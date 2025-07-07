import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HojaTrabajo } from '../entities/hoja-trabajo.entity';
import { HojaTrabajoDetalle } from '../entities/hoja-trabajo-detalle.entity';
import { Servicio } from '../entities/servicio.entity';

export interface CreateHojaTrabajoDto {
  cliente?: string;
  vehiculo?: string;
  placa?: string;
  observaciones?: string;
  servicios?: Array<{
    servicioId: number;
    comentario?: string;
  }>;
}

export interface UpdateHojaTrabajoDto {
  cliente?: string;
  vehiculo?: string;
  placa?: string;
  observaciones?: string;
  estado?: 'pendiente' | 'en_proceso' | 'completado' | 'entregado';
}

export interface AgregarServicioDto {
  servicioId: number;
  comentario?: string;
}

@Injectable()
export class HojaTrabajoService {
  constructor(
    @InjectRepository(HojaTrabajo)
    private hojaTrabajoRepository: Repository<HojaTrabajo>,
    @InjectRepository(HojaTrabajoDetalle)
    private hojaTrabajoDetalleRepository: Repository<HojaTrabajoDetalle>,
    @InjectRepository(Servicio)
    private servicioRepository: Repository<Servicio>,
  ) {}

  async create(createHojaTrabajoDto: CreateHojaTrabajoDto): Promise<HojaTrabajo | null> {
    const hojaTrabajo = this.hojaTrabajoRepository.create({
      cliente: createHojaTrabajoDto.cliente,
      vehiculo: createHojaTrabajoDto.vehiculo,
      placa: createHojaTrabajoDto.placa,
      observaciones: createHojaTrabajoDto.observaciones,
    });
    
    const hojaGuardada = await this.hojaTrabajoRepository.save(hojaTrabajo);

    // Agregar servicios si se especificaron
    if (createHojaTrabajoDto.servicios && createHojaTrabajoDto.servicios.length > 0) {
      for (const servicioDto of createHojaTrabajoDto.servicios) {
        await this.agregarServicio(hojaGuardada.id, servicioDto);
      }
    }

    return this.findOne(hojaGuardada.id);
  }

  async findAll(): Promise<HojaTrabajo[]> {
    return this.hojaTrabajoRepository.find({
      relations: ['detalles', 'detalles.servicio'],
      order: { created_at: 'DESC' }
    });
  }

  async findOne(id: number): Promise<HojaTrabajo | null> {
    const hojaTrabajo = await this.hojaTrabajoRepository.findOne({ 
      where: { id },
      relations: ['detalles', 'detalles.servicio']
    });
    
    if (hojaTrabajo) {
      // Calcular el total
      hojaTrabajo.total = hojaTrabajo.detalles.reduce((total, detalle) => total + Number(detalle.precio), 0);
      await this.hojaTrabajoRepository.save(hojaTrabajo);
    }
    
    return hojaTrabajo;
  }

  async update(id: number, updateHojaTrabajoDto: UpdateHojaTrabajoDto): Promise<HojaTrabajo | null> {
    await this.hojaTrabajoRepository.update(id, updateHojaTrabajoDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.hojaTrabajoRepository.delete(id);
  }

  async agregarServicio(hojaTrabajoId: number, agregarServicioDto: AgregarServicioDto): Promise<HojaTrabajoDetalle | null> {
    const hojaTrabajo = await this.hojaTrabajoRepository.findOne({ where: { id: hojaTrabajoId } });
    if (!hojaTrabajo) {
      throw new NotFoundException('Hoja de trabajo no encontrada');
    }

    const servicio = await this.servicioRepository.findOne({ where: { id: agregarServicioDto.servicioId } });
    if (!servicio) {
      throw new NotFoundException('Servicio no encontrado');
    }

    // Verificar si el servicio ya está agregado
    const servicioExistente = await this.hojaTrabajoDetalleRepository.findOne({
      where: { 
        hojaTrabajoId: hojaTrabajoId,
        servicioId: agregarServicioDto.servicioId
      }
    });

    if (servicioExistente) {
      throw new Error('El servicio ya está agregado a esta hoja de trabajo');
    }

    const detalle = this.hojaTrabajoDetalleRepository.create({
      hojaTrabajoId: hojaTrabajoId,
      servicioId: agregarServicioDto.servicioId,
      precio: servicio.precio,
      comentario: agregarServicioDto.comentario,
    });

    const detalleGuardado = await this.hojaTrabajoDetalleRepository.save(detalle);
    
    // Actualizar el total de la hoja de trabajo
    await this.actualizarTotal(hojaTrabajoId);
    
    return this.hojaTrabajoDetalleRepository.findOne({
      where: { id: detalleGuardado.id },
      relations: ['servicio']
    });
  }

  async removerServicio(hojaTrabajoId: number, detalleId: number): Promise<void> {
    const detalle = await this.hojaTrabajoDetalleRepository.findOne({
      where: { 
        id: detalleId,
        hojaTrabajoId: hojaTrabajoId
      }
    });

    if (!detalle) {
      throw new NotFoundException('Detalle de servicio no encontrado');
    }

    await this.hojaTrabajoDetalleRepository.delete(detalleId);
    await this.actualizarTotal(hojaTrabajoId);
  }

  async actualizarComentarioServicio(hojaTrabajoId: number, detalleId: number, comentario: string): Promise<HojaTrabajoDetalle | null> {
    const detalle = await this.hojaTrabajoDetalleRepository.findOne({
      where: { 
        id: detalleId,
        hojaTrabajoId: hojaTrabajoId
      }
    });

    if (!detalle) {
      throw new NotFoundException('Detalle de servicio no encontrado');
    }

    await this.hojaTrabajoDetalleRepository.update(detalleId, { comentario });
    
    return this.hojaTrabajoDetalleRepository.findOne({
      where: { id: detalleId },
      relations: ['servicio']
    });
  }

  private async actualizarTotal(hojaTrabajoId: number): Promise<void> {
    const detalles = await this.hojaTrabajoDetalleRepository.find({
      where: { hojaTrabajoId }
    });

    const total = detalles.reduce((sum, detalle) => sum + Number(detalle.precio), 0);
    
    await this.hojaTrabajoRepository.update(hojaTrabajoId, { total });
  }
}
