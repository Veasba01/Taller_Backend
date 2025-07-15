import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CierreCaja } from '../entities/cierre-caja.entity';
import { HojaTrabajoDetalle } from '../entities/hoja-trabajo-detalle.entity';
import { Gasto } from '../entities/gasto.entity';
import { TimezoneUtil } from '../utils/timezone.util';

export interface CierreCajaDto {
  fecha: string;
  totalIngresos: number;
  totalGastos: number;
  saldoFinal: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResumenCierreDto {
  fecha: string;
  totalIngresos: number;
  totalGastos: number;
  saldoFinal: number;
  detalleIngresos: {
    cantidadServicios: number;
    serviciosRealizados: Array<{
      nombre: string;
      cantidad: number;
      total: number;
    }>;
  };
  detalleGastos: Array<{
    descripcion: string;
    monto: number;
  }>;
}

@Injectable()
export class CierreCajaService {
  constructor(
    @InjectRepository(CierreCaja)
    private readonly cierreCajaRepository: Repository<CierreCaja>,
    @InjectRepository(HojaTrabajoDetalle)
    private readonly hojaTrabajoDetalleRepository: Repository<HojaTrabajoDetalle>,
    @InjectRepository(Gasto)
    private readonly gastoRepository: Repository<Gasto>,
  ) {}

  /**
   * Realiza el cierre de caja para una fecha específica
   */
  async realizarCierre(fecha?: string): Promise<CierreCajaDto> {
    const fechaConsulta = fecha ? TimezoneUtil.parseCostaRicaDate(fecha) : new Date();
    const fechaString = fechaConsulta.toISOString().split('T')[0];

    // Verificar si ya existe un cierre para esta fecha
    const cierreExistente = await this.cierreCajaRepository.findOne({
      where: { fecha: fechaConsulta }
    });

    if (cierreExistente) {
      throw new ConflictException(`Ya existe un cierre de caja para la fecha ${fechaString}`);
    }

    // Calcular totales
    const { totalIngresos, totalGastos } = await this.calcularTotales(fechaConsulta);
    const saldoFinal = totalIngresos - totalGastos;

    // Crear el cierre de caja
    const nuevoCierre = this.cierreCajaRepository.create({
      fecha: fechaConsulta,
      totalIngresos,
      totalGastos,
      saldoFinal,
    });

    const cierreGuardado = await this.cierreCajaRepository.save(nuevoCierre);

    return {
      fecha: fechaString,
      totalIngresos: Number(cierreGuardado.totalIngresos),
      totalGastos: Number(cierreGuardado.totalGastos),
      saldoFinal: Number(cierreGuardado.saldoFinal),
      createdAt: cierreGuardado.createdAt,
      updatedAt: cierreGuardado.updatedAt,
    };
  }

  /**
   * Obtiene el resumen detallado para el cierre de caja
   */
  async obtenerResumenCierre(fecha?: string): Promise<ResumenCierreDto> {
    const fechaConsulta = fecha ? TimezoneUtil.parseCostaRicaDate(fecha) : new Date();
    const fechaString = fechaConsulta.toISOString().split('T')[0];

    const { totalIngresos, totalGastos, detalleIngresos, detalleGastos } = await this.calcularTotalesDetallados(fechaConsulta);
    const saldoFinal = totalIngresos - totalGastos;

    return {
      fecha: fechaString,
      totalIngresos,
      totalGastos,
      saldoFinal,
      detalleIngresos,
      detalleGastos,
    };
  }

  /**
   * Obtiene todos los cierres de caja realizados
   */
  async obtenerCierres(): Promise<CierreCajaDto[]> {
    const cierres = await this.cierreCajaRepository.find({
      order: { fecha: 'DESC' },
    });

    return cierres.map(cierre => ({
      fecha: cierre.fecha instanceof Date ? cierre.fecha.toISOString().split('T')[0] : cierre.fecha,
      totalIngresos: Number(cierre.totalIngresos),
      totalGastos: Number(cierre.totalGastos),
      saldoFinal: Number(cierre.saldoFinal),
      createdAt: cierre.createdAt,
      updatedAt: cierre.updatedAt,
    }));
  }

  /**
   * Obtiene un cierre específico por fecha
   */
  async obtenerCierrePorFecha(fecha: string): Promise<CierreCajaDto | null> {
    const fechaConsulta = TimezoneUtil.parseCostaRicaDate(fecha);
    
    const cierre = await this.cierreCajaRepository.findOne({
      where: { fecha: fechaConsulta }
    });

    if (!cierre) {
      return null;
    }

    return {
      fecha: cierre.fecha instanceof Date ? cierre.fecha.toISOString().split('T')[0] : cierre.fecha,
      totalIngresos: Number(cierre.totalIngresos),
      totalGastos: Number(cierre.totalGastos),
      saldoFinal: Number(cierre.saldoFinal),
      createdAt: cierre.createdAt,
      updatedAt: cierre.updatedAt,
    };
  }

  /**
   * Calcula los totales de ingresos y gastos para una fecha
   */
  private async calcularTotales(fecha: Date): Promise<{ totalIngresos: number; totalGastos: number }> {
    const { inicioDia, finDia } = TimezoneUtil.getDayRange(fecha);

    // Calcular ingresos (servicios completados)
    const ingresos = await this.hojaTrabajoDetalleRepository
      .createQueryBuilder('htd')
      .select('SUM(htd.precio)', 'total')
      .where('htd.updated_at >= :inicioDia', { inicioDia })
      .andWhere('htd.updated_at < :finDia', { finDia })
      .getRawOne() as { total: string | null };

    // Calcular gastos
    const gastos = await this.gastoRepository
      .createQueryBuilder('g')
      .select('SUM(g.monto)', 'total')
      .where('DATE(g.created_at) = :fecha', { fecha: fecha.toISOString().split('T')[0] })
      .getRawOne() as { total: string | null };

    return {
      totalIngresos: Number(ingresos?.total || 0),
      totalGastos: Number(gastos?.total || 0),
    };
  }

  /**
   * Calcula los totales detallados para el resumen
   */
  private async calcularTotalesDetallados(fecha: Date): Promise<{
    totalIngresos: number;
    totalGastos: number;
    detalleIngresos: {
      cantidadServicios: number;
      serviciosRealizados: Array<{
        nombre: string;
        cantidad: number;
        total: number;
      }>;
    };
    detalleGastos: Array<{
      descripcion: string;
      monto: number;
    }>;
  }> {
    const { inicioDia, finDia } = TimezoneUtil.getDayRange(fecha);

    // Obtener servicios realizados con detalles
    const serviciosRealizados = await this.hojaTrabajoDetalleRepository
      .createQueryBuilder('htd')
      .leftJoinAndSelect('htd.servicio', 's')
      .where('htd.updated_at >= :inicioDia', { inicioDia })
      .andWhere('htd.updated_at < :finDia', { finDia })
      .getMany();

    // Agrupar servicios por nombre
    const serviciosAgrupados: Record<string, { nombre: string; cantidad: number; total: number }> = {};
    let totalIngresos = 0;

    serviciosRealizados.forEach(detalle => {
      const nombre = detalle.servicio.nombre;
      const precio = Number(detalle.precio);
      
      if (!serviciosAgrupados[nombre]) {
        serviciosAgrupados[nombre] = {
          nombre,
          cantidad: 0,
          total: 0,
        };
      }
      
      serviciosAgrupados[nombre].cantidad += 1;
      serviciosAgrupados[nombre].total += precio;
      totalIngresos += precio;
    });

    // Obtener gastos del día
    const gastos = await this.gastoRepository
      .createQueryBuilder('g')
      .where('DATE(g.created_at) = :fecha', { fecha: fecha.toISOString().split('T')[0] })
      .orderBy('g.created_at', 'DESC')
      .getMany();

    const detalleGastos = gastos.map(gasto => ({
      descripcion: gasto.comentario || 'Sin descripción',
      monto: Number(gasto.monto),
    }));

    const totalGastos = detalleGastos.reduce((sum, gasto) => sum + gasto.monto, 0);

    return {
      totalIngresos,
      totalGastos,
      detalleIngresos: {
        cantidadServicios: serviciosRealizados.length,
        serviciosRealizados: Object.values(serviciosAgrupados).sort((a, b) => b.total - a.total),
      },
      detalleGastos,
    };
  }
}
