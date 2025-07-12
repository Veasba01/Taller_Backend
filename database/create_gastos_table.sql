-- Script para crear la tabla gastos
USE taller_db;

-- Crear tabla gastos
CREATE TABLE IF NOT EXISTS gastos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    monto DECIMAL(10, 2) NOT NULL,
    comentario TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Opcional: Insertar algunos datos de ejemplo
-- INSERT INTO gastos (monto, comentario) VALUES 
-- (15000.00, 'Compra de herramientas'),
-- (5000.00, 'Pago de servicios públicos'),
-- (25000.00, 'Compra de repuestos');

-- Mostrar la estructura de la tabla
-- DESCRIBE gastos;
