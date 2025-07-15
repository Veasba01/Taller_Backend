import { Controller, Get, Post, Query, HttpException, HttpStatus } from '@nestjs/common';
import { CierreCajaService } from './cierre-caja.service';

@Controller('cierre-caja')
export class CierreCajaController {
  constructor(private readonly cierreCajaService: CierreCajaService) {}

  /**
   * Realiza el cierre de caja para una fecha específica
   * POST /cierre-caja/realizar?fecha=2025-07-15
   */
  @Post('realizar')
  async realizarCierre(@Query('fecha') fecha?: string) {
    try {
      return await this.cierreCajaService.realizarCierre(fecha);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al realizar cierre de caja';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Obtiene el resumen detallado para el cierre de caja
   * GET /cierre-caja/resumen?fecha=2025-07-15
   */
  @Get('resumen')
  async obtenerResumenCierre(@Query('fecha') fecha?: string) {
    try {
      return await this.cierreCajaService.obtenerResumenCierre(fecha);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener resumen de cierre';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Obtiene todos los cierres de caja realizados
   * GET /cierre-caja
   */
  @Get()
  async obtenerCierres() {
    try {
      return await this.cierreCajaService.obtenerCierres();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener cierres';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Obtiene un cierre específico por fecha
   * GET /cierre-caja/fecha?fecha=2025-07-15
   */
  @Get('fecha')
  async obtenerCierrePorFecha(@Query('fecha') fecha: string) {
    if (!fecha) {
      throw new HttpException('Se requiere el parámetro fecha', HttpStatus.BAD_REQUEST);
    }

    try {
      const cierre = await this.cierreCajaService.obtenerCierrePorFecha(fecha);
      if (!cierre) {
        throw new HttpException(`No se encontró cierre para la fecha ${fecha}`, HttpStatus.NOT_FOUND);
      }
      return cierre;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener cierre por fecha';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }
}
