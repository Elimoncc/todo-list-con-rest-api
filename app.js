require('dotenv').config()
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const express = require('express')
const session = require('express-session')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const multer = require('multer')
const mongoose = require('mongoose')
const Tarea = require('./models/Tarea')
const Archivo = require('./models/Archivo')

const app = express()
app.set('trust proxy', 1)
const PORT = process.env.PORT || 3000
const UPLOADS_DIR = path.join(__dirname, 'uploads')

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR)

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/todolist')
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error MongoDB:', err))

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
  return done(null, {
    id: profile.id,
    nombre: profile.displayName,
    email: profile.emails[0].value,
    foto: profile.photos[0].value
  })
}))
passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user))

app.use(express.json())
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-inseguro',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none'
  }
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.static(path.join(__dirname, 'public')))

function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next()
  res.status(401).json({ mensaje: 'No autenticado' })
}

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)
app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: process.env.FRONTEND_URL,
    failureRedirect: process.env.FRONTEND_URL
  })
)
app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.redirect(process.env.FRONTEND_URL)
    })
  })
})
app.get('/auth/me', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json(null)
  res.json(req.user)
})

app.get('/api/tareas', requireAuth, async (req, res) => {
  try {
    const tareas = await Tarea.find({
      usuarioId: req.user.id
    })

    res.json(tareas)
  }
  catch {
    res.status(500).json({
      mensaje: 'Error al obtener las tareas'
    })
  }
})

app.post('/api/tareas', requireAuth, async (req, res) => {
  try {
    const { descripcion, fecha } = req.body
    if (!descripcion || !fecha)
      return res.status(400).json({ mensaje: 'Faltan campos requeridos' })
    if (!descripcion.trim())
      return res.status(400).json({ mensaje: 'La descripcion no puede estar vacía' })
    if (descripcion.trim().length > 200)
      return res.status(400).json({ mensaje: 'Máximo 200 caracteres' })
    if (isNaN(Date.parse(fecha)))
      return res.status(400).json({ mensaje: 'Fecha inválida' })
    const nueva = await Tarea.create({
      usuarioId: req.user.id,
      descripcion: descripcion.trim(),
      fecha,
      completada: false
    })
    res.status(201).json(nueva)
  } catch { res.status(500).json({ mensaje: 'Error al crear la tarea' }) }
})

app.put('/api/tareas/:id', requireAuth, async (req, res) => {
  try {
    const tarea = await Tarea.findOne({
      _id: req.params.id,
      usuarioId: req.user.id
    })
    if (!tarea) return res.status(404).json({ mensaje: 'No existe esa tarea' })
    const { completada, descripcion, fecha } = req.body
    if (completada !== undefined) {
      if (typeof completada !== 'boolean')
        return res.status(400).json({ mensaje: 'completada debe ser true o false' })
      tarea.completada = completada
    }
    if (descripcion !== undefined) {
      if (!descripcion.trim()) return res.status(400).json({ mensaje: 'Descripción vacía' })
      if (descripcion.trim().length > 200) return res.status(400).json({ mensaje: 'Máximo 200 caracteres' })
      tarea.descripcion = descripcion.trim()
    }
    if (fecha !== undefined) {
      if (isNaN(Date.parse(fecha))) return res.status(400).json({ mensaje: 'Fecha inválida' })
      tarea.fecha = fecha
    }
    await tarea.save()
    res.json(tarea)
  } catch { res.status(500).json({ mensaje: 'Error al actualizar' }) }
})

app.delete('/api/tareas/:id', requireAuth, async (req, res) => {
  try {
    const tarea = await Tarea.findOneAndDelete({
      _id: req.params.id,
      usuarioId: req.user.id
    })
    if (!tarea) return res.status(404).json({ mensaje: 'No existe esa tarea' })
    res.json({ mensaje: 'Tarea eliminada' })
  } catch { res.status(500).json({ mensaje: 'Error al eliminar' }) }
})

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const nombre = Buffer.from(file.originalname, 'latin1').toString('utf8')
    cb(null, Date.now() + '-' + nombre)
  }
})
const upload = multer({ storage })

app.get('/api/archivos', requireAuth, async (req, res) => {
  try {
    res.json(
      await Archivo.find({
        usuarioId: req.user.id
      })
    )
  }
  catch { res.status(500).json({ mensaje: 'Error al obtener archivos' }) }
})

app.post('/api/archivos', requireAuth, upload.array('archivos'), async (req, res) => {
  try {
    const guardados = await Promise.all(req.files.map(f =>
      Archivo.create({
        usuarioId: req.user.id,
        filename: f.filename,
        nombre: f.filename.replace(/^\d+-/, ''),
        tamaño: f.size
      })
    ))
    res.json(guardados)
  } catch { res.status(500).json({ mensaje: 'Error al guardar archivos' }) }
})

app.get('/api/archivos/:id', requireAuth, async (req, res) => {
  try {
    const archivo = await Archivo.findOne({
      _id: req.params.id,
      usuarioId: req.user.id
    })
    if (!archivo) return res.status(404).json({ error: 'No encontrado' })
    const fp = path.join(UPLOADS_DIR, archivo.filename)
    if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Archivo no encontrado en disco' })
    res.download(fp, archivo.nombre)
  } catch { res.status(500).json({ mensaje: 'Error al descargar' }) }
})

app.delete('/api/archivos/:id', requireAuth, async (req, res) => {
  try {
    const archivo = await Archivo.findOneAndDelete({
      _id: req.params.id,
      usuarioId: req.user.id
    })
    if (!archivo) return res.status(404).json({ error: 'No encontrado' })
    const fp = path.join(UPLOADS_DIR, archivo.filename)
    if (fs.existsSync(fp)) fs.unlinkSync(fp)
    res.json({ ok: true })
  } catch { res.status(500).json({ mensaje: 'Error al eliminar' }) }
})

app.delete('/api/archivos', requireAuth, async (req, res) => {
  try {
    const archivos = await Archivo.find({
      usuarioId: req.user.id
    })
    archivos.forEach(a => {
      const fp = path.join(UPLOADS_DIR, a.filename)
      if (fs.existsSync(fp)) fs.unlinkSync(fp)
    })
    await Archivo.deleteMany({
      usuarioId: req.user.id
    })
    res.json({ ok: true })
  } catch { res.status(500).json({ mensaje: 'Error al eliminar todo' }) }
})

app.use((req, res) => res.status(404).json({ mensaje: `Ruta no encontrada: ${req.method} ${req.path}` }))
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ mensaje: 'Error interno del servidor' })
})

app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`)
})