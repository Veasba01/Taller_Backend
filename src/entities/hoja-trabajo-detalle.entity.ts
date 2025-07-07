import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { HojaTrabajo } from './hoja-trabajo.entity';
import { Servicio } from './servicio.entity';

@Entity('hoja_trabajo_detalle')
export class HojaTrabajoDetalle {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => HojaTrabajo, (hojaTrabajo: HojaTrabajo) => hojaTrabajo.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hoja_trabajo_id' })
  hojaTrabajo: HojaTrabajo;

  @Column({ name: 'hoja_trabajo_id' })
  hojaTrabajoId: number;

  @ManyToOne(() => Servicio, (servicio: Servicio) => servicio.hojaTrabajoDetalles)
  @JoinColumn({ name: 'servicio_id' })
  servicio: Servicio;

  @Column({ name: 'servicio_id' })
  servicioId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number; // Precio al momento de agregar el servicio

  @Column({ type: 'text', nullable: true })
  comentario: string;

  @Column({ type: 'boolean', default: false })
  completado: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
