const express = require('express');
const router = express.Router();
const commonController = require('../controllers/commonController');

router.get('/categorias', commonController.getCategorias);
router.get('/clientes', commonController.getClientes);
router.get('/canales', commonController.getCanales);

module.exports = router;
