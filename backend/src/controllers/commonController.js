const supabase = require('../config/database');

exports.getCategorias = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('categorias')
            .select('*')
            .eq('activo', true);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener categorías', error: error.message });
    }
};

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
        res.status(500).json({ message: 'Error al obtener clientes', error: error.message });
    }
};

exports.getCanales = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('canales_venta')
            .select('*')
            .eq('activo', true);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener canales', error: error.message });
    }
};
