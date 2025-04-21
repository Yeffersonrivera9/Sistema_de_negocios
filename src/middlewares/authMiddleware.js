// middleware/authMiddleware.js

// Importamos jwt para trabajar con los tokens
const jwt = require('jsonwebtoken');
// Importamos dotenv para usar las variables de entorno
const dotenv = require('dotenv');
dotenv.config();

// Middleware para verificar si el token JWT es válido
const verificarToken = (req, res, next) => {
  // Obtenemos el encabezado de autorización (Authorization: Bearer TOKEN)
  const authHeader = req.headers['authorization'];

  // Si no hay token, devolvemos un error de acceso denegado
  if (!authHeader) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

  // Extraemos el token del encabezado
  const token = authHeader.split(' ')[1];

  try {
    // Verificamos y decodificamos el token usando la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Guardamos los datos del usuario en la solicitud para uso posterior
    req.usuario = decoded;

    // Continuamos con la siguiente función del flujo (controlador o middleware)
    next();
  } catch (error) {
    // Si el token es inválido o expiró, devolvemos error
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};

// Exportamos el middleware para usarlo en otras partes del proyecto
module.exports = verificarToken;
