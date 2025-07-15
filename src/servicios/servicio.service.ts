import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Servicio } from '../entities/servicio.entity';
import { HojaTrabajoDetalle } from '../entities/hoja-trabajo-detalle.entity';
import { TimezoneUtil } from '../utils/timezone.util';

export interface CreateServicioDto {
  nombre: string;
  descripcion?: string;
  precio: number;
  activo?: boolean;
}

export type UpdateServicioDto = Partial<CreateServicioDto>;

export interface ServicioRealizadoDto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  fechaRealizacion: string;
  cliente: string;
  vehiculo: string;
  comentario?: string;
}

export interface ResumenServiciosDto {
  fechaInicio: string;
  fechaFin: string;
  totalServicios: number;
  servicios: ServicioRealizadoDto[];
}

export interface ServicioIngresoDto {
  nombre: string;
  descripcion: string;
  cantidad: number;
  ingresoTotal: number;
}

export interface ResumenIngresosServiciosDto {
  fechaInicio: string;
  fechaFin: string;
  totalIngresos: number;
  totalServicios: number;
  servicios: ServicioIngresoDto[];
}

@Injectable()
export class ServicioService {
  constructor(
    @InjectRepository(Servicio)
    private servicioRepository: Repository<Servicio>,
    @InjectRepository(HojaTrabajoDetalle)
    private hojaTrabajoDetalleRepository: Repository<HojaTrabajoDetalle>,
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

  /**
   * Obtiene los servicios realizados del día actual
   */
  async getServiciosDelDia(fecha?: string): Promise<ResumenServiciosDto> {
    const fechaConsulta = fecha ? TimezoneUtil.parseCostaRicaDate(fecha) : TimezoneUtil.getCurrentCostaRicaDate();
    const { inicioDia, finDia } = TimezoneUtil.getDayRange(fechaConsulta);

    const serviciosRealizados = await this.hojaTrabajoDetalleRepository
      .createQueryBuilder('htd')
      .leftJoinAndSelect('htd.servicio', 's')
      .leftJoinAndSelect('htd.hojaTrabajo', 'ht')
      .where('htd.updated_at >= :inicioDia', { inicioDia })
      .andWhere('htd.updated_at < :finDia', { finDia })
      .orderBy('htd.updated_at', 'DESC')
      .getMany();

    const serviciosMapeados: ServicioRealizadoDto[] = serviciosRealizados.map(detalle => {
      // Convertir la fecha updated_at a zona horaria de Costa Rica
      const fechaUTC = new Date(detalle.updated_at);
      const fechaCostaRica = new Date(fechaUTC.getTime() - (6 * 60 * 60 * 1000)); // UTC-6
      
      return {
        id: detalle.id,
        nombre: detalle.servicio.nombre,
        descripcion: detalle.servicio.descripcion,
        precio: Number(detalle.precio),
        fechaRealizacion: fechaCostaRica.toISOString().split('T')[0],
        cliente: detalle.hojaTrabajo.cliente,
        vehiculo: detalle.hojaTrabajo.vehiculo,
        comentario: detalle.comentario
      };
    });

    return {
      fechaInicio: fechaConsulta.toISOString().split('T')[0],
      fechaFin: fechaConsulta.toISOString().split('T')[0],
      totalServicios: serviciosMapeados.length,
      servicios: serviciosMapeados
    };
  }

  /**
   * Obtiene los servicios realizados en un período específico
   */
  async getServiciosPorPeriodo(fechaInicio: string, fechaFin: string): Promise<ResumenServiciosDto> {
    const fechaInicioCostaRica = TimezoneUtil.parseCostaRicaDate(fechaInicio);
    const fechaFinCostaRica = TimezoneUtil.parseCostaRicaDate(fechaFin);
    
    const { inicioDia: inicio } = TimezoneUtil.getDayRange(fechaInicioCostaRica);
    const { finDia: fin } = TimezoneUtil.getDayRange(fechaFinCostaRica);

    const serviciosRealizados = await this.hojaTrabajoDetalleRepository
      .createQueryBuilder('htd')
      .leftJoinAndSelect('htd.servicio', 's')
      .leftJoinAndSelect('htd.hojaTrabajo', 'ht')
      .where('htd.updated_at >= :inicio', { inicio })
      .andWhere('htd.updated_at < :fin', { fin })
      .orderBy('htd.updated_at', 'DESC')
      .getMany();

    const serviciosMapeados: ServicioRealizadoDto[] = serviciosRealizados.map(detalle => {
      // Convertir la fecha updated_at a zona horaria de Costa Rica
      const fechaUTC = new Date(detalle.updated_at);
      const fechaCostaRica = new Date(fechaUTC.getTime() - (6 * 60 * 60 * 1000)); // UTC-6
      
      return {
        id: detalle.id,
        nombre: detalle.servicio.nombre,
        descripcion: detalle.servicio.descripcion,
        precio: Number(detalle.precio),
        fechaRealizacion: fechaCostaRica.toISOString().split('T')[0],
        cliente: detalle.hojaTrabajo.cliente,
        vehiculo: detalle.hojaTrabajo.vehiculo,
        comentario: detalle.comentario
      };
    });

    return {
      fechaInicio: fechaInicioCostaRica.toISOString().split('T')[0],
      fechaFin: fechaFinCostaRica.toISOString().split('T')[0],
      totalServicios: serviciosMapeados.length,
      servicios: serviciosMapeados
    };
  }

  /**
   * Obtiene todos los servicios agregados del día (sin filtrar por completado)
   * Útil para ver todos los servicios agregados, independientemente de si están completados
   */
  async getTodosLosServiciosDelDia(fecha?: string): Promise<ResumenServiciosDto> {
    const fechaConsulta = fecha ? TimezoneUtil.parseCostaRicaDate(fecha) : TimezoneUtil.getCurrentCostaRicaDate();
    const { inicioDia, finDia } = TimezoneUtil.getDayRange(fechaConsulta);

    const serviciosRealizados = await this.hojaTrabajoDetalleRepository
      .createQueryBuilder('htd')
      .leftJoinAndSelect('htd.servicio', 's')
      .leftJoinAndSelect('htd.hojaTrabajo', 'ht')
      .where('htd.updated_at >= :inicioDia', { inicioDia })
      .andWhere('htd.updated_at < :finDia', { finDia })
      .orderBy('htd.updated_at', 'DESC')
      .getMany();

    const serviciosMapeados: ServicioRealizadoDto[] = serviciosRealizados.map(detalle => {
      // Convertir la fecha updated_at a zona horaria de Costa Rica
      const fechaUTC = new Date(detalle.updated_at);
      const fechaCostaRica = new Date(fechaUTC.getTime() - (6 * 60 * 60 * 1000)); // UTC-6
      
      return {
        id: detalle.id,
        nombre: detalle.servicio.nombre,
        descripcion: detalle.servicio.descripcion,
        precio: Number(detalle.precio),
        fechaRealizacion: fechaCostaRica.toISOString().split('T')[0],
        cliente: detalle.hojaTrabajo.cliente,
        vehiculo: detalle.hojaTrabajo.vehiculo,
        comentario: detalle.comentario
      };
    });

    return {
      fechaInicio: fechaConsulta.toISOString().split('T')[0],
      fechaFin: fechaConsulta.toISOString().split('T')[0],
      totalServicios: serviciosMapeados.length,
      servicios: serviciosMapeados
    };
  }

  /**
   * Obtiene todos los servicios agregados en un período específico (sin filtrar por completado)
   * Útil para ver todos los servicios agregados, independientemente de si están completados
   */
  async getTodosLosServiciosPorPeriodo(fechaInicio: string, fechaFin: string): Promise<ResumenServiciosDto> {
    const fechaInicioCostaRica = TimezoneUtil.parseCostaRicaDate(fechaInicio);
    const fechaFinCostaRica = TimezoneUtil.parseCostaRicaDate(fechaFin);
    
    const { inicioDia: inicio } = TimezoneUtil.getDayRange(fechaInicioCostaRica);
    const { finDia: fin } = TimezoneUtil.getDayRange(fechaFinCostaRica);

    const serviciosRealizados = await this.hojaTrabajoDetalleRepository
      .createQueryBuilder('htd')
      .leftJoinAndSelect('htd.servicio', 's')
      .leftJoinAndSelect('htd.hojaTrabajo', 'ht')
      .where('htd.updated_at >= :inicio', { inicio })
      .andWhere('htd.updated_at < :fin', { fin })
      .orderBy('htd.updated_at', 'DESC')
      .getMany();

    const serviciosMapeados: ServicioRealizadoDto[] = serviciosRealizados.map(detalle => {
      // Convertir la fecha updated_at a zona horaria de Costa Rica
      const fechaUTC = new Date(detalle.updated_at);
      const fechaCostaRica = new Date(fechaUTC.getTime() - (6 * 60 * 60 * 1000)); // UTC-6
      
      return {
        id: detalle.id,
        nombre: detalle.servicio.nombre,
        descripcion: detalle.servicio.descripcion,
        precio: Number(detalle.precio),
        fechaRealizacion: fechaCostaRica.toISOString().split('T')[0],
        cliente: detalle.hojaTrabajo.cliente,
        vehiculo: detalle.hojaTrabajo.vehiculo,
        comentario: detalle.comentario
      };
    });

    return {
      fechaInicio: fechaInicioCostaRica.toISOString().split('T')[0],
      fechaFin: fechaFinCostaRica.toISOString().split('T')[0],
      totalServicios: serviciosMapeados.length,
      servicios: serviciosMapeados
    };
  }

  /**
   * Obtiene los ingresos por servicio del día actual
   */
  async getIngresosPorServicioDelDia(fecha?: string): Promise<ResumenIngresosServiciosDto> {
    const fechaConsulta = fecha ? TimezoneUtil.parseCostaRicaDate(fecha) : TimezoneUtil.getCurrentCostaRicaDate();
    const { inicioDia, finDia } = TimezoneUtil.getDayRange(fechaConsulta);

    const serviciosRealizados = await this.hojaTrabajoDetalleRepository
      .createQueryBuilder('htd')
      .leftJoinAndSelect('htd.servicio', 's')
      .leftJoinAndSelect('htd.hojaTrabajo', 'ht')
      .where('htd.updated_at >= :inicioDia', { inicioDia })
      .andWhere('htd.updated_at < :finDia', { finDia })
      .getMany();

    const serviciosAgrupados: Record<string, ServicioIngresoDto> = {};

    serviciosRealizados.forEach(detalle => {
      const nombreServicio = detalle.servicio.nombre;
      const precio = Number(detalle.precio);

      if (!serviciosAgrupados[nombreServicio]) {
        serviciosAgrupados[nombreServicio] = {
          nombre: nombreServicio,
          descripcion: detalle.servicio.descripcion,
          cantidad: 0,
          ingresoTotal: 0
        };
      }

      serviciosAgrupados[nombreServicio].cantidad += 1;
      serviciosAgrupados[nombreServicio].ingresoTotal += precio;
    });

    const serviciosArray = Object.values(serviciosAgrupados);
    const totalIngresos = serviciosArray.reduce((sum, servicio) => sum + servicio.ingresoTotal, 0);
    const totalServicios = serviciosArray.reduce((sum, servicio) => sum + servicio.cantidad, 0);

    return {
      fechaInicio: fechaConsulta.toISOString().split('T')[0],
      fechaFin: fechaConsulta.toISOString().split('T')[0],
      totalIngresos,
      totalServicios,
      servicios: serviciosArray.sort((a, b) => b.ingresoTotal - a.ingresoTotal) // Ordenar por ingresos (mayor a menor)
    };
  }

  /**
   * Obtiene los ingresos por servicio en un período específico
   */
  async getIngresosPorServicioPorPeriodo(fechaInicio: string, fechaFin: string): Promise<ResumenIngresosServiciosDto> {
    const fechaInicioCostaRica = TimezoneUtil.parseCostaRicaDate(fechaInicio);
    const fechaFinCostaRica = TimezoneUtil.parseCostaRicaDate(fechaFin);
    
    const { inicioDia: inicio } = TimezoneUtil.getDayRange(fechaInicioCostaRica);
    const { finDia: fin } = TimezoneUtil.getDayRange(fechaFinCostaRica);

    const serviciosRealizados = await this.hojaTrabajoDetalleRepository
      .createQueryBuilder('htd')
      .leftJoinAndSelect('htd.servicio', 's')
      .leftJoinAndSelect('htd.hojaTrabajo', 'ht')
      .where('htd.updated_at >= :inicio', { inicio })
      .andWhere('htd.updated_at < :fin', { fin })
      .getMany();

    const serviciosAgrupados: Record<string, ServicioIngresoDto> = {};

    serviciosRealizados.forEach(detalle => {
      const nombreServicio = detalle.servicio.nombre;
      const precio = Number(detalle.precio);

      if (!serviciosAgrupados[nombreServicio]) {
        serviciosAgrupados[nombreServicio] = {
          nombre: nombreServicio,
          descripcion: detalle.servicio.descripcion,
          cantidad: 0,
          ingresoTotal: 0
        };
      }

      serviciosAgrupados[nombreServicio].cantidad += 1;
      serviciosAgrupados[nombreServicio].ingresoTotal += precio;
    });

    const serviciosArray = Object.values(serviciosAgrupados);
    const totalIngresos = serviciosArray.reduce((sum, servicio) => sum + servicio.ingresoTotal, 0);
    const totalServicios = serviciosArray.reduce((sum, servicio) => sum + servicio.cantidad, 0);

    return {
      fechaInicio: fechaInicioCostaRica.toISOString().split('T')[0],
      fechaFin: fechaFinCostaRica.toISOString().split('T')[0],
      totalIngresos,
      totalServicios,
      servicios: serviciosArray.sort((a, b) => b.ingresoTotal - a.ingresoTotal) // Ordenar por ingresos (mayor a menor)
    };
  }
}
