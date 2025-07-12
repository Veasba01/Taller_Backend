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
  ParseIntPipe
} from '@nestjs/common';
import { 
  GastosService, 
  CreateGastoDto, 
  UpdateGastoDto 
} from './gastos.service';

@Controller('gastos')
export class GastosController {
  constructor(private readonly gastosService: GastosService) {}

  @Post()
  async create(@Body() createGastoDto: CreateGastoDto) {
    try {
      return await this.gastosService.create(createGastoDto);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear el gasto';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async findAll() {
    return await this.gastosService.findAll();
  }

  @Get('estadisticas')
  async getEstadisticas() {
    return await this.gastosService.getEstadisticasGastos();
  }

  @Get('periodo')
  async findByPeriodo(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string
  ) {
    if (!fechaInicio || !fechaFin) {
      throw new HttpException('Se requieren fechaInicio y fechaFin', HttpStatus.BAD_REQUEST);
    }
    return await this.gastosService.findByPeriodo(fechaInicio, fechaFin);
  }

  @Get('total-periodo')
  async getTotalPeriodo(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string
  ) {
    if (!fechaInicio || !fechaFin) {
      throw new HttpException('Se requieren fechaInicio y fechaFin', HttpStatus.BAD_REQUEST);
    }
    const total = await this.gastosService.getTotalGastosPorPeriodo(fechaInicio, fechaFin);
    return { 
      fechaInicio, 
      fechaFin, 
      totalGastos: total 
    };
  }

  @Get('mes')
  async getGastosDelMes(
    @Query('año') año?: string,
    @Query('mes') mes?: string
  ) {
    const añoNum = año ? parseInt(año) : undefined;
    const mesNum = mes ? parseInt(mes) : undefined;
    
    if (añoNum && (isNaN(añoNum) || añoNum < 1900 || añoNum > 3000)) {
      throw new HttpException('Año inválido', HttpStatus.BAD_REQUEST);
    }
    
    if (mesNum && (isNaN(mesNum) || mesNum < 1 || mesNum > 12)) {
      throw new HttpException('Mes inválido (1-12)', HttpStatus.BAD_REQUEST);
    }

    return await this.gastosService.getGastosDelMes(añoNum, mesNum);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.gastosService.findOne(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Gasto no encontrado', HttpStatus.NOT_FOUND);
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateGastoDto: UpdateGastoDto
  ) {
    try {
      return await this.gastosService.update(id, updateGastoDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error al actualizar el gasto', HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.gastosService.remove(id);
      return { message: 'Gasto eliminado exitosamente' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error al eliminar el gasto', HttpStatus.BAD_REQUEST);
    }
  }
}
