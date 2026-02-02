const supabase = require('../config/database');

// Get all orders
exports.getPedidos = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('pedidos')
            .select(`
                *,
                clientes (nombre_cliente),
                canales_venta (nombre_canal)
            `)
            .order('id_pedido', { ascending: false });

        if (error) throw error;

        // Flatten data for frontend compatibility
        const formattedData = data.map(p => ({
            ...p,
            nombre_cliente: p.clientes?.nombre_cliente,
            nombre_canal: p.canales_venta?.nombre_canal
        }));

        res.json(formattedData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener pedidos', error: error.message });
    }
};

// Get order by ID with details
exports.getPedidoById = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('pedidos')
            .select(`
                *,
                clientes (*),
                canales_venta (nombre_canal),
                detalle_pedidos (
                    *,
                    productos (nombre_producto)
                )
            `)
            .eq('id_pedido', req.params.id)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ message: 'Pedido no encontrado' });

        // Format details structure
        const formattedData = {
            ...data,
            nombre_cliente: data.clientes?.nombre_cliente,
            telefono: data.clientes?.telefono,
            direccion: data.clientes?.direccion,
            nombre_canal: data.canales_venta?.nombre_canal,
            detalles: data.detalle_pedidos.map(d => ({
                ...d,
                nombre_producto: d.productos?.nombre_producto
            }))
        };
        // Remove nested objects that were flattened
        delete formattedData.clientes;
        delete formattedData.canales_venta;
        delete formattedData.detalle_pedidos;

        // Add details back in correct property name expected by frontend
        formattedData.detalles = data.detalle_pedidos.map(d => ({
            ...d,
            nombre_producto: d.productos?.nombre_producto
        }));

        res.json(formattedData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el pedido', error: error.message });
    }
};

// Create new order
exports.createPedido = async (req, res) => {
    try {
        const {
            fecha_pedido, fecha_limite, id_cliente, id_canal, costo_envio,
            requiere_envio, direccion_envio, notas, metodo_pago, productos, estado
        } = req.body;

        // 1. Call RPC to create order header
        const { data: pedidoId, error: createError } = await supabase
            .rpc('sp_crear_pedido', {
                p_fecha_pedido: fecha_pedido,
                p_id_cliente: id_cliente,
                p_id_canal: id_canal,
                p_costo_envio: costo_envio || 0,
                p_requiere_envio: requiere_envio || false,
                p_direccion_envio: direccion_envio || '',
                p_notas: notas || ''
            });

        if (createError) throw createError;

        // Update payment method and status which were not in the basic procedure
        // Or we could have updated the procedure. For now, separate update.
        await supabase
            .from('pedidos')
            .update({
                metodo_pago: metodo_pago || 'No especificado',
                estado: estado || 'pendiente',
                fecha_limite: fecha_limite === '' ? null : fecha_limite
            })
            .eq('id_pedido', pedidoId);

        // 2. Add Details using RPC or Insert
        // Using sp_agregar_producto_pedido is safer as it handles prices and subtotal
        for (const item of productos) {
            const { error: itemError } = await supabase
                .rpc('sp_agregar_producto_pedido', {
                    p_id_pedido: pedidoId,
                    p_id_producto: item.id_producto,
                    p_cantidad: item.cantidad
                });
            if (itemError) console.error('Error adding item:', itemError);
        }

        res.status(201).json({ message: 'Pedido creado exitosamente', id_pedido: pedidoId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Error al crear el pedido: ${error.message}` });
    }
};

// Update order
exports.updatePedido = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            fecha_pedido, fecha_limite, id_cliente, id_canal, costo_envio,
            requiere_envio, direccion_envio, notas, metodo_pago, productos, estado
        } = req.body;

        const cleanFechaLimite = fecha_limite === '' ? null : fecha_limite;

        // 1. Update main order
        const { error: updateError } = await supabase
            .from('pedidos')
            .update({
                fecha_pedido,
                fecha_limite: cleanFechaLimite,
                id_cliente,
                id_canal,
                costo_envio,
                requiere_envio,
                direccion_envio,
                notas,
                metodo_pago: metodo_pago || 'No especificado',
                estado: estado || 'borrador',
                fecha_actualizacion: new Date()
            })
            .eq('id_pedido', id);

        if (updateError) throw updateError;

        // 2. Remove old details
        await supabase.from('detalle_pedidos').delete().eq('id_pedido', id);

        // 3. Add new details
        // We can reuse the RPC loop or do a bulk insert. 
        // Using RPC ensures prices are fetched from products table and totals updated.
        for (const item of productos) {
            await supabase
                .rpc('sp_agregar_producto_pedido', {
                    p_id_pedido: parseInt(id),
                    p_id_producto: item.id_producto,
                    p_cantidad: item.cantidad
                });
        }

        res.json({ message: 'Pedido actualizado exitosamente' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Error al actualizar el pedido: ${error.message}` });
    }
};

// Update order status
exports.updateEstadoPedido = async (req, res) => {
    try {
        const { estado } = req.body;
        const { error } = await supabase
            .from('pedidos')
            .update({ estado })
            .eq('id_pedido', req.params.id);

        if (error) throw error;
        res.json({ message: 'Estado actualizado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar estado', error: error.message });
    }
};
