// frontend/js/main.js

// ————— Variables globales —————

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
  const formProd = document.getElementById('formAgregarProducto');
  if (formProd) formProd.style.display = 'none';
  document.querySelectorAll('.btn-editar-prod, .btn-eliminar-prod')
          .forEach(b => b.style.display = 'none');
}

const token = localStorage.getItem('token');
if (!token) {
  alert('No estás autenticado');
  window.location.href = 'login.html';
}

// ————— Carga inicial —————
document.addEventListener('DOMContentLoaded', () => {
  obtenerProductos();
  document.getElementById('menuBtn').addEventListener('click', () =>
    document.getElementById('menuOpciones').classList.toggle('oculto')
  );
  document.getElementById('formAgregarProducto')
          .addEventListener('submit', guardarProducto);
});

// ————— Funciones CRUD —————

// 1) Listar productos
async function obtenerProductos() {
  try {
    const res = await fetch('http://localhost:3000/productos', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    const tabla = document.getElementById('tablaProductos');
    const alerta = document.getElementById('alertaStock');
    tabla.innerHTML = '';

    // 1) Detectar productos con stock bajo
    const bajos = data.filter(p => p.stock <= p.stock_minimo);

    if (bajos.length > 0) {
      alerta.textContent = `⚠️ Atención: ${bajos.length} producto(s) con stock bajo.`;
    } else {
      alerta.textContent = ''; // sin alerta
    }

    // 2) Llenar la tabla, resaltando los bajos
    data.forEach(p => {
      const fila = document.createElement('tr');
    
      // Resalta si el stock está por debajo o igual al mínimo
      if (p.stock <= p.stock_minimo) {
        fila.classList.add('stock-bajo');
      }
      fila.innerHTML = `
    <td>${p.id_producto}</td>
    <td>${p.nombre}</td>
    <td>${p.descripcion}</td>           <!-- Descripción -->
    <td>${p.categoria}</td>            <!-- CATEGORÍA que faltaba -->
    <td>$${parseFloat(p.precio_unitario).toFixed(2)}</td>
    <td>${p.stock}</td>
    <td>${p.stock_minimo}</td>
    <td>
      <button onclick="editarProducto(
        ${p.id_producto},
        '${p.nombre.replace(/'/g,"\\'")}',
        '${p.descripcion.replace(/'/g,"\\'")}',
        '${p.categoria.replace(/'/g,"\\'")}',
        ${parseFloat(p.precio_unitario)},
        ${p.stock},
        ${p.stock_minimo}
      )">Editar</button>
      <button onclick="eliminarProducto(${p.id_producto})">Eliminar</button>
    </td>
  `;
  tabla.appendChild(fila);
});
      // Construye la fila con todos los campos y formatea el precio
      

  } catch (error) {
    console.error('Error al cargar productos:', error);
    alert('Error de conexión con el servidor');
  }
}

// 2) Guardar (agregar o actualizar)
async function guardarProducto(e) {
  e.preventDefault();

  const id             = document.getElementById('id_producto').value;
  const nombre         = document.getElementById('nombre').value;
  const descripcion    = document.getElementById('descripcion').value;
  const categoria      = document.getElementById('categoria').value;
  const precio_unitario= parseFloat(document.getElementById('precio_unitario').value);
  const stock          = parseInt(document.getElementById('stock').value);
  const stock_minimo   = parseInt(document.getElementById('stock_minimo').value);

  const url    = id  
    ? `http://localhost:3000/productos/${id}`  
    : 'http://localhost:3000/productos';
  const metodo = id ? 'PUT' : 'POST';

  const body = JSON.stringify({
    nombre,
    descripcion,
    categoria,
    precio_unitario,
    stock,
    stock_minimo
    // id_usuario se asigna en backend desde el token
  });

  try {
    const res = await fetch(url, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body
    });
    const resp = await res.json();

    if (res.ok) {
      alert(id ? 'Producto actualizado' : 'Producto agregado');
      document.getElementById('formAgregarProducto').reset();
      document.getElementById('id_producto').value = '';
      document.getElementById('tituloFormulario').textContent = 'Agregar nuevo producto';
      obtenerProductos();
    } else {
      alert(resp.error || 'Error en operación');
    }
  } catch (e) {
    console.error(e);
    alert('Error de conexión');
  }
}

// 3) Cargar datos en formulario para editar
function editarProducto(id, nombre, descripcion, categoria, precio_unitario, stock, stock_minimo) {
  document.getElementById('id_producto').value      = id;
  document.getElementById('nombre').value           = nombre;
  document.getElementById('descripcion').value      = descripcion;
  document.getElementById('categoria').value        = categoria;
  document.getElementById('precio_unitario').value  = precio_unitario;
  document.getElementById('stock').value            = stock;
  document.getElementById('stock_minimo').value     = stock_minimo;
  document.getElementById('tituloFormulario').textContent = 'Editar producto';
}

// 4) Eliminar producto
async function eliminarProducto(id) {
  if (!confirm('¿Eliminar este producto?')) return;
  try {
    const res = await fetch(`http://localhost:3000/productos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const resp = await res.json();
    if (res.ok) {
      alert(resp.mensaje);
      obtenerProductos();
    } else {
      alert(resp.error);
    }
  } catch {
    alert('Error al eliminar');
  }
}

// ————— Navegación —————
function irAProductos()  { window.location.href = 'productos.html'; }
function irAEmpleados()  { window.location.href = 'empleados.html'; }
function irADashboard()  { window.location.href = 'dashboard.html'; }
function irAVentas()     { window.location.href = 'ventas.html'; }
function irAGastos()     { window.location.href = 'gastos.html'; }
function cerrarSesion()  {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}


  
  
  
  