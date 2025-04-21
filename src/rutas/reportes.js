const express         = require('express');
const router          = express.Router();
const verificarToken  = require('../middlewares/verificarToken');
const reportesCtrl    = require('../controladores/reportesController');

// Inventario
router.get('/inventario',     verificarToken, reportesCtrl.inventarioExcel);
router.get('/inventario/pdf', verificarToken, reportesCtrl.inventarioPDF);

// Ventas
router.get('/ventas',     verificarToken, reportesCtrl.ventasExcel);
router.get('/ventas/pdf', verificarToken, reportesCtrl.ventasPDF);

// Gastos (filtrado por el usuario autenticado)
router.get('/gastos',     verificarToken, reportesCtrl.gastosExcel);
router.get('/gastos/pdf', verificarToken, reportesCtrl.gastosPDF);

module.exports = router;

