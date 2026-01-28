-- SCRIPT DE MIGRACIÓN - MiniStore
-- Este script consolida los cambios realizados en la base de datos para habilitar:
-- 1. Estado de 'borrador' en pedidos.
-- 2. Seguimiento de 'última edición' en pedidos.

-- Seleccionar la base de datos (descomenta y ajusta si el nombre es diferente)
-- USE bisuteria_ventas;

-- 1. Asegurar que la columna 'estado' acepte el valor 'borrador'
-- (Nota: Dependiendo de tu versión de MySQL y cómo esté definida la columna, 
-- este paso asegura que no haya errores de restricción)
ALTER TABLE PEDIDOS MODIFY COLUMN estado VARCHAR(20) DEFAULT 'pendiente';

-- 2. Añadir columna para seguimiento de última edición
-- Se añade como DATETIME y permite nulos para los registros existentes.
ALTER TABLE PEDIDOS ADD COLUMN ultima_edicion DATETIME DEFAULT NULL;

-- 3. (Opcional) Actualizar registros para asegurar consistencia si es necesario
-- UPDATE PEDIDOS SET estado = 'pendiente' WHERE estado IS NULL OR estado = '';

-- Fin del script
