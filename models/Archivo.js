const mongoose = require('mongoose')

const archivoSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  nombre:   { type: String, required: true },
  tamaño:   { type: Number, required: true }
})

module.exports = mongoose.model('Archivo', archivoSchema)