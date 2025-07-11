import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { HojaTrabajo } from '../entities/hoja-trabajo.entity';
import { HojaTrabajoDetalle } from '../entities/hoja-trabajo-detalle.entity';
import { Servicio } from '../entities/servicio.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HojaTrabajo, HojaTrabajoDetalle, Servicio])
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService]
})
export class DashboardModule {}
