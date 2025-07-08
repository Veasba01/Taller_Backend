# API Documentation - Taller Backend

## Información General

- **Base URL**: `http://localhost:3000`
- **Formato de respuesta**: JSON
- **Autenticación**: No implementada (puedes agregar JWT más tarde)
- **CORS**: ✅ Habilitado para todos los orígenes en desarrollo
- **Métodos HTTP permitidos**: GET, POST, PUT, PATCH, DELETE, OPTIONS
- **Headers permitidos**: Content-Type, Authorization, Accept
- **Credentials**: Habilitado

## Tipos de Datos (TypeScript Interfaces)

### Servicio
```typescript
interface Servicio {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}
```

### HojaTrabajo
```typescript
interface HojaTrabajo {
  id: number;
  cliente?: string;
  vehiculo?: string;
  placa?: string;
  observaciones?: string;
  estado: 'pendiente' | 'en_proceso' | 'completado' | 'entregado';
  total: number;
  detalles: HojaTrabajoDetalle[];
  created_at: Date;
  updated_at: Date;
}
```

### HojaTrabajoDetalle
```typescript
interface HojaTrabajoDetalle {
  id: number;
  hojaTrabajoId: number;
  servicioId: number;
  precio: number;
  comentario?: string;
  completado: boolean;
  servicio: Servicio;
  created_at: Date;
  updated_at: Date;
}
```

### DTOs (Data Transfer Objects)

#### CreateHojaTrabajoDto
```typescript
interface CreateHojaTrabajoDto {
  cliente?: string;
  vehiculo?: string;
  placa?: string;
  observaciones?: string;
  servicios?: Array<{
    servicioId: number;
    comentario?: string;
  }>;
}
```

#### UpdateHojaTrabajoDto
```typescript
interface UpdateHojaTrabajoDto {
  cliente?: string;
  vehiculo?: string;
  placa?: string;
  observaciones?: string;
  estado?: 'pendiente' | 'en_proceso' | 'completado' | 'entregado';
}
```

#### CreateServicioDto
```typescript
interface CreateServicioDto {
  nombre: string;
  descripcion?: string;
  precio: number;
  activo?: boolean;
}
```

#### AgregarServicioDto
```typescript
interface AgregarServicioDto {
  servicioId: number;
  comentario?: string;
}
```

#### ActualizarServiciosDto
```typescript
interface ActualizarServiciosDto {
  servicios: Array<{
    servicioId: number;
    comentario?: string;
  }>;
}
```

---

## Endpoints de Servicios

### 1. Obtener todos los servicios
- **Método**: `GET`
- **URL**: `/servicios`
- **Descripción**: Obtiene todos los servicios activos
- **Respuesta**:
```typescript
Servicio[]
```

**Ejemplo de respuesta**:
```json
[
  {
    "id": 1,
    "nombre": "frenos",
    "descripcion": "Revisión y reparación del sistema de frenos",
    "precio": 15000,
    "activo": true,
    "created_at": "2025-07-07T10:00:00.000Z",
    "updated_at": "2025-07-07T10:00:00.000Z"
  },
  {
    "id": 2,
    "nombre": "suspension",
    "descripcion": "Revisión y reparación de suspensión",
    "precio": 12000,
    "activo": true,
    "created_at": "2025-07-07T10:00:00.000Z",
    "updated_at": "2025-07-07T10:00:00.000Z"
  }
]
```

### 2. Obtener servicio por ID
- **Método**: `GET`
- **URL**: `/servicios/:id`
- **Parámetros**: `id` (number) - ID del servicio
- **Respuesta**: `Servicio`
- **Errores**: 404 si no existe

### 3. Crear nuevo servicio
- **Método**: `POST`
- **URL**: `/servicios`
- **Body**: `CreateServicioDto`
- **Respuesta**: `Servicio`

**Ejemplo de request**:
```json
{
  "nombre": "cambio_aceite",
  "descripcion": "Cambio de aceite y filtro",
  "precio": 8000,
  "activo": true
}
```

### 4. Actualizar servicio
- **Método**: `PATCH`
- **URL**: `/servicios/:id`
- **Parámetros**: `id` (number)
- **Body**: `Partial<CreateServicioDto>`
- **Respuesta**: `Servicio`
- **Errores**: 404 si no existe

### 5. Desactivar servicio
- **Método**: `DELETE`
- **URL**: `/servicios/:id`
- **Parámetros**: `id` (number)
- **Descripción**: Marca el servicio como inactivo (no lo elimina)
- **Respuesta**: `void`

### 6. Poblar servicios iniciales
- **Método**: `POST`
- **URL**: `/servicios/seed`
- **Descripción**: Crea los servicios predefinidos del taller
- **Respuesta**: `void`

**Servicios creados por seed**:
```json
[
  { "nombre": "frenos", "precio": 15000 },
  { "nombre": "cambio_rotula", "precio": 8000 },
  { "nombre": "suspension", "precio": 12000 },
  { "nombre": "gases", "precio": 5000 },
  { "nombre": "cambio_compensadores", "precio": 6000 },
  { "nombre": "catalizador", "precio": 25000 },
  { "nombre": "silenciador", "precio": 10000 },
  { "nombre": "regulacion", "precio": 8000 },
  { "nombre": "alineado", "precio": 7000 },
  { "nombre": "tramado", "precio": 4000 },
  { "nombre": "luces", "precio": 3000 },
  { "nombre": "llantas", "precio": 20000 },
  { "nombre": "servicio_scanner", "precio": 15000 },
  { "nombre": "soldadura", "precio": 12000 }
]
```

---

## Endpoints de Hoja de Trabajo

### 1. Obtener todas las hojas de trabajo
- **Método**: `GET`
- **URL**: `/hoja-trabajo`
- **Descripción**: Obtiene todas las hojas con sus servicios incluidos
- **Respuesta**: `HojaTrabajo[]`

### 2. Obtener hoja de trabajo por ID
- **Método**: `GET`
- **URL**: `/hoja-trabajo/:id`
- **Parámetros**: `id` (number)
- **Respuesta**: `HojaTrabajo`
- **Errores**: 404 si no existe

**Ejemplo de respuesta**:
```json
{
  "id": 1,
  "cliente": "Juan Pérez",
  "vehiculo": "Toyota Corolla 2020",
  "placa": "ABC123",
  "observaciones": "Cliente frecuente",
  "estado": "pendiente",
  "total": 27000,
  "detalles": [
    {
      "id": 1,
      "hojaTrabajoId": 1,
      "servicioId": 1,
      "precio": 15000,
      "comentario": "Requiere pastillas nuevas",
      "completado": false,
      "servicio": {
        "id": 1,
        "nombre": "frenos",
        "descripcion": "Revisión y reparación del sistema de frenos",
        "precio": 15000,
        "activo": true
      },
      "created_at": "2025-07-07T10:00:00.000Z",
      "updated_at": "2025-07-07T10:00:00.000Z"
    },
    {
      "id": 2,
      "hojaTrabajoId": 1,
      "servicioId": 3,
      "precio": 12000,
      "comentario": "Revisar amortiguadores",
      "completado": false,
      "servicio": {
        "id": 3,
        "nombre": "suspension",
        "descripcion": "Revisión y reparación de suspensión",
        "precio": 12000,
        "activo": true
      },
      "created_at": "2025-07-07T10:00:00.000Z",
      "updated_at": "2025-07-07T10:00:00.000Z"
    }
  ],
  "created_at": "2025-07-07T10:00:00.000Z",
  "updated_at": "2025-07-07T10:00:00.000Z"
}
```

### 3. Crear nueva hoja de trabajo
- **Método**: `POST`
- **URL**: `/hoja-trabajo`
- **Body**: `CreateHojaTrabajoDto`
- **Respuesta**: `HojaTrabajo`

**Ejemplo de request**:
```json
{
  "cliente": "María García",
  "vehiculo": "Honda Civic 2019",
  "placa": "XYZ789",
  "observaciones": "Primera visita",
  "servicios": [
    {
      "servicioId": 1,
      "comentario": "Cliente reporta ruido al frenar"
    },
    {
      "servicioId": 9,
      "comentario": "Vehículo se desvía hacia la derecha"
    }
  ]
}
```

### 4. Actualizar hoja de trabajo
- **Método**: `PATCH`
- **URL**: `/hoja-trabajo/:id`
- **Parámetros**: `id` (number)
- **Body**: `UpdateHojaTrabajoDto`
- **Respuesta**: `HojaTrabajo`
- **Errores**: 404 si no existe

**Ejemplo de request**:
```json
{
  "estado": "en_proceso",
  "observaciones": "Trabajo iniciado - revisando frenos"
}
```

### 5. Eliminar hoja de trabajo
- **Método**: `DELETE`
- **URL**: `/hoja-trabajo/:id`
- **Parámetros**: `id` (number)
- **Respuesta**: `void`

---

## Endpoints de Gestión de Servicios en Hoja de Trabajo

### 1. Agregar servicio a hoja de trabajo
- **Método**: `POST`
- **URL**: `/hoja-trabajo/:id/servicios`
- **Parámetros**: `id` (number) - ID de la hoja de trabajo
- **Body**: `AgregarServicioDto`
- **Respuesta**: `HojaTrabajoDetalle`
- **Errores**: 
  - 404 si la hoja de trabajo no existe
  - 404 si el servicio no existe
  - 409 si el servicio ya está agregado

