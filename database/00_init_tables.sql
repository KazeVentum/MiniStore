-- ============================================
-- BASE DE DATOS: Sistema de Ventas - Bisutería y Artesanías
-- ============================================

DROP DATABASE IF EXISTS bisuteria_ventas;
CREATE DATABASE bisuteria_ventas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bisuteria_ventas;
SET NAMES utf8mb4;

-- ============================================
-- TABLAS PRINCIPALES
-- ============================================

-- Tabla: CATEGORIAS
CREATE TABLE CATEGORIAS (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(200),
    activo BOOLEAN DEFAULT TRUE,
    INDEX idx_nombre_categoria (nombre_categoria)
) ENGINE=InnoDB;

-- Tabla: PRODUCTOS
CREATE TABLE PRODUCTOS (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre_producto VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    tamano ENUM('pequeño', 'mediano', 'grande', 'unico') DEFAULT 'unico',
    imagen_url VARCHAR(500),
    id_categoria INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_producto_categoria FOREIGN KEY (id_categoria) REFERENCES CATEGORIAS(id_categoria) ON DELETE RESTRICT,
    INDEX idx_nombre_producto (nombre_producto),
    INDEX idx_categoria (id_categoria),
    INDEX idx_activo (activo)
) ENGINE=InnoDB;

-- Tabla: CLIENTES
CREATE TABLE CLIENTES (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre_cliente VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    notas TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_nombre_cliente (nombre_cliente),
    INDEX idx_telefono (telefono)
) ENGINE=InnoDB;

-- Tabla: CANALES_VENTA
CREATE TABLE CANALES_VENTA (
    id_canal INT AUTO_INCREMENT PRIMARY KEY,
    nombre_canal VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(200),
    activo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

-- Tabla: PEDIDOS
CREATE TABLE PEDIDOS (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    fecha_pedido DATE NOT NULL,
    fecha_limite DATE,
    id_cliente INT NOT NULL,
    id_canal INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    costo_envio DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) GENERATED ALWAYS AS (subtotal + IFNULL(costo_envio, 0)) STORED,
    estado ENUM('pendiente', 'en_proceso', 'completado', 'entregado', 'cancelado') DEFAULT 'pendiente',
    metodo_pago VARCHAR(50) DEFAULT 'No especificado',
    requiere_envio BOOLEAN DEFAULT FALSE,
    direccion_envio TEXT,
    notas TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pedido_cliente FOREIGN KEY (id_cliente) REFERENCES CLIENTES(id_cliente) ON DELETE RESTRICT,
    CONSTRAINT fk_pedido_canal FOREIGN KEY (id_canal) REFERENCES CANALES_VENTA(id_canal) ON DELETE RESTRICT,
    INDEX idx_fecha_pedido (fecha_pedido),
    INDEX idx_estado (estado),
    INDEX idx_cliente (id_cliente),
    INDEX idx_canal (id_canal)
) ENGINE=InnoDB;

-- Tabla: DETALLE_PEDIDOS
CREATE TABLE DETALLE_PEDIDOS (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    CONSTRAINT fk_detalle_pedido FOREIGN KEY (id_pedido) REFERENCES PEDIDOS(id_pedido) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_producto FOREIGN KEY (id_producto) REFERENCES PRODUCTOS(id_producto) ON DELETE RESTRICT,
    INDEX idx_pedido (id_pedido),
    INDEX idx_producto (id_producto),
    CHECK (cantidad > 0)
) ENGINE=InnoDB;

-- Tabla: GASTOS
CREATE TABLE GASTOS (
    id_gasto INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(200) NOT NULL,
    categoria_gasto VARCHAR(100) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    fecha_gasto DATE NOT NULL,
    plataforma VARCHAR(50),
    notas TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_fecha_gasto (fecha_gasto),
    INDEX idx_categoria (categoria_gasto),
    CHECK (monto >= 0)
) ENGINE=InnoDB;

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Categorías de productos
INSERT INTO CATEGORIAS (nombre_categoria, descripcion) VALUES
('Collares', 'Collares y gargantillas'),
('Aretes', 'Aretes y pendientes'),
('Manillas/Pulseras', 'Pulseras y manillas'),
('Llaveros', 'Llaveros decorativos y personalizados');

