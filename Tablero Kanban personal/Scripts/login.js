/** Lógica de inicio de sesión **/
document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

  const usuarioValido = usuarios.find(user => user.email === email && user.password === password);

  if (usuarioValido) {
    // Guardar usuario activo
    localStorage.setItem('usuarioActivo', JSON.stringify(usuarioValido));
    window.location.href = "tablero.html";
  } else {
    alert('Correo o contraseña incorrectos');
  }
});


  // Obtener los usuarios almacenados
  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

  // Buscar si hay coincidencia
  const usuarioValido = usuarios.find(
    user => user.email === email && user.password === password
  );

  if (usuarioValido) {
    // Guardar sesión simulada
    localStorage.setItem('usuarioActual', JSON.stringify(usuarioValido));

    alert(`Bienvenido, ${usuarioValido.nombre}`);
    window.location.href = "tablero.html";
  } else {
    alert('Correo o contraseña incorrectos');
  }
;
