import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Servicio } from '../entities/servicio.entity';

export interface CreateServicioDto {
  nombre: string;
  descripcion?: string;
  precio: number;
  activo?: boolean;
}

export type UpdateServicioDto = Partial<CreateServicioDto>;

@Injectable()
export class ServicioService {
  constructor(
    @InjectRepository(Servicio)
    private servicioRepository: Repository<Servicio>,
  ) {}

  async create(createServicioDto: CreateServicioDto): Promise<Servicio> {
    const servicio = this.servicioRepository.create(createServicioDto);
    return this.servicioRepository.save(servicio);
  }

  async findAll(): Promise<Servicio[]> {
    return this.servicioRepository.find({
      where: { activo: true },
      order: { nombre: 'ASC' }
    });
  }

  async findOne(id: number): Promise<Servicio | null> {
    return this.servicioRepository.findOne({ where: { id } });
  }

  async update(id: number, updateServicioDto: UpdateServicioDto): Promise<Servicio | null> {
    await this.servicioRepository.update(id, updateServicioDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.servicioRepository.update(id, { activo: false });
  }

  async seed(): Promise<void> {
    const serviciosExistentes = await this.servicioRepository.count();
    
    if (serviciosExistentes === 0) {
      const serviciosIniciales = [
        { nombre: 'frenos', descripcion: 'Revisión y reparación del sistema de frenos', precio: 15000 },
        { nombre: 'cambio_rotula', descripcion: 'Cambio de rótulas de dirección', precio: 8000 },
        { nombre: 'suspension', descripcion: 'Revisión y reparación de suspensión', precio: 12000 },
        { nombre: 'gases', descripcion: 'Revisión de gases de escape', precio: 5000 },
        { nombre: 'cambio_compensadores', descripcion: 'Cambio de compensadores', precio: 6000 },
        { nombre: 'catalizador', descripcion: 'Revisión y cambio de catalizador', precio: 25000 },
        { nombre: 'silenciador', descripcion: 'Reparación o cambio de silenciador', precio: 10000 },
        { nombre: 'regulacion', descripcion: 'Regulación del motor', precio: 8000 },
        { nombre: 'alineado', descripcion: 'Alineación de llantas', precio: 7000 },
        { nombre: 'tramado', descripcion: 'Servicio de tramado', precio: 4000 },
        { nombre: 'luces', descripcion: 'Revisión del sistema de luces', precio: 3000 },
        { nombre: 'llantas', descripcion: 'Revisión y cambio de llantas', precio: 20000 },
        { nombre: 'servicio_scanner', descripcion: 'Diagnóstico con scanner automotriz', precio: 15000 },
        { nombre: 'soldadura', descripcion: 'Trabajos de soldadura automotriz', precio: 12000 },
      ];

      for (const servicio of serviciosIniciales) {
        await this.create(servicio);
      }
    }
  }
}
