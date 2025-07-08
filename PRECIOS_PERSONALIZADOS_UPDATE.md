# 🔧 Actualización: Soporte para Precios Personalizados

## 📋 Problema Identificado

Actualmente el frontend permite modificar precios de servicios en el modal de hoja de trabajo, pero la API no está preparada para recibir estos precios personalizados. Los servicios se guardan siempre con el precio del catálogo, ignorando las modificaciones del usuario.

## 🎯 Objetivo

Permitir que los usuarios puedan establecer precios personalizados para servicios en hojas de trabajo específicas, manteniendo el precio original del catálogo intacto.

---

## 🔄 Cambios Necesarios en el Backend

### 1. Actualizar DTOs (Data Transfer Objects)

#### 1.1 Modificar `CreateHojaTrabajoDto`
```typescript
// ✅ YA ESTÁ ACTUALIZADO EN LA DOCUMENTACIÓN
interface CreateHojaTrabajoDto {
  cliente?: string;
  vehiculo?: string;
  placa?: string;
  observaciones?: string;
  servicios?: Array<{
    servicioId: number;
    comentario?: string;
    precio?: number; // 🆕 AGREGAR ESTE CAMPO
  }>;
}
```

#### 1.2 Modificar `AgregarServicioDto`
```typescript
// ✅ YA ESTÁ ACTUALIZADO EN LA DOCUMENTACIÓN
interface AgregarServicioDto {
  servicioId: number;
  comentario?: string;
  precio?: number; // 🆕 AGREGAR ESTE CAMPO
}
```

#### 1.3 Modificar `ActualizarServiciosDto`
```typescript
// ✅ YA ESTÁ ACTUALIZADO EN LA DOCUMENTACIÓN
interface ActualizarServiciosDto {
  servicios: Array<{
    servicioId: number;
    comentario?: string;
    precio?: number; // 🆕 AGREGAR ESTE CAMPO
  }>;
}
```

### 2. Actualizar Validaciones y DTOs en el Backend

Si estás usando NestJS con class-validator, necesitas actualizar tus DTOs:

```typescript
// create-hoja-trabajo.dto.ts
import { IsOptional, IsString, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

class ServicioHojaTrabajoDto {
  @IsNumber()
  servicioId: number;

  @IsOptional()
  @IsString()
  comentario?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precio?: number; // 🆕 NUEVO CAMPO
}

export class CreateHojaTrabajoDto {
  @IsOptional()
  @IsString()
  cliente?: string;

  @IsOptional()
  @IsString()
  vehiculo?: string;

  @IsOptional()
  @IsString()
  placa?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServicioHojaTrabajoDto)
  servicios?: ServicioHojaTrabajoDto[];
}
```

```typescript
// agregar-servicio.dto.ts
export class AgregarServicioDto {
  @IsNumber()
  servicioId: number;

  @IsOptional()
  @IsString()
  comentario?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precio?: number; // 🆕 NUEVO CAMPO
}
```

### 3. Actualizar Lógica del Servicio

#### 3.1 Endpoint: `POST /hoja-trabajo` (Crear hoja de trabajo)

