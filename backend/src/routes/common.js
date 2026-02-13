const express = require('express');
const router = express.Router();
const commonController = require('../controllers/commonController');

router.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));
router.get('/categorias', commonController.getCategorias);
router.get('/clientes', commonController.getClientes);
router.get('/canales', commonController.getCanales);

module.exports = router;
