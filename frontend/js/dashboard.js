// frontend/js/dashboard.js

// =================== VARIABLES GLOBALES ===================
const token = localStorage.getItem('token');
if (!token) {
  alert('No estás autenticado');
  window.location.href = 'login.html';
}

// =================== UTILIDADES ===================
/** Decodifica el JWT para extraer el rol */

async function descargarReporte(tipo, formato) {
  const endpoint = `/reportes/${tipo}${formato === 'pdf' ? '/pdf' : ''}`;
  try {
    const res = await fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
    const blob = await res.blob();
    // construye un enlace temporal para descargar
    const urlBlob = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = urlBlob;
    // ponle nombre al archivo según tipo y formato
    a.download = `${tipo}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(urlBlob);
  } catch (err) {
    console.error(err);
    alert('No se pudo descargar el reporte:\n' + err.message);
  }
}

function obtenerRol() {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.rol; // 'admin' o 'empleado'
  } catch {
    return null;
  }
}

// =================== CARGA INICIAL ===================
document.addEventListener('DOMContentLoaded', () => {
  // Mostrar/ocultar menú hamburguesa
  document
    .getElementById('menuBtn')
    .addEventListener('click', () =>
      document.getElementById('menuOpciones').classList.toggle('oculto')
    );

  renderDashboard();
});

// =================== FUNCIONES PRINCIPALES ===================
async function renderDashboard() {
  const rol = obtenerRol();
  console.log('renderDashboard → rol =', rol);

  // 1) Preparo las peticiones que todos ejecutan
  const peticiones = [
    fetch('http://localhost:3000/productos', {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch('http://localhost:3000/ventas', {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch('http://localhost:3000/gastos', {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ];

  // 2) Solo admin añade /empleados
  if (rol === 'admin') {
    peticiones.unshift(
      fetch('http://localhost:3000/empleados', {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
  }

  try {
    // 3) Ejecuto todas
    const respuestas = await Promise.all(peticiones);

    // 4) Cierro sesión si hay 401/403
    if (respuestas.some(r => r.status === 401 || r.status === 403)) {
      alert('Sesión caducada o sin permisos. Inicia sesión de nuevo.');
      cerrarSesion();
      return;
    }

    // 5) Parseo JSON
    let empleados = [], productos, ventas, gastos;
    const bodies = await Promise.all(respuestas.map(r => r.json()));
    if (rol === 'admin') {
      [empleados, productos, ventas, gastos] = bodies;
    } else {
      [productos, ventas, gastos] = bodies;
    }

    // 6) Gráfica de empleados (solo admin)
    const canvasEmps = document.getElementById('chartEmpleadosPorMes');
    if (rol === 'admin' && canvasEmps) {
      dibujarGraficoEmpleados(canvasEmps, empleados);
    } else if (canvasEmps) {
      // Oculto el contenedor si no hay canvas o no es admin
      const cont = canvasEmps.closest('.chart-container') || canvasEmps.parentElement;
      if (cont) cont.style.display = 'none';
    }

    // 7) Resto de gráficas
    const canvasVentas = document.getElementById('chartVentasPorMes');
    if (canvasVentas) dibujarGraficoVentas(canvasVentas, ventas);

    const canvasIngEgr = document.getElementById('chartIngresosEgresos');
    if (canvasIngEgr) dibujarGraficoIngresosEgresos(canvasIngEgr, ventas, gastos);

    const canvasTopProd = document.getElementById('chartProductosMasVendidos');
    if (canvasTopProd) dibujarGraficoTopProductos(canvasTopProd, ventas, productos);

  } catch (error) {
    console.error('Error al renderizar dashboard:', error);
    alert(`Error cargando dashboard:\n${error.message}`);
  }
}

// =================== DIBUJO DE GRÁFICOS ===================
function dibujarGraficoEmpleados(canvas, empleados) {
  const counts = {};
  empleados.forEach(e => {
    const d = new Date(e.fecha_registro);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    counts[key] = (counts[key] || 0) + 1;
  });
  const labels = Object.keys(counts).sort();
  const data = labels.map(m => counts[m]);

  new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Empleados registrados',
        data,
        fill: false,
        tension: 0.1
      }]
    },
    options: {
      scales: {
        x: { title: { display: true, text: 'Mes' } },
        y: { title: { display: true, text: 'Cantidad' }, beginAtZero: true }
      }
    }
  });
}

function dibujarGraficoVentas(canvas, ventas) {
  const counts = {};
  ventas.forEach(v => {
    const d = new Date(v.fecha);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    counts[key] = (counts[key] || 0) + parseFloat(v.total);
  });
  const labels = Object.keys(counts).sort();
  const data = labels.map(m => counts[m]);

  new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Total Ventas',
        data,
        fill: false,
        tension: 0.1
      }]
    },
    options: {
      scales: {
        x: { title: { display: true, text: 'Mes' } },
        y: { title: { display: true, text: 'Monto (USD)' }, beginAtZero: true }
      }
    }
  });
}

function dibujarGraficoIngresosEgresos(canvas, ventas, gastos) {
  const ingresos = {}, egresos = {};
  ventas.forEach(v => {
    const d = new Date(v.fecha);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    ingresos[key] = (ingresos[key] || 0) + parseFloat(v.total);
  });
  gastos.forEach(g => {
    const d = new Date(g.fecha);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    egresos[key] = (egresos[key] || 0) + parseFloat(g.monto);
  });
  const labels = Array.from(new Set([...Object.keys(ingresos), ...Object.keys(egresos)])).sort();
  const dataIn = labels.map(m => ingresos[m] || 0);
  const dataEg = labels.map(m => egresos[m] || 0);

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Ingresos', data: dataIn },
        { label: 'Egresos',  data: dataEg }
      ]
    },
    options: {
      scales: {
        x: { title: { display: true, text: 'Mes' } },
        y: { title: { display: true, text: 'Monto (USD)' }, beginAtZero: true }
      }
    }
  });
}

function dibujarGraficoTopProductos(canvas, ventas, productos) {
  const ventasProd = {};
  ventas.forEach(v =>
    (v.detalle || []).forEach(d => {
      ventasProd[d.id_producto] = (ventasProd[d.id_producto] || 0) + d.cantidad;
    })
  );
  const top = Object.entries(ventasProd)
    .map(([id, qty]) => ({ id: +id, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const labels = top.map(t => {
    const p = productos.find(x => x.id_producto === t.id);
    return p ? p.nombre : `ID ${t.id}`;
  });
  const data = top.map(t => t.qty);

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Unidades vendidas',
        data
      }]
    },
    options: {
      scales: {
        x: { title: { display: true, text: 'Producto' } },
        y: { title: { display: true, text: 'Unidades' }, beginAtZero: true }
      }
    }
  });

// Para cada dropdown, alternar la visibilidad al hacer clic
document.querySelectorAll('.dropdown').forEach(dd => {
  const btn = dd.querySelector('.report-btn');
  const menu = dd.querySelector('.dropdown-content');

  btn.addEventListener('click', e => {
    e.stopPropagation();    // evitar cerrar al mismo tiempo que abrimos
    // cerrar cualquier otro dropdown abierto
    document.querySelectorAll('.dropdown-content.show')
      .forEach(openMenu => {
        if (openMenu !== menu) openMenu.classList.remove('show');
      });
    // alternar este
    menu.classList.toggle('show');
  });
});

// cerrar dropdowns si clic afuera
document.addEventListener('click', () => {
  document.querySelectorAll('.dropdown-content.show')
    .forEach(menu => menu.classList.remove('show'));
});
}

// =================== NAVEGACIÓN ===================
function irAProductos()  { window.location.href = 'productos.html'; }
function irAEmpleados()   { window.location.href = 'empleados.html'; }
function irADashboard()   { window.location.href = 'dashboard.html'; }
function irAVentas()      { window.location.href = 'ventas.html'; }
function irAGastos()      { window.location.href = 'gastos.html'; }
function cerrarSesion()   {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}


