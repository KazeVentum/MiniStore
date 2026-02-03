-- ========================================================
-- IMPORTACIÓN DE DATOS LEGACY A SUPABASE (POSTGRESQL)
-- ========================================================

-- Limpiamos datos de prueba previos si existen para evitar conflictos
TRUNCATE DETALLE_PEDIDOS, PEDIDOS, PRODUCTOS, CLIENTES, CATEGORIAS, CANALES_VENTA CASCADE;

-- 1. CANALES_VENTA
INSERT INTO CANALES_VENTA (id_canal, nombre_canal, descripcion, activo) VALUES
(1, 'Tienda Física', NULL, TRUE),
(2, 'Instagram', NULL, TRUE),
(3, 'WhatsApp', NULL, TRUE);

-- 2. CATEGORIAS
INSERT INTO CATEGORIAS (id_categoria, nombre_categoria, descripcion, activo) VALUES
(1, 'Collares', 'Collares y gargantillas', TRUE),
(2, 'Aretes', 'Aretes y pendientes', TRUE),
(3, 'Manillas/Pulseras', 'Pulseras y manillas', TRUE),
(4, 'Llaveros', 'Llaveros decorativos y personalizados', TRUE),
(5, 'Conjunto', 'Conjunto de Aretes y collares', TRUE),
(6, 'Diciembre', 'Diciembre', TRUE);

-- 3. CLIENTES
INSERT INTO CLIENTES (id_cliente, nombre_cliente, telefono, direccion, notas, activo, fecha_registro) VALUES
(1, 'Tatu', '', '', '', TRUE, '2026-01-08 22:27:02'),
(2, 'Ivana', '', '', '', TRUE, '2026-01-08 23:29:01'),
(3, 'Sacerdote', '', '', '', TRUE, '2026-01-08 23:29:26'),
(4, 'Angela', '', '', '', TRUE, '2026-01-08 23:29:32'),
(5, 'Karen', '', '', '', TRUE, '2026-01-08 23:29:41'),
(6, 'Tia Mayi', '', '', '', TRUE, '2026-01-08 23:29:50'),
(7, 'Natalia Martinez', '', '', '', TRUE, '2026-01-08 23:30:07'),
(8, 'Maria Universidad', '', '', '', TRUE, '2026-01-08 23:30:13'),
(9, 'Ana Belen', '', '', '', TRUE, '2026-01-08 23:30:24'),
(10, 'Andrea', '', '', '', TRUE, '2026-01-08 23:30:35'),
(11, 'Daniela', '', '', '', TRUE, '2026-01-08 23:30:44'),
(12, 'Cristina Comunidad', '', '', '', TRUE, '2026-01-08 23:31:01'),
(13, 'Aleja', '', '', '', TRUE, '2026-01-08 23:31:14'),
(14, 'Valentina Universidad', '', '', '', TRUE, '2026-01-08 23:31:23'),
(15, 'Sheriland', '', '', '', TRUE, '2026-01-08 23:31:33'),
(16, 'Jonathan', '', '', '', TRUE, '2026-01-08 23:31:45'),
(17, 'Maria Isabel', '', '', '', TRUE, '2026-01-08 23:32:04'),
(18, 'Emilio Comunidad', '', '', '', TRUE, '2026-01-08 23:32:29'),
(19, 'Adriana Universidad', '', '', '', TRUE, '2026-01-09 00:23:56'),
(20, 'Sofia Universidad', '', '', '', TRUE, '2026-01-09 00:32:14'),
(21, 'Janeth Descanse', '', '', '', TRUE, '2026-01-09 00:45:14'),
(22, 'Conjunto 22K', '', '', '', FALSE, '2026-01-09 01:05:13'),
(23, 'Tania Guzman', '', '', '', TRUE, '2026-01-26 21:33:16'),
(24, 'Geraldine Quintero', '314 731 9210', 'Bogotá', 'Amiga de Cris', TRUE, '2026-01-26 21:41:21');

