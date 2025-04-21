// src/controladores/gastoController.js
const pool = require('../db/conexion');

// Obtener todos los gastos del usuario autenticado
const obtenerGastos = async (req, res) => {
  try {
    const { id_empresa } = req.usuario;
    const result = await pool.query(
      `SELECT
         g.id_gasto,
         g.concepto,
         g.categoria,
         g.monto,
         g.fecha,
         u.nombre AS empleado
       FROM gastos g
       JOIN usuarios u
         ON g.id_usuario = u.id_usuario
       WHERE u.id_empresa = $1
       ORDER BY g.fecha DESC`,
      [id_empresa]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener gastos:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Agregar un nuevo gasto y asociarlo al usuario autenticado
const agregarGasto = async (req, res) => {
  const { concepto, categoria, monto, fecha } = req.body;
  const id_usuario = req.usuario.id_usuario;

  try {
    const result = await pool.query(
      `INSERT INTO gastos (concepto, categoria, monto, fecha, id_usuario)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [concepto, categoria, monto, fecha || new Date(), id_usuario]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al agregar gasto:', error);
    res.status(500).json({ error: 'Error al agregar gasto' });
  }
};

// Actualizar un gasto solo si pertenece al usuario autenticado
const actualizarGasto = async (req, res) => {
  const { id } = req.params;
  const { concepto, categoria, monto, fecha } = req.body;

  try {
    const result = await pool.query(
      `UPDATE gastos
         SET concepto  = $1,
             categoria = $2,
             monto     = $3,
             fecha     = $4
       WHERE id_gasto = $5 AND id_usuario = $6
       RETURNING *`,
      [concepto, categoria, monto, fecha, id, req.usuario.id_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gasto no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar gasto:', error);
    res.status(500).json({ error: 'Error al actualizar gasto' });
  }
};

// Eliminar un gasto solo si pertenece al usuario autenticado
const eliminarGasto = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM gastos
       WHERE id_gasto = $1 AND id_usuario = $2
       RETURNING *`,
      [id, req.usuario.id_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gasto no encontrado' });
    }

    res.json({ mensaje: 'Gasto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar gasto:', error);
    res.status(500).json({ error: 'Error al eliminar gasto' });
  }
};

module.exports = {
  obtenerGastos,
  agregarGasto,
  actualizarGasto,
  eliminarGasto
};
