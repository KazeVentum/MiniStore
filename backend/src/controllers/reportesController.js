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

        res.json({
            ventasHoy: todaySales[0].total || 0,
            pedidosHoy: todaySales[0].count || 0,
            pedidosPendientes: pendingOrders[0].count || 0,
            totalProductos: totalProducts[0].count || 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener estadísticas del dashboard' });
    }
};
