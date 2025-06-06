// Botón para volver al tablero principal
document.getElementById('volverBtn').addEventListener('click', () => {
  window.location.href = 'tablero.html';
});

const kanban = document.getElementById('kanban');
const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
const tableroId = localStorage.getItem('kanbanActualId');

// Validación básica de sesión
if (!usuarioActivo || !tableroId) {
  alert('No se pudo cargar el tablero. Inicia sesión de nuevo.');
  window.location.href = 'login.html';
}

// Obtener el nombre del tablero actual
const tableroActual = usuarioActivo.tableros.find(t => t.id == tableroId);

// Mostrar título y descripción del tablero
if (tableroActual) {
  document.getElementById('tituloTablero').textContent = `Tablero: ${tableroActual.nombre}`;
  document.getElementById('descripcionTablero').textContent = tableroActual.descripcion || '';
} else {
  document.getElementById('tituloTablero').textContent = 'Tablero sin nombre';
  document.getElementById('descripcionTablero').textContent = '';
}


// Clave única para almacenar las tareas de este tablero y usuario
const storageKey = `kanban_${usuarioActivo.email}_${tableroId}`;

// Obtener datos del localStorage o iniciar con las listas base
let datosTablero = JSON.parse(localStorage.getItem(storageKey));
if (!datosTablero) {
  datosTablero = [
    { nombre: "POR HACER", tareas: [] },
    { nombre: "EN PROCESO", tareas: [] },
    { nombre: "COMPLETADO", tareas: [] }
  ];
  guardarEnStorage();
}

// Mostrar todas las listas
datosTablero.forEach(lista => crearLista(lista.nombre, lista.tareas));

// Agregar nueva lista
document.getElementById('formNuevaLista').addEventListener('submit', function (e) {
  e.preventDefault();
  const titulo = document.getElementById('tituloLista').value.trim();
  if (!titulo) return;

  datosTablero.push({ nombre: titulo, tareas: [] });
  guardarEnStorage();
  crearLista(titulo, []);
  this.reset();
});

// ============================
// Crear lista DOM
function crearLista(nombre, tareas = []) {
  const listaEl = document.createElement('div');
  listaEl.className = 'lista';

  const encabezado = document.createElement('div');
  encabezado.className = 'encabezado-lista';

  const titulo = document.createElement('h2');
  titulo.textContent = nombre;

  const eliminarLista = document.createElement('span');
  eliminarLista.textContent = '✖';
  eliminarLista.className = 'eliminar-lista';
  eliminarLista.title = 'Eliminar lista';
  eliminarLista.addEventListener('click', () => {
    datosTablero = datosTablero.filter(l => l.nombre !== nombre);
    guardarEnStorage();
    listaEl.remove();
  });

  encabezado.appendChild(titulo);
  encabezado.appendChild(eliminarLista);
  listaEl.appendChild(encabezado);

  // Permitir soltar tarjetas aquí
  listaEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    listaEl.classList.add('over');
  });

  listaEl.addEventListener('dragleave', () => {
    listaEl.classList.remove('over');
  });

  listaEl.addEventListener('drop', (e) => {
    e.preventDefault();
    listaEl.classList.remove('over');

    const tarjetaId = e.dataTransfer.getData('text/id');
    const texto = e.dataTransfer.getData('text/contenido');
    const tarjeta = document.getElementById(tarjetaId);

    if (tarjeta && texto) {
      listaEl.insertBefore(tarjeta, form);
      moverTareaALista(texto, nombre);
    }
  });

  // Añadir tareas existentes
  tareas.forEach(tarea => {
    const tarjeta = crearTarjeta(tarea);
    listaEl.appendChild(tarjeta);
  });

  // Formulario para nueva tarea
  const form = document.createElement('form');
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Nueva tarea';

  const btn = document.createElement('button');
  btn.textContent = 'Agregar';

  form.appendChild(input);
  form.appendChild(btn);
  listaEl.appendChild(form);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const valor = input.value.trim();
    if (!valor) return;

    const nuevaTarjeta = crearTarjeta(valor);
    listaEl.insertBefore(nuevaTarjeta, form);

    const lista = datosTablero.find(l => l.nombre === nombre);
    if (lista) {
      lista.tareas.push(valor);
      guardarEnStorage();
    }

    input.value = '';
  });

  kanban.appendChild(listaEl);
}

// ============================
// Crear tarjeta DOM
function crearTarjeta(texto) {
  const tarjeta = document.createElement('div');
  tarjeta.className = 'tarjeta';
  tarjeta.setAttribute('draggable', true);
  tarjeta.id = 'tarjeta-' + Date.now();

  const contenido = document.createElement('span');
  contenido.className = 'contenido';
  contenido.textContent = texto;

  const eliminar = document.createElement('span');
  eliminar.className = 'eliminar';
  eliminar.title = 'Eliminar tarea';
  eliminar.textContent = '✖';

  eliminar.addEventListener('click', () => {
    tarjeta.remove();
    eliminarTarea(texto);
  });

  tarjeta.appendChild(contenido);
  tarjeta.appendChild(eliminar);

  tarjeta.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/id', tarjeta.id);
    e.dataTransfer.setData('text/contenido', texto);
    tarjeta.classList.add('dragging');
    setTimeout(() => (tarjeta.style.display = 'none'), 0);
  });

  tarjeta.addEventListener('dragend', () => {
    tarjeta.style.display = '';
    tarjeta.classList.remove('dragging');
  });

  return tarjeta;
}

// ============================
// Guardar en localStorage
function guardarEnStorage() {
  localStorage.setItem(storageKey, JSON.stringify(datosTablero));
}

// ============================
// Mover tarea a otra lista
function moverTareaALista(tarea, nuevaLista) {
  datosTablero.forEach(l => {
    l.tareas = l.tareas.filter(t => t !== tarea);
  });

  const destino = datosTablero.find(l => l.nombre === nuevaLista);
  if (destino) {
    destino.tareas.push(tarea);
  }

  guardarEnStorage();
}

// ============================
// Eliminar tarea de todas las listas
function eliminarTarea(tarea) {
  datosTablero.forEach(l => {
    l.tareas = l.tareas.filter(t => t !== tarea);
  });

  guardarEnStorage();
}
