const supabase = require('../config/database');

exports.getPedidos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*, clientes(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener pedidos', error: error.message });
  }
};

exports.createPedido = async (req, res) => {
  try {
    const { id_producto, quantity, id_cliente, notes } = req.body;

    // Fetch product to get name and price
    const { data: producto, error: prodError } = await supabase
      .from('productos')
      .select('name, price')
      .eq('id', id_producto)
      .single();

    if (prodError || !producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const total = producto.price * quantity;

    const { data, error } = await supabase
      .from('pedidos')
      .insert([{
        id_producto,
        product_name: producto.name,
        quantity,
        total,
        id_cliente: id_cliente || null, 
        notes: notes || null
      }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el pedido', error: error.message });
  }
};

exports.deletePedido = async (req, res) => {
  try {
    const { error } = await supabase
      .from('pedidos')
      .update({ estado: 'cancelado' })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Pedido cancelado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el pedido', error: error.message });
  }
};
