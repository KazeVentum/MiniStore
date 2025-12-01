const db = require('../config/database');

// Get all products with optional category filter
exports.getProductos = async (req, res) => {
    try {
        const { categoria } = req.query;
        let query = `
            SELECT p.*, c.nombre_categoria 
            FROM PRODUCTOS p 
            JOIN CATEGORIAS c ON p.id_categoria = c.id_categoria
            WHERE p.activo = TRUE
        `;
        const params = [];

        if (categoria) {
            query += ' AND p.id_categoria = ?';
            params.push(categoria);
        }

        query += ' ORDER BY p.nombre_producto ASC';

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener productos' });
    }
};

// Get single product
exports.getProductoById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM PRODUCTOS WHERE id_producto = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el producto' });
    }
};

// Create product
exports.createProducto = async (req, res) => {
    try {
        const { nombre_producto, descripcion, precio, tamano, imagen_url, id_categoria } = req.body;
        const [result] = await db.query(
            'INSERT INTO PRODUCTOS (nombre_producto, descripcion, precio, tamano, imagen_url, id_categoria) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre_producto, descripcion, precio, tamano, imagen_url, id_categoria]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el producto' });
    }
};

// Update product
exports.updateProducto = async (req, res) => {
    try {
        const { nombre_producto, descripcion, precio, tamano, imagen_url, id_categoria } = req.body;
        await db.query(
            'UPDATE PRODUCTOS SET nombre_producto = ?, descripcion = ?, precio = ?, tamano = ?, imagen_url = ?, id_categoria = ? WHERE id_producto = ?',
            [nombre_producto, descripcion, precio, tamano, imagen_url, id_categoria, req.params.id]
        );
        res.json({ message: 'Producto actualizado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el producto' });
    }
};

// Delete product (soft delete)
exports.deleteProducto = async (req, res) => {
    try {
        await db.query('UPDATE PRODUCTOS SET activo = FALSE WHERE id_producto = ?', [req.params.id]);
        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar el producto' });
    }
};
