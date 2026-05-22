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

    const nuevaTarea = {

        id: Date.now(),

        descripcion: req.body.descripcion,

        fecha: req.body.fecha,

        completada: false
    };

    tareas.push(nuevaTarea);

    res.json(nuevaTarea);
});

app.put('/api/tareas/:id', (req, res) => {

    const id = Number(req.params.id);

    const tarea = tareas.find(t => t.id === id);

    if (tarea) {

        tarea.completada = req.body.completada;
    }

    res.json(tarea);
});

app.listen(3000, () => {

    console.log('Servidor REST en puerto 3000');
});