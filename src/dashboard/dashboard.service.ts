import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HojaTrabajo } from '../entities/hoja-trabajo.entity';
import { HojaTrabajoDetalle } from '../entities/hoja-trabajo-detalle.entity';
import { Servicio } from '../entities/servicio.entity';
import {
  IngresosDiaResponse,
  ServiciosCompletadosResponse,
  ClientesAtendidosResponse,
  ServiciosPendientesResponse,
  IngresosPorSemanaResponse,
  IngresosPorMesResponse,
  ResumenSemanaResponse,
  EstadisticasGeneralesResponse,
  ServicioResumen,
  IngresoDia
} from './interfaces/dashboard.interfaces';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(HojaTrabajo)
    private readonly hojaTrabajoRepository: Repository<HojaTrabajo>,
    @InjectRepository(HojaTrabajoDetalle)
    private readonly hojaTrabajoDetalleRepository: Repository<HojaTrabajoDetalle>,
    @InjectRepository(Servicio)
    private readonly servicioRepository: Repository<Servicio>,
  ) {}

  /**
   * Obtiene los ingresos del día especificado
   */
  async getIngresosDia(fecha?: string): Promise<IngresosDiaResponse> {
    const fechaConsulta = fecha ? new Date(fecha) : new Date();
    const inicioDia = new Date(fechaConsulta.getFullYear(), fechaConsulta.getMonth(), fechaConsulta.getDate());
    const finDia = new Date(fechaConsulta.getFullYear(), fechaConsulta.getMonth(), fechaConsulta.getDate() + 1);

    const ingresos = await this.hojaTrabajoRepository
      .createQueryBuilder('ht')
      .where('ht.estado IN (:...estados)', { estados: ['completado', 'entregado'] })
      .andWhere('ht.updated_at >= :inicioDia', { inicioDia })
      .andWhere('ht.updated_at < :finDia', { finDia })
      .getMany();

    const totalIngresos = ingresos.reduce((sum, hoja) => sum + Number(hoja.total), 0);

    return {
      fecha: fechaConsulta.toISOString().split('T')[0],
      ingresos: totalIngresos,
      cantidadTrabajos: ingresos.length,
      trabajos: ingresos.map(t => ({
        id: t.id,
        cliente: t.cliente,
        vehiculo: t.vehiculo,
        total: t.total,
        estado: t.estado
      }))
    };
  }

  /**
   * Obtiene los servicios completados en la semana
   */
  async getServiciosCompletadosSemana(fecha?: string): Promise<ServiciosCompletadosResponse> {
    const fechaConsulta = fecha ? new Date(fecha) : new Date();
    const { inicioSemana, finSemana } = this.obtenerRangoSemana(fechaConsulta);

    const serviciosCompletados = await this.hojaTrabajoDetalleRepository
      .createQueryBuilder('htd')
      .leftJoinAndSelect('htd.hojaTrabajo', 'ht')
      .leftJoinAndSelect('htd.servicio', 's')
      .where('htd.completado = :completado', { completado: true })
      .andWhere('htd.updated_at >= :inicioSemana', { inicioSemana })
      .andWhere('htd.updated_at < :finSemana', { finSemana })
      .getMany();

    const resumenServicios: Record<string, ServicioResumen> = {};
    serviciosCompletados.forEach(detalle => {
      const nombreServicio = detalle.servicio.nombre;
      if (!resumenServicios[nombreServicio]) {
        resumenServicios[nombreServicio] = {
          nombre: nombreServicio,
          cantidad: 0,
          ingresos: 0
        };
      }
      resumenServicios[nombreServicio].cantidad += 1;
      resumenServicios[nombreServicio].ingresos += Number(detalle.precio);
    });

    return {
      semana: `${inicioSemana.toISOString().split('T')[0]} - ${finSemana.toISOString().split('T')[0]}`,
      totalServicios: serviciosCompletados.length,
      servicios: Object.values(resumenServicios)
    };
  }

  /**
   * Obtiene los clientes atendidos en la semana
   */
  async getClientesAtendidosSemana(fecha?: string): Promise<ClientesAtendidosResponse> {
    const fechaConsulta = fecha ? new Date(fecha) : new Date();
    const { inicioSemana, finSemana } = this.obtenerRangoSemana(fechaConsulta);

    const clientesAtendidos = await this.hojaTrabajoRepository
      .createQueryBuilder('ht')
      .where('ht.created_at >= :inicioSemana', { inicioSemana })
      .andWhere('ht.created_at < :finSemana', { finSemana })
      .getMany();

    const clientesUnicos = new Set(clientesAtendidos.map(ht => ht.cliente));

    return {
      semana: `${inicioSemana.toISOString().split('T')[0]} - ${finSemana.toISOString().split('T')[0]}`,
      totalClientes: clientesUnicos.size,
      totalTrabajos: clientesAtendidos.length,
      clientes: Array.from(clientesUnicos).map(cliente => {
        const trabajosCliente = clientesAtendidos.filter(ht => ht.cliente === cliente);
        return {
          nombre: cliente,
          cantidadTrabajos: trabajosCliente.length,
          totalGastado: trabajosCliente.reduce((sum, ht) => sum + Number(ht.total), 0)
        };
      })
    };
  }

  /**
   * Obtiene los servicios pendientes del día
   */
  async getServiciosPendientesDia(fecha?: string): Promise<ServiciosPendientesResponse> {
    const fechaConsulta = fecha ? new Date(fecha) : new Date();
    const inicioDia = new Date(fechaConsulta.getFullYear(), fechaConsulta.getMonth(), fechaConsulta.getDate());
    const finDia = new Date(fechaConsulta.getFullYear(), fechaConsulta.getMonth(), fechaConsulta.getDate() + 1);

    const serviciosPendientes = await this.hojaTrabajoRepository
      .createQueryBuilder('ht')
      .leftJoinAndSelect('ht.detalles', 'htd')
      .leftJoinAndSelect('htd.servicio', 's')
      .where('ht.estado IN (:...estados)', { estados: ['pendiente', 'en_proceso'] })
      .andWhere('ht.created_at >= :inicioDia', { inicioDia })
      .andWhere('ht.created_at < :finDia', { finDia })
      .getMany();

    return {
      fecha: fechaConsulta.toISOString().split('T')[0],
      totalPendientes: serviciosPendientes.length,
      trabajos: serviciosPendientes.map(trabajo => ({
        id: trabajo.id,
        cliente: trabajo.cliente,
        vehiculo: trabajo.vehiculo,
        placa: trabajo.placa,
        estado: trabajo.estado,
        servicios: trabajo.detalles?.map(detalle => ({
          nombre: detalle.servicio.nombre,
          precio: detalle.precio,
          completado: detalle.completado
        })) || []
      }))
    };
  }

  /**
   * Obtiene los ingresos por cada día de la semana
   */
  async getIngresosPorSemana(fecha?: string): Promise<IngresosPorSemanaResponse> {
    const fechaConsulta = fecha ? new Date(fecha) : new Date();
    const { inicioSemana, finSemana } = this.obtenerRangoSemana(fechaConsulta);

    const ingresosSemana = await this.hojaTrabajoRepository
      .createQueryBuilder('ht')
      .where('ht.estado IN (:...estados)', { estados: ['completado', 'entregado'] })
      .andWhere('ht.updated_at >= :inicioSemana', { inicioSemana })
      .andWhere('ht.updated_at < :finSemana', { finSemana })
      .getMany();

    const ingresosPorDia: Record<string, IngresoDia> = {};
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    // Inicializar todos los días en 0
    for (let i = 0; i < 7; i++) {
      const dia = new Date(inicioSemana);
      dia.setDate(inicioSemana.getDate() + i);
      const fechaStr = dia.toISOString().split('T')[0];
      ingresosPorDia[fechaStr] = {
        fecha: fechaStr,
        dia: diasSemana[i],
        ingresos: 0,
        cantidadTrabajos: 0
      };
    }

    // Sumar los ingresos por día
    ingresosSemana.forEach(trabajo => {
      const fechaTrabajo = trabajo.updated_at.toISOString().split('T')[0];
      if (ingresosPorDia[fechaTrabajo]) {
        ingresosPorDia[fechaTrabajo].ingresos += Number(trabajo.total);
        ingresosPorDia[fechaTrabajo].cantidadTrabajos += 1;
      }
    });

    const ingresosPorDiaArray = Object.values(ingresosPorDia);

    return {
      semana: `${inicioSemana.toISOString().split('T')[0]} - ${finSemana.toISOString().split('T')[0]}`,
      ingresosPorDia: ingresosPorDiaArray,
      totalSemana: ingresosPorDiaArray.reduce((sum: number, dia: IngresoDia) => sum + dia.ingresos, 0)
    };
  }

  /**
   * Obtiene los ingresos por cada día del mes
   */
  async getIngresosPorMes(fecha?: string): Promise<IngresosPorMesResponse> {
    const fechaConsulta = fecha ? new Date(fecha) : new Date();
    const inicioMes = new Date(fechaConsulta.getFullYear(), fechaConsulta.getMonth(), 1);
    const finMes = new Date(fechaConsulta.getFullYear(), fechaConsulta.getMonth() + 1, 1);

    const ingresosMes = await this.hojaTrabajoRepository
      .createQueryBuilder('ht')
      .where('ht.estado IN (:...estados)', { estados: ['completado', 'entregado'] })
      .andWhere('ht.updated_at >= :inicioMes', { inicioMes })
      .andWhere('ht.updated_at < :finMes', { finMes })
      .getMany();

    const ingresosPorDia: Record<string, IngresoDia> = {};
    const diasEnMes = new Date(fechaConsulta.getFullYear(), fechaConsulta.getMonth() + 1, 0).getDate();

    // Inicializar todos los días del mes en 0
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fechaDia = new Date(fechaConsulta.getFullYear(), fechaConsulta.getMonth(), dia);
      const fechaStr = fechaDia.toISOString().split('T')[0];
      ingresosPorDia[fechaStr] = {
        fecha: fechaStr,
        dia: dia,
        ingresos: 0,
        cantidadTrabajos: 0
      };
    }

    // Sumar los ingresos por día
    ingresosMes.forEach(trabajo => {
      const fechaTrabajo = trabajo.updated_at.toISOString().split('T')[0];
      if (ingresosPorDia[fechaTrabajo]) {
        ingresosPorDia[fechaTrabajo].ingresos += Number(trabajo.total);
        ingresosPorDia[fechaTrabajo].cantidadTrabajos += 1;
      }
    });

    const ingresosPorDiaArray = Object.values(ingresosPorDia);

    return {
      mes: fechaConsulta.toLocaleString('es-ES', { month: 'long', year: 'numeric' }),
      año: fechaConsulta.getFullYear(),
      ingresosPorDia: ingresosPorDiaArray,
      totalMes: ingresosPorDiaArray.reduce((sum: number, dia: IngresoDia) => sum + dia.ingresos, 0)
    };
  }

  /**
   * Obtiene el resumen completo de la semana
   */
  async getResumenSemana(fecha?: string): Promise<ResumenSemanaResponse> {
    const fechaConsulta = fecha ? new Date(fecha) : new Date();
    const { inicioSemana, finSemana } = this.obtenerRangoSemana(fechaConsulta);

    const [ingresosSemana, serviciosCompletados, clientesAtendidos] = await Promise.all([
      this.getIngresosPorSemana(fecha),
      this.getServiciosCompletadosSemana(fecha),
      this.getClientesAtendidosSemana(fecha)
    ]);

    return {
      semana: `${inicioSemana.toISOString().split('T')[0]} - ${finSemana.toISOString().split('T')[0]}`,
      resumen: {
        ingresosTotales: ingresosSemana.totalSemana,
        serviciosCompletados: serviciosCompletados.totalServicios,
        clientesAtendidos: clientesAtendidos.totalClientes,
        trabajosRealizados: clientesAtendidos.totalTrabajos
      },
      detalles: {
        ingresosPorDia: ingresosSemana.ingresosPorDia,
        serviciosMasRealizados: serviciosCompletados.servicios,
        clientesConMasTrabajos: clientesAtendidos.clientes
          .sort((a, b) => b.cantidadTrabajos - a.cantidadTrabajos)
          .slice(0, 5)
      }
    };
  }

  /**
   * Obtiene estadísticas generales del taller
   */
  async getEstadisticasGenerales(): Promise<EstadisticasGeneralesResponse> {
    const totalTrabajos = await this.hojaTrabajoRepository.count();
    
    const totalClientesResult = await this.hojaTrabajoRepository
      .createQueryBuilder('ht')
      .select('COUNT(DISTINCT ht.cliente)', 'total')
      .getRawOne();
    
    const totalServicios = await this.servicioRepository.count({ where: { activo: true } });
    
    const ingresosTotalesResult = await this.hojaTrabajoRepository
      .createQueryBuilder('ht')
      .select('SUM(ht.total)', 'total')
      .where('ht.estado IN (:...estados)', { estados: ['completado', 'entregado'] })
      .getRawOne();
    
    const trabajosCompletados = await this.hojaTrabajoRepository.count({ where: { estado: 'completado' } });
    const trabajosPendientes = await this.hojaTrabajoRepository.count({ where: { estado: 'pendiente' } });

    const totalClientes = Number(totalClientesResult?.total || 0);
    const ingresosTotales = Number(ingresosTotalesResult?.total || 0);

    return {
      totales: {
        trabajos: totalTrabajos,
        clientes: totalClientes,
        servicios: totalServicios,
        ingresos: ingresosTotales
      },
      estados: {
        completados: trabajosCompletados,
        pendientes: trabajosPendientes,
        porcentajeCompletados: totalTrabajos > 0 ? (trabajosCompletados / totalTrabajos * 100).toFixed(2) : '0'
      }
    };
  }

  /**
   * Método auxiliar para obtener el rango de la semana
   */
  private obtenerRangoSemana(fecha: Date) {
    const dia = fecha.getDay();
    const diferencia = dia === 0 ? 6 : dia - 1; // Lunes como primer día de la semana
    const inicioSemana = new Date(fecha);
    inicioSemana.setDate(fecha.getDate() - diferencia);
    inicioSemana.setHours(0, 0, 0, 0);

    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 7);

    return { inicioSemana, finSemana };
  }
}
