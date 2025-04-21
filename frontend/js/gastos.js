// =================== GLOBALES ===================

// gastos.js

// 1) Validar token y extraer rol
const token = localStorage.getItem('token');
if (!token) {
  alert('No estás autenticado');
  window.location.href = 'login.html';
}
const payload = JSON.parse(atob(token.split('.')[1])); // { id_usuario, correo, id_empresa, rol, ... }

// 2) Setup inicial al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  // 2.a) Si NO es admin, ocultar el formulario y botones mutadores
  if (payload.rol !== 'admin') {
    document.getElementById('formGastos').style.display = 'none';
  }

  // 2.b) Llenar la tabla
  obtenerGastos();

  // 2.c) Control del menú
  document.getElementById('menuBtn')
    .addEventListener('click', () =>
      document.getElementById('menuOpciones').classList.toggle('oculto')
    );

  // 2.d) Solo admin: enganchar submit para crear/editar
  if (payload.rol === 'admin') {
    document.getElementById('formGastos')
      .addEventListener('submit', guardarGasto);
  }
});


// — FUNCIONES PRINCIPALES —

// Obtener y mostrar todos los gastos del usuario/empresa
async function obtenerGastos() {
  const tabla = document.getElementById('tablaGastos');
  tabla.innerHTML = ''; // Limpiar

  try {
    const res = await fetch('http://localhost:3000/gastos', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const gastos = await res.json();
    gastos.forEach(g => {
      const fechaLegible = g.fecha
        ? new Date(g.fecha).toLocaleDateString()
        : '—';

      // Crear la fila
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${g.id_gasto}</td>
        <td>${g.concepto}</td>
        <td>${g.categoria}</td>
        <td>$${parseFloat(g.monto).toFixed(2)}</td>
        <td>${fechaLegible}</td>
        <td>
          ${payload.rol === 'admin'
            ? `<button onclick="editarGasto(
                 ${g.id_gasto},
                 '${g.concepto.replace(/'/g,"\\'")}',
                 '${g.categoria.replace(/'/g,"\\'")}',
                 ${g.monto},
                 '${g.fecha ? g.fecha.split('T')[0] : ''}'
               )">Editar</button>
               <button onclick="eliminarGasto(${g.id_gasto})">Eliminar</button>`
            : ''
          }
        </td>
      `;
      tabla.appendChild(fila);
    });

  } catch (err) {
    console.error('Error al obtener gastos:', err);
    tabla.innerHTML = `
      <tr><td colspan="6" style="color:red;">
        No se pudieron cargar los gastos
      </td></tr>`;
  }
}

// Crear o actualizar gasto (solo admin)
async function guardarGasto(e) {
  e.preventDefault();

  // Leer campos
  const id      = document.getElementById('id_gasto').value;
  const concepto = document.getElementById('concepto').value.trim();
  const categoria = document.getElementById('categoria').value.trim();
  const monto     = parseFloat(document.getElementById('monto').value);
  const fecha     = document.getElementById('fecha').value; // yyyy-mm-dd

  // Url y método según sea POST o PUT
  const url    = id
    ? `http://localhost:3000/gastos/${id}`
    : 'http://localhost:3000/gastos';
  const method = id ? 'PUT' : 'POST';
  const body   = { concepto, categoria, monto, fecha };

  try {
    const res  = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (res.ok) {
      alert(id ? 'Gasto actualizado' : 'Gasto registrado');
      document.getElementById('formGastos').reset();
      document.getElementById('id_gasto').value = '';
      document.getElementById('tituloFormulario').textContent = 'Agregar nuevo gasto';
      obtenerGastos();
    } else {
      alert(data.error || 'Error en la operación');
    }
  } catch (err) {
    console.error('Error al guardar gasto:', err);
    alert('Error de conexión');
  }
}

// Cargar los datos al formulario para editar (solo admin)
function editarGasto(id, concepto, categoria, monto, fecha) {
  document.getElementById('id_gasto').value   = id;
  document.getElementById('concepto').value   = concepto;
  document.getElementById('categoria').value  = categoria;
  document.getElementById('monto').value      = monto;
  document.getElementById('fecha').value      = fecha;
  document.getElementById('tituloFormulario').textContent = 'Editar gasto';
}

// Eliminar gasto (solo admin)
async function eliminarGasto(id) {
  if (!confirm('¿Seguro que deseas eliminar este gasto?')) return;
  try {
    const res  = await fetch(`http://localhost:3000/gastos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      alert('Gasto eliminado');
      obtenerGastos();
    } else {
      alert(data.error || 'No se pudo eliminar');
    }
  } catch (err) {
    console.error('Error al eliminar gasto:', err);
    alert('Error de conexión');
  }
}

// Navegación
function irAProductos()  { window.location.href = 'productos.html'; }
function irAEmpleados()  { window.location.href = 'empleados.html'; }
function irADashboard()  { window.location.href = 'dashboard.html'; }
function irAVentas()     { window.location.href = 'ventas.html'; }
function irAGastos()     { window.location.href = 'gastos.html'; }
function cerrarSesion()  {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

