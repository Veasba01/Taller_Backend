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
import { 
  HojaTrabajoService, 
  CreateHojaTrabajoDto, 
  UpdateHojaTrabajoDto,
  AgregarServicioDto 
} from './hoja-trabajo.service';

@Controller('hoja-trabajo')
export class HojaTrabajoController {
  constructor(private readonly hojaTrabajoService: HojaTrabajoService) {}

  @Post()
  create(@Body() createHojaTrabajoDto: CreateHojaTrabajoDto) {
    return this.hojaTrabajoService.create(createHojaTrabajoDto);
  }

  @Get()
  findAll() {
    return this.hojaTrabajoService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const hojaTrabajo = await this.hojaTrabajoService.findOne(+id);
    if (!hojaTrabajo) {
      throw new HttpException('Hoja de trabajo no encontrada', HttpStatus.NOT_FOUND);
    }
    return hojaTrabajo;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateHojaTrabajoDto: UpdateHojaTrabajoDto) {
    const hojaTrabajo = await this.hojaTrabajoService.update(+id, updateHojaTrabajoDto);
    if (!hojaTrabajo) {
      throw new HttpException('Hoja de trabajo no encontrada', HttpStatus.NOT_FOUND);
    }
    return hojaTrabajo;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hojaTrabajoService.remove(+id);
  }

  @Post(':id/servicios')
  async agregarServicio(
    @Param('id') id: string, 
    @Body() agregarServicioDto: AgregarServicioDto
  ) {
    try {
      return await this.hojaTrabajoService.agregarServicio(+id, agregarServicioDto);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      if (errorMessage === 'El servicio ya está agregado a esta hoja de trabajo') {
        throw new HttpException(errorMessage, HttpStatus.CONFLICT);
      }
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id/servicios/:detalleId')
  async removerServicio(
    @Param('id') id: string,
    @Param('detalleId') detalleId: string
  ) {
    try {
      await this.hojaTrabajoService.removerServicio(+id, +detalleId);
      return { message: 'Servicio removido exitosamente' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new HttpException(errorMessage, HttpStatus.NOT_FOUND);
    }
  }

  @Patch(':id/servicios/:detalleId/comentario')
  async actualizarComentario(
    @Param('id') id: string,
    @Param('detalleId') detalleId: string,
    @Body() body: { comentario: string }
  ) {
    try {
      return await this.hojaTrabajoService.actualizarComentarioServicio(+id, +detalleId, body.comentario);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new HttpException(errorMessage, HttpStatus.NOT_FOUND);
    }
  }
}
