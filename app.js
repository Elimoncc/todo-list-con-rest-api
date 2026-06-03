import dotenv from 'dotenv';
dotenv.config();
require('dotenv').config();
const express  = require('express');
const session  = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
require('dotenv').config();
const app = express();
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// ── Passport ──────────────────────────────────────────────
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
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
app.use(session({ secret: 'clave-secreta', resave: false, saveUninitialized: false }));
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
  req.logout(() => res.redirect('http://localhost:5173/'));
});
app.get('/auth/me', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json(null);
  res.json(req.user);
});

// ── Tareas ────────────────────────────────────────────────
let tareas = [];

function validarCamposNuevaTarea(descripcion, fecha) {
  if (!descripcion || !fecha) return 'Faltan campos: descripcion y fecha son requeridos';
  if (descripcion.trim().length === 0) return 'La descripcion no puede estar vacía';
  if (descripcion.trim().length > 200) return 'La descripcion no puede superar 200 caracteres';
  if (isNaN(Date.parse(fecha))) return 'El campo fecha no tiene un formato válido (YYYY-MM-DD)';
  return null;
}

app.get('/api/tareas', requireAuth, (req, res) => {
  res.json(tareas);
});
app.post('/api/tareas', requireAuth, (req, res) => {
  const { descripcion, fecha } = req.body;
  const error = validarCamposNuevaTarea(descripcion, fecha);
  if (error) return res.status(400).json({ mensaje: error });
  const nuevaTarea = { id: Date.now(), descripcion: descripcion.trim(), fecha, completada: false };
  tareas.push(nuevaTarea);
  res.status(201).json(nuevaTarea);
});
app.put('/api/tareas/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ mensaje: 'El ID debe ser un número válido' });
  const tarea = tareas.find(t => t.id === id);
  if (!tarea) return res.status(404).json({ mensaje: `No existe una tarea con ID ${id}` });
  const { completada, descripcion, fecha } = req.body;
  if (completada !== undefined) {
    if (typeof completada !== 'boolean') return res.status(400).json({ mensaje: 'completada debe ser true o false' });
    tarea.completada = completada;
  }
  if (descripcion !== undefined) {
    if (typeof descripcion !== 'string' || descripcion.trim().length === 0)
      return res.status(400).json({ mensaje: 'La descripcion no puede estar vacía' });
    if (descripcion.trim().length > 200)
      return res.status(400).json({ mensaje: 'La descripcion no puede superar 200 caracteres' });
    tarea.descripcion = descripcion.trim();
  }
  if (fecha !== undefined) {
    if (isNaN(Date.parse(fecha))) return res.status(400).json({ mensaje: 'Fecha inválida' });
    tarea.fecha = fecha;
  }
  res.json(tarea);
});
app.delete('/api/tareas/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ mensaje: 'El ID debe ser un número válido' });
  if (!tareas.some(t => t.id === id)) return res.status(404).json({ mensaje: `No existe una tarea con ID ${id}` });
  tareas = tareas.filter(t => t.id !== id);
  res.json({ mensaje: 'Tarea eliminada' });
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

app.get('/api/archivos', requireAuth, (req, res) => {
  const archivos = fs.readdirSync(UPLOADS_DIR).map(filename => ({
    id:     filename,
    nombre: filename.replace(/^\d+-/, ''),
    tamaño: fs.statSync(path.join(UPLOADS_DIR, filename)).size
  }));
  res.json(archivos);
});
app.post('/api/archivos', requireAuth, upload.array('archivos'), (req, res) => {
  res.json(req.files.map(f => ({
    id:     f.filename,
    nombre: f.filename.replace(/^\d+-/, ''),
    tamaño: f.size
  })));
});
app.get('/api/archivos/:id', requireAuth, (req, res) => {
  const filepath = path.join(UPLOADS_DIR, req.params.id);
  if (!fs.existsSync(filepath)) return res.status(404).json({ error: 'Archivo no encontrado' });
  res.download(filepath, req.params.id.replace(/^\d+-/, ''));
});
app.delete('/api/archivos/:id', requireAuth, (req, res) => {
  const filepath = path.join(UPLOADS_DIR, req.params.id);
  if (!fs.existsSync(filepath)) return res.status(404).json({ error: 'Archivo no encontrado' });
  fs.unlinkSync(filepath);
  res.json({ ok: true });
});
app.delete('/api/archivos', requireAuth, (req, res) => {
  fs.readdirSync(UPLOADS_DIR).forEach(f => fs.unlinkSync(path.join(UPLOADS_DIR, f)));
  res.json({ ok: true });
});

// ── Error handler ─────────────────────────────────────────
app.use((req, res) => res.status(404).json({ mensaje: `Ruta no encontrada: ${req.method} ${req.path}` }));
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

app.listen(3000, () => console.log('Servidor en http://localhost:3000'));