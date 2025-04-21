// src/controladores/authController.js
const bcrypt = require('bcrypt'); // Para encriptar y comparar contraseñas
const jwt = require('jsonwebtoken'); // Para generar tokens JWT 
const pool = require('../db/conexion'); // Conexión a la base de datos

// Función para registrar un nuevo usuario y crear empresa/admin
const registrarUsuario = async (req, res) => {
  const { nombre, correo, contraseña, empresa_nombre } = req.body;
  try {
    // Verificamos si el correo ya está registrado
    const exists = await pool.query(
      'SELECT 1 FROM usuarios WHERE correo = $1',
      [correo]
    );
    if (exists.rows.length) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    // 1) Crear empresa
    const empresaRes = await pool.query(
      'INSERT INTO empresas (nombre) VALUES ($1) RETURNING id_empresa',
      [empresa_nombre]
    );
    const id_empresa = empresaRes.rows[0].id_empresa;
    const rol = 'admin';

    // 2) Encriptamos la contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // 3) Insertamos el nuevo usuario
    const userRes = await pool.query(
      `INSERT INTO usuarios
         (nombre, correo, contraseña, id_empresa, rol)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id_usuario, nombre, correo, fecha_registro, id_empresa, rol`,
      [nombre, correo, hashedPassword, id_empresa, rol]
    );

    // 4) Generamos JWT con payload enriquecido
    const usuario = userRes.rows[0];
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        correo: usuario.correo,
        id_empresa: usuario.id_empresa,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // 5) Respondemos con usuario (sin contraseña) y token
    res.status(201).json({
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        fecha_registro: usuario.fecha_registro,
        id_empresa: usuario.id_empresa,
        rol: usuario.rol
      },
      token
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Función para login de usuario
const loginUsuario = async (req, res) => {
  const { correo, contraseña } = req.body;
  try {
    // Buscamos al usuario por correo
    const result = await pool.query(
      `SELECT id_usuario, correo, contraseña, id_empresa, rol
         FROM usuarios WHERE correo = $1`,
      [correo]
    );
    const usuario = result.rows[0];

    if (!usuario) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    // Verificamos la contraseña
    const valid = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Creamos el token JWT
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        correo: usuario.correo,
        id_empresa: usuario.id_empresa,
        rol: usuario.rol,
        nombre: usuario.nombre
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario
};




