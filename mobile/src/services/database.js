import * as SQLite from 'expo-sqlite';

const databaseName = 'ministore.db';

// Modern Expo SDK uses openDatabaseSync for synchronous access
export const db = SQLite.openDatabaseSync(databaseName);

/**
 * Initialize the database and create tables if they don't exist
 */
export const initDatabase = async () => {
  try {
    console.log('Initializing SQLite database schema...');

    // Using execAsync for multiple statements
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS CATEGORIAS (
        id_categoria INTEGER PRIMARY KEY NOT NULL,
        nombre_categoria TEXT NOT NULL,
        descripcion TEXT,
        activo INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS PRODUCTOS (
        id_producto INTEGER PRIMARY KEY NOT NULL,
        nombre_producto TEXT NOT NULL,
        descripcion TEXT,
        precio REAL NOT NULL,
        tamano TEXT,
        imagen_url TEXT,
        id_categoria INTEGER,
        activo INTEGER DEFAULT 1,
        fecha_creacion TEXT,
        FOREIGN KEY (id_categoria) REFERENCES CATEGORIAS (id_categoria)
      );

      CREATE TABLE IF NOT EXISTS CLIENTES (
        id_cliente INTEGER PRIMARY KEY NOT NULL,
        nombre_cliente TEXT NOT NULL,
        telefono TEXT,
        direccion TEXT,
        notas TEXT,
        activo INTEGER DEFAULT 1,
        fecha_registro TEXT
      );

      CREATE TABLE IF NOT EXISTS CANALES_VENTA (
        id_canal INTEGER PRIMARY KEY NOT NULL,
        nombre_canal TEXT NOT NULL,
        descripcion TEXT,
        activo INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS PEDIDOS (
        id_pedido INTEGER PRIMARY KEY NOT NULL,
        fecha_pedido TEXT DEFAULT CURRENT_TIMESTAMP,
        fecha_limite TEXT,
        id_cliente INTEGER,
        id_canal INTEGER,
        subtotal REAL,
        costo_envio REAL,
        total REAL,
        estado TEXT DEFAULT 'pendiente',
        metodo_pago TEXT,
        requiere_envio INTEGER DEFAULT 0,
        direccion_envio TEXT,
        notas TEXT,
        sincronizado INTEGER DEFAULT 0,
        FOREIGN KEY (id_cliente) REFERENCES CLIENTES (id_cliente),
        FOREIGN KEY (id_canal) REFERENCES CANALES_VENTA (id_canal)
      );

      CREATE TABLE IF NOT EXISTS DETALLE_PEDIDOS (
        id_detalle INTEGER PRIMARY KEY NOT NULL,
        id_pedido INTEGER,
        id_producto INTEGER,
        cantidad INTEGER NOT NULL,
        precio_unitario REAL NOT NULL,
        subtotal REAL NOT NULL,
        FOREIGN KEY (id_pedido) REFERENCES PEDIDOS (id_pedido),
        FOREIGN KEY (id_producto) REFERENCES PRODUCTOS (id_producto)
      );
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

/**
 * Transformation Helpers
 */
export const transformToSQLite = (item, type) => {
  if (type === 'PRODUCTO') {
    return [
      item.id_producto,
      item.nombre_producto,
      item.descripcion,
      item.precio,
      item.tamano,
      item.imagen_url,
      item.id_categoria,
      item.activo ? 1 : 0,
      item.fecha_creacion
    ];
  }
  if (type === 'CLIENTE') {
    return [
      item.id_cliente,
      item.nombre_cliente,
      item.telefono,
      item.direccion,
      item.notas,
      item.activo ? 1 : 0,
      item.fecha_registro
    ];
  }
  if (type === 'PEDIDO') {
    return [
      item.id_pedido,
      item.fecha_pedido,
      item.fecha_limite,
      item.id_cliente,
      item.id_canal,
      item.subtotal,
      item.costo_envio,
      item.total,
      item.estado,
      item.metodo_pago,
      item.requiere_envio ? 1 : 0,
      item.direccion_envio,
      item.notas,
      1 // sincronizado = true because it comes from Supabase
    ];
  }
  return [];
};

// CRUD Operations - Productos
export const getProductos = async () => {
  const allRows = await db.getAllAsync('SELECT * FROM PRODUCTOS WHERE activo = 1');
  return { rows: allRows };
};

export const saveProductosBulk = async (productos) => {
  // Using SQLite transactions with modern API
  await db.withTransactionAsync(async () => {
    for (const p of productos) {
      await db.runAsync(
        `INSERT OR REPLACE INTO PRODUCTOS (id_producto, nombre_producto, descripcion, precio, tamano, imagen_url, id_categoria, activo, fecha_creacion)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        transformToSQLite(p, 'PRODUCTO')
      );
    }
  });
};

// CRUD Operations - Clientes
export const getClientes = async () => {
  const allRows = await db.getAllAsync('SELECT * FROM CLIENTES WHERE activo = 1');
  return { rows: allRows };
};

export const saveClientesBulk = async (clientes) => {
  await db.withTransactionAsync(async () => {
    for (const c of clientes) {
      await db.runAsync(
        `INSERT OR REPLACE INTO CLIENTES (id_cliente, nombre_cliente, telefono, direccion, notas, activo, fecha_registro)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        transformToSQLite(c, 'CLIENTE')
      );
    }
  });
};

// CRUD Operations - Pedidos
export const getPedidos = async () => {
  const allRows = await db.getAllAsync(`
    SELECT p.*, c.nombre_cliente 
    FROM PEDIDOS p 
    LEFT JOIN CLIENTES c ON p.id_cliente = c.id_cliente 
    ORDER BY p.fecha_pedido DESC
  `);
  return { rows: allRows };
};

export const savePedidosBulk = async (pedidos) => {
  await db.withTransactionAsync(async () => {
    for (const p of pedidos) {
      await db.runAsync(
        `INSERT OR REPLACE INTO PEDIDOS (id_pedido, fecha_pedido, fecha_limite, id_cliente, id_canal, subtotal, costo_envio, total, estado, metodo_pago, requiere_envio, direccion_envio, notas, sincronizado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        transformToSQLite(p, 'PEDIDO')
      );
    }
  });
};

export const createPedido = async (pedido) => {
  const result = await db.runAsync(
    `INSERT INTO PEDIDOS (fecha_limite, id_cliente, id_canal, subtotal, costo_envio, total, estado, metodo_pago, requiere_envio, direccion_envio, notas, sincronizado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [pedido.fecha_limite, pedido.id_cliente, pedido.id_canal, pedido.subtotal, pedido.costo_envio, pedido.total, pedido.estado, pedido.metodo_pago, pedido.requiere_envio ? 1 : 0, pedido.direccion_envio, pedido.notas, 0]
  );
  return result;
};