**Ejemplo de request**:
```json
{
  "servicioId": 2,
  "comentario": "Cliente solicita cambio urgente"
}
```

### 2. Remover servicio de hoja de trabajo
- **Método**: `DELETE`
- **URL**: `/hoja-trabajo/:id/servicios/:detalleId`
- **Parámetros**: 
  - `id` (number) - ID de la hoja de trabajo
  - `detalleId` (number) - ID del detalle a eliminar
- **Respuesta**: `{ message: string }`
- **Errores**: 404 si no existe

### 3. Actualizar comentario de servicio
- **Método**: `PATCH`
- **URL**: `/hoja-trabajo/:id/servicios/:detalleId/comentario`
- **Parámetros**: 
  - `id` (number) - ID de la hoja de trabajo
  - `detalleId` (number) - ID del detalle
- **Body**: `{ comentario: string }`
- **Respuesta**: `HojaTrabajoDetalle`
- **Errores**: 404 si no existe

**Ejemplo de request**:
```json
{
  "comentario": "Trabajo completado - pastillas nuevas instaladas"
}
```

### 4. Actualizar servicios de hoja de trabajo (masivo)
- **Método**: `PUT`
- **URL**: `/hoja-trabajo/:id/servicios`
- **Parámetros**: `id` (number) - ID de la hoja de trabajo
- **Body**: `ActualizarServiciosDto`
- **Respuesta**: `HojaTrabajo`
- **Descripción**: Reemplaza TODOS los servicios existentes con los nuevos servicios especificados
- **Errores**: 
  - 404 si la hoja de trabajo no existe
  - 404 si algún servicio no existe

**Ejemplo de request**:
```json
{
  "servicios": [
    {
      "servicioId": 1,
      "comentario": "Frenos nuevos requeridos"
    },
    {
      "servicioId": 3,
      "comentario": "Revisar suspensión delantera"
    },
    {
      "servicioId": 9,
      "comentario": "Alineación después de cambio de llantas"
    }
  ]
}
```

**Nota importante**: Este endpoint elimina todos los servicios existentes y agrega los nuevos. El total se recalcula automáticamente.

---

## Códigos de Estado HTTP

### Exitosos (2xx)
- **200 OK**: Operación exitosa
- **201 Created**: Recurso creado exitosamente

### Errores del Cliente (4xx)
- **400 Bad Request**: Datos inválidos en el request
- **404 Not Found**: Recurso no encontrado
- **409 Conflict**: El servicio ya está agregado a la hoja de trabajo

### Errores del Servidor (5xx)
- **500 Internal Server Error**: Error interno del servidor

---

## Configuración de CORS

### CORS Habilitado
El servidor tiene CORS completamente habilitado para desarrollo con las siguientes configuraciones:

```typescript
app.enableCors({
  origin: true, // Permite todos los orígenes
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
});
```

### Ejemplo de Request desde React/JavaScript
```javascript
// Ejemplo con fetch - NO necesitas configuración especial de CORS
const response = await fetch('http://localhost:3000/servicios', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Ejemplo con Axios
```javascript
// Si usas Axios, también funciona sin configuración especial
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Usar normalmente
const servicios = await api.get('/servicios');
```

---

## Ejemplos de Uso con Fetch API

### Obtener servicios disponibles
```javascript
const getServicios = async () => {
  try {
    const response = await fetch('http://localhost:3000/servicios');
    const servicios = await response.json();
    return servicios;
  } catch (error) {
    console.error('Error al obtener servicios:', error);
  }
};
```

### Crear hoja de trabajo
```javascript
const createHojaTrabajo = async (data) => {
  try {
    const response = await fetch('http://localhost:3000/hoja-trabajo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const hojaTrabajo = await response.json();
    return hojaTrabajo;
  } catch (error) {
    console.error('Error al crear hoja de trabajo:', error);
  }
};
```

### Agregar servicio a hoja de trabajo
```javascript
const agregarServicio = async (hojaTrabajoId, servicioData) => {
  try {
    const response = await fetch(`http://localhost:3000/hoja-trabajo/${hojaTrabajoId}/servicios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(servicioData),
    });
    
    if (response.status === 409) {
      throw new Error('El servicio ya está agregado a esta hoja de trabajo');
    }
    
    const detalle = await response.json();
    return detalle;
  } catch (error) {
    console.error('Error al agregar servicio:', error);
    throw error;
  }
};
```

### Actualizar estado de hoja de trabajo
```javascript
const updateEstadoHojaTrabajo = async (id, estado) => {
  try {
    const response = await fetch(`http://localhost:3000/hoja-trabajo/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ estado }),
    });
    const hojaTrabajo = await response.json();
    return hojaTrabajo;
  } catch (error) {
    console.error('Error al actualizar estado:', error);
  }
};
```

### Actualizar servicios masivamente
```javascript
const actualizarServicios = async (hojaTrabajoId, servicios) => {
  try {
    const response = await fetch(`http://localhost:3000/hoja-trabajo/${hojaTrabajoId}/servicios`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ servicios }),
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar servicios');
    }
    
    const hojaActualizada = await response.json();
    return hojaActualizada;
  } catch (error) {
    console.error('Error al actualizar servicios:', error);
    throw error;
  }
};

