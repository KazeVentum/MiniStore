const db = require('../config/database');

exports.getClientes = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM CLIENTES WHERE activo = TRUE ORDER BY nombre_cliente');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener clientes' });
    }
};

exports.createCliente = async (req, res) => {
    try {
        const { nombre_cliente, telefono, direccion, notas } = req.body;
        const [result] = await db.query(
            'INSERT INTO CLIENTES (nombre_cliente, telefono, direccion, notas) VALUES (?, ?, ?, ?)',
            [nombre_cliente, telefono, direccion, notas]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear cliente' });
    }
};

exports.updateCliente = async (req, res) => {
    try {
        const { nombre_cliente, telefono, direccion, notas } = req.body;
        await db.query(
            'UPDATE CLIENTES SET nombre_cliente = ?, telefono = ?, direccion = ?, notas = ? WHERE id_cliente = ?',
            [nombre_cliente, telefono, direccion, notas, req.params.id]
        );
        res.json({ message: 'Cliente actualizado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar cliente' });
    }
};

exports.deleteCliente = async (req, res) => {
    try {
        await db.query('UPDATE CLIENTES SET activo = FALSE WHERE id_cliente = ?', [req.params.id]);
        res.json({ message: 'Cliente eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar cliente' });
    }
};
