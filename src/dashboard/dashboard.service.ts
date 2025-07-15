/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HojaTrabajo } from '../entities/hoja-trabajo.entity';
import { HojaTrabajoDetalle } from '../entities/hoja-trabajo-detalle.entity';
import { Servicio } from '../entities/servicio.entity';
import { Gasto } from '../entities/gasto.entity';
import { TimezoneUtil } from '../utils/timezone.util';
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
  IngresoDia,
  IngresosPorMetodoPagoResponse,
  MetodoPagoResponse,
  GastosResponse,
  ResumenFinancieroResponse
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
    @InjectRepository(Gasto)
    private readonly gastosRepository: Repository<Gasto>,
  ) {}

  /**
   * Obtiene los ingresos del día especificado
   */
  async getIngresosDia(fecha?: string): Promise<IngresosDiaResponse> {
    const fechaConsulta = fecha ? TimezoneUtil.parseCostaRicaDate(fecha) : TimezoneUtil.getCurrentCostaRicaDate();
    const { inicioDia, finDia } = TimezoneUtil.getDayRange(fechaConsulta);

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
    const fechaConsulta = fecha ? TimezoneUtil.parseCostaRicaDate(fecha) : TimezoneUtil.getCurrentCostaRicaDate();
    const { inicioSemana, finSemana } = TimezoneUtil.getWeekRange(fechaConsulta);

    const serviciosCompletados = await this.hojaTrabajoDetalleRepository
      .createQueryBuilder('htd')
      .leftJoinAndSelect('htd.hojaTrabajo', 'ht')
      .leftJoinAndSelect('htd.servicio', 's')
      .where('htd.updated_at >= :inicioSemana', { inicioSemana })
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
    const fechaConsulta = fecha ? TimezoneUtil.parseCostaRicaDate(fecha) : TimezoneUtil.getCurrentCostaRicaDate();
    const { inicioSemana, finSemana } = TimezoneUtil.getWeekRange(fechaConsulta);

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
    const fechaConsulta = fecha ? TimezoneUtil.parseCostaRicaDate(fecha) : TimezoneUtil.getCurrentCostaRicaDate();
    const { inicioDia, finDia } = TimezoneUtil.getDayRange(fechaConsulta);

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
    const fechaConsulta = fecha ? TimezoneUtil.parseCostaRicaDate(fecha) : TimezoneUtil.getCurrentCostaRicaDate();
    const { inicioSemana, finSemana } = TimezoneUtil.getWeekRange(fechaConsulta);

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
      // Convertir la fecha updated_at a zona horaria de Costa Rica
      const fechaTrabajoUTC = new Date(trabajo.updated_at);
      const fechaTrabajoCostaRica = new Date(fechaTrabajoUTC.getTime() - (6 * 60 * 60 * 1000)); // UTC-6
      const fechaTrabajo = fechaTrabajoCostaRica.toISOString().split('T')[0];
      
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
    const fechaConsulta = fecha ? TimezoneUtil.parseCostaRicaDate(fecha) : TimezoneUtil.getCurrentCostaRicaDate();
    const { inicioMes, finMes } = TimezoneUtil.getMonthRange(fechaConsulta);

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
      // Convertir la fecha updated_at a zona horaria de Costa Rica
      const fechaTrabajoUTC = new Date(trabajo.updated_at);
      const fechaTrabajoCostaRica = new Date(fechaTrabajoUTC.getTime() - (6 * 60 * 60 * 1000)); // UTC-6
      const fechaTrabajo = fechaTrabajoCostaRica.toISOString().split('T')[0];
      
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
    const fechaConsulta = fecha ? TimezoneUtil.parseCostaRicaDate(fecha) : TimezoneUtil.getCurrentCostaRicaDate();
    const { inicioSemana, finSemana } = TimezoneUtil.getWeekRange(fechaConsulta);

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
    
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const totalClientesResult = await this.hojaTrabajoRepository
      .createQueryBuilder('ht')
      .select('COUNT(DISTINCT ht.cliente)', 'total')
      .getRawOne();
    
    const totalServicios = await this.servicioRepository.count({ where: { activo: true } });
    
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
   * Obtiene los ingresos por método de pago
   */
  async getIngresosPorMetodoPago(fecha?: string): Promise<IngresosPorMetodoPagoResponse> {
    const fechaConsulta = fecha ? TimezoneUtil.parseCostaRicaDate(fecha) : TimezoneUtil.getCurrentCostaRicaDate();
    const { inicioDia, finDia } = TimezoneUtil.getDayRange(fechaConsulta);

    const trabajos = await this.hojaTrabajoRepository
      .createQueryBuilder('ht')
      .where('ht.estado IN (:...estados)', { estados: ['completado', 'entregado'] })
      .andWhere('ht.updated_at >= :inicioDia', { inicioDia })
      .andWhere('ht.updated_at < :finDia', { finDia })
      .getMany();

    const totalIngresos = trabajos.reduce((sum, hoja) => sum + Number(hoja.total), 0);
    
    // Agrupar por método de pago
    const metodosPago = ['pendiente', 'sinpe', 'tarjeta', 'efectivo'];
    const metodos: MetodoPagoResponse[] = metodosPago.map(metodo => {
      const trabajosMetodo = trabajos.filter(t => t.metodo_pago === metodo);
      const ingresos = trabajosMetodo.reduce((sum, hoja) => sum + Number(hoja.total), 0);
      const porcentaje = totalIngresos > 0 ? (ingresos / totalIngresos) * 100 : 0;
      
      return {
        metodo,
        cantidad: trabajosMetodo.length,
        ingresos,
        porcentaje: parseFloat(porcentaje.toFixed(2))
      };
    });

    return {
      fecha: fechaConsulta.toISOString().split('T')[0],
      metodos,
      totalIngresos
    };
  }

  /**
   * Obtiene los gastos del día
   */
  async getGastosDia(fecha?: string): Promise<GastosResponse> {
    const fechaConsulta = fecha ? TimezoneUtil.parseCostaRicaDate(fecha) : TimezoneUtil.getCurrentCostaRicaDate();
    const { inicioDia, finDia } = TimezoneUtil.getDayRange(fechaConsulta);

    const gastos = await this.gastosRepository
      .createQueryBuilder('gasto')
      .where('gasto.created_at >= :inicioDia', { inicioDia })
      .andWhere('gasto.created_at < :finDia', { finDia })
      .orderBy('gasto.created_at', 'DESC')
      .getMany();

    const totalGastos = gastos.reduce((sum, gasto) => sum + Number(gasto.monto), 0);

    return {
      fecha: fechaConsulta.toISOString().split('T')[0],
      totalGastos,
      cantidadGastos: gastos.length,
      gastos: gastos.map(g => {
        // Convertir la fecha created_at a zona horaria de Costa Rica
        const fechaUTC = new Date(g.created_at);
        const fechaCostaRica = new Date(fechaUTC.getTime() - (6 * 60 * 60 * 1000)); // UTC-6
        return {
          id: g.id,
          monto: Number(g.monto),
          comentario: g.comentario,
          fecha: fechaCostaRica.toISOString().split('T')[0]
        };
      })
    };
  }

  /**
   * Obtiene el resumen financiero del día (ingresos vs gastos)
   */
  async getResumenFinanciero(fecha?: string): Promise<ResumenFinancieroResponse> {
    const fechaConsulta = fecha ? TimezoneUtil.parseCostaRicaDate(fecha) : TimezoneUtil.getCurrentCostaRicaDate();
    const { inicioDia, finDia } = TimezoneUtil.getDayRange(fechaConsulta);

    // Obtener ingresos del día
    const ingresos = await this.hojaTrabajoRepository
      .createQueryBuilder('ht')
      .where('ht.estado IN (:...estados)', { estados: ['completado', 'entregado'] })
      .andWhere('ht.updated_at >= :inicioDia', { inicioDia })
      .andWhere('ht.updated_at < :finDia', { finDia })
      .getMany();

    // Obtener gastos del día
    const gastos = await this.gastosRepository
      .createQueryBuilder('gasto')
      .where('gasto.created_at >= :inicioDia', { inicioDia })
      .andWhere('gasto.created_at < :finDia', { finDia })
      .getMany();

    const totalIngresos = ingresos.reduce((sum, hoja) => sum + Number(hoja.total), 0);
    const totalGastos = gastos.reduce((sum, gasto) => sum + Number(gasto.monto), 0);
    const utilidad = totalIngresos - totalGastos;
    const margenUtilidad = totalIngresos > 0 ? (utilidad / totalIngresos) * 100 : 0;

    return {
      fecha: fechaConsulta.toISOString().split('T')[0],
      ingresos: totalIngresos,
      gastos: totalGastos,
      utilidad,
      margenUtilidad: parseFloat(margenUtilidad.toFixed(2))
    };
  }

}
