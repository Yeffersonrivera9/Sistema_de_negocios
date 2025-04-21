// frontend/js/ventas.js

// =================== GLOBALES ===================
// extraemos el rol del token
function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return {};
  }
}
const payload = decodeToken(localStorage.getItem('token'));

// si NO es admin, escondemos el formulario de creación
if (payload.rol !== 'admin') {
  document.getElementById('formVenta').style.display = 'none';
  document.getElementById('agregarLinea').style.display = 'none';
}

const token = localStorage.getItem('token');
if (!token) {
  alert('No estás autenticado');
  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', async () => {
  // Toggle menú hamburguesa
  document.getElementById('menuBtn').addEventListener('click', () =>
    document.getElementById('menuOpciones').classList.toggle('oculto')
  );

  // Cargar vendedores en el select
  await cargarUsuarios();

  // Eventos de formulario
  document.getElementById('agregarLinea').addEventListener('click', addLinea);
  document.getElementById('formVenta').addEventListener('submit', guardarVenta);
  document.getElementById('filtrarVentas').addEventListener('click', listarVentas);

  // Listado inicial de ventas
  listarVentas();
});

// — Carga vendedores en <select id="id_usuario"> con "ID – Nombre"
async function cargarUsuarios() {
  const sel = document.getElementById('id_usuario');
  sel.innerHTML = '<option value="">Selecciona vendedor…</option>';

  // 1) Decodifica el payload del JWT (sin verificar, para uso en UI)
  const payload = JSON.parse(atob(token.split('.')[1]));
  const { rol, id_usuario: miId, nombre: miNombre } = payload;

  try {
    if (rol === 'admin') {
      // 2) Si eres admin, sí pedimos la lista completa
      const res = await fetch('http://localhost:3000/empleados', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const empleados = await res.json();
      empleados.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.id_usuario;
        opt.textContent = `${u.id_usuario} – ${u.nombre}`;
        sel.appendChild(opt);
      });
    } else {
      // 3) Si no eres admin, sólo tú mismo
      const opt = document.createElement('option');
      opt.value = miId;
      opt.textContent = `${miId} – ${miNombre}`;
      sel.appendChild(opt);
    }
  } catch (err) {
    console.error('Error cargando vendedores:', err);
    sel.innerHTML = '<option value="">Error al cargar vendedores</option>';
  }
}

// — Añade una línea de detalle de venta —
function addLinea() {
  const div = document.createElement('div');
  div.classList.add('linea-venta');
  div.innerHTML = `
    <select class="productoLinea"></select>
    <input type="number" class="cantidadLinea" placeholder="Cantidad" min="1" value="1">
    <button type="button" class="remove-linea" onclick="this.parentElement.remove()">✖</button>
  `;
  document.getElementById('lineasVenta').appendChild(div);
  cargarProductosEnSelect(div.querySelector('.productoLinea'));
}

// — Carga productos en cada <select class="productoLinea"> —
async function cargarProductosEnSelect(select) {
  try {
    const res = await fetch('http://localhost:3000/productos', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const productos = await res.json();
    select.innerHTML = '<option value="">Selecciona producto…</option>';
    productos.forEach(p => {
      const precio = Number(p.precio_unitario || p.precio).toFixed(2);
      const opt = document.createElement('option');
      opt.value = p.id_producto;
      opt.dataset.precio = precio;
      opt.textContent = `${p.nombre} ($${precio})`;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('Error cargando productos:', err);
    select.innerHTML = '<option value="">No disponibles</option>';
  }
}

// — Guarda la venta y detalle en el servidor —
async function guardarVenta(e) {
  e.preventDefault();

  // 1) Lee el vendedor seleccionado
  const id_usuario = parseInt(
    document.getElementById('id_usuario').value,
    10
  );
  console.log('guardarVenta → id_usuario seleccionado:', id_usuario);
  if (!id_usuario) {
    return alert('Selecciona un vendedor válido.');
  }

  // 2) Recoge las líneas de venta
  const lineas = Array.from(
    document.querySelectorAll('.linea-venta')
  ).map(div => {
    const sel  = div.querySelector('.productoLinea');
    const cant = div.querySelector('.cantidadLinea');
    return {
      id_producto:    parseInt(sel.value, 10),
      cantidad:       parseInt(cant.value, 10),
      precio_unitario: parseFloat(
        sel.selectedOptions[0].dataset.precio
      )
    };
  });
  if (lineas.length === 0) {
    return alert('Agrega al menos un producto.');
  }

  // 3) Calcula el total
  const total = lineas.reduce(
    (sum, l) => sum + l.cantidad * l.precio_unitario,
    0
  );

  // 4) Envía al backend incluyendo id_usuario
  try {
    const res = await fetch('http://localhost:3000/ventas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id_usuario, total, detalle: lineas })
    });

    const payload = await res.json();
    if (!res.ok) {
      throw new Error(payload.details || payload.error);
    }

    // 5) Confirmación y limpieza del formulario
    alert(
      `Venta #${payload.id_venta} registrada el ${new Date(
        payload.fecha
      ).toLocaleDateString()}`
    );
    document.getElementById('formVenta').reset();
    document.getElementById('lineasVenta').innerHTML = '';
    listarVentas();
  } catch (err) {
    console.error('Error al guardar venta:', err);
    alert(err.message);
  }
}

// — Lista las ventas, ya con campo v.vendedor y sin hora —
async function listarVentas() {
  // 1) Lee filtros de fecha
  const desde = document.getElementById('fechaInicio').value;
  const hasta = document.getElementById('fechaFin').value;

  // 2) Construye query string si hace falta
  const params = new URLSearchParams();
  if (desde) params.set('fecha_inicio', desde);
  if (hasta) params.set('fecha_fin',   hasta);
  const url = `http://localhost:3000/ventas${params.toString() ? `?${params}` : ''}`;

  try {
    // 3) Llama a la API
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }
    const ventas = await res.json();

    // 4) Renderiza la tabla
    const tbody = document.getElementById('tablaVentas');
    tbody.innerHTML = ventas.map(v => {
      // Genera la lista de detalle con nombres
      const detalleHTML = v.detalle.map(d => {
        const precio = parseFloat(d.precio_unitario).toFixed(2);
        const subtotal = parseFloat(d.subtotal).toFixed(2);
        return `<li>
          ${d.nombre_producto} — 
          ${d.cantidad} × $${precio} c/u = $${subtotal}
        </li>`;
      }).join('');

      return `
        <tr>
          <td>${v.id_venta}</td>
          <td>${v.vendedor}</td>
          <td>${new Date(v.fecha).toLocaleDateString()}</td>
          <td>$${parseFloat(v.total).toFixed(2)}</td>
          <td><ul>${detalleHTML}</ul></td>
        </tr>
      `;
    }).join('');

  } catch (error) {
    console.error('Error al listar ventas:', error);
    alert('No se pudieron cargar las ventas. Revisa la consola para más detalles.');
  }
}

// =================== NAVEGACIÓN ===================
function irAProductos() { window.location.href = 'productos.html'; }
function irAEmpleados()  { window.location.href = 'empleados.html'; }
function irADashboard()  { window.location.href = 'dashboard.html'; }
function irAVentas()     { window.location.href = 'ventas.html'; }
function irAGastos()     { window.location.href = 'gastos.html'; }
function cerrarSesion()  {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

  