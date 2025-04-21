// src/controladores/ventaController.js
const pool = require('../db/conexion');

// Crear venta (cabecera + detalle)
const crearVenta = async (req, res) => {
  // id que viene del JWT (quien está autenticado)
  const authId   = req.usuario.id_usuario;
  const { id_usuario: selId, total, detalle } = req.body;

  // Si eres admin, puedes “vender” por otro usuario; si no, fuerza tu propio ID
  const vendedorId = (req.usuario.rol === 'admin' && selId) ? selId : authId;

  try {
    // Insertar con el vendedorId correcto
    const ventaRes = await pool.query(
      `INSERT INTO ventas (id_usuario, total, fecha)
         VALUES ($1, $2, NOW())
       RETURNING id_venta, fecha`,
      [vendedorId, total]
    );
    const { id_venta, fecha } = ventaRes.rows[0];

    // Insertar detalle …
    await Promise.all(
      detalle.map(item => {
        const subtotal = item.cantidad * item.precio_unitario;
        return pool.query(
          `INSERT INTO detalle_venta
             (id_venta, id_producto, cantidad, precio_unitario, subtotal)
           VALUES ($1,$2,$3,$4,$5)`,
          [id_venta, item.id_producto, item.cantidad, item.precio_unitario, subtotal]
        );
      })
    );

    res.status(201).json({ id_venta, fecha });
  } catch (error) {
    console.error('Error al crear venta:', error);
    res.status(500).json({
      error: 'Error del servidor al crear venta',
      details: error.message
    });
  }
};

// Obtener ventas (con detalle y nombres)
// src/controladores/ventaController.js

const obtenerVentas = async (req, res) => {
  const { fecha_inicio, fecha_fin } = req.query;
  try {
    // 1) Cabecera de ventas + nombre de vendedor
    let query = `
      SELECT
        v.id_venta,
        v.fecha,
        v.total,
        u.nombre    AS vendedor
      FROM ventas v
      JOIN usuarios u 
        ON v.id_usuario = u.id_usuario
    `;
    const params = [];
    if (fecha_inicio && fecha_fin) {
      query += ' WHERE v.fecha BETWEEN $1 AND $2';
      params.push(fecha_inicio, fecha_fin);
    }
    query += ' ORDER BY v.fecha DESC';

    const { rows: ventas } = await pool.query(query, params);

    // 2) Para cada venta, trae el detalle con nombre de producto
    const ventasConDetalle = await Promise.all(
      ventas.map(async v => {
        const detRes = await pool.query(
          `SELECT
             dv.id_producto,
             p.nombre           AS nombre_producto,
             dv.cantidad,
             dv.precio_unitario,
             dv.subtotal
           FROM detalle_venta dv
           JOIN productos p
             ON dv.id_producto = p.id_producto
           WHERE dv.id_venta = $1
          `,
          [v.id_venta]
        );
        return {
          ...v,
          detalle: detRes.rows
        };
      })
    );

    res.json(ventasConDetalle);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({
      error: 'Error consultando ventas',
      details: error.message
    });
  }
};

module.exports = {
  crearVenta,
  obtenerVentas
};

