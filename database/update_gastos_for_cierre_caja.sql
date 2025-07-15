-- Script para actualizar la tabla gastos con las columnas necesarias para el cierre de caja
USE taller_db;

-- Agregar columna fecha si no existe
ALTER TABLE gastos 
ADD COLUMN IF NOT EXISTS fecha DATE NULL;

-- Agregar columna metodoPago si no existe
ALTER TABLE gastos 
ADD COLUMN IF NOT EXISTS metodoPago VARCHAR(50) NULL;

-- Actualizar registros existentes para usar created_at como fecha si no tienen fecha
UPDATE gastos 
SET fecha = DATE(created_at) 
WHERE fecha IS NULL;

-- Mostrar la estructura actualizada de la tabla
DESCRIBE gastos;