```typescript
// hoja-trabajo.service.ts
async crear(createHojaTrabajoDto: CreateHojaTrabajoDto): Promise<HojaTrabajo> {
  // Crear la hoja de trabajo
  const hojaTrabajo = await this.hojaTrabajoRepository.create({
    cliente: createHojaTrabajoDto.cliente,
    vehiculo: createHojaTrabajoDto.vehiculo,
    placa: createHojaTrabajoDto.placa,
    observaciones: createHojaTrabajoDto.observaciones,
    estado: 'pendiente',
  });

  const hojaGuardada = await this.hojaTrabajoRepository.save(hojaTrabajo);

  // Agregar servicios si los hay
  if (createHojaTrabajoDto.servicios && createHojaTrabajoDto.servicios.length > 0) {
    for (const servicioDto of createHojaTrabajoDto.servicios) {
      // 🔥 CAMBIO PRINCIPAL: Usar precio personalizado o precio del catálogo
      const servicio = await this.servicioRepository.findOne({ 
        where: { id: servicioDto.servicioId } 
      });
      
      if (!servicio) {
        throw new NotFoundException(`Servicio con ID ${servicioDto.servicioId} no encontrado`);
      }

      const precioFinal = servicioDto.precio !== undefined 
        ? servicioDto.precio  // 🆕 Usar precio personalizado si se proporciona
        : servicio.precio;    // 🔄 Usar precio del catálogo como fallback

      const detalle = this.hojaTrabajoDetalleRepository.create({
        hojaTrabajoId: hojaGuardada.id,
        servicioId: servicioDto.servicioId,
        precio: precioFinal, // 🆕 USAR EL PRECIO CALCULADO
        comentario: servicioDto.comentario,
        completado: false,
      });

      await this.hojaTrabajoDetalleRepository.save(detalle);
    }
  }

  // Recalcular total
  await this.recalcularTotal(hojaGuardada.id);

  return this.obtenerPorId(hojaGuardada.id);
}
```

#### 3.2 Endpoint: `POST /hoja-trabajo/:id/servicios` (Agregar servicio)

```typescript
async agregarServicio(hojaTrabajoId: number, agregarServicioDto: AgregarServicioDto): Promise<HojaTrabajoDetalle> {
  const hojaTrabajo = await this.hojaTrabajoRepository.findOne({ 
    where: { id: hojaTrabajoId } 
  });
  
  if (!hojaTrabajo) {
    throw new NotFoundException('Hoja de trabajo no encontrada');
  }

  const servicio = await this.servicioRepository.findOne({ 
    where: { id: agregarServicioDto.servicioId } 
  });
  
  if (!servicio) {
    throw new NotFoundException('Servicio no encontrado');
  }

  // Verificar si ya existe
  const detalleExistente = await this.hojaTrabajoDetalleRepository.findOne({
    where: { 
      hojaTrabajoId: hojaTrabajoId, 
      servicioId: agregarServicioDto.servicioId 
    }
  });

  if (detalleExistente) {
    throw new ConflictException('El servicio ya está agregado a esta hoja de trabajo');
  }

  // 🔥 CAMBIO PRINCIPAL: Usar precio personalizado o precio del catálogo
  const precioFinal = agregarServicioDto.precio !== undefined 
    ? agregarServicioDto.precio  // 🆕 Usar precio personalizado si se proporciona
    : servicio.precio;           // 🔄 Usar precio del catálogo como fallback

  const detalle = this.hojaTrabajoDetalleRepository.create({
    hojaTrabajoId: hojaTrabajoId,
    servicioId: agregarServicioDto.servicioId,
    precio: precioFinal, // 🆕 USAR EL PRECIO CALCULADO
    comentario: agregarServicioDto.comentario,
    completado: false,
  });

  const detalleGuardado = await this.hojaTrabajoDetalleRepository.save(detalle);

  // Recalcular total
  await this.recalcularTotal(hojaTrabajoId);

  return this.hojaTrabajoDetalleRepository.findOne({
    where: { id: detalleGuardado.id },
    relations: ['servicio']
  });
}
```

#### 3.3 Endpoint: `PUT /hoja-trabajo/:id/servicios` (Actualizar servicios masivamente)

