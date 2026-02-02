const supabase = require('../config/database');

exports.getClientes = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('activo', true)
            .order('nombre_cliente', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener clientes', error: error.message });
    }
};

exports.createCliente = async (req, res) => {
    try {
        const { nombre_cliente, telefono, direccion, notas } = req.body;
        const { data, error } = await supabase
            .from('clientes')
            .insert([{ nombre_cliente, telefono, direccion, notas }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear cliente', error: error.message });
    }
};

exports.updateCliente = async (req, res) => {
    try {
        const { nombre_cliente, telefono, direccion, notas } = req.body;
        const { error } = await supabase
            .from('clientes')
            .update({ nombre_cliente, telefono, direccion, notas })
            .eq('id_cliente', req.params.id);

        if (error) throw error;
        res.json({ message: 'Cliente actualizado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar cliente', error: error.message });
    }
};

exports.deleteCliente = async (req, res) => {
    try {
        const { error } = await supabase
            .from('clientes')
            .update({ activo: false })
            .eq('id_cliente', req.params.id);

        if (error) throw error;
        res.json({ message: 'Cliente eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar cliente', error: error.message });
    }
};
