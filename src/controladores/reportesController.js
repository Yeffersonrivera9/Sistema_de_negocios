const ExcelJS   = require('exceljs');
const PDFDocument = require('pdfkit');
const pool       = require('../db/conexion');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Formatea fecha a DD/MM/YYYY
function formatDate(date) {
  const d = new Date(date);
  return [d.getDate(), d.getMonth() + 1, d.getFullYear()]
    .map(n => String(n).padStart(2, '0'))
    .join('/');
}

// ─────────────────────────────────────────────────────────────────────────────
// INVENTARIO → EXCEL
exports.inventarioExcel = async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const sheet    = workbook.addWorksheet('Inventario');

  sheet.columns = [
    { header: 'ID',             key: 'id',           width: 10 },
    { header: 'Nombre',         key: 'nombre',       width: 30 },
    { header: 'Descripción',    key: 'descripcion',  width: 40 },
    { header: 'Categoría',      key: 'categoria',    width: 20 },
    { header: 'Precio Unitario',key: 'precio',       width: 15 },
    { header: 'Stock',          key: 'stock',        width: 10 },
    { header: 'Stock Mínimo',   key: 'stock_minimo', width: 12 },
  ];

  const { rows } = await pool.query(`
    SELECT id_producto, nombre, descripcion, categoria,
           precio_unitario, stock, stock_minimo
      FROM productos
     ORDER BY nombre
  `);

  rows.forEach(r => {
    sheet.addRow({
      id:           r.id_producto,
      nombre:       r.nombre,
      descripcion:  r.descripcion,
      categoria:    r.categoria,
      precio:       parseFloat(r.precio_unitario).toFixed(2),
      stock:        r.stock,
      stock_minimo: r.stock_minimo
    });
  });

  res.setHeader(
    'Content-Disposition',
    'attachment; filename="inventario.xlsx"'
  );
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  await workbook.xlsx.write(res);
  res.end();
};

// INVENTARIO → PDF
exports.inventarioPDF = async (req, res) => {
  const doc = new PDFDocument({ margin: 30, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="inventario.pdf"'
  );
  doc.pipe(res);

  doc.fontSize(18).text('Reporte de Inventario', { align: 'center' });
  doc.moveDown();

  const { rows } = await pool.query(`
    SELECT id_producto, nombre, descripcion, categoria,
           precio_unitario, stock, stock_minimo
      FROM productos
     ORDER BY nombre
  `);

  rows.forEach(r => {
    doc
      .fontSize(12)
      .text(
        `• [${r.id_producto}] ${r.nombre}` +
        ` — Cat: ${r.categoria}` +
        ` — Stock: ${r.stock}/${r.stock_minimo}` +
        ` — Precio: $${parseFloat(r.precio_unitario).toFixed(2)}`
      )
      .moveDown(0.2);
  });

  doc.end();
};

// ─────────────────────────────────────────────────────────────────────────────
// VENTAS → EXCEL
exports.ventasExcel = async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const sheet    = workbook.addWorksheet('Ventas');

  sheet.columns = [
    { header: 'ID Venta', key: 'id',       width: 10 },
    { header: 'Fecha',    key: 'fecha',    width: 15 },
    { header: 'Vendedor', key: 'vendedor', width: 25 },
    { header: 'Total',    key: 'total',    width: 15 },
  ];

  const { rows } = await pool.query(`
    SELECT v.id_venta, v.fecha, u.nombre AS vendedor, v.total
      FROM ventas v
      JOIN usuarios u ON u.id_usuario = v.id_usuario
     ORDER BY v.fecha DESC
  `);

  rows.forEach(r => {
    sheet.addRow({
      id:       r.id_venta,
      fecha:    formatDate(r.fecha),
      vendedor: r.vendedor,
      total:    parseFloat(r.total).toFixed(2)
    });
  });

  res.setHeader(
    'Content-Disposition',
    'attachment; filename="ventas.xlsx"'
  );
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  await workbook.xlsx.write(res);
  res.end();
};

// VENTAS → PDF
exports.ventasPDF = async (req, res) => {
  const doc = new PDFDocument({ margin: 30, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="ventas.pdf"'
  );
  doc.pipe(res);

  doc.fontSize(18).text('Reporte de Ventas', { align: 'center' });
  doc.moveDown();

  const { rows } = await pool.query(`
    SELECT v.id_venta, v.fecha, u.nombre AS vendedor, v.total
      FROM ventas v
      JOIN usuarios u ON u.id_usuario = v.id_usuario
     ORDER BY v.fecha DESC
  `);

  rows.forEach(r => {
    doc
      .fontSize(12)
      .text(
        `• [${r.id_venta}] ${formatDate(r.fecha)}` +
        ` — Vendedor: ${r.vendedor}` +
        ` — Total: $${parseFloat(r.total).toFixed(2)}`
      )
      .moveDown(0.2);
  });

  doc.end();
};

// ─────────────────────────────────────────────────────────────────────────────
// GASTOS → EXCEL
exports.gastosExcel = async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const sheet    = workbook.addWorksheet('Gastos');

  sheet.columns = [
    { header: 'ID Gasto', key: 'id',       width: 10 },
    { header: 'Concepto', key: 'concepto', width: 30 },
    { header: 'Categoría',key: 'categoria',width: 20 },
    { header: 'Monto',    key: 'monto',    width: 15 },
    { header: 'Fecha',    key: 'fecha',    width: 15 },
  ];

  const usuarioId = req.usuario.id_usuario;
  const { rows } = await pool.query(
    `SELECT id_gasto, concepto, categoria, monto, fecha
       FROM gastos
      WHERE id_usuario = $1
      ORDER BY fecha DESC`,
    [usuarioId]
  );

  rows.forEach(r => {
    sheet.addRow({
      id:        r.id_gasto,
      concepto:  r.concepto,
      categoria: r.categoria,
      monto:     parseFloat(r.monto).toFixed(2),
      fecha:     formatDate(r.fecha)
    });
  });

  res.setHeader(
    'Content-Disposition',
    'attachment; filename="gastos.xlsx"'
  );
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  await workbook.xlsx.write(res);
  res.end();
};

// GASTOS → PDF
exports.gastosPDF = async (req, res) => {
  const doc = new PDFDocument({ margin: 30, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="gastos.pdf"'
  );
  doc.pipe(res);

  doc.fontSize(18).text('Reporte de Gastos', { align: 'center' });
  doc.moveDown();

  const usuarioId = req.usuario.id_usuario;
  const { rows } = await pool.query(
    `SELECT id_gasto, concepto, categoria, monto, fecha
       FROM gastos
      WHERE id_usuario = $1
      ORDER BY fecha DESC`,
    [usuarioId]
  );

  rows.forEach(r => {
    doc
      .fontSize(12)
      .text(
        `• [${r.id_gasto}] ${formatDate(r.fecha)}` +
        ` — ${r.concepto}` +
        ` — Cat: ${r.categoria}` +
        ` — Monto: $${parseFloat(r.monto).toFixed(2)}`
      )
      .moveDown(0.2);
  });

  doc.end();
};

