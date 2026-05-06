const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidosController');

router.get('/', pedidosController.getPedidos);
router.post('/', pedidosController.createPedido);
router.delete('/:id', pedidosController.deletePedido);

module.exports = router;
