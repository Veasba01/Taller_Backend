import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
}
