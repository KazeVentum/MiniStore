const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');

router.get('/ganancias', reportesController.getResumenGanancias);
router.get('/productos-top', reportesController.getProductosMasVendidos);
router.get('/ventas-recientes', reportesController.getVentasRecientes);
router.get('/ventas-mensuales', reportesController.getVentasMensuales);
router.get('/stats', reportesController.getDashboardStats);

module.exports = router;
