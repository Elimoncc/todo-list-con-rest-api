# TodoList REST API 
Aplicación web de lista de tareas con autenticación mediante Google OAuth. 
El proyecto está dividido en dos partes: un **backend** con Node.js/Express que expone una REST API, y un **frontend** 
con React + Vite. Usa MongoDB como base de datos y admite subida de archivos adjuntos por tarea.
---
## Tecnologías utilizadas
- **Backend:** Node.js, Express, Mongoose, Passport.js (Google OAuth 2.0), Multer, dotenv
- **Frontend:** React 19, Vite
- **Base de datos:** MongoDB
- **Autenticación:** Google OAuth 2.0 (via HTTPS local)
---
## Requisitos previos
Antes de comenzar, asegúrate de tener instalado lo siguiente:
- [Node.js](https://nodejs.org/) v18 o superior
- [MongoDB](https://www.mongodb.com/try/download/community) corriendo localmente (o usar Docker)
- Una cuenta de Google para configurar las credenciales OAuth
> **Nota:** El backend usa HTTPS con certificados locales, por lo que también necesitarás generar
> un certificado autofirmado (ver paso 2).
---
## Instalación y configuración local

### Paso 1 — Clonar o descomprimir el proyecto

Si descargaste el `.zip`, descomprímelo en una carpeta de tu preferencia y navega a la raíz del proyecto:
```bash
cd TodoList-RestAPI
```
### Paso 2 — Generar certificados HTTPS locales

El backend corre en HTTPS. Para generarlos sin instalar nada adicional puedes usar `openssl`:

```bash
mkdir certs
openssl req -x509 -newkey rsa:4096 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes -subj "/CN=localhost"
```

Esto crea los archivos `certs/key.pem` y `certs/cert.pem` que el servidor necesita.

### Paso 3 — Configurar las variables de entorno

En la raíz del proyecto ya existe un archivo `.env`. Edítalo y reemplaza los valores con tus propias credenciales de Google:

```env
GOOGLE_CLIENT_ID=*********
GOOGLE_CLIENT_SECRET=*********
SESSION_SECRET=********
MONGO_URI=mongodb:*******
PORT=3000
NODE_ENV=development
```

> Para obtener `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` debes crear un proyecto en [Google Cloud Console](https://console.cloud.google.com/), habilitar la API de Google OAuth y configurar `https://localhost:3000/auth/google/callback` como URI de redireccionamiento autorizado.

### Paso 4 — Instalar dependencias del backend

```bash
npm install
```

### Paso 5 — Instalar dependencias del frontend

```bash
cd frontend
npm install
cd ..
```

---

## Ejecutar la aplicación

La app necesita tres cosas corriendo al mismo tiempo: MongoDB, el backend y el frontend. Abre **tres terminales** distintas.

### Terminal 1 — Iniciar MongoDB

Si tienes MongoDB instalado localmente:

```bash
mongod
```

> Si usas una instalación estándar en Windows, MongoDB puede estar corriendo como servicio automáticamente. En ese caso puedes omitir este paso.

### Terminal 2 — Iniciar el backend

Desde la raíz del proyecto:

```bash
npm start
```

Si todo va bien deberías ver algo así:
Conectado a MongoDB
Servidor corriendo en https://localhost:3000

### Terminal 3 — Iniciar el frontend

```bash
cd frontend
npm run dev
```

El frontend estará disponible en:
https://localhost:5173

---

## Acceder a la aplicación

1. Abre el navegador y navega a `https://localhost:5173`
2. Como el certificado es autofirmado, el navegador mostrará una advertencia de seguridad — haz clic en **"Avanzado"** y luego en **"Continuar a localhost"** (en Chrome) o el equivalente según tu navegador
3. Haz lo mismo para `https://localhost:3000` (el backend), ya que las cookies de sesión también necesitan que confíes en ese origen
4. Inicia sesión con tu cuenta de Google

---

## Estructura del proyecto
TodoList-RestAPI/
├── app.js               # Servidor principal (Express + Passport + rutas API)
├── package.json
├── .env                 # Variables de entorno (no subir a Git)
├── certs/               # Certificados HTTPS (generados por ti)
├── uploads/             # Archivos subidos por los usuarios
├── models/              # Modelos de Mongoose (Tarea, Archivo)
└── frontend/            # Aplicación React
├── src/
│   ├── App.jsx
│   ├── components/  # Componentes React
│   └── hooks/       # Custom hooks
├── vite.config.js
└── package.json

---

## Endpoints principales de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/auth/google` | Redirige al login de Google |
| GET | `/auth/google/callback` | Callback de Google OAuth |
| GET | `/auth/logout` | Cierra la sesión |
| GET | `/auth/me` | Devuelve el usuario autenticado |
| GET | `/api/tareas` | Lista todas las tareas |
| POST | `/api/tareas` | Crea una nueva tarea |
| PUT | `/api/tareas/:id` | Actualiza una tarea |
| DELETE | `/api/tareas/:id` | Elimina una tarea |

> Todos los endpoints de `/api/` requieren estar autenticado.

---

## Opción alternativa: Docker

Si prefieres no instalar MongoDB ni configurar todo manualmente, puedes usar Docker Compose. Necesitas tener instalado [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
docker compose up --build
```
Esto levanta automáticamente MongoDB, el backend y el frontend en contenedores.
---
## Posibles errores comunes

**El navegador no carga la app (ERR_CERT_INVALID)**
→ Debes aceptar manualmente el certificado autofirmado en `https://localhost:3000` y también en `https://localhost:5173`.

**"Error MongoDB"**
→ Verifica que MongoDB esté corriendo. En Linux/Mac: `sudo systemctl start mongod`.

**"No autenticado" en todas las rutas**
→ Asegúrate de haber configurado bien las credenciales de Google en el `.env` y que la URI de callback en Google Cloud coincida exactamente con `https://localhost:3000/auth/google/callback`.
