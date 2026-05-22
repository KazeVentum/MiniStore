const supabase = require('../config/database');

exports.getClientes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener clientes', error: error.message });
  }
};

exports.createCliente = async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    const { data, error } = await supabase
      .from('clientes')
      .insert([{ name, phone, email }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear cliente', error: error.message });
  }
};

exports.deleteCliente = async (req, res) => {
  try {
    const { error } = await supabase
      .from('clientes')
      .update({ activo: false })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Cliente desactivado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar cliente', error: error.message });
  }
};