export interface IngresosDiaResponse {
  fecha: string;
  ingresos: number;
  cantidadTrabajos: number;
  trabajos: TrabajoResumen[];
}

export interface TrabajoResumen {
  id: number;
  cliente: string;
  vehiculo: string;
  total: number;
  estado: string;
}

export interface ServiciosCompletadosResponse {
  semana: string;
  totalServicios: number;
  servicios: ServicioResumen[];
}

export interface ServicioResumen {
  nombre: string;
  cantidad: number;
  ingresos: number;
}

export interface ClientesAtendidosResponse {
  semana: string;
  totalClientes: number;
  totalTrabajos: number;
  clientes: ClienteResumen[];
}

export interface ClienteResumen {
  nombre: string;
  cantidadTrabajos: number;
  totalGastado: number;
}

export interface ServiciosPendientesResponse {
  fecha: string;
  totalPendientes: number;
  trabajos: TrabajoPendiente[];
}

export interface TrabajoPendiente {
  id: number;
  cliente: string;
  vehiculo: string;
  placa: string;
  estado: string;
  servicios: ServicioDetalle[];
}

export interface ServicioDetalle {
  nombre: string;
  precio: number;
  completado: boolean;
}

export interface IngresosPorSemanaResponse {
  semana: string;
  ingresosPorDia: IngresoDia[];
  totalSemana: number;
}

export interface IngresoDia {
  fecha: string;
  dia: string | number;
  ingresos: number;
  cantidadTrabajos: number;
}

export interface IngresosPorMesResponse {
  mes: string;
  año: number;
  ingresosPorDia: IngresoDia[];
  totalMes: number;
}

export interface ResumenSemanaResponse {
  semana: string;
  resumen: {
    ingresosTotales: number;
    serviciosCompletados: number;
    clientesAtendidos: number;
    trabajosRealizados: number;
  };
  detalles: {
    ingresosPorDia: IngresoDia[];
    serviciosMasRealizados: ServicioResumen[];
    clientesConMasTrabajos: ClienteResumen[];
  };
}

export interface EstadisticasGeneralesResponse {
  totales: {
    trabajos: number;
    clientes: number;
    servicios: number;
    ingresos: number;
  };
  estados: {
    completados: number;
    pendientes: number;
    porcentajeCompletados: string;
  };
}

export interface MetodoPagoResponse {
  metodo: string;
  cantidad: number;
  ingresos: number;
  porcentaje: number;
}

export interface IngresosPorMetodoPagoResponse {
  fecha: string;
  metodos: MetodoPagoResponse[];
  totalIngresos: number;
}

export interface GastosResponse {
  fecha: string;
  totalGastos: number;
  cantidadGastos: number;
  gastos: GastoResumen[];
}

export interface GastoResumen {
  id: number;
  monto: number;
  comentario: string;
  fecha: string;
}

export interface ResumenFinancieroResponse {
  fecha: string;
  ingresos: number;
  gastos: number;
  utilidad: number;
  margenUtilidad: number;
}
