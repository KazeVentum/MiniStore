const supabase = require('../config/database');

// Get all products with optional category filter
exports.getProductos = async (req, res) => {
    try {
        const { categoria } = req.query;

        // Build query
        let query = supabase
            .from('productos')
            .select('*, categorias(nombre_categoria)')
            .eq('activo', true)
            .order('nombre_producto', { ascending: true });

        if (categoria) {
            query = query.eq('id_categoria', categoria);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Flatten the structure if needed to match previous response format
        const formattedData = data.map(product => ({
            ...product,
            nombre_categoria: product.categorias?.nombre_categoria
        }));

        res.json(formattedData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener productos', error: error.message });
    }
};

// Get single product
exports.getProductoById = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('productos')
            .select('*')
            .eq('id_producto', req.params.id)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ message: 'Producto no encontrado' });

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el producto', error: error.message });
    }
};

// Create product
exports.createProducto = async (req, res) => {
    try {
        const { nombre_producto, descripcion, precio, tamano, imagen_url, id_categoria } = req.body;

        const { data, error } = await supabase
            .from('productos')
            .insert([{
                nombre_producto,
                descripcion,
                precio,
                tamano,
                imagen_url,
                id_categoria
            }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el producto', error: error.message });
    }
};

// Update product
exports.updateProducto = async (req, res) => {
    try {
        const { nombre_producto, descripcion, precio, tamano, imagen_url, id_categoria } = req.body;

        const { error } = await supabase
            .from('productos')
            .update({
                nombre_producto,
                descripcion,
                precio,
                tamano,
                imagen_url,
                id_categoria
            })
            .eq('id_producto', req.params.id);

        if (error) throw error;
        res.json({ message: 'Producto actualizado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
    }
};

// Delete product (soft delete)
exports.deleteProducto = async (req, res) => {
    try {
        const { error } = await supabase
            .from('productos')
            .update({ activo: false })
            .eq('id_producto', req.params.id);

        if (error) throw error;
        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
    }
};
