async function cargarTareas() {

    const response = await fetch('/api/tareas');

    const tareas = await response.json();

    const lista = document.getElementById('lista');

    lista.innerHTML = '';

    tareas.forEach(tarea => {

        const item = document.createElement('div');

        item.className = 'item';

        item.innerHTML = `
            <div class="col descripcion"
                 style="
                    text-decoration: ${tarea.completada ? 'line-through' : 'none'};
                    color: ${tarea.completada ? '#888' : '#fff'};
                 ">
                 ${tarea.descripcion}
            </div>

            <div class="col">
                ${tarea.fecha}
            </div>

            <div class="col">
                <input
                    type="checkbox"
                    class="check"
                    ${tarea.completada ? 'checked' : ''}
                    onchange="marcarCompletada(${tarea.id}, this.checked)"
                >
            </div>
        `;

        lista.appendChild(item);
    });
}

async function agregarTarea() {

    const descripcion = document
        .getElementById('descripcion')
        .value
        .trim();

    const fecha = document
        .getElementById('fecha')
        .value;

    if (!descripcion || !fecha) {

        alert('Por favor completa todos los campos');

        return;
    }

    await fetch('/api/tareas', {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            descripcion,
            fecha
        })
    });

    document.getElementById('descripcion').value = '';

    document.getElementById('fecha').value = '';

    cargarTareas();
}

async function marcarCompletada(id, completada) {

    await fetch(`/api/tareas/${id}`, {

        method: 'PUT',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            completada
        })
    });

    cargarTareas();
}

document
    .getElementById('descripcion')
    .addEventListener('keypress', function(e) {

        if (e.key === 'Enter') {

            agregarTarea();
        }
    });

cargarTareas();