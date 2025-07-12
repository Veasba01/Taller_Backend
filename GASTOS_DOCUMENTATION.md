# Gastos - Sistema de Control de Gastos

## Resumen
Se implementó un sistema completo de control de gastos (CRUD) para el taller, incluyendo funcionalidades avanzadas de consulta y análisis financiero.

## Estructura Implementada

### 1. Entidad Gasto (src/entities/gasto.entity.ts)
```typescript
@Entity('gastos')
export class Gasto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto: number;

  @Column({ type: 'text', nullable: true })
  comentario: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

### 2. Servicio Gastos (src/gastos/gastos.service.ts)
Incluye todas las operaciones CRUD básicas y funcionalidades avanzadas:

#### DTOs
- `CreateGastoDto`: Para crear nuevos gastos
- `UpdateGastoDto`: Para actualizar gastos existentes
- `GastosPorPeriodoDto`: Para consultas por período

#### Métodos Principales
- `create()`: Crear nuevo gasto
- `findAll()`: Obtener todos los gastos
- `findOne()`: Obtener gasto por ID
- `update()`: Actualizar gasto
- `remove()`: Eliminar gasto
- `findByPeriodo()`: Gastos por período de fechas
- `getTotalGastosPorPeriodo()`: Total de gastos en un período
- `getGastosDelMes()`: Gastos de un mes específico
- `getEstadisticasGastos()`: Estadísticas generales

### 3. Controlador Gastos (src/gastos/gastos.controller.ts)
Implementa todos los endpoints REST con validación y manejo de errores.

## Endpoints Disponibles

### CRUD Básico
- `POST /gastos` - Crear nuevo gasto
- `GET /gastos` - Obtener todos los gastos
- `GET /gastos/:id` - Obtener gasto específico
- `PATCH /gastos/:id` - Actualizar gasto
- `DELETE /gastos/:id` - Eliminar gasto

### Consultas Avanzadas
- `GET /gastos/estadisticas` - Estadísticas generales
- `GET /gastos/periodo?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD` - Gastos por período
- `GET /gastos/total-periodo?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD` - Total por período
- `GET /gastos/mes?año=YYYY&mes=MM` - Gastos del mes

### Dashboard Financiero
- `GET /dashboard/gastos-dia?fecha=YYYY-MM-DD` - Gastos del día
- `GET /dashboard/resumen-financiero?fecha=YYYY-MM-DD` - Resumen financiero (ingresos vs gastos)

## Ejemplos de Uso

### 1. Crear Nuevo Gasto
```bash
POST /gastos
Content-Type: application/json

{
  "monto": 15000.50,
  "comentario": "Compra de herramientas nuevas"
}
```

**Respuesta:**
```json
{
  "id": 1,
  "monto": 15000.50,
  "comentario": "Compra de herramientas nuevas",
  "created_at": "2025-07-12T10:30:00.000Z",
  "updated_at": "2025-07-12T10:30:00.000Z"
}
```

### 2. Obtener Todos los Gastos
```bash
GET /gastos
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "monto": 15000.50,
    "comentario": "Compra de herramientas nuevas",
    "created_at": "2025-07-12T10:30:00.000Z",
    "updated_at": "2025-07-12T10:30:00.000Z"
  },
  {
    "id": 2,
    "monto": 5000.00,
    "comentario": "Pago de servicios públicos",
    "created_at": "2025-07-12T11:00:00.000Z",
    "updated_at": "2025-07-12T11:00:00.000Z"
  }
]
```

### 3. Actualizar Gasto
```bash
PATCH /gastos/1
Content-Type: application/json

{
  "monto": 16000.00,
  "comentario": "Compra de herramientas nuevas - Actualizado"
}
```

### 4. Gastos por Período
```bash
GET /gastos/periodo?fechaInicio=2025-07-01&fechaFin=2025-07-31
```

### 5. Estadísticas de Gastos
```bash
GET /gastos/estadisticas
```

**Respuesta:**
```json
{
  "totalGastos": 45000.50,
  "cantidadGastos": 3,
  "gastoPromedio": 15000.17,
  "gastoMayor": 25000.00,
  "gastoMenor": 5000.00
}
```

### 6. Resumen Financiero del Día
```bash
GET /dashboard/resumen-financiero?fecha=2025-07-12
```

**Respuesta:**
```json
{
  "fecha": "2025-07-12",
  "ingresos": 120000.00,
  "gastos": 20000.00,
  "utilidad": 100000.00,
  "margenUtilidad": 83.33
}
```

## Validaciones Implementadas

### Validación de Datos
- **Monto**: Debe ser un número positivo
- **Comentario**: Opcional, tipo texto
- **Fechas**: Formato YYYY-MM-DD para consultas
- **IDs**: Validación de enteros positivos

### Manejo de Errores
- **404 Not Found**: Cuando no se encuentra un gasto
- **400 Bad Request**: Datos inválidos
- **500 Internal Server Error**: Errores del servidor

## Integración con Dashboard

### Nuevas Métricas
1. **Gastos del Día**: Total y detalle de gastos diarios
2. **Resumen Financiero**: Comparación ingresos vs gastos
3. **Margen de Utilidad**: Cálculo automático de rentabilidad

### Análisis Disponible
- Gastos por período
- Estadísticas generales
- Comparación con ingresos
- Cálculo de utilidad y margen

## Base de Datos

### Tabla Gastos
```sql
CREATE TABLE gastos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    monto DECIMAL(10, 2) NOT NULL,
    comentario TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Migración
Ejecutar el script: `database/create_gastos_table.sql`

## Módulos Actualizados

### 1. GastosModule (src/gastos/gastos.module.ts)
- Nuevo módulo independiente
- Exporta GastosService para uso en otros módulos

### 2. AppModule (src/app.module.ts)
- Agregado GastosModule
- Agregada entidad Gasto a TypeORM

### 3. DashboardModule (src/dashboard/dashboard.module.ts)
- Agregada entidad Gasto para análisis financiero
- Nuevos endpoints de análisis

## Funcionalidades Destacadas

### ✅ CRUD Completo
- Crear, leer, actualizar y eliminar gastos
- Validaciones y manejo de errores

### ✅ Consultas Avanzadas
- Filtros por fecha
- Estadísticas automáticas
- Agrupación por períodos

### ✅ Análisis Financiero
- Comparación ingresos vs gastos
- Cálculo de utilidad
- Margen de rentabilidad

### ✅ Integración Dashboard
- Métricas en tiempo real
- Análisis histórico
- Reportes financieros

## Próximos Pasos

1. **Ejecutar Migración**: Crear tabla gastos en la base de datos
2. **Reiniciar Aplicación**: Aplicar los cambios del módulo
3. **Probar Endpoints**: Verificar funcionalidad completa
4. **Integrar Frontend**: Conectar con interfaces de usuario

## Compatibilidad

- ✅ **Backward Compatible**: No afecta funcionalidades existentes
- ✅ **Modular**: Puede deshabilitarse sin afectar otros módulos
- ✅ **Escalable**: Preparado para futuras funcionalidades
- ✅ **TypeScript**: Completamente tipado y documentado
