const express = require('express');
const router = express.Router();
const gastoController = require('../controladores/gastoController');
const verificarToken    = require('../middlewares/verificarToken');
const permitirSoloAdmin = require('../middlewares/permitirSoloAdmin');

// GET (listar): cualquier usuario autenticado
router.get('/', verificarToken, gastoController.obtenerGastos);

// POST / PUT / DELETE: sólo admin
router.post('/',    verificarToken, permitirSoloAdmin, gastoController.agregarGasto);
router.put('/:id',  verificarToken, permitirSoloAdmin, gastoController.actualizarGasto);
router.delete('/:id',verificarToken, permitirSoloAdmin, gastoController.eliminarGasto);

module.exports = router;