-- 4. PRODUCTOS
INSERT INTO PRODUCTOS (id_producto, nombre_producto, descripcion, precio, tamano, imagen_url, id_categoria, activo, fecha_creacion) VALUES
(1, 'Aretes 8K', 'Perla', 8000.00, 'mediano', '', 2, TRUE, '2026-01-08 23:22:56'),
(2, 'Manilla San Antonio', '', 8000.00, 'unico', '', 3, TRUE, '2026-01-08 23:23:54'),
(3, 'Aretes 7K', '', 7000.00, 'mediano', '', 2, TRUE, '2026-01-08 23:26:19'),
(4, 'Denario San Antonio', '', 8000.00, 'unico', '', 4, TRUE, '2026-01-08 23:28:06'),
(5, 'Llavero', '', 9000.00, 'unico', '', 4, TRUE, '2026-01-09 00:17:49'),
(6, 'Aretes 6.5K', '', 6500.00, 'mediano', '', 2, TRUE, '2026-01-09 00:26:13'),
(7, 'Collar 5K', '', 5000.00, 'unico', '', 1, TRUE, '2026-01-09 00:30:52'),
(8, 'Conjunto Pequeño 10K', '', 10000.00, 'unico', '', 5, TRUE, '2026-01-09 00:53:23'),
(9, 'Conjunto Pequeño 22K', '', 22000.00, 'mediano', '', 5, TRUE, '2026-01-09 01:06:31'),
(10, 'Velas 6K', '', 6000.00, 'unico', '', 6, TRUE, '2026-01-09 01:15:29'),
(11, 'Velas 8K', '', 8000.00, 'unico', '', 6, TRUE, '2026-01-09 01:15:55'),
(12, 'Aretes 9K', '', 9000.00, 'mediano', '', 2, TRUE, '2026-01-26 21:36:49');

-- 5. PEDIDOS (Excluimos la columna generada 'total')
INSERT INTO PEDIDOS (id_pedido, fecha_pedido, fecha_limite, id_cliente, id_canal, subtotal, costo_envio, estado, metodo_pago, requiere_envio, direccion_envio, notas, fecha_creacion, fecha_actualizacion) VALUES 
(24, '2026-01-26', '2026-01-26', 23, 3, 25000.00, 0.00, 'completado', 'Nequi', FALSE, '', 'Envio a Bogotá con Cristian', '2026-01-26 21:37:22', '2026-01-26 21:37:32'),
(25, '2026-01-26', '2026-01-26', 24, 2, 9000.00, 0.00, 'completado', 'Nequi', FALSE, '', 'Amiga de Cris', '2026-01-26 21:42:19', '2026-01-26 21:42:22');

-- 6. DETALLE_PEDIDOS (Excluimos la columna generada 'subtotal')
INSERT INTO DETALLE_PEDIDOS (id_detalle, id_pedido, id_producto, cantidad, precio_unitario) VALUES 
(26, 24, 1, 2, 8000.00),
(27, 24, 12, 1, 9000.00),
(28, 25, 12, 1, 9000.00);

-- 7. REINICIO DE SECUENCIAS (Para que los nuevos registros sigan el orden correcto)
SELECT setval(pg_get_serial_sequence('canales_venta', 'id_canal'), COALESCE(MAX(id_canal), 1)) FROM canales_venta;
SELECT setval(pg_get_serial_sequence('categorias', 'id_categoria'), COALESCE(MAX(id_categoria), 1)) FROM categorias;
SELECT setval(pg_get_serial_sequence('clientes', 'id_cliente'), COALESCE(MAX(id_cliente), 1)) FROM clientes;
SELECT setval(pg_get_serial_sequence('productos', 'id_producto'), COALESCE(MAX(id_producto), 1)) FROM productos;
SELECT setval(pg_get_serial_sequence('pedidos', 'id_pedido'), COALESCE(MAX(id_pedido), 1)) FROM pedidos;
SELECT setval(pg_get_serial_sequence('detalle_pedidos', 'id_detalle'), COALESCE(MAX(id_detalle), 1)) FROM detalle_pedidos;
