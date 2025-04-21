const express = require('express');
const router = express.Router();
const productoController = require('../controladores/productoController');
const verificarToken    = require('../middlewares/authMiddleware');
const permitirSoloAdmin = require('../middlewares/permitirSoloAdmin');

// GET (listar y obtener por ID): cualquier usuario autenticado
router.get('/', verificarToken, productoController.obtenerProductos);
router.get('/:id', verificarToken, productoController.obtenerProductoPorId);

// POST / PUT / DELETE: sólo admin
router.post('/',    verificarToken, permitirSoloAdmin, productoController.agregarProducto);
router.put('/:id',  verificarToken, permitirSoloAdmin, productoController.actualizarProducto);
router.delete('/:id',verificarToken, permitirSoloAdmin, productoController.eliminarProducto);

module.exports = router;




