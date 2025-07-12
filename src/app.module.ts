import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HojaTrabajoModule } from './hoja-trabajo/hoja-trabajo.module';
import { ServicioModule } from './servicios/servicio.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { GastosModule } from './gastos/gastos.module';
import { HojaTrabajo } from './entities/hoja-trabajo.entity';
import { HojaTrabajoDetalle } from './entities/hoja-trabajo-detalle.entity';
import { Servicio } from './entities/servicio.entity';
import { Gasto } from './entities/gasto.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT') || 3306,
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [HojaTrabajo, HojaTrabajoDetalle, Servicio, Gasto],
        synchronize: true, // Solo para desarrollo
        logging: false, // Desactivar logging SQL
      }),
      inject: [ConfigService],
    }),
    HojaTrabajoModule,
    ServicioModule,
    DashboardModule,
    GastosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
