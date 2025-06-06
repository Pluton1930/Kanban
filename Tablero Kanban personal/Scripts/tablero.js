let usuarioActual = JSON.parse(localStorage.getItem('usuarioActivo'));
let tableroAEliminar = null;

if (!usuarioActual) {
  alert('Sesión expirada. Inicia sesión nuevamente.');
  window.location.href = 'login.html';
}

document.getElementById('bienvenida').textContent = `Hola, ${usuarioActual.nombre}`;

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('usuarioActivo');
  window.location.href = 'login.html';
});

document.getElementById('formTablero').addEventListener('submit', function (e) {
  e.preventDefault();

  const nombre = document.getElementById('nombreTablero').value.trim();
  const descripcion = document.getElementById('descripcionTablero').value.trim();
  if (!nombre) return;

  const nuevoTablero = { id: Date.now(), nombre, descripcion };
  usuarioActual.tableros = [nuevoTablero, ...(usuarioActual.tableros || [])];

  actualizarUsuarioEnStorage();
  this.reset();
  cargarTableros();
});

function cargarTableros() {
  const contenedor = document.getElementById('contenedorTableros');
  contenedor.innerHTML = '';

  const tableros = usuarioActual.tableros || [];

  if (tableros.length === 0) {
    contenedor.innerHTML = '<p>No hay tableros aún.</p>';
    return;
  }

  tableros.forEach((t, index) => {
    const card = document.createElement('div');
    card.className = 'tablero';
    card.setAttribute('draggable', 'true');
    card.dataset.index = index;

    const nombreHTML = `<h3 class="titulo-tablero" title="${t.nombre}">${t.nombre}</h3>`;
    const descripcionHTML = `<p class="descripcion-tablero" title="${t.descripcion || 'Sin descripción'}">${t.descripcion || 'Sin descripción'}</p>`;

    card.innerHTML = `
      ${nombreHTML}
      ${descripcionHTML}
      <div class="botones">
        <button class="editar-btn" title="Editar">✏️ Editar</button>
        <button class="abrir-btn">Abrir</button>
        <button class="eliminar-btn">Eliminar</button>
      </div>
    `;

    // Abrir tablero
    card.querySelector('.abrir-btn').addEventListener('click', () => {
      localStorage.setItem('kanbanActualId', t.id);
      window.location.href = 'kanban.html';
    });

    // Eliminar tablero
    card.querySelector('.eliminar-btn').addEventListener('click', () => {
      tableroAEliminar = index;
      document.getElementById('mensajeModal').textContent =
        `¿Estás seguro que deseas eliminar el tablero "${t.nombre}"?`;
      document.getElementById('modalConfirmacion').style.display = 'flex';
    });

    // Editar nombre y descripción
    card.querySelector('.editar-btn').addEventListener('click', function () {
      const btn = this;
      const h3 = card.querySelector('.titulo-tablero');
      const p = card.querySelector('.descripcion-tablero');

      const inputNombre = document.createElement('input');
      inputNombre.type = 'text';
      inputNombre.value = h3.textContent;
      inputNombre.className = 'input-editable';

      const inputDesc = document.createElement('input');
      inputDesc.type = 'text';
      inputDesc.value = p.textContent;
      inputDesc.className = 'input-editable';

      h3.replaceWith(inputNombre);
      p.replaceWith(inputDesc);

      inputNombre.focus();
      btn.textContent = '💾 Guardar';

      const guardar = () => {
        const nuevoNombre = inputNombre.value.trim() || 'Sin título';
        const nuevaDesc = inputDesc.value.trim() || 'Sin descripción';

        usuarioActual.tableros[index].nombre = nuevoNombre;
        usuarioActual.tableros[index].descripcion = nuevaDesc;
        actualizarUsuarioEnStorage();
        cargarTableros();
      };

      // Guardar con Enter
      inputNombre.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') guardar();
      });
      inputDesc.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') guardar();
      });

      // Guardar con botón
      btn.onclick = guardar;
    });

    contenedor.appendChild(card);
  });

  habilitarDragAndDrop();
}

document.getElementById('btnCancelar').addEventListener('click', () => {
  document.getElementById('modalConfirmacion').style.display = 'none';
  tableroAEliminar = null;
});

document.getElementById('btnConfirmarEliminar').addEventListener('click', () => {
  if (tableroAEliminar !== null) {
    usuarioActual.tableros.splice(tableroAEliminar, 1);
    actualizarUsuarioEnStorage();
    cargarTableros();
    document.getElementById('modalConfirmacion').style.display = 'none';
    tableroAEliminar = null;
  }
});

function habilitarDragAndDrop() {
  const tarjetas = document.querySelectorAll('.tablero');
  let dragging = null;

  tarjetas.forEach(t => {
    t.addEventListener('dragstart', () => {
      dragging = t;
      t.classList.add('dragging');
    });

    t.addEventListener('dragend', () => {
      dragging = null;
      t.classList.remove('dragging');
      actualizarOrdenDesdeDOM();
    });

    t.addEventListener('dragover', e => e.preventDefault());

    t.addEventListener('dragenter', e => {
      e.preventDefault();
      if (!dragging || t === dragging) return;

      const container = document.getElementById('contenedorTableros');
      const tarjetasArray = [...container.querySelectorAll('.tablero')];
      const draggingIndex = tarjetasArray.indexOf(dragging);
      const targetIndex = tarjetasArray.indexOf(t);

      if (draggingIndex < targetIndex) {
        container.insertBefore(dragging, t.nextSibling);
      } else {
        container.insertBefore(dragging, t);
      }
    });
  });
}

function actualizarOrdenDesdeDOM() {
  const container = document.getElementById('contenedorTableros');
  const nuevasTarjetas = [...container.querySelectorAll('.tablero')];
  const nuevoOrden = nuevasTarjetas.map(div => {
    const index = parseInt(div.dataset.index);
    return usuarioActual.tableros[index];
  });

  usuarioActual.tableros = nuevoOrden;
  actualizarUsuarioEnStorage();
}

function actualizarUsuarioEnStorage() {
  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  const index = usuarios.findIndex(u => u.email === usuarioActual.email);
  if (index !== -1) {
    usuarios[index] = usuarioActual;
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    localStorage.setItem('usuarioActivo', JSON.stringify(usuarioActual));
  }
}

cargarTableros();
