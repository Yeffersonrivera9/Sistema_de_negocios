// src/rutas/empleados.js
const express           = require('express'),
      router            = express.Router(),
      verificarToken    = require('../middlewares/verificarToken'),
      permitirSoloAdmin = require('../middlewares/permitirSoloAdmin'),
      empleadoCtrl      = require('../controladores/empleadoController');

// GET /empleados → cualquiera autenticado puede ver a sus compañeros
router.get('/', verificarToken, empleadoCtrl.obtenerEmpleados);

// POST/PUT/DELETE → sólo admin
router.post('/', verificarToken, permitirSoloAdmin, empleadoCtrl.crearEmpleado);
router.put('/:id', verificarToken, permitirSoloAdmin, empleadoCtrl.actualizarEmpleado);
router.delete('/:id', verificarToken, permitirSoloAdmin, empleadoCtrl.eliminarEmpleado);

module.exports = router;




