const db = require('../config/database');

exports.getResumenGanancias = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM vw_resumen_ganancias LIMIT 12');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener resumen de ganancias' });
    }
};

exports.getProductosMasVendidos = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM vw_productos_mas_vendidos LIMIT 10');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener productos más vendidos' });
    }
};

exports.getVentasRecientes = async (req, res) => {
    try {
        const { periodo } = req.query; // '7', '15', '30'
        let viewName = 'vw_ventas_7_dias';

        if (periodo === '15') viewName = 'vw_ventas_15_dias';
        if (periodo === '30') viewName = 'vw_ventas_30_dias';

        const [rows] = await db.query(`SELECT * FROM ${viewName}`);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener ventas recientes' });
    }
};

exports.getVentasMensuales = async (req, res) => {
    try {
        const { mes, anio } = req.query; // Format: MM, YYYY
        const targetMonth = mes || (new Date().getMonth() + 1).toString().padStart(2, '0');
        const targetYear = anio || new Date().getFullYear().toString();
        const dateFilter = `${targetYear}-${targetMonth}`;

        // 1. Total sales and breakdown
        const [summaryRows] = await db.query(`
            SELECT 
                metodo_pago,
                count(*) as cantidad_pedidos,
                SUM(total) as total_monto
            FROM PEDIDOS 
            WHERE DATE_FORMAT(fecha_pedido, '%Y-%m') = ? 
              AND estado != 'cancelado'
            GROUP BY metodo_pago
        `, [dateFilter]);

        // 2. Detailed list with concatenated products
        const [orderRows] = await db.query(`
            SELECT 
                p.id_pedido,
                p.fecha_pedido,
                p.total,
                p.metodo_pago,
                c.nombre_cliente,
                GROUP_CONCAT(pr.nombre_producto SEPARATOR ', ') as productos_resumen
            FROM PEDIDOS p
            JOIN CLIENTES c ON p.id_cliente = c.id_cliente
            LEFT JOIN DETALLE_PEDIDOS dp ON p.id_pedido = dp.id_pedido
            LEFT JOIN PRODUCTOS pr ON dp.id_producto = pr.id_producto
            WHERE DATE_FORMAT(p.fecha_pedido, '%Y-%m') = ?
              AND p.estado != 'cancelado'
            GROUP BY p.id_pedido
            ORDER BY p.id_pedido DESC
        `, [dateFilter]);

        res.json({
            resumen: summaryRows,
            pedidos: orderRows,
            meta: { mes: targetMonth, anio: targetYear }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener ventas mensuales' });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        // Get today's sales
        const [todaySales] = await db.query(`
            SELECT SUM(total) as total, COUNT(*) as count 
            FROM PEDIDOS 
            WHERE DATE(fecha_pedido) = CURDATE() AND estado != 'cancelado'
        `);

        // Get pending orders count
        const [pendingOrders] = await db.query(`
            SELECT COUNT(*) as count 
            FROM PEDIDOS 
            WHERE estado = 'pendiente'
        `);

        // Get total products
        const [totalProducts] = await db.query('SELECT COUNT(*) as count FROM PRODUCTOS WHERE activo = TRUE');

        // Get total historical sales
        const [historicalSales] = await db.query(`
            SELECT SUM(total) as total 
            FROM PEDIDOS 
            WHERE estado != 'cancelado'
        `);

        res.json({
            ventasHoy: todaySales[0].total || 0,
            pedidosHoy: todaySales[0].count || 0,
            pedidosPendientes: pendingOrders[0].count || 0,
            totalProductos: totalProducts[0].count || 0,
            totalHistorico: historicalSales[0].total || 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener estadísticas del dashboard' });
    }
};