```typescript
async actualizarServicios(hojaTrabajoId: number, actualizarServiciosDto: ActualizarServiciosDto): Promise<HojaTrabajo> {
  const hojaTrabajo = await this.hojaTrabajoRepository.findOne({ 
    where: { id: hojaTrabajoId } 
  });
  
  if (!hojaTrabajo) {
    throw new NotFoundException('Hoja de trabajo no encontrada');
  }

  // Eliminar todos los servicios existentes
  await this.hojaTrabajoDetalleRepository.delete({ hojaTrabajoId: hojaTrabajoId });

  // Agregar los nuevos servicios
  for (const servicioDto of actualizarServiciosDto.servicios) {
    const servicio = await this.servicioRepository.findOne({ 
      where: { id: servicioDto.servicioId } 
    });
    
    if (!servicio) {
      throw new NotFoundException(`Servicio con ID ${servicioDto.servicioId} no encontrado`);
    }

    // 🔥 CAMBIO PRINCIPAL: Usar precio personalizado o precio del catálogo
    const precioFinal = servicioDto.precio !== undefined 
      ? servicioDto.precio  // 🆕 Usar precio personalizado si se proporciona
      : servicio.precio;    // 🔄 Usar precio del catálogo como fallback

    const detalle = this.hojaTrabajoDetalleRepository.create({
      hojaTrabajoId: hojaTrabajoId,
      servicioId: servicioDto.servicioId,
      precio: precioFinal, // 🆕 USAR EL PRECIO CALCULADO
      comentario: servicioDto.comentario,
      completado: false,
    });

    await this.hojaTrabajoDetalleRepository.save(detalle);
  }

  // Recalcular total
  await this.recalcularTotal(hojaTrabajoId);

  return this.obtenerPorId(hojaTrabajoId);
}
```

---

## 🔄 Cambios en el Frontend

### 1. Actualizar Tipos TypeScript

```typescript
// src/types/index.ts - ✅ YA ACTUALIZADO
export interface CreateHojaTrabajoDto {
  cliente?: string;
  vehiculo?: string;
  placa?: string;
  observaciones?: string;
  servicios?: Array<{
    servicioId: number;
    comentario?: string;
    precio?: number; // 🆕 YA AGREGADO
  }>;
}

export interface AgregarServicioDto {
  servicioId: number;
  comentario?: string;
  precio?: number; // 🆕 YA AGREGADO
}
```

### 2. Actualizar Modal de Hoja de Trabajo

```typescript
// src/components/HojaTrabajoModal.tsx - ✅ YA ACTUALIZADO
// El modal ya está enviando los precios personalizados:

const dataToSubmit: CreateHojaTrabajoDto = {
  ...formData,
  servicios: serviciosSeleccionados.map(s => ({
    servicioId: s.servicioId,
    comentario: s.comentario,
    precio: s.precio // 🆕 YA SE ESTÁ ENVIANDO EL PRECIO PERSONALIZADO
  }))
};
```

### 3. Actualizar API Service

```typescript
// src/services/api.ts - ✅ YA ACTUALIZADO
// Los métodos ya están enviando los precios correctamente:

static async actualizarServicios(
  hojaTrabajoId: number, 
  servicios: Array<{ servicioId: number; comentario?: string; precio?: number }> // 🆕 YA INCLUYE PRECIO
): Promise<HojaTrabajo>
```

---

## 🧪 Casos de Prueba

### 1. Crear hoja de trabajo con precios personalizados

```json
POST /hoja-trabajo
{
  "cliente": "Juan Pérez",
  "vehiculo": "Toyota Corolla 2020",
  "placa": "ABC123",
  "servicios": [
    {
      "servicioId": 1,
      "comentario": "Frenos delanteros",
      "precio": 12000
    },
    {
      "servicioId": 3,
      "comentario": "Suspensión",
      "precio": 18000
    }
  ]
}
```

**Resultado esperado:**
- Servicio frenos: precio personalizado 12,000 (en lugar del catálogo 15,000)
- Servicio suspensión: precio personalizado 18,000 (en lugar del catálogo 12,000)
- Total: 30,000

### 2. Crear hoja con algunos precios personalizados y otros por defecto

```json
POST /hoja-trabajo
{
  "cliente": "María García",
  "servicios": [
    {
      "servicioId": 1,
      "comentario": "Frenos con descuento",
      "precio": 10000
    },
    {
      "servicioId": 2,
      "comentario": "Aceite precio normal"
      // Sin campo "precio" - usa precio del catálogo
    }
  ]
}
```

