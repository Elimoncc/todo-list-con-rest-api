async function obtenerMensajeError(response, mensajeGenerico) {
    try {
        const data = await response.json();
        return data.mensaje || mensajeGenerico;
    } catch {
        return mensajeGenerico;
    }
}


function abrirModal(id, descripcionActual, fechaActual) {
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-desc').value = descripcionActual;
    document.getElementById('modal-fecha').value = fechaActual;
    document.getElementById('modal-guardar').onclick = () => guardarEdicion(id);
}

function cerrarModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}

async function guardarEdicion(id) {
    const descripcion = document.getElementById('modal-desc').value.trim();
    const fecha       = document.getElementById('modal-fecha').value;

    if (!descripcion || !fecha) {
        mostrarError('Completa todos los campos para editar');
        return;
    }

    try {
        const response = await fetch(`/api/tareas/${id}`, { //peticion al servidor
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descripcion, fecha })
        });

        if (!response.ok) {
            const mensaje = await obtenerMensajeError(response, 'No se pudo editar la tarea');
            mostrarError(mensaje);
            return;
        }

        cerrarModal();
        cargarTareas();

    } catch (error) {
        mostrarError('Sin conexión con el servidor. Verifica tu red.');
    }
}

function mostrarError(mensaje) {
    const el = document.getElementById('error-msg');
    el.textContent = mensaje;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 3000);
}

async function cargarTareas() {
    try {
        const response = await fetch('/api/tareas');

        if (!response.ok) {
            const mensaje = await obtenerMensajeError(response, 'Error al cargar las tareas');
            mostrarError(mensaje);
            return;
        }

        const tareas = await response.json();
        const lista  = document.getElementById('lista');
        lista.innerHTML = '';

        tareas.forEach(tarea => {
            const item = document.createElement('div');
            item.className = 'item';
            item.innerHTML = `
                <div class="descripcion" style="
                    text-decoration: ${tarea.completada ? 'line-through' : 'none'};
                    color: ${tarea.completada ? '#ccc' : '#fff'};
                ">
                    ${tarea.descripcion}
                </div>
                <div>${tarea.fecha}</div>
                <div>
                    <input
                        type="checkbox"
                        class="check"
                        ${tarea.completada ? 'checked' : ''}
                        onchange="marcarCompletada(${tarea.id}, this.checked)"
                    >
                </div>
                <div class="botones">
                    <button
                        class="btn-editar"
                        onclick="abrirModal(${tarea.id}, '${tarea.descripcion}', '${tarea.fecha}')"
                    >
                        Editar
                    </button>
                    <button
                        class="btn-eliminar"
                        onclick="eliminarTarea(${tarea.id})"
                    >
                        Eliminar
                    </button>
                </div>
            `;
            lista.appendChild(item);
        });

    } catch (error) {
        mostrarError('Sin conexión con el servidor. Verifica tu red.');
    }
}

async function agregarTarea() {
    const descripcion = document.getElementById('descripcion').value.trim();
    const fecha       = document.getElementById('fecha').value;

    if (!descripcion || !fecha) {
        mostrarError('Completa todos los campos');
        return;
    }

    try {
        const response = await fetch('/api/tareas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descripcion, fecha })
        });

        if (!response.ok) {
            const mensaje = await obtenerMensajeError(response, 'No se pudo guardar la tarea');
            mostrarError(mensaje);
            return;
        }

        document.getElementById('descripcion').value = '';
        document.getElementById('fecha').value = '';
        cargarTareas();

    } catch (error) {
        mostrarError('Sin conexión con el servidor. Verifica tu red.');
    }
}

async function marcarCompletada(id, completada) {
    try {
        const response = await fetch(`/api/tareas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completada })
        });

        if (!response.ok) {
            const mensaje = await obtenerMensajeError(response, 'No se pudo actualizar el estado');
            mostrarError(mensaje);
            return;
        }

        cargarTareas();

    } catch (error) {
        mostrarError('Sin conexión con el servidor. Verifica tu red.');
    }
}

async function eliminarTarea(id) {
    try {
        const response = await fetch(`/api/tareas/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const mensaje = await obtenerMensajeError(response, 'No se pudo eliminar la tarea');
            mostrarError(mensaje);
            return;
        }

        cargarTareas();

    } catch (error) {
        mostrarError('Sin conexión con el servidor. Verifica tu red.');
    }
}

document.getElementById('descripcion').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') agregarTarea();
});

document.getElementById('modal-cancelar').addEventListener('click', cerrarModal);

document.getElementById('modal-overlay').addEventListener('click', function(e) {
    if (e.target === this) cerrarModal();
});

cargarTareas();