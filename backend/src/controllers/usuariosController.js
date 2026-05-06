const supabase = require('../config/database');

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username already exists
    const { data: existing } = await supabase
      .from('usuarios')
      .select('id')
      .eq('username', username)
      .single();

    if (existing) {
      return res.status(409).json({ message: 'El usuario ya existe' });
    }

    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ username, password }])
      .select('id, username, created_at');

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const { data, error } = await supabase
      .from('usuarios')
      .select('id, username, password')
      .eq('username', username)
      .single();

    if (error || !data) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    if (data.password !== password) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    res.json({ username: data.username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
};
