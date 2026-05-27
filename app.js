const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let tareas = [];

function validarCamposNuevaTarea(descripcion, fecha) {
    if (!descripcion || !fecha) return 'Faltan campos: descripcion y fecha son requeridos';
    if (typeof descripcion !== 'string') return 'El campo descripcion debe ser texto';
    if (descripcion.trim().length === 0) return 'La descripcion no puede estar vacía';
    if (descripcion.trim().length > 200) return 'La descripcion no puede superar 200 caracteres';
    const fechaValida = !isNaN(Date.parse(fecha));
    if (!fechaValida) return 'El campo fecha no tiene un formato válido (YYYY-MM-DD)';
    return null;
}

app.get('/api/tareas', (req, res) => {
    try {
        res.json(tareas);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error interno al obtener las tareas' });
    }
});

app.post('/api/tareas', (req, res) => {
    try {
        const { descripcion, fecha } = req.body;
        const error = validarCamposNuevaTarea(descripcion, fecha);
        if (error) return res.status(400).json({ mensaje: error });

        const nuevaTarea = {
            id: Date.now(),
            descripcion: descripcion.trim(),
            fecha,
            completada: false
        };

        tareas.push(nuevaTarea);
        res.status(201).json(nuevaTarea);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error interno al crear la tarea' });
    }
});

app.put('/api/tareas/:id', (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) return res.status(400).json({ mensaje: 'El ID debe ser un número válido' });

        const tarea = tareas.find(t => t.id === id);
        if (!tarea) return res.status(404).json({ mensaje: `No existe una tarea con ID ${id}` });

        const { completada, descripcion, fecha } = req.body;

        if (completada !== undefined) {
            if (typeof completada !== 'boolean') {
                return res.status(400).json({ mensaje: 'El campo completada debe ser true o false' });
            }
            tarea.completada = completada;
        }

        if (descripcion !== undefined) {
            if (typeof descripcion !== 'string' || descripcion.trim().length === 0) {
                return res.status(400).json({ mensaje: 'La descripcion no puede estar vacía' });
            }
            if (descripcion.trim().length > 200) {
                return res.status(400).json({ mensaje: 'La descripcion no puede superar 200 caracteres' });
            }
            tarea.descripcion = descripcion.trim();
        }

        if (fecha !== undefined) {
            if (isNaN(Date.parse(fecha))) {
                return res.status(400).json({ mensaje: 'El campo fecha no tiene un formato válido (YYYY-MM-DD)' });
            }
            tarea.fecha = fecha;
        }

        res.json(tarea);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error interno al actualizar la tarea' });
    }
});

app.delete('/api/tareas/:id', (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) return res.status(400).json({ mensaje: 'El ID debe ser un número válido' });

        const existe = tareas.some(t => t.id === id);
        if (!existe) return res.status(404).json({ mensaje: `No existe una tarea con ID ${id}` });

        tareas = tareas.filter(t => t.id !== id);
        res.json({ mensaje: 'Tarea eliminada' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error interno al eliminar la tarea' });
    }
});

app.use((req, res) => {
    res.status(404).json({ mensaje: `Ruta no encontrada: ${req.method} ${req.path}` });
});

app.use((err, req, res, next) => {
    console.error('Error no controlado:', err);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
});

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});