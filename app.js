const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let tareas = [];

app.get('/api/tareas', (req, res) => {
    res.json(tareas);
});

app.post('/api/tareas', (req, res) => {
    const { descripcion, fecha } = req.body;

    if (!descripcion || !fecha) {
        return res.status(400).json({ mensaje: 'Faltan datos' });
    }

    const nuevaTarea = {
        id: Date.now(),
        descripcion,
        fecha,
        completada: false
    };

    tareas.push(nuevaTarea);
    res.status(201).json(nuevaTarea);
});

app.put('/api/tareas/:id', (req, res) => {
    const id = Number(req.params.id);
    const tarea = tareas.find(t => t.id === id);

    if (!tarea) {
        return res.status(404).json({ mensaje: 'Tarea no encontrada' });
    }

    if (req.body.completada !== undefined) tarea.completada = req.body.completada;
    if (req.body.descripcion)             tarea.descripcion = req.body.descripcion;
    if (req.body.fecha)                   tarea.fecha = req.body.fecha;

    res.json(tarea);
});

app.delete('/api/tareas/:id', (req, res) => {
    const id = Number(req.params.id);
    const existe = tareas.some(t => t.id === id);

    if (!existe) {
        return res.status(404).json({ mensaje: 'Tarea no encontrada' });
    }

    tareas = tareas.filter(t => t.id !== id);
    res.json({ mensaje: 'Tarea eliminada' });
});

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});