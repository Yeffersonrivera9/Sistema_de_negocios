// empleados.js

// 1) Recuperar y validar token
const token = localStorage.getItem('token');
if (!token) {
  alert('No estás autenticado');
  window.location.href = 'login.html';
}

// 2) Extraer payload para saber el rol
const payload = JSON.parse(atob(token.split('.')[1]));

// 3) Al cargarse la página...
document.addEventListener('DOMContentLoaded', () => {
  // 3.a) Si no es admin, ocultar todo lo mutador
  if (payload.rol !== 'admin') {
    // Oculta formulario de crear/editar
    document.getElementById('formEmpleados').style.display = 'none';
    // Elimina los botones de editar/eliminar de la tabla
    document.querySelectorAll('#tablaEmpleados button').forEach(btn => btn.remove());
  }

  // 3.b) Cargar lista de empleados
  obtenerEmpleados();

  // 3.c) Toggle menú
  document.getElementById('menuBtn')
    .addEventListener('click', () =>
      document.getElementById('menuOpciones').classList.toggle('oculto')
    );

  // 3.d) Submit de Crear/Actualizar empleado
  document.getElementById('formEmpleados')
    .addEventListener('submit', guardarEmpleado);
});


// — FUNCIONES DEL MÓDULO EMPLEADOS —

// Obtener y mostrar empleados
async function obtenerEmpleados() {
  const tabla = document.getElementById('tablaEmpleados');
  tabla.innerHTML = ''; // limpio

  try {
    const res = await fetch('http://localhost:3000/empleados', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const empleados = await res.json();
    empleados.forEach(emp => {
      const id     = emp.id_usuario;
      const nombre = emp.nombre;
      const correo = emp.correo;
      const rol    = emp.rol;
      const fecha  = emp.fecha_registro
        ? new Date(emp.fecha_registro).toLocaleDateString()
        : '—';

      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${id}</td>
        <td>${nombre}</td>
        <td>${correo}</td>
        <td>${rol}</td>
        <td>${fecha}</td>
        <td>
          <button onclick="editarEmpleado(${id}, '${nombre.replace(/'/g,"\\'")}', '${correo.replace(/'/g,"\\'")}', '${rol}')">Editar</button>
          <button onclick="eliminarEmpleado(${id})">Eliminar</button>
        </td>
      `;
      tabla.appendChild(fila);
    });

  } catch (error) {
    console.error('Error de conexión al obtener empleados:', error);
    tabla.innerHTML = `
      <tr><td colspan="6" style="color:red;">
        No se pudieron cargar los empleados
      </td></tr>`;
  }
}

// Guardar (crear o actualizar) empleado
async function guardarEmpleado(e) {
  e.preventDefault();
  const id      = document.getElementById('id_usuario').value;
  const nombre  = document.getElementById('nombre').value.trim();
  const correo  = document.getElementById('correo').value.trim();
  const pass    = document.getElementById('contraseña').value;
  const rol     = document.getElementById('rol').value;

  const url    = id ? `http://localhost:3000/empleados/${id}` : 'http://localhost:3000/empleados';
  const method = id ? 'PUT' : 'POST';
  const body   = id
    ? { nombre, correo, rol }
    : { nombre, correo, contraseña: pass, rol };

  try {
    const res  = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (res.ok) {
      alert(id ? 'Empleado actualizado correctamente' : 'Empleado agregado correctamente');
      document.getElementById('formEmpleados').reset();
      document.getElementById('id_usuario').value = '';
      document.getElementById('tituloFormulario').textContent = 'Agregar nuevo empleado';
      obtenerEmpleados();
    } else {
      alert(data.error || 'Error en la operación');
    }
  } catch (error) {
    console.error('Error al guardar empleado:', error);
    alert('Error de conexión');
  }
}

// Cargar datos en el formulario para editar
function editarEmpleado(id, nombre, correo, rol) {
  document.getElementById('id_usuario').value = id;
  document.getElementById('nombre').value     = nombre;
  document.getElementById('correo').value     = correo;
  document.getElementById('rol').value        = rol;
  document.getElementById('contraseña').value = '';
  document.getElementById('tituloFormulario').textContent = 'Editar empleado';
}

// Eliminar un empleado
async function eliminarEmpleado(id) {
  if (!confirm('¿Seguro que deseas eliminar este empleado?')) return;
  try {
    const res  = await fetch(`http://localhost:3000/empleados/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.mensaje);
      obtenerEmpleados();
    } else {
      alert(data.error || 'No se pudo eliminar');
    }
  } catch (error) {
    console.error('Error al eliminar empleado:', error);
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



