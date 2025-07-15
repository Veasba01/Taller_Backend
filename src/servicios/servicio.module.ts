import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Servicio } from '../entities/servicio.entity';
import { HojaTrabajoDetalle } from '../entities/hoja-trabajo-detalle.entity';
import { ServicioService } from './servicio.service';
import { ServicioController } from './servicio.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Servicio, HojaTrabajoDetalle])],
  providers: [ServicioService],
  controllers: [ServicioController],
  exports: [ServicioService],
})
export class ServicioModule {}
