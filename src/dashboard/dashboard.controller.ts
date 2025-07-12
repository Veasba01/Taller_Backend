import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('ingresos-dia')
  async getIngresosDia(@Query('fecha') fecha?: string) {
    return await this.dashboardService.getIngresosDia(fecha);
  }

  @Get('servicios-completados-semana')
  async getServiciosCompletadosSemana(@Query('fecha') fecha?: string) {
    return await this.dashboardService.getServiciosCompletadosSemana(fecha);
  }

  @Get('clientes-atendidos-semana')
  async getClientesAtendidosSemana(@Query('fecha') fecha?: string) {
    return await this.dashboardService.getClientesAtendidosSemana(fecha);
  }

  @Get('servicios-pendientes-dia')
  async getServiciosPendientesDia(@Query('fecha') fecha?: string) {
    return await this.dashboardService.getServiciosPendientesDia(fecha);
  }

  @Get('ingresos-por-semana')
  async getIngresosPorSemana(@Query('fecha') fecha?: string) {
    return await this.dashboardService.getIngresosPorSemana(fecha);
  }

  @Get('ingresos-por-mes')
  async getIngresosPorMes(@Query('fecha') fecha?: string) {
    return await this.dashboardService.getIngresosPorMes(fecha);
  }

  @Get('resumen-semana')
  async getResumenSemana(@Query('fecha') fecha?: string) {
    return await this.dashboardService.getResumenSemana(fecha);
  }

  @Get('estadisticas-generales')
  async getEstadisticasGenerales() {
    return await this.dashboardService.getEstadisticasGenerales();
  }

  @Get('ingresos-por-metodo-pago')
  async getIngresosPorMetodoPago(@Query('fecha') fecha?: string) {
    return await this.dashboardService.getIngresosPorMetodoPago(fecha);
  }
}
