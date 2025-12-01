const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/productos', require('./src/routes/productos'));
app.use('/api/pedidos', require('./src/routes/pedidos'));
app.use('/api/reportes', require('./src/routes/reportes'));
app.use('/api/common', require('./src/routes/common'));
app.use('/api/clientes', require('./src/routes/clientes'));

app.get('/', (req, res) => {
    res.send('Bisutería API is running');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
