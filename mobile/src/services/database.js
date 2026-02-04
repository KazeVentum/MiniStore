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
      PRAGMA foreign_keys = ON;
      
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
        sincronizado INTEGER DEFAULT 1,
        FOREIGN KEY (id_categoria) REFERENCES CATEGORIAS (id_categoria)
      );

      CREATE TABLE IF NOT EXISTS CLIENTES (
        id_cliente INTEGER PRIMARY KEY NOT NULL,
        nombre_cliente TEXT NOT NULL,
        telefono TEXT,
        direccion TEXT,
        notas TEXT,
        activo INTEGER DEFAULT 1,
        fecha_registro TEXT,
        sincronizado INTEGER DEFAULT 1
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

    // MIGRATIONS: Add 'sincronizado' column if missing (for existing users)
    console.log('Checking for necessary database migrations...');

    // Attempt to add 'sincronizado' to PRODUCTOS
    try {
      await db.runAsync('ALTER TABLE PRODUCTOS ADD COLUMN sincronizado INTEGER DEFAULT 1');
      console.log('PRODUCTOS migrated: sincronizado added');
    } catch (e) {
      // If it fails, it usually means column already exists
      console.log('PRODUCTOS migration skipped (likely already exists)');
    }

    // Attempt to add 'sincronizado' to CLIENTES
    try {
      await db.runAsync('ALTER TABLE CLIENTES ADD COLUMN sincronizado INTEGER DEFAULT 1');
      console.log('CLIENTES migrated: sincronizado added');
    } catch (e) {
      console.log('CLIENTES migration skipped (likely already exists)');
    }

    console.log('Migration check completed');
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
      item.fecha_creacion,
      1 // sincronizado = 1 because it comes from Supabase
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
      item.fecha_registro,
      1 // sincronizado = 1 because it comes from Supabase
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
  await db.withTransactionAsync(async () => {
    for (const p of productos) {
      await db.runAsync(
        `INSERT OR REPLACE INTO PRODUCTOS (id_producto, nombre_producto, descripcion, precio, tamano, imagen_url, id_categoria, activo, fecha_creacion, sincronizado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        transformToSQLite(p, 'PRODUCTO')
      );
    }
  });
};

export const createProducto = async (prod) => {
  const maxRow = await db.getFirstAsync('SELECT MAX(id_producto) as maxId FROM PRODUCTOS');
  const nextId = Math.max(maxRow?.maxId || 0, 100000) + 1;
  return await db.runAsync(
    `INSERT INTO PRODUCTOS (id_producto, nombre_producto, descripcion, precio, id_categoria, activo, fecha_creacion, sincronizado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [nextId, prod.nombre_producto, prod.descripcion, prod.precio, prod.id_categoria || null, 1, new Date().toISOString(), 0]
  );
};

export const updateProducto = async (prod) => {
  return await db.runAsync(
    `UPDATE PRODUCTOS SET nombre_producto = ?, descripcion = ?, precio = ?, sincronizado = 0 WHERE id_producto = ?`,
    [prod.nombre_producto, prod.descripcion, prod.precio, prod.id_producto]
  );
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
        `INSERT OR REPLACE INTO CLIENTES (id_cliente, nombre_cliente, telefono, direccion, notas, activo, fecha_registro, sincronizado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        transformToSQLite(c, 'CLIENTE')
      );
    }
  });
};

export const createCliente = async (client) => {
  const maxRow = await db.getFirstAsync('SELECT MAX(id_cliente) as maxId FROM CLIENTES');
  const nextId = Math.max(maxRow?.maxId || 0, 100000) + 1;
  return await db.runAsync(
    `INSERT INTO CLIENTES (id_cliente, nombre_cliente, telefono, direccion, notas, activo, fecha_registro, sincronizado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [nextId, client.nombre_cliente, client.telefono, client.direccion, client.notas, 1, new Date().toISOString(), 0]
  );
};

export const updateCliente = async (client) => {
  return await db.runAsync(
    `UPDATE CLIENTES SET nombre_cliente = ?, telefono = ?, direccion = ?, notas = ?, sincronizado = 0 WHERE id_cliente = ?`,
    [client.nombre_cliente, client.telefono, client.direccion, client.notas, client.id_cliente]
  );
};

export const updateEntidadSync = async (tabla, oldId, newId) => {
  await db.withTransactionAsync(async () => {
    if (tabla === 'PRODUCTOS') {
      // 1. Create a copy of the product with the new sync ID
      const original = await db.getFirstAsync('SELECT * FROM PRODUCTOS WHERE id_producto = ?', [oldId]);
      if (original) {
        await db.runAsync(
          `INSERT INTO PRODUCTOS (id_producto, nombre_producto, descripcion, precio, tamano, imagen_url, id_categoria, activo, fecha_creacion, sincronizado)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [newId, original.nombre_producto, original.descripcion, original.precio, original.tamano, original.imagen_url, original.id_categoria, original.activo, original.fecha_creacion]
        );

        // 2. Update foreign keys in DETALLE_PEDIDOS to the new ID
        await db.runAsync(
          'UPDATE DETALLE_PEDIDOS SET id_producto = ? WHERE id_producto = ?',
          [newId, oldId]
        );

        // 3. Delete the old local record
        await db.runAsync('DELETE FROM PRODUCTOS WHERE id_producto = ?', [oldId]);
      }
    } else if (tabla === 'CLIENTES') {
      // 1. Create a copy of the client with the new sync ID
      const original = await db.getFirstAsync('SELECT * FROM CLIENTES WHERE id_cliente = ?', [oldId]);
      if (original) {
        await db.runAsync(
          `INSERT INTO CLIENTES (id_cliente, nombre_cliente, telefono, direccion, notas, activo, fecha_registro, sincronizado)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [newId, original.nombre_cliente, original.telefono, original.direccion, original.notas, original.activo, original.fecha_registro]
        );

        // 2. Update foreign keys in PEDIDOS to the new ID
        await db.runAsync(
          'UPDATE PEDIDOS SET id_cliente = ? WHERE id_cliente = ?',
          [newId, oldId]
        );

        // 3. Delete the old local record
        await db.runAsync('DELETE FROM CLIENTES WHERE id_cliente = ?', [oldId]);
      }
    }
  });
};

// CRUD Operations - Canales de Venta
export const getCanales = async () => {
  const allRows = await db.getAllAsync('SELECT * FROM CANALES_VENTA WHERE activo = 1');
  return { rows: allRows };
};

export const getCategorias = async () => {
  const allRows = await db.getAllAsync('SELECT * FROM CATEGORIAS WHERE activo = 1');
  return { rows: allRows };
};

export const saveCanalesBulk = async (canales) => {
  await db.withTransactionAsync(async () => {
    for (const c of canales) {
      await db.runAsync(
        `INSERT OR REPLACE INTO CANALES_VENTA (id_canal, nombre_canal, descripcion, activo)
         VALUES (?, ?, ?, ?)`,
        [c.id_canal, c.nombre_canal, c.descripcion, c.activo ? 1 : 0]
      );
    }
  });
};

export const saveCategoriasBulk = async (categorias) => {
  await db.withTransactionAsync(async () => {
    for (const c of categorias) {
      await db.runAsync(
        `INSERT OR REPLACE INTO CATEGORIAS (id_categoria, nombre_categoria, descripcion, activo)
         VALUES (?, ?, ?, ?)`,
        [c.id_categoria, c.nombre_categoria, c.descripcion, c.activo ? 1 : 0]
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

export const savePedidosBulk = async (pedidos, detalles) => {
  await db.withTransactionAsync(async () => {
    // 1. Purge synchronized records
    // IMPORTANT: Delete children (DETALLE_PEDIDOS) first to respect Foreign Key constraints
    await db.runAsync('DELETE FROM DETALLE_PEDIDOS WHERE id_pedido IN (SELECT id_pedido FROM PEDIDOS WHERE sincronizado = 1)');
    await db.runAsync('DELETE FROM PEDIDOS WHERE sincronizado = 1');

    // 2. Insert fresh order headers from Supabase
    for (const p of pedidos) {
      await db.runAsync(
        `INSERT OR REPLACE INTO PEDIDOS (id_pedido, fecha_pedido, fecha_limite, id_cliente, id_canal, subtotal, costo_envio, total, estado, metodo_pago, requiere_envio, direccion_envio, notas, sincronizado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        transformToSQLite(p, 'PEDIDO')
      );
    }

    // 3. Insert fresh order details from Supabase if provided
    if (detalles && detalles.length > 0) {
      for (const d of detalles) {
        await db.runAsync(
          `INSERT OR REPLACE INTO DETALLE_PEDIDOS (id_detalle, id_pedido, id_producto, cantidad, precio_unitario, subtotal)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [d.id_detalle, d.id_pedido, d.id_producto, d.cantidad, d.precio_unitario, d.subtotal]
        );
      }
    }
  });
};

export const createPedido = async (pedido) => {
  const maxRow = await db.getFirstAsync('SELECT MAX(id_pedido) as maxId FROM PEDIDOS');
  const nextId = Math.max(maxRow?.maxId || 0, 100000) + 1;

  const result = await db.runAsync(
    `INSERT INTO PEDIDOS (id_pedido, fecha_pedido, fecha_limite, id_cliente, id_canal, subtotal, costo_envio, total, estado, metodo_pago, requiere_envio, direccion_envio, notas, sincronizado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nextId,
      pedido.fecha_pedido || new Date().toLocaleString('sv-SE').replace(' ', 'T'),
      pedido.fecha_limite,
      pedido.id_cliente,
      pedido.id_canal,
      pedido.subtotal,
      pedido.costo_envio,
      pedido.total,
      pedido.estado || 'pendiente',
      pedido.metodo_pago,
      pedido.requiere_envio ? 1 : 0,
      pedido.direccion_envio,
      pedido.notas,
      0
    ]
  );

  if (pedido.productos && pedido.productos.length > 0) {
    const pedidoId = nextId; // Using the explicit ID since we are not relying on autoincrement here
    for (const prod of pedido.productos) {
      await db.runAsync(
        `INSERT INTO DETALLE_PEDIDOS (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [pedidoId, prod.id_producto, prod.cantidad, prod.precio, prod.cantidad * prod.precio]
      );
    }
  }
  return result;
};

export const updatePedidoEstado = async (id_pedido, estado) => {
  return await db.runAsync(
    'UPDATE PEDIDOS SET estado = ?, sincronizado = 0 WHERE id_pedido = ?',
    [estado, id_pedido]
  );
};

export const updatePedidoFull = async (id_pedido, pedido) => {
  await db.withTransactionAsync(async () => {
    // 1. Update Header
    await db.runAsync(
      `UPDATE PEDIDOS 
       SET id_cliente = ?, id_canal = ?, subtotal = ?, costo_envio = ?, total = ?, estado = ?, metodo_pago = ?, requiere_envio = ?, direccion_envio = ?, notas = ?, sincronizado = 0
       WHERE id_pedido = ?`,
      [
        pedido.id_cliente,
        pedido.id_canal,
        pedido.subtotal,
        pedido.costo_envio,
        pedido.total,
        pedido.estado,
        pedido.metodo_pago,
        pedido.requiere_envio ? 1 : 0,
        pedido.direccion_envio,
        pedido.notas,
        id_pedido
      ]
    );

    // 2. Refresh Details (simplest way: delete and re-insert)
    await db.runAsync('DELETE FROM DETALLE_PEDIDOS WHERE id_pedido = ?', [id_pedido]);
    for (const prod of pedido.productos) {
      await db.runAsync(
        `INSERT INTO DETALLE_PEDIDOS (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [id_pedido, prod.id_producto, prod.cantidad, prod.precio, prod.cantidad * prod.precio]
      );
    }
  });
};

/**
 * Dashboard Statistics
 */
export const getDashboardStats = async () => {
  const today = new Date().toLocaleString('sv-SE').split(' ')[0];

  const totalVentasRow = await db.getFirstAsync('SELECT SUM(total) as total FROM PEDIDOS WHERE estado != "cancelado"');
  const totalPedidosRow = await db.getFirstAsync('SELECT COUNT(*) as count FROM PEDIDOS');
  const pendientesSyncRow = await db.getFirstAsync('SELECT COUNT(*) as count FROM PEDIDOS WHERE sincronizado = 0');
  const totalClientesRow = await db.getFirstAsync('SELECT COUNT(*) as count FROM CLIENTES');
  const totalProductosRow = await db.getFirstAsync('SELECT COUNT(*) as count FROM PRODUCTOS');

  // New Metrics
  const ventasHoyRow = await db.getFirstAsync('SELECT SUM(total) as total FROM PEDIDOS WHERE date(fecha_pedido) = date(?) AND estado != "cancelado"', [today]);
  const pedidosHoyRow = await db.getFirstAsync('SELECT COUNT(*) as count FROM PEDIDOS WHERE date(fecha_pedido) = date(?)', [today]);
  const pedidosPendientesEstadoRow = await db.getFirstAsync('SELECT COUNT(*) as count FROM PEDIDOS WHERE estado = "pendiente"');

  // Top 5 Products
  const topProductos = await db.getAllAsync(`
    SELECT pr.nombre_producto, SUM(dp.cantidad) as total_vendido
    FROM DETALLE_PEDIDOS dp
    JOIN PRODUCTOS pr ON dp.id_producto = pr.id_producto
    JOIN PEDIDOS p ON dp.id_pedido = p.id_pedido
    WHERE p.estado != "cancelado"
    GROUP BY pr.id_producto
    ORDER BY total_vendido DESC
    LIMIT 5
  `);

  return {
    totalVentas: totalVentasRow?.total || 0,
    pedidosTotales: totalPedidosRow?.count || 0,
    pedidosPendientesSync: pendientesSyncRow?.count || 0,
    totalClientes: totalClientesRow?.count || 0,
    totalProductos: totalProductosRow?.count || 0,
    ventasHoy: ventasHoyRow?.total || 0,
    pedidosHoy: pedidosHoyRow?.count || 0,
    pedidosPendientesEstado: pedidosPendientesEstadoRow?.count || 0,
    topProductos: topProductos || []
  };
};

export const getPedidoById = async (id) => {
  const pedido = await db.getFirstAsync(`
    SELECT p.*, c.nombre_cliente, cv.nombre_canal
    FROM PEDIDOS p
    LEFT JOIN CLIENTES c ON p.id_cliente = c.id_cliente
    LEFT JOIN CANALES_VENTA cv ON p.id_canal = cv.id_canal
    WHERE p.id_pedido = ?
  `, [id]);

  if (!pedido) return null;

  const items = await db.getAllAsync(`
    SELECT dp.*, pr.nombre_producto
    FROM DETALLE_PEDIDOS dp
    LEFT JOIN PRODUCTOS pr ON dp.id_producto = pr.id_producto
    WHERE dp.id_pedido = ?
  `, [id]);

  return { ...pedido, productos: items };
};

export const updatePedidoId = async (oldId, newId) => {
  await db.withTransactionAsync(async () => {
    // 1. Get original record
    const original = await db.getFirstAsync('SELECT * FROM PEDIDOS WHERE id_pedido = ?', [oldId]);
    if (original) {
      // 2. Insert new record with Supabase ID
      await db.runAsync(
        `INSERT INTO PEDIDOS (id_pedido, fecha_pedido, fecha_limite, id_cliente, id_canal, subtotal, costo_envio, total, estado, metodo_pago, requiere_envio, direccion_envio, notas, sincronizado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [newId, original.fecha_pedido, original.fecha_limite, original.id_cliente, original.id_canal, original.subtotal, original.costo_envio, original.total, original.estado, original.metodo_pago, original.requiere_envio, original.direccion_envio, original.notas]
      );

      // 3. Re-link children (DETALLE_PEDIDOS)
      await db.runAsync(
        'UPDATE DETALLE_PEDIDOS SET id_pedido = ? WHERE id_pedido = ?',
        [newId, oldId]
      );

      // 4. Delete temporary record
      await db.runAsync('DELETE FROM PEDIDOS WHERE id_pedido = ?', [oldId]);
    }
  });
};
