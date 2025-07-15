import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('cierre_caja')
@Index(['fecha'], { unique: true }) // Garantiza un cierre por día
export class CierreCaja {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalIngresos: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalGastos: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  saldoFinal: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
