// models/productoModel.js
const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sistema_negocios',
  password: '787421',
  port: 5432,
});

const getProductos = async () => {
  const res = await pool.query('SELECT * FROM productos');
  return res.rows;
};

const getProductoById = async (id) => {
  const res = await pool.query('SELECT * FROM productos WHERE id_producto = $1', [id]);
  return res.rows[0];
};

const createProducto = async (nombre, precio, cantidad) => {
  const res = await pool.query(
    'INSERT INTO productos(nombre, precio, cantidad) VALUES ($1, $2, $3) RETURNING *',
    [nombre, precio, cantidad]
  );
  return res.rows[0];
};

const updateProducto = async (id, nombre, precio, cantidad) => {
  const res = await pool.query(
    'UPDATE productos SET nombre = $1, precio = $2, cantidad = $3 WHERE id_producto = $4 RETURNING *',
    [nombre, precio, cantidad, id]
  );
  return res.rows[0];
};

const deleteProducto = async (id) => {
  const res = await pool.query('DELETE FROM productos WHERE id_producto = $1 RETURNING *', [id]);
  return res.rows[0];
};

module.exports = {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
};