### 3. Agregar servicio con precio personalizado

```json
POST /hoja-trabajo/1/servicios
{
  "servicioId": 5,
  "comentario": "Precio especial para cliente frecuente",
  "precio": 4500
}
```

---

## 📝 Documentación a Actualizar

### 1. Ejemplos en API_DOCUMENTATION.md

```markdown
### Crear hoja de trabajo con precios personalizados

**Ejemplo de request con precios personalizados**:
```json
{
  "cliente": "María García",
  "vehiculo": "Honda Civic 2019",
  "placa": "XYZ789",
  "observaciones": "Cliente frecuente - descuento aplicado",
  "servicios": [
    {
      "servicioId": 1,
      "comentario": "Cliente reporta ruido al frenar",
      "precio": 12000
    },
    {
      "servicioId": 9,
      "comentario": "Vehículo se desvía hacia la derecha"
    }
  ]
}
```

**Nota**: Si no se especifica `precio`, se usa el precio del catálogo automáticamente.
```

### 2. Agregar nota sobre precios históricos

```markdown
## Notas Importantes sobre Precios

1. **Precios Personalizados**: Cada servicio en una hoja de trabajo puede tener un precio personalizado diferente al del catálogo.

2. **Precios por Defecto**: Si no se especifica un precio personalizado, se usa automáticamente el precio actual del catálogo.

3. **Precios Históricos**: Una vez guardado un servicio en una hoja de trabajo (con precio personalizado o del catálogo), ese precio se mantiene fijo aunque el precio del catálogo cambie posteriormente.

4. **Flexibilidad de Precios**: Permite manejar descuentos, precios especiales por cliente, promociones, etc.
```

---

## ✅ Checklist de Implementación

### Backend:
- [ ] Actualizar DTOs para incluir campo `precio?: number`
- [ ] Modificar validaciones (class-validator si aplica)
- [ ] Actualizar lógica de creación de hoja de trabajo
- [ ] Actualizar lógica de agregar servicio individual
- [ ] Actualizar lógica de actualización masiva de servicios
- [ ] Probar endpoints con Postman/Insomnia
- [ ] Verificar que el total se calcula correctamente

### Frontend:
- [ ] ✅ Tipos TypeScript actualizados
- [ ] ✅ Modal de hoja de trabajo implementado
- [ ] ✅ Campos de precio editables agregados
- [ ] ✅ Cálculo de totales con precios personalizados
- [ ] ✅ Indicadores visuales de precios modificados
- [ ] Probar flujo completo de creación
- [ ] Probar flujo completo de edición

### Documentación:
- [ ] Actualizar ejemplos en API_DOCUMENTATION.md
- [ ] Agregar casos de uso de precios personalizados
- [ ] Documentar comportamiento de precios por defecto vs personalizados

---

## 🚀 Beneficios de la Implementación

1. **Flexibilidad de Precios**: Permite descuentos, promociones y precios especiales por cliente
2. **Mantenimiento del Catálogo**: El precio del catálogo se mantiene intacto
3. **Transparencia**: El usuario puede ver qué precios han sido modificados
4. **Facilidad de Uso**: Opción de usar precios del catálogo o personalizados
5. **Historial Preservado**: Los precios se mantienen fijos una vez guardados

---

## 🔍 Validaciones Adicionales Recomendadas

1. **Precio Mínimo**: Validar que el precio personalizado no sea negativo
2. **Precio Máximo**: Opcional - validar que no exceda un límite razonable
3. **Permisos**: Considerar si ciertos usuarios pueden o no modificar precios
4. **Auditoría**: Opcional - log de cambios de precios para auditoría

---

**Fecha de creación**: 8 de julio, 2025  
**Prioridad**: Alta  
**Estimación**: 2-4 horas de desarrollo backend + testing
