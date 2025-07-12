-- Script para agregar la columna metodo_pago a la tabla hoja_trabajo
USE taller_db;

-- Agregar la columna metodo_pago con valores enum
ALTER TABLE hoja_trabajo 
ADD COLUMN metodo_pago ENUM('pendiente', 'sinpe', 'tarjeta', 'efectivo') NOT NULL DEFAULT 'pendiente';

-- Opcional: Mostrar la estructura actualizada de la tabla
-- DESCRIBE hoja_trabajo;
