// Mostrar mensaje de error debajo del campo
function showError(id, mensaje) {
  document.getElementById(id).textContent = mensaje;
}

// Limpiar errores anteriores
function clearErrors() {
  ['nombreError', 'emailError', 'passwordError', 'confirmPasswordError'].forEach(id => {
    document.getElementById(id).textContent = '';
  });
}

// Validar nombre de usuario al escribir
document.getElementById('username').addEventListener('input', function () {
  const username = this.value;
  const feedback = document.getElementById('usernameFeedback');

  if (username.length < 4) {
    feedback.textContent = 'Mínimo 4 caracteres';
    feedback.className = 'feedback invalido';
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    feedback.textContent = 'Solo letras, números y guiones bajos';
    feedback.className = 'feedback invalido';
  } else {
    feedback.textContent = 'Nombre de usuario válido';
    feedback.className = 'feedback valido';
  }
});

// Barra de fuerza de contraseña
document.getElementById('password').addEventListener('input', function () {
  const pass = this.value;
  const strengthBar = document.querySelector('.strength-bar');
  const strengthText = document.getElementById('strengthText');
  let strength = 0;

  if (pass.length >= 8) strength++;
  if (/[A-Z]/.test(pass)) strength++;
  if (/[0-9]/.test(pass)) strength++;
  if (/[^A-Za-z0-9]/.test(pass)) strength++;

  const colors = ['red', 'orange', 'gold', 'green'];
  const messages = ['Muy débil', 'Débil', 'Moderada', 'Fuerte'];

  strengthBar.style.width = `${(strength / 4) * 100}%`;
  strengthBar.style.background = colors[strength - 1] || 'red';
  strengthText.textContent = messages[strength - 1] || '';
  strengthText.style.color = colors[strength - 1] || 'red';
});

// Validación al enviar el formulario
document.getElementById('registroForm').addEventListener('submit', function (e) {
  e.preventDefault();
  clearErrors();

  const nombre = document.getElementById('nombre').value.trim();
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  let valido = true;

  if (!nombre) {
    showError('nombreError', 'El nombre es obligatorio');
    valido = false;
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    showError('emailError', 'Correo electrónico inválido');
    valido = false;
  }

  if (password.length < 8) {
    showError('passwordError', 'Mínimo 8 caracteres');
    valido = false;
  }

  if (confirmPassword !== password) {
    showError('confirmPasswordError', 'Las contraseñas no coinciden');
    valido = false;
  }

  // Evitar duplicados por correo
  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  const existe = usuarios.find(u => u.email === email);

  if (existe) {
    showError('emailError', 'Este correo ya está registrado');
    valido = false;
  }

  if (valido) {
  const nuevoUsuario = { nombre, username, email, password };
  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

  // Verificar si el email ya existe
  if (usuarios.some(u => u.email === email)) {
    showError('emailError', 'El correo ya está registrado');
    return;
  }

  usuarios.push(nuevoUsuario);
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
  localStorage.setItem('usuarioActivo', JSON.stringify(nuevoUsuario)); // Guardar activo
  alert('Registro exitoso');
  window.location.href = "tablero.html";
}

});
