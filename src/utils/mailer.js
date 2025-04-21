const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Envía una alerta de stock bajo para los productos indicados.
 * @param {Array} productos Array de objetos { id_producto, nombre, stock, stock_minimo }
 */
async function enviarAlerta(productos) {
  if (productos.length === 0) return;

  const htmlLista = productos.map(p =>
    `<li><strong>${p.nombre}</strong> (ID ${p.id_producto}): stock ${p.stock} / mínimo ${p.stock_minimo}</li>`
  ).join('');

  const html = `
    <h2>⚠️ Alerta de stock bajo</h2>
    <p>Estos productos están por debajo o en su stock mínimo:</p>
    <ul>${htmlLista}</ul>
  `;

  await transporter.sendMail({
    from: `"Sistema Inventario" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: 'Alerta: Productos con stock bajo',
    html
  });
}

module.exports = { enviarAlerta };
