// src/controladores/empleadoController.js
const pool = require('../db/conexion');
const bcrypt = require('bcrypt');

// Obtener todos los empleados de la misma empresa (solo admin)
const obtenerEmpleados = async (req, res) => {
  try {
    const { id_empresa } = req.usuario;
    const result = await pool.query(
      `SELECT id_usuario, nombre, correo, rol, fecha_registro
       FROM usuarios
       WHERE id_empresa = $1
       ORDER BY fecha_registro DESC`,
      [id_empresa]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

const crearEmpleado = async (req, res) => {
  const { nombre, correo, contraseña, rol = 'empleado' } = req.body;
  const id_empresa = req.usuario.id_empresa;
  const hashed = await bcrypt.hash(contraseña, 10);
  const result = await pool.query(
    `INSERT INTO usuarios (nombre, correo, contraseña, id_empresa, rol)
     VALUES ($1,$2,$3,$4,$5) RETURNING id_usuario, nombre, correo, rol, fecha_registro`,
    [nombre, correo, hashed, id_empresa, rol]
  );
  res.status(201).json(result.rows[0]);
};

const actualizarEmpleado = async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, rol } = req.body;
  const id_empresa = req.usuario.id_empresa;
  const result = await pool.query(
    `UPDATE usuarios
        SET nombre = $1, correo = $2, rol = $3
      WHERE id_usuario = $4 AND id_empresa = $5
      RETURNING id_usuario, nombre, correo, rol, fecha_registro`,
    [nombre, correo, rol, id, id_empresa]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Empleado no encontrado' });
  res.json(result.rows[0]);
};

const eliminarEmpleado = async (req, res) => {
  const { id } = req.params;
  const id_empresa = req.usuario.id_empresa;
  const result = await pool.query(
    `DELETE FROM usuarios
      WHERE id_usuario = $1 AND id_empresa = $2
      RETURNING id_usuario`,
    [id, id_empresa]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Empleado no encontrado' });
  res.json({ mensaje: 'Empleado eliminado' });
};

module.exports = { obtenerEmpleados, crearEmpleado, actualizarEmpleado, eliminarEmpleado };


