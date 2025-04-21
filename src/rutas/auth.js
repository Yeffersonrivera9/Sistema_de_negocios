const express = require('express');
const router = express.Router();
const { registrarUsuario, loginUsuario } = require('../controladores/authController');

// Ruta de registro
router.post('/registro', registrarUsuario);

// Ruta de login
router.post('/login', loginUsuario);

module.exports = router;

