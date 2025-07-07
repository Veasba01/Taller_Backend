-- Script para crear la base de datos del taller
CREATE DATABASE IF NOT EXISTS taller_db;
USE taller_db;

-- La tabla se creará automáticamente por TypeORM cuando ejecutes la aplicación
-- debido a la configuración synchronize: true en el app.module.ts
