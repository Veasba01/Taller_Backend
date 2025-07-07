import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { HojaTrabajoDetalle } from './hoja-trabajo-detalle.entity';

@Entity('hoja_trabajo')
export class HojaTrabajo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  cliente: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  vehiculo: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  placa: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'enum', enum: ['pendiente', 'en_proceso', 'completado', 'entregado'], default: 'pendiente' })
  estado: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @OneToMany(() => HojaTrabajoDetalle, (detalle: HojaTrabajoDetalle) => detalle.hojaTrabajo, { cascade: true })
  detalles: HojaTrabajoDetalle[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