// Ejemplo de uso
const nuevosServicios = [
  { servicioId: 1, comentario: "Frenos delanteros" },
  { servicioId: 3, comentario: "Suspensión completa" },
  { servicioId: 9, comentario: "Alineación post-cambio" }
];

const hojaActualizada = await actualizarServicios(1, nuevosServicios);
```

---

## Flujo de Trabajo Recomendado

### 1. Inicialización
```javascript
// Al iniciar la aplicación, poblar servicios si es necesario
await fetch('http://localhost:3000/servicios/seed', { method: 'POST' });

// Obtener servicios disponibles
const servicios = await getServicios();
```

### 2. Crear nueva hoja de trabajo
```javascript
const nuevaHoja = {
  cliente: "Juan Pérez",
  vehiculo: "Toyota Corolla 2020",
  placa: "ABC123",
  observaciones: "Cliente frecuente"
};

const hojaCreada = await createHojaTrabajo(nuevaHoja);
```

### 3. Agregar servicios dinámicamente
```javascript
// OPCIÓN A: Agregar servicios uno por uno
const serviciosSeleccionados = [
  { servicioId: 1, comentario: "Ruido al frenar" },
  { servicioId: 3, comentario: "Revisar amortiguadores" }
];

for (const servicio of serviciosSeleccionados) {
  await agregarServicio(hojaCreada.id, servicio);
}

// OPCIÓN B: Actualizar todos los servicios de una vez (RECOMENDADO)
await actualizarServicios(hojaCreada.id, serviciosSeleccionados);
```

### 3.1. Modificar servicios de hoja existente
```javascript
// Para modificar servicios de una hoja de trabajo ya creada
const hojaTrabajoId = 1;

// Obtener servicios actuales
const hojaActual = await fetch(`http://localhost:3000/hoja-trabajo/${hojaTrabajoId}`)
  .then(res => res.json());

// Modificar la lista de servicios
const serviciosModificados = [
  { servicioId: 1, comentario: "Frenos completados" },
  { servicioId: 5, comentario: "Cambio de compensadores agregado" },
  // Nota: esto eliminará cualquier otro servicio que tuviera antes
];

// Actualizar todos los servicios
const hojaActualizada = await actualizarServicios(hojaTrabajoId, serviciosModificados);
```

### 4. Obtener hoja actualizada con totales
```javascript
const hojaCompleta = await fetch(`http://localhost:3000/hoja-trabajo/${hojaCreada.id}`)
  .then(res => res.json());

console.log('Total:', hojaCompleta.total); // Total calculado automáticamente
```

---

## Notas Importantes

1. **Cálculo Automático de Totales**: El total se recalcula automáticamente cada vez que se agregan o remueven servicios.

2. **Precios Históricos**: Cuando se agrega un servicio a una hoja de trabajo, se guarda el precio actual del servicio. Si luego cambias el precio del servicio en el catálogo, las hojas de trabajo existentes mantienen el precio original.

3. **Estados de Hoja de Trabajo**: Los estados siguen el flujo: `pendiente` → `en_proceso` → `completado` → `entregado`

4. **Servicios Únicos**: No se puede agregar el mismo servicio dos veces a una hoja de trabajo.

5. **Soft Delete**: Los servicios se desactivan en lugar de eliminarse para mantener la integridad referencial.

6. **Relaciones**: Todas las consultas incluyen las relaciones necesarias para obtener la información completa.

---

## Base de Datos

### Tablas Principales
- `hoja_trabajo`: Información principal de cada hoja
- `servicios`: Catálogo de servicios disponibles
- `hoja_trabajo_detalle`: Relación entre hojas y servicios seleccionados

### Índices Recomendados
- `hoja_trabajo.cliente` para búsquedas por cliente
- `hoja_trabajo.placa` para búsquedas por vehículo
- `hoja_trabajo.estado` para filtros por estado
- `servicios.nombre` para búsquedas de servicios
