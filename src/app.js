// app.js
const express = require('express');
const path    = require('path');
const cors    = require('cors');
const dotenv  = require('dotenv');

// 📂 Cargar variables de entorno desde ../.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

// 1) Sirve tu carpeta 'frontend' (JS, CSS, HTML) de forma estática:
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Importar rutas
const authRoutes = require('./rutas/auth');  
const productosRoutes = require('./rutas/productos');
const rutaEmpleados = require('./rutas/empleados');
const rutaVentas = require('./rutas/ventas');
const rutaGastos = require('./rutas/gastos');
const rutaReportes = require('./rutas/reportes');

// Usar rutas
app.use('/auth', authRoutes);  
app.use('/productos', productosRoutes);
app.use('/empleados', rutaEmpleados);
app.use('/ventas', rutaVentas);
app.use('/gastos', rutaGastos);
app.use('/reportes', rutaReportes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});


