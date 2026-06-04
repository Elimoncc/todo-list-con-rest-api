require('dotenv').config();
const express  = require('express');
const session  = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const mongoose = require('mongoose');
const Tarea    = require('./models/Tarea');
const Archivo  = require('./models/Archivo');

const app = express();
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// ── Conexión MongoDB ──────────────────────────────────────
mongoose.connect('mongodb://127.0.0.1:27017/todolist')
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error al conectar MongoDB:', err));

// ── Passport ──────────────────────────────────────────────
passport.use(new GoogleStrategy(
  {
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  'http://localhost:3000/auth/google/callback'
  },
  (accessToken, refreshToken, profile, done) => {
    const usuario = {
      id:     profile.id,
      nombre: profile.displayName,
      email:  profile.emails[0].value,
      foto:   profile.photos[0].value
    };
    return done(null, usuario);
  }
));
passport.serializeUser((user, done)   => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// ── Middlewares ───────────────────────────────────────────
app.use(express.json());
app.use(session({ secret: 'clave-secreta', resave: false, saveUninitialized: false, cookie: { sameSite: 'lax' }}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

// ── Middleware de autenticación ───────────────────────────
function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ mensaje: 'No autenticado' });
}

// ── Auth routes ───────────────────────────────────────────
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: 'http://localhost:5173/',
    failureRedirect: 'http://localhost:5173/'
  })
);
app.get('/auth/logout', (req, res) => {
  req.logout(() => res.redirect('/'));
});
app.get('/auth/me', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json(null);
  res.json(req.user);
});

// ── Tareas ────────────────────────────────────────────────
app.get('/api/tareas', requireAuth, async (req, res) => {
  try {
    const tareas = await Tarea.find()
    res.json(tareas)
  } catch {
    res.status(500).json({ mensaje: 'Error al obtener las tareas' })
  }
});

app.post('/api/tareas', requireAuth, async (req, res) => {
  try {
    const { descripcion, fecha } = req.body
    if (!descripcion || !fecha)
      return res.status(400).json({ mensaje: 'Faltan campos: descripcion y fecha son requeridos' })
    if (descripcion.trim().length === 0)
      return res.status(400).json({ mensaje: 'La descripcion no puede estar vacía' })
    if (descripcion.trim().length > 200)
      return res.status(400).json({ mensaje: 'La descripcion no puede superar 200 caracteres' })
    if (isNaN(Date.parse(fecha)))
      return res.status(400).json({ mensaje: 'El campo fecha no tiene un formato válido' })

    const nueva = await Tarea.create({ descripcion: descripcion.trim(), fecha, completada: false })
    res.status(201).json(nueva)
  } catch {
    res.status(500).json({ mensaje: 'Error al crear la tarea' })
  }
});

app.put('/api/tareas/:id', requireAuth, async (req, res) => {
  try {
    const tarea = await Tarea.findById(req.params.id)
    if (!tarea) return res.status(404).json({ mensaje: 'No existe esa tarea' })

    const { completada, descripcion, fecha } = req.body

    if (completada !== undefined) {
      if (typeof completada !== 'boolean')
        return res.status(400).json({ mensaje: 'completada debe ser true o false' })
      tarea.completada = completada
    }
    if (descripcion !== undefined) {
      if (descripcion.trim().length === 0)
        return res.status(400).json({ mensaje: 'La descripcion no puede estar vacía' })
      if (descripcion.trim().length > 200)
        return res.status(400).json({ mensaje: 'La descripcion no puede superar 200 caracteres' })
      tarea.descripcion = descripcion.trim()
    }
    if (fecha !== undefined) {
      if (isNaN(Date.parse(fecha)))
        return res.status(400).json({ mensaje: 'Fecha inválida' })
      tarea.fecha = fecha
    }

    await tarea.save()
    res.json(tarea)
  } catch {
    res.status(500).json({ mensaje: 'Error al actualizar la tarea' })
  }
});

app.delete('/api/tareas/:id', requireAuth, async (req, res) => {
  try {
    const tarea = await Tarea.findByIdAndDelete(req.params.id)
    if (!tarea) return res.status(404).json({ mensaje: 'No existe esa tarea' })
    res.json({ mensaje: 'Tarea eliminada' })
  } catch {
    res.status(500).json({ mensaje: 'Error al eliminar la tarea' })
  }
});

// ── Archivos ──────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename:    (req, file, cb) => {
    const nombre = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, Date.now() + '-' + nombre);
  }
});
const upload = multer({ storage });

app.get('/api/archivos', requireAuth, async (req, res) => {
  try {
    const archivos = await Archivo.find()
    res.json(archivos)
  } catch {
    res.status(500).json({ mensaje: 'Error al obtener archivos' })
  }
});

app.post('/api/archivos', requireAuth, upload.array('archivos'), async (req, res) => {
  try {
    const guardados = await Promise.all(req.files.map(f =>
      Archivo.create({
        filename: f.filename,
        nombre:   f.filename.replace(/^\d+-/, ''),
        tamaño:   f.size
      })
    ))
    res.json(guardados)
  } catch {
    res.status(500).json({ mensaje: 'Error al guardar archivos' })
  }
});

app.get('/api/archivos/:id', requireAuth, async (req, res) => {
  try {
    const archivo = await Archivo.findById(req.params.id)
    if (!archivo) return res.status(404).json({ error: 'Archivo no encontrado' })
    const filepath = path.join(UPLOADS_DIR, archivo.filename)
    if (!fs.existsSync(filepath)) return res.status(404).json({ error: 'Archivo no encontrado en disco' })
    res.download(filepath, archivo.nombre)
  } catch {
    res.status(500).json({ mensaje: 'Error al descargar' })
  }
});

app.delete('/api/archivos/:id', requireAuth, async (req, res) => {
  try {
    const archivo = await Archivo.findByIdAndDelete(req.params.id)
    if (!archivo) return res.status(404).json({ error: 'Archivo no encontrado' })
    const filepath = path.join(UPLOADS_DIR, archivo.filename)
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
    res.json({ ok: true })
  } catch {
    res.status(500).json({ mensaje: 'Error al eliminar' })
  }
});

app.delete('/api/archivos', requireAuth, async (req, res) => {
  try {
    const archivos = await Archivo.find()
    archivos.forEach(a => {
      const filepath = path.join(UPLOADS_DIR, a.filename)
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
    })
    await Archivo.deleteMany()
    res.json({ ok: true })
  } catch {
    res.status(500).json({ mensaje: 'Error al eliminar todo' })
  }
});

// ── Error handler ─────────────────────────────────────────
app.use((req, res) => res.status(404).json({ mensaje: `Ruta no encontrada: ${req.method} ${req.path}` }));
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

app.listen(3000, () => console.log('Servidor en http://localhost:3000'));