const db = require('../config/database');

exports.getCategorias = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM CATEGORIAS WHERE activo = TRUE');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener categorías' });
    }
};

exports.getClientes = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM CLIENTES WHERE activo = TRUE ORDER BY nombre_cliente');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener clientes' });
    }
};

exports.getCanales = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM CANALES_VENTA WHERE activo = TRUE');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener canales' });
    }
};
