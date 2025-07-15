import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ServicioService, CreateServicioDto, UpdateServicioDto } from './servicio.service';

@Controller('servicios')
export class ServicioController {
  constructor(private readonly servicioService: ServicioService) {}

  @Post()
  create(@Body() createServicioDto: CreateServicioDto) {
    return this.servicioService.create(createServicioDto);
  }

  @Get()
  findAll() {
    return this.servicioService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const servicio = await this.servicioService.findOne(+id);
    if (!servicio) {
      throw new HttpException('Servicio no encontrado', HttpStatus.NOT_FOUND);
    }
    return servicio;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateServicioDto: UpdateServicioDto) {
    const servicio = await this.servicioService.update(+id, updateServicioDto);
    if (!servicio) {
      throw new HttpException('Servicio no encontrado', HttpStatus.NOT_FOUND);
    }
    return servicio;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicioService.remove(+id);
  }

  @Post('seed')
  seed() {
    return this.servicioService.seed();
  }

  @Get('realizados/dia')
  async getServiciosDelDia(@Query('fecha') fecha?: string) {
    try {
      return await this.servicioService.getServiciosDelDia(fecha);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener servicios del día';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('realizados/periodo')
  async getServiciosPorPeriodo(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string
  ) {
    if (!fechaInicio || !fechaFin) {
      throw new HttpException('Se requieren fechaInicio y fechaFin', HttpStatus.BAD_REQUEST);
    }
    
    try {
      return await this.servicioService.getServiciosPorPeriodo(fechaInicio, fechaFin);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener servicios por período';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('todos/dia')
  async getTodosLosServiciosDelDia(@Query('fecha') fecha?: string) {
    try {
      return await this.servicioService.getTodosLosServiciosDelDia(fecha);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener todos los servicios del día';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('todos/periodo')
  async getTodosLosServiciosPorPeriodo(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string
  ) {
    if (!fechaInicio || !fechaFin) {
      throw new HttpException('Se requieren fechaInicio y fechaFin', HttpStatus.BAD_REQUEST);
    }
    
    try {
      return await this.servicioService.getTodosLosServiciosPorPeriodo(fechaInicio, fechaFin);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener todos los servicios por período';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('ingresos/dia')
  async getIngresosPorServicioDelDia(@Query('fecha') fecha?: string) {
    try {
      return await this.servicioService.getIngresosPorServicioDelDia(fecha);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener ingresos por servicio del día';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('ingresos/periodo')
  async getIngresosPorServicioPorPeriodo(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string
  ) {
    if (!fechaInicio || !fechaFin) {
      throw new HttpException('Se requieren fechaInicio y fechaFin', HttpStatus.BAD_REQUEST);
    }
    
    try {
      return await this.servicioService.getIngresosPorServicioPorPeriodo(fechaInicio, fechaFin);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener ingresos por servicio por período';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }
}
