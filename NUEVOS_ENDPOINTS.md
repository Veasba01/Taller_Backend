# Nuevos Endpoints de Servicios

## 1. Endpoints para Visualizar Servicios Vendidos

### GET /servicios/dia
- **Descripción**: Obtiene los servicios vendidos con nombre y precio para un día específico
- **Parámetros**: 
  - `fecha` (opcional): Fecha en formato YYYY-MM-DD. Si no se especifica, usa la fecha actual
- **Ejemplo**: `http://localhost:3000/servicios/dia?fecha=2025-07-14`

### GET /servicios/periodo
- **Descripción**: Obtiene los servicios vendidos con nombre y precio para un período específico
- **Parámetros**: 
  - `fechaInicio` (requerido): Fecha de inicio en formato YYYY-MM-DD
  - `fechaFin` (requerido): Fecha de fin en formato YYYY-MM-DD
- **Ejemplo**: `http://localhost:3000/servicios/periodo?fechaInicio=2025-07-13&fechaFin=2025-07-14`

## 2. Endpoints para Visualizar Todos los Servicios (incluye no completados)

### GET /servicios/todos/dia
- **Descripción**: Obtiene todos los servicios (completados y no completados) para un día específico
- **Parámetros**: 
  - `fecha` (opcional): Fecha en formato YYYY-MM-DD. Si no se especifica, usa la fecha actual
- **Ejemplo**: `http://localhost:3000/servicios/todos/dia?fecha=2025-07-14`

### GET /servicios/todos/periodo
- **Descripción**: Obtiene todos los servicios (completados y no completados) para un período específico
- **Parámetros**: 
  - `fechaInicio` (requerido): Fecha de inicio en formato YYYY-MM-DD
  - `fechaFin` (requerido): Fecha de fin en formato YYYY-MM-DD
- **Ejemplo**: `http://localhost:3000/servicios/todos/periodo?fechaInicio=2025-07-13&fechaFin=2025-07-14`

## 3. Endpoints para Visualizar Ingresos por Servicio

### GET /servicios/ingresos/dia
- **Descripción**: Obtiene los ingresos totales por cada tipo de servicio para un día específico
- **Parámetros**: 
  - `fecha` (opcional): Fecha en formato YYYY-MM-DD. Si no se especifica, usa la fecha actual
- **Ejemplo**: `http://localhost:3000/servicios/ingresos/dia?fecha=2025-07-14`
- **Respuesta**: Incluye información agregada por servicio:
  - `nombre`: Nombre del servicio
  - `descripcion`: Descripción del servicio
  - `cantidad`: Cantidad de servicios vendidos
  - `ingresoTotal`: Total de ingresos por este servicio

### GET /servicios/ingresos/periodo
- **Descripción**: Obtiene los ingresos totales por cada tipo de servicio para un período específico
- **Parámetros**: 
  - `fechaInicio` (requerido): Fecha de inicio en formato YYYY-MM-DD
  - `fechaFin` (requerido): Fecha de fin en formato YYYY-MM-DD
- **Ejemplo**: `http://localhost:3000/servicios/ingresos/periodo?fechaInicio=2025-07-13&fechaFin=2025-07-14`
- **Respuesta**: Incluye información agregada por servicio igual que el endpoint diario

## Ejemplo de Respuesta de Ingresos

```json
{
  "fechaInicio": "2025-07-14",
  "fechaFin": "2025-07-14",
  "totalIngresos": 49000,
  "totalServicios": 6,
  "servicios": [
    {
      "nombre": "frenos",
      "descripcion": "Revisión y reparación del sistema de frenos",
      "cantidad": 1,
      "ingresoTotal": 15000
    },
    {
      "nombre": "soldadura",
      "descripcion": "Trabajos de soldadura automotriz",
      "cantidad": 1,
      "ingresoTotal": 12000
    }
  ]
}
```

## Notas Importantes

1. **Zona Horaria**: Todos los endpoints utilizan la zona horaria de Costa Rica (UTC-6)
2. **Formato de Fecha**: Todas las fechas deben estar en formato YYYY-MM-DD
3. **Filtros**: Los endpoints de ingresos solo incluyen servicios completados (completado = true)
4. **Ordenamiento**: Los resultados se ordenan por ingreso total de mayor a menor
5. **Agregación**: Los endpoints de ingresos agrupan por nombre de servicio y calculan totales automáticamente
