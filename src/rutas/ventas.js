// src/rutas/ventas.js

const express           = require('express');
const router            = express.Router();
const verificarToken    = require('../middlewares/verificarToken');
const permitirSoloAdmin = require('../middlewares/permitirSoloAdmin');
const ventaCtrl         = require('../controladores/ventaController');

// GET /ventas      → cualquier usuario autenticado
router.get(
  '/',
  verificarToken,
  ventaCtrl.obtenerVentas
);

// POST /ventas     → solo admin puede crear ventas
router.post(
  '/',
  verificarToken,
  permitirSoloAdmin,
  ventaCtrl.crearVenta
);

// Si más adelante quieres habilitar actualización o borrado:
// router.put(
//   '/:id',
//   verificarToken,
//   permitirSoloAdmin,
//   ventaCtrl.actualizarVenta
// );
// router.delete(
//   '/:id',
//   verificarToken,
//   permitirSoloAdmin,
//   ventaCtrl.eliminarVenta
// );

module.exports = router;



