const supabase = require('../config/database');

exports.getResumenGanancias = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('vw_resumen_ganancias')
            .select('*')
            .limit(12);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener resumen de ganancias', error: error.message });
    }
};

exports.getProductosMasVendidos = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('vw_productos_mas_vendidos')
            .select('*')
            .limit(10);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener productos más vendidos', error: error.message });
    }
};

exports.getVentasRecientes = async (req, res) => {
    try {
        const { periodo } = req.query; // '7', '15', '30'
        let viewName = 'vw_ventas_7_dias';

        if (periodo === '15') viewName = 'vw_ventas_15_dias';
        if (periodo === '30') viewName = 'vw_ventas_30_dias';

        const { data, error } = await supabase
            .from(viewName)
            .select('*');

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener ventas recientes', error: error.message });
    }
};

exports.getVentasMensuales = async (req, res) => {
    try {
        const { mes, anio } = req.query; // Format: MM, YYYY
        const targetMonth = mes || (new Date().getMonth() + 1).toString().padStart(2, '0');
        const targetYear = anio || new Date().getFullYear().toString();

        // Calculate date range for filter
        const startDate = `${targetYear}-${targetMonth}-01`;
        // Handle end date (last day of month)
        const lastDay = new Date(targetYear, targetMonth, 0).getDate();
        const endDate = `${targetYear}-${targetMonth}-${lastDay}`;

        // Fetch all non-cancelled orders for the month with details
        const { data: pedidos, error } = await supabase
            .from('pedidos')
            .select(`
                id_pedido,
                fecha_pedido,
                total,
                metodo_pago,
                clientes (nombre_cliente),
                detalle_pedidos (
                    productos (nombre_producto)
                )
            `)
            .gte('fecha_pedido', startDate)
            .lte('fecha_pedido', endDate)
            .neq('estado', 'cancelado')
            .order('id_pedido', { ascending: false });

        if (error) throw error;

        // 1. Process breakdown (originally summaryRows)
        const breakdownMap = {};
        pedidos.forEach(p => {
            const method = p.metodo_pago || 'No especificado';
            if (!breakdownMap[method]) {
                breakdownMap[method] = { metodo_pago: method, cantidad_pedidos: 0, total_monto: 0 };
            }
            breakdownMap[method].cantidad_pedidos += 1;
            breakdownMap[method].total_monto += parseFloat(p.total || 0);
        });
        const summaryRows = Object.values(breakdownMap);

        // 2. Process list (originally orderRows with GROUP_CONCAT)
        const orderRows = pedidos.map(p => {
            const productNames = p.detalle_pedidos
                .map(dp => dp.productos?.nombre_producto)
                .filter(Boolean)
                .join(', ');

            return {
                id_pedido: p.id_pedido,
                fecha_pedido: p.fecha_pedido,
                total: p.total,
                metodo_pago: p.metodo_pago,
                nombre_cliente: p.clientes?.nombre_cliente,
                productos_resumen: productNames
            };
        });

        res.json({
            resumen: summaryRows,
            pedidos: orderRows,
            meta: { mes: targetMonth, anio: targetYear }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener ventas mensuales', error: error.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Parallelize requests
        const [
            todaySalesResult,
            pendingOrdersResult,
            totalProductsResult,
            historicalSalesResult
        ] = await Promise.all([
            // 1. Today's sales
            supabase
                .from('pedidos')
                .select('total')
                .eq('fecha_pedido', today)
                .neq('estado', 'cancelado'),

            // 2. Pending orders count
            supabase
                .from('pedidos')
                .select('id_pedido', { count: 'exact', head: true })
                .eq('estado', 'pendiente'),

            // 3. Total products
            supabase
                .from('productos')
                .select('id_producto', { count: 'exact', head: true })
                .eq('activo', true),

            // 4. Historical sales
            supabase
                .from('pedidos')
                .select('total')
                .neq('estado', 'cancelado')
        ]);

        // Process Today Sales
        const todaySalesData = todaySalesResult.data || [];
        const ventasHoy = todaySalesData.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
        const pedidosHoy = todaySalesResult.count || todaySalesResult.data?.length || 0; // count might be missing if simple select

        // Process Historical Sales
        const historicalSalesData = historicalSalesResult.data || [];
        const totalHistorico = historicalSalesData.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);

        res.json({
            ventasHoy,
            pedidosHoy, // Note: original query was COUNT(*) of sales today.
            pedidosPendientes: pendingOrdersResult.count || 0,
            totalProductos: totalProductsResult.count || 0,
            totalHistorico
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener estadísticas del dashboard', error: error.message });
    }
};
