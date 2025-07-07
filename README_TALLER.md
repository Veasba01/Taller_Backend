# Taller Backend

Backend para gestión de hojas de trabajo de taller automotriz desarrollado con NestJS y MySQL.

## Características

- API RESTful para gestión de hojas de trabajo
- Sistema de servicios con precios dinámicos
- Comentarios personalizados por servicio
- Cálculo automático de totales
- Conexión con base de datos MySQL usando TypeORM

## Configuración

### Prerrequisitos

- Node.js (v14 o superior)
- MySQL (v8.0 o superior)
- npm o yarn

### Instalación

1. Clona el repositorio
2. Instala las dependencias:
```bash
npm install
```

3. Configura la base de datos:
   - Crea una base de datos MySQL llamada `taller_db`
   - O ejecuta el script SQL: `database/create_database.sql`

4. Configura las variables de entorno:
   - Edita el archivo `.env` con tus credenciales de MySQL:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_contraseña
DB_DATABASE=taller_db
PORT=3000
```

### Ejecución

```bash
# Desarrollo
npm run start:dev

# Producción
npm run start:prod
```

## API Endpoints

### Servicios

- `GET /servicios` - Obtener todos los servicios disponibles
- `POST /servicios` - Crear nuevo servicio
- `GET /servicios/:id` - Obtener un servicio específico
- `PATCH /servicios/:id` - Actualizar servicio
- `DELETE /servicios/:id` - Desactivar servicio
- `POST /servicios/seed` - Poblar base de datos con servicios iniciales

### Hoja de Trabajo

- `GET /hoja-trabajo` - Obtener todas las hojas de trabajo
- `GET /hoja-trabajo/:id` - Obtener una hoja de trabajo específica
- `POST /hoja-trabajo` - Crear nueva hoja de trabajo
- `PATCH /hoja-trabajo/:id` - Actualizar hoja de trabajo
- `DELETE /hoja-trabajo/:id` - Eliminar hoja de trabajo

### Gestión de Servicios en Hoja de Trabajo

- `POST /hoja-trabajo/:id/servicios` - Agregar servicio a hoja de trabajo
- `DELETE /hoja-trabajo/:id/servicios/:detalleId` - Remover servicio
- `PATCH /hoja-trabajo/:id/servicios/:detalleId/comentario` - Actualizar comentario

## Entidades

### HojaTrabajo
- `id` (number) - ID único
- `cliente` (string) - Nombre del cliente
- `vehiculo` (string) - Información del vehículo
- `placa` (string) - Placa del vehículo
- `observaciones` (string) - Observaciones generales
- `estado` (enum) - Estado: 'pendiente', 'en_proceso', 'completado', 'entregado'
- `total` (decimal) - Total calculado automáticamente
- `detalles` (array) - Servicios incluidos

### Servicio
- `id` (number) - ID único
- `nombre` (string) - Nombre del servicio
- `descripcion` (string) - Descripción
- `precio` (decimal) - Precio del servicio
- `activo` (boolean) - Si está disponible

### HojaTrabajoDetalle
- `id` (number) - ID único
- `hojaTrabajo` (relation) - Hoja de trabajo asociada
- `servicio` (relation) - Servicio asociado
- `precio` (decimal) - Precio al momento de agregar
- `comentario` (string) - Comentario específico
- `completado` (boolean) - Si el servicio está completado

## Ejemplos de uso

### 1. Inicializar servicios
```bash
curl -X POST http://localhost:3000/servicios/seed
```

### 2. Crear hoja de trabajo
```bash
curl -X POST http://localhost:3000/hoja-trabajo \
  -H "Content-Type: application/json" \
  -d '{
    "cliente": "Juan Pérez",
    "vehiculo": "Toyota Corolla 2020",
    "placa": "ABC123",
    "observaciones": "Cliente frecuente"
  }'
```

### 3. Agregar servicio a hoja de trabajo
```bash
curl -X POST http://localhost:3000/hoja-trabajo/1/servicios \
  -H "Content-Type: application/json" \
  -d '{
    "servicioId": 1,
    "comentario": "Requiere pastillas nuevas"
  }'
```

### 4. Actualizar comentario de servicio
```bash
curl -X PATCH http://localhost:3000/hoja-trabajo/1/servicios/1/comentario \
  -H "Content-Type: application/json" \
  -d '{
    "comentario": "Pastillas cambiadas, revisar en 5000km"
  }'
```

### 5. Obtener hoja de trabajo completa
```bash
curl http://localhost:3000/hoja-trabajo/1
```

**Respuesta:**
```json
{
  "id": 1,
  "cliente": "Juan Pérez",
  "vehiculo": "Toyota Corolla 2020",
  "placa": "ABC123",
  "observaciones": "Cliente frecuente",
  "estado": "pendiente",
  "total": 15000,
  "detalles": [
    {
      "id": 1,
      "precio": 15000,
      "comentario": "Pastillas cambiadas, revisar en 5000km",
      "completado": false,
      "servicio": {
        "id": 1,
        "nombre": "frenos",
        "descripcion": "Revisión y reparación del sistema de frenos",
        "precio": 15000
      }
    }
  ],
  "created_at": "2025-07-07T10:00:00.000Z",
  "updated_at": "2025-07-07T10:00:00.000Z"
}
```

## Funcionamiento del Sistema

1. **Servicios predefinidos**: Al ejecutar `/servicios/seed`, se crean los servicios básicos con precios
2. **Selección de servicios**: Al agregar un servicio a una hoja de trabajo, se copia el precio actual
3. **Comentarios personalizados**: Cada servicio en una hoja puede tener comentarios específicos
4. **Cálculo automático**: El total se recalcula cada vez que se agregan/remueven servicios
5. **Historial de precios**: Se mantiene el precio al momento de agregar el servicio

## Estructura del proyecto

```
src/
├── entities/
│   ├── hoja-trabajo.entity.ts        # Entidad principal
│   ├── hoja-trabajo-detalle.entity.ts # Detalles de servicios
│   └── servicio.entity.ts            # Catálogo de servicios
├── hoja-trabajo/
│   ├── hoja-trabajo.module.ts
│   ├── hoja-trabajo.service.ts
│   └── hoja-trabajo.controller.ts
├── servicios/
│   ├── servicio.module.ts
│   ├── servicio.service.ts
│   └── servicio.controller.ts
├── app.module.ts
└── main.ts
```
