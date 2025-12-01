const db = require('../config/database');

// Get all orders
exports.getPedidos = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.*, p.fecha_limite, c.nombre_cliente, cv.nombre_canal 
            FROM PEDIDOS p
            JOIN CLIENTES c ON p.id_cliente = c.id_cliente
            JOIN CANALES_VENTA cv ON p.id_canal = cv.id_canal
            ORDER BY p.fecha_pedido DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener pedidos' });
    }
};

// Get order by ID with details
exports.getPedidoById = async (req, res) => {
    try {
        const [orderRows] = await db.query(`
            SELECT p.*, p.fecha_limite, c.nombre_cliente, c.telefono, c.direccion, cv.nombre_canal 
            FROM PEDIDOS p
            JOIN CLIENTES c ON p.id_cliente = c.id_cliente
            JOIN CANALES_VENTA cv ON p.id_canal = cv.id_canal
            WHERE p.id_pedido = ?
        `, [req.params.id]);

        if (orderRows.length === 0) return res.status(404).json({ message: 'Pedido no encontrado' });

        const [detailsRows] = await db.query(`
            SELECT dp.*, pr.nombre_producto 
            FROM DETALLE_PEDIDOS dp
            JOIN PRODUCTOS pr ON dp.id_producto = pr.id_producto
            WHERE dp.id_pedido = ?
        `, [req.params.id]);

        const order = orderRows[0];
        order.detalles = detailsRows;

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el pedido' });
    }
};

// Create new order
exports.createPedido = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const {
            fecha_pedido, fecha_limite, id_cliente, id_canal, costo_envio,
            requiere_envio, direccion_envio, notas, productos
        } = req.body;

        // 1. Create Order
        const [orderResult] = await connection.query(
            'INSERT INTO PEDIDOS (fecha_pedido, fecha_limite, id_cliente, id_canal, costo_envio, requiere_envio, direccion_envio, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [fecha_pedido, fecha_limite, id_cliente, id_canal, costo_envio, requiere_envio, direccion_envio, notas]
        );
        const pedidoId = orderResult.insertId;

        // 2. Add Details
        let subtotal = 0;
        for (const item of productos) {
            const [prodRows] = await connection.query('SELECT precio FROM PRODUCTOS WHERE id_producto = ?', [item.id_producto]);
            if (prodRows.length === 0) throw new Error(`Producto ${item.id_producto} no encontrado`);

            const precio = prodRows[0].precio;
            const itemSubtotal = precio * item.cantidad;
            subtotal += itemSubtotal;

            await connection.query(
                'INSERT INTO DETALLE_PEDIDOS (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
                [pedidoId, item.id_producto, item.cantidad, precio]
            );
        }

        // 3. Update Subtotal (Trigger/Generated column might handle this, but let's be safe if logic changes)
        // Actually, the table has a generated column for total, but subtotal is a regular column we need to set?
        // Checking schema: subtotal DECIMAL(10,2) NOT NULL DEFAULT 0
        // So we should update it.
        await connection.query('UPDATE PEDIDOS SET subtotal = ? WHERE id_pedido = ?', [subtotal, pedidoId]);

        await connection.commit();
        res.status(201).json({ message: 'Pedido creado exitosamente', id_pedido: pedidoId });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Error al crear el pedido', error: error.message });
    } finally {
        connection.release();
    }
};

// Update order status
exports.updateEstadoPedido = async (req, res) => {
    try {
        const { estado } = req.body;
        await db.query('UPDATE PEDIDOS SET estado = ? WHERE id_pedido = ?', [estado, req.params.id]);
        res.json({ message: 'Estado actualizado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar estado' });
    }
};
