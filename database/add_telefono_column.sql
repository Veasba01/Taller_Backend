-- Migración: Agregar campo teléfono a la tabla hoja_trabajo
-- Fecha: 8 de julio, 2025
-- Descripción: Se agrega el campo telefono para almacenar el número de contacto del cliente

-- Agregar la columna telefono
ALTER TABLE hoja_trabajo 
ADD COLUMN telefono VARCHAR(20) NULL 
AFTER cliente;

-- Comentario para documentar el campo
ALTER TABLE hoja_trabajo 
MODIFY COLUMN telefono VARCHAR(20) NULL 
COMMENT 'Número de teléfono del cliente';

-- Verificar que la columna se agregó correctamente
DESCRIBE hoja_trabajo;
