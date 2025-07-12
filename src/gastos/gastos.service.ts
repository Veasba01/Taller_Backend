import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gasto } from '../entities/gasto.entity';

export interface CreateGastoDto {
  monto: number;
  comentario?: string;
}

export interface UpdateGastoDto {
  monto?: number;
  comentario?: string;
}

export interface GastosPorPeriodoDto {
  fechaInicio: string;
  fechaFin: string;
}

@Injectable()
export class GastosService {
  constructor(
    @InjectRepository(Gasto)
    private gastosRepository: Repository<Gasto>,
  ) {}

  async create(createGastoDto: CreateGastoDto): Promise<Gasto> {
    const gasto = this.gastosRepository.create(createGastoDto);
    return await this.gastosRepository.save(gasto);
  }

  async findAll(): Promise<Gasto[]> {
    return await this.gastosRepository.find({
      order: { created_at: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Gasto> {
    const gasto = await this.gastosRepository.findOne({ where: { id } });
    if (!gasto) {
      throw new NotFoundException(`Gasto con ID ${id} no encontrado`);
    }
    return gasto;
  }

  async update(id: number, updateGastoDto: UpdateGastoDto): Promise<Gasto> {
    const gasto = await this.findOne(id);
    const updatedGasto = await this.gastosRepository.save({
      ...gasto,
      ...updateGastoDto
    });
    return updatedGasto;
  }

  async remove(id: number): Promise<void> {
    const gasto = await this.findOne(id);
    await this.gastosRepository.remove(gasto);
  }

  async findByPeriodo(fechaInicio: string, fechaFin: string): Promise<Gasto[]> {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    fin.setHours(23, 59, 59, 999); // Incluir todo el día final

    return await this.gastosRepository
      .createQueryBuilder('gasto')
      .where('gasto.created_at >= :inicio', { inicio })
      .andWhere('gasto.created_at <= :fin', { fin })
      .orderBy('gasto.created_at', 'DESC')
      .getMany();
  }

  async getTotalGastosPorPeriodo(fechaInicio: string, fechaFin: string): Promise<number> {
    const gastos = await this.findByPeriodo(fechaInicio, fechaFin);
    return gastos.reduce((total, gasto) => total + Number(gasto.monto), 0);
  }

  async getGastosDelMes(año?: number, mes?: number): Promise<Gasto[]> {
    const fechaActual = new Date();
    const añoConsulta = año || fechaActual.getFullYear();
    const mesConsulta = mes || fechaActual.getMonth() + 1;

    const inicioMes = new Date(añoConsulta, mesConsulta - 1, 1);
    const finMes = new Date(añoConsulta, mesConsulta, 0);

    return await this.gastosRepository
      .createQueryBuilder('gasto')
      .where('gasto.created_at >= :inicio', { inicio: inicioMes })
      .andWhere('gasto.created_at <= :fin', { fin: finMes })
      .orderBy('gasto.created_at', 'DESC')
      .getMany();
  }

  async getEstadisticasGastos(): Promise<{
    totalGastos: number;
    cantidadGastos: number;
    gastoPromedio: number;
    gastoMayor: number;
    gastoMenor: number;
  }> {
    const gastos = await this.gastosRepository.find();
    
    if (gastos.length === 0) {
      return {
        totalGastos: 0,
        cantidadGastos: 0,
        gastoPromedio: 0,
        gastoMayor: 0,
        gastoMenor: 0
      };
    }

    const montos = gastos.map(gasto => Number(gasto.monto));
    const totalGastos = montos.reduce((sum, monto) => sum + monto, 0);
    
    return {
      totalGastos,
      cantidadGastos: gastos.length,
      gastoPromedio: totalGastos / gastos.length,
      gastoMayor: Math.max(...montos),
      gastoMenor: Math.min(...montos)
    };
  }
}
