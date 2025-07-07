import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HojaTrabajo } from '../entities/hoja-trabajo.entity';
import { HojaTrabajoDetalle } from '../entities/hoja-trabajo-detalle.entity';
import { Servicio } from '../entities/servicio.entity';
import { HojaTrabajoService } from './hoja-trabajo.service';
import { HojaTrabajoController } from './hoja-trabajo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HojaTrabajo, HojaTrabajoDetalle, Servicio])],
  providers: [HojaTrabajoService],
  controllers: [HojaTrabajoController],
  exports: [HojaTrabajoService],
})
export class HojaTrabajoModule {}
