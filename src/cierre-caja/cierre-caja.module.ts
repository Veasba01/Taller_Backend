import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CierreCajaService } from './cierre-caja.service';
import { CierreCajaController } from './cierre-caja.controller';
import { CierreCaja } from '../entities/cierre-caja.entity';
import { HojaTrabajoDetalle } from '../entities/hoja-trabajo-detalle.entity';
import { Gasto } from '../entities/gasto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CierreCaja, HojaTrabajoDetalle, Gasto]),
  ],
  controllers: [CierreCajaController],
  providers: [CierreCajaService],
})
export class CierreCajaModule {}
