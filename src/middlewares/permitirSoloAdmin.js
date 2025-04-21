// src/middlewares/permitirSoloAdmin.js
module.exports = (req, res, next) => {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado: solo admin' });
    }
    next();
  };
  