-- Canales de venta
INSERT INTO CANALES_VENTA (nombre_canal, descripcion) VALUES
('Tienda Física', 'Ventas realizadas en el local físico'),
('Instagram', 'Ventas a través de Instagram'),
('WhatsApp', 'Ventas a través de WhatsApp');

-- Cliente genérico para ventas sin registro
INSERT INTO CLIENTES (nombre_cliente, telefono, notas) VALUES
('Cliente General', NULL, 'Cliente sin registro específico');

-- ============================================
-- VISTAS ÚTILES PARA REPORTES
-- ============================================

-- Vista: Ventas de los últimos 7 días
CREATE VIEW vw_ventas_7_dias AS
SELECT 
    p.id_pedido,
    p.fecha_pedido,
    c.nombre_cliente,
    cv.nombre_canal,
    p.total,
    p.estado
FROM PEDIDOS p
INNER JOIN CLIENTES c ON p.id_cliente = c.id_cliente
INNER JOIN CANALES_VENTA cv ON p.id_canal = cv.id_canal
WHERE p.fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
  AND p.estado != 'cancelado'
ORDER BY p.fecha_pedido DESC;

-- Vista: Ventas de los últimos 15 días
CREATE VIEW vw_ventas_15_dias AS
SELECT 
    p.id_pedido,
    p.fecha_pedido,
    c.nombre_cliente,
    cv.nombre_canal,
    p.total,
    p.estado
FROM PEDIDOS p
INNER JOIN CLIENTES c ON p.id_cliente = c.id_cliente
INNER JOIN CANALES_VENTA cv ON p.id_canal = cv.id_canal
WHERE p.fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 15 DAY)
  AND p.estado != 'cancelado'
ORDER BY p.fecha_pedido DESC;

-- Vista: Ventas del último mes (30 días)
CREATE VIEW vw_ventas_30_dias AS
SELECT 
    p.id_pedido,
    p.fecha_pedido,
    c.nombre_cliente,
    cv.nombre_canal,
    p.total,
    p.estado
FROM PEDIDOS p
INNER JOIN CLIENTES c ON p.id_cliente = c.id_cliente
INNER JOIN CANALES_VENTA cv ON p.id_canal = cv.id_canal
WHERE p.fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
  AND p.estado != 'cancelado'
ORDER BY p.fecha_pedido DESC;

-- Vista: Productos más vendidos
CREATE VIEW vw_productos_mas_vendidos AS
SELECT 
    pr.id_producto,
    pr.nombre_producto,
    cat.nombre_categoria,
    SUM(dp.cantidad) as total_vendido,
    SUM(dp.subtotal) as ingresos_totales
FROM PRODUCTOS pr
INNER JOIN DETALLE_PEDIDOS dp ON pr.id_producto = dp.id_producto
INNER JOIN PEDIDOS p ON dp.id_pedido = p.id_pedido
INNER JOIN CATEGORIAS cat ON pr.id_categoria = cat.id_categoria
WHERE p.estado != 'cancelado'
GROUP BY pr.id_producto, pr.nombre_producto, cat.nombre_categoria
ORDER BY total_vendido DESC;

-- Vista: Resumen de ganancias
CREATE VIEW vw_resumen_ganancias AS
SELECT 
    DATE_FORMAT(fecha_pedido, '%Y-%m') as mes,
    COUNT(DISTINCT id_pedido) as total_pedidos,
    SUM(total) as ingresos_totales,
    (SELECT IFNULL(SUM(monto), 0) 
     FROM GASTOS 
     WHERE DATE_FORMAT(fecha_gasto, '%Y-%m') = DATE_FORMAT(p.fecha_pedido, '%Y-%m')) as gastos_totales,
    SUM(total) - (SELECT IFNULL(SUM(monto), 0) 
                  FROM GASTOS 
                  WHERE DATE_FORMAT(fecha_gasto, '%Y-%m') = DATE_FORMAT(p.fecha_pedido, '%Y-%m')) as ganancia_neta
FROM PEDIDOS p
WHERE estado != 'cancelado'
GROUP BY DATE_FORMAT(fecha_pedido, '%Y-%m')
ORDER BY mes DESC;

-- ============================================
-- PROCEDIMIENTOS ALMACENADOS ÚTILES
-- ============================================

DELIMITER //

-- Procedimiento: Crear pedido completo
CREATE PROCEDURE sp_crear_pedido(
    IN p_fecha_pedido DATE,
    IN p_id_cliente INT,
    IN p_id_canal INT,
    IN p_costo_envio DECIMAL(10,2),
    IN p_requiere_envio BOOLEAN,
    IN p_direccion_envio TEXT,
    IN p_notas TEXT,
    OUT p_id_pedido INT
)
BEGIN
    INSERT INTO PEDIDOS (
        fecha_pedido, 
        id_cliente, 
        id_canal, 
        costo_envio, 
        requiere_envio, 
        direccion_envio, 
        notas
    ) VALUES (
        p_fecha_pedido,
        p_id_cliente,
        p_id_canal,
        p_costo_envio,
        p_requiere_envio,
        p_direccion_envio,
        p_notas
    );
    
    SET p_id_pedido = LAST_INSERT_ID();
END //

-- Procedimiento: Agregar producto al pedido
CREATE PROCEDURE sp_agregar_producto_pedido(
    IN p_id_pedido INT,
    IN p_id_producto INT,
    IN p_cantidad INT
)
BEGIN
    DECLARE v_precio DECIMAL(10,2);
    
    -- Obtener precio actual del producto
    SELECT precio INTO v_precio 
    FROM PRODUCTOS 
    WHERE id_producto = p_id_producto;
    
    -- Insertar detalle
    INSERT INTO DETALLE_PEDIDOS (id_pedido, id_producto, cantidad, precio_unitario)
    VALUES (p_id_pedido, p_id_producto, p_cantidad, v_precio);
    
    -- Actualizar subtotal del pedido
    UPDATE PEDIDOS 
    SET subtotal = (
        SELECT SUM(subtotal) 
        FROM DETALLE_PEDIDOS 
        WHERE id_pedido = p_id_pedido
    )
    WHERE id_pedido = p_id_pedido;
END //

-- Procedimiento: Obtener ventas por rango de días
CREATE PROCEDURE sp_ventas_ultimos_dias(
    IN p_dias INT
)
BEGIN
    SELECT 
        p.id_pedido,
        p.fecha_pedido,
        c.nombre_cliente,
        cv.nombre_canal,
        p.total,
        p.estado,
        GROUP_CONCAT(
            CONCAT(pr.nombre_producto, ' (', dp.cantidad, ')')
            SEPARATOR ', '
        ) as productos
    FROM PEDIDOS p
    INNER JOIN CLIENTES c ON p.id_cliente = c.id_cliente
    INNER JOIN CANALES_VENTA cv ON p.id_canal = cv.id_canal
    LEFT JOIN DETALLE_PEDIDOS dp ON p.id_pedido = dp.id_pedido
    LEFT JOIN PRODUCTOS pr ON dp.id_producto = pr.id_producto
    WHERE p.fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL p_dias DAY)
      AND p.estado != 'cancelado'
    GROUP BY p.id_pedido, p.fecha_pedido, c.nombre_cliente, cv.nombre_canal, p.total, p.estado
    ORDER BY p.fecha_pedido DESC;
END //

DELIMITER ;

-- ============================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ============================================

CREATE INDEX idx_pedido_fecha_estado ON PEDIDOS(fecha_pedido, estado);
CREATE INDEX idx_detalle_producto_pedido ON DETALLE_PEDIDOS(id_producto, id_pedido);
CREATE INDEX idx_gasto_fecha_categoria ON GASTOS(fecha_gasto, categoria_gasto);

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
