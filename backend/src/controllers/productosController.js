const supabase = require('../config/database');

exports.getProductos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('activo', true)
      .order('name', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener productos', error: error.message });
  }
};

exports.getProductoById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el producto', error: error.message });
  }
};

exports.createProducto = async (req, res) => {
  try {
    const { name, price, image_url, featured } = req.body;
    const { data, error } = await supabase
      .from('productos')
      .insert([{ name, price, image_url: image_url || null, featured: featured || false }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el producto', error: error.message });
  }
};

exports.updateProducto = async (req, res) => {
  try {
    const { name, price, image_url, featured } = req.body;
    const { data, error } = await supabase
      .from('productos')
      .update({ name, price, image_url: image_url || null, featured: featured ?? false })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
  }
};

exports.deleteProducto = async (req, res) => {
  try {
    const { error } = await supabase
      .from('productos')
      .update({ activo: false })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
  }
};
