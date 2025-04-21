document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    // Cambiamos los nombres para que coincidan con los del backend
    const correo = document.getElementById('usuario').value;
    const contraseña = document.getElementById('password').value;
  
    const res = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contraseña })
    });
  
    const data = await res.json();
  
    if (res.ok) {
      localStorage.setItem('token', data.token);
      alert('Inicio de sesión exitoso');
      window.location.href = 'productos.html';
    } else {
      alert('Error al iniciar sesión: ' + data.error);
    }
  });
  
  