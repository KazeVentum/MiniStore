-- SCRIPT DE LIMPIEZA - MiniStore
-- Propósito: Eliminar todos los pedidos del año 2025 para iniciar contabilidad limpia en 2026.
-- PRECAUCIÓN: Esta acción es irreversible. Se recomienda hacer backup de la base de datos antes.

-- Seleccionar la base de datos (descomenta y ajusta si es necesario)
-- USE bisuteria_ventas;

-- 1. Eliminar primero los detalles de los pedidos (por integridad referencial)
DELETE FROM DETALLE_PEDIDOS 
WHERE id_pedido IN (
    SELECT id_pedido 
    FROM PEDIDOS 
    WHERE YEAR(fecha_pedido) = 2025
);

-- 2. Eliminar los pedidos del año 2025
DELETE FROM PEDIDOS 
WHERE YEAR(fecha_pedido) = 2025;

-- Fin del script
