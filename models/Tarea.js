const mongoose = require('mongoose')

const tareaSchema = new mongoose.Schema({
  descripcion: { type: String, required: true, maxlength: 200 },
  fecha:       { type: String, required: true },
  completada:  { type: Boolean, default: false }
})

module.exports = mongoose.model('Tarea', tareaSchema)