document.getElementById('formRegister').addEventListener('submit', async e => {
    e.preventDefault();
  
    const empresa_nombre = document.getElementById('empresa_nombre').value.trim();
    const nombre         = document.getElementById('nombre').value.trim();
    const correo         = document.getElementById('correo').value.trim();
    const contraseña     = document.getElementById('contraseña').value;
  
    try {
      const res = await fetch('http://localhost:3000/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa_nombre, nombre, correo, contraseña })
      });
  
      const data = await res.json();
      if (res.ok) {
        alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
        window.location.href = 'login.html';
      } else {
        alert('Error: ' + (data.error || 'No se pudo registrar'));
      }
    } catch (err) {
      console.error('Error en registro:', err);
      alert('Error de conexión al servidor');
    }
  });
  
  