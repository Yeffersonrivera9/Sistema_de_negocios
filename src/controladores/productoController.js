// controladores/productoController.js
const pool = require('../db/conexion');
const { enviarAlerta } = require('../utils/mailer');

const esAdmin = (req) => req.usuario.rol === 'admin';

// Obtener todos los productos
const obtenerProductos = async (req, res) => {
  try {
    const { id_empresa } = req.usuario;

    const result = await pool.query(
      `SELECT 
         p.id_producto,
         p.nombre,
         p.descripcion,
         p.categoria,
         p.precio_unitario,
         p.stock,
         p.stock_minimo,
         p.id_usuario
       FROM productos p
       JOIN usuarios u 
         ON p.id_usuario = u.id_usuario
       WHERE u.id_empresa = $1
       ORDER BY p.id_producto`,
      [id_empresa]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

const obtenerProductoPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const { id_empresa } = req.usuario;
    const result = await pool.query(
      `SELECT 
         p.id_producto,
         p.nombre,
         p.descripcion,
         p.categoria,
         p.precio_unitario,
         p.stock,
         p.stock_minimo,
         p.id_usuario
       FROM productos p
       JOIN usuarios u 
         ON p.id_usuario = u.id_usuario
       WHERE p.id_producto = $1
         AND u.id_empresa  = $2`,
      [id, id_empresa]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener producto por ID:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Agregar nuevo producto (igual para todos)
const agregarProducto = async (req, res) => {
  const {
    nombre, descripcion, categoria,
    precio_unitario, stock, stock_minimo
  } = req.body;
  const id_usuario = req.usuario.id_usuario;

  try {
    const result = await pool.query(
      `INSERT INTO productos
         (nombre, descripcion, categoria, precio_unitario, stock, stock_minimo, id_usuario)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [nombre, descripcion, categoria, precio_unitario, stock, stock_minimo, id_usuario]
    );
    const nuevoProducto = result.rows[0];
    if (nuevoProducto.stock <= nuevoProducto.stock_minimo) {
      enviarAlerta([nuevoProducto]).catch(console.error);
    }
    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error('Error al agregar producto:', error);
    res.status(500).json({ error: 'Error interno al agregar producto' });
  }
};

// Actualizar un producto
const actualizarProducto = async (req, res) => {
  const { id } = req.params;
  const {
    nombre, descripcion, categoria,
    precio_unitario, stock, stock_minimo
  } = req.body;

  try {
    // Construimos dinámicamente el WHERE
    let query = `
      UPDATE productos
         SET nombre          = $1,
             descripcion     = $2,
             categoria       = $3,
             precio_unitario = $4,
             stock           = $5,
             stock_minimo    = $6
      WHERE id_producto = $7
    `;
    const params = [nombre, descripcion, categoria, precio_unitario, stock, stock_minimo, id];

    // Si NO eres admin, añade la condición de ownership
    if (!esAdmin(req)) {
      query += ' AND id_usuario = $8';
      params.push(req.usuario.id_usuario);
    }

    query += ' RETURNING *';
    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado o sin permisos' });
    }

    const productoActualizado = result.rows[0];
    if (productoActualizado.stock <= productoActualizado.stock_minimo) {
      enviarAlerta([productoActualizado]).catch(console.error);
    }
    res.json(productoActualizado);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar un producto
const eliminarProducto = async (req, res) => {
  const { id } = req.params;
  try {
    let query = 'DELETE FROM productos WHERE id_producto = $1';
    const params = [id];

    if (!esAdmin(req)) {
      query += ' AND id_usuario = $2';
      params.push(req.usuario.id_usuario);
    }
    query += ' RETURNING *';

    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado o sin permisos' });
    }
    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  obtenerProductos, 
  agregarProducto,
  actualizarProducto,
  eliminarProducto,
};



