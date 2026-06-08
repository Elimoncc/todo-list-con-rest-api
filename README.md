# TodoList REST API

Aplicación web para la gestión de tareas y archivos con autenticación mediante Google OAuth 2.0.

El sistema permite a cada usuario:

* Iniciar sesión con Google.
* Crear tareas.
* Editar tareas.
* Marcar tareas como completadas.
* Eliminar tareas.
* Subir archivos.
* Descargar archivos.
* Eliminar archivos.
* Gestionar información privada asociada únicamente a su cuenta.

La aplicación está compuesta por:

* **Backend:** Node.js + Express.
* **Frontend:** React + Vite.
* **Base de datos:** MongoDB Atlas.
* **Autenticación:** Google OAuth 2.0.
* **Despliegue:** Render.

---

# URL de producción

Frontend:

https://todolist-frontend-oiu7.onrender.com

Backend:

https://todolist-backend-aucg.onrender.com

---

# Tecnologías utilizadas

## Backend

* Node.js
* Express
* MongoDB
* Mongoose
* Passport.js
* Google OAuth 2.0
* Express Session
* Multer
* dotenv
* CORS

## Frontend

* React
* Vite
* CSS Modules

## Infraestructura

* MongoDB Atlas
* Render
* GitHub

---

# Funcionalidades implementadas

## Gestión de usuarios

* Inicio de sesión con Google.
* Cierre de sesión.
* Persistencia de sesión.

## Gestión de tareas

* Crear tarea.
* Editar tarea.
* Eliminar tarea.
* Marcar tarea como completada.
* Listar tareas del usuario autenticado.

## Gestión de archivos

* Subir archivos.
* Descargar archivos.
* Eliminar archivos individuales.
* Eliminar todos los archivos.
* Aislamiento de archivos por usuario.

## Seguridad

* Autenticación mediante OAuth 2.0.
* Protección de rutas privadas.
* Separación de información por usuario.
* Variables sensibles mediante archivo .env.

---

# Arquitectura del proyecto

```text
TodoList-RestAPI
│
├── app.js
├── package.json
├── .env
├── models
│   ├── Tarea.js
│   └── Archivo.js
│
├── uploads
│
└── frontend
    │
    ├── package.json
    ├── vite.config.js
    │
    └── src
        ├── App.jsx
        ├── hooks
        │   └── useTareas.js
        │
        └── components
            ├── FormularioTarea.jsx
            ├── ListaTareas.jsx
            ├── ModalEditar.jsx
            └── GestorArchivos.jsx
```

---

# Instalación y ejecución local

## Requisitos previos

Instalar:

* Node.js 18 o superior
* MongoDB Community Edition
* Git

Verificar instalación:

```bash
node -v
npm -v
mongod --version
```

---

## 1. Clonar el repositorio

```bash
git clone https://github.com/Elimoncc/todo-list-con-rest-api.git

cd todo-list-con-rest-api
```

---

## 2. Instalar dependencias del backend

```bash
npm install
```

---

## 3. Instalar dependencias del frontend

```bash
cd frontend

npm install

cd ..
```

---

## 4. Crear archivo .env

Crear un archivo llamado:

```text
.env
```

Contenido:

```env
PORT=3000

MONGO_URI=mongodb://127.0.0.1:27017/todolist

GOOGLE_CLIENT_ID=TU_CLIENT_ID

GOOGLE_CLIENT_SECRET=TU_CLIENT_SECRET

GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

SESSION_SECRET=clave_super_secreta

FRONTEND_URL=http://localhost:5173

NODE_ENV=development
```

---

## 5. Configurar Google OAuth

Entrar a:

https://console.cloud.google.com

Crear un proyecto.

Habilitar:

```text
Google Identity Services
```

Crear credenciales OAuth 2.0.

Agregar:

### Authorized JavaScript Origins

```text
http://localhost:5173
```

### Authorized Redirect URIs

```text
http://localhost:3000/auth/google/callback
```

Guardar.

Copiar:

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

al archivo .env.

---

## 6. Iniciar MongoDB

```bash
mongod
```

---

## 7. Iniciar backend

```bash
npm start
```

Resultado esperado:

```text
Conectado a MongoDB
Servidor en puerto 3000
```

---

## 8. Iniciar frontend

Nueva terminal:

```bash
cd frontend

npm run dev
```

Resultado esperado:

```text
Local:
http://localhost:5173
```

---

## 9. Acceder a la aplicación

Abrir:

```text
http://localhost:5173
```

Iniciar sesión con Google.

---

# Ejecución mediante Docker

## Requisitos

Instalar Docker Desktop.

Verificar:

```bash
docker --version
docker compose version
```

---

## Construir contenedores

```bash
docker compose build
```

---

## Iniciar servicios

```bash
docker compose up
```

---

## Iniciar en segundo plano

```bash
docker compose up -d
```

---

## Detener servicios

```bash
docker compose down
```

---

# Despliegue en la nube (Render + MongoDB Atlas)

## 1. Crear base de datos MongoDB Atlas

* Crear cuenta en MongoDB Atlas.
* Crear Cluster.
* Crear usuario de base de datos.
* Configurar acceso de red.
* Obtener cadena de conexión.

Ejemplo:

```text
mongodb+srv://usuario:password@cluster.mongodb.net/todolist
```

---

## 2. Crear repositorio GitHub

Subir proyecto:

```bash
git init

git add .

git commit -m "Primer commit"

git remote add origin URL_REPOSITORIO

git push -u origin main
```

---

## 3. Desplegar Backend en Render

Crear:

```text
Web Service
```

Configurar:

```text
Root Directory: /
Build Command: npm install
Start Command: npm start
```

Variables de entorno:

```env
MONGO_URI=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
SESSION_SECRET=
FRONTEND_URL=
NODE_ENV=production
```

---

## 4. Desplegar Frontend en Render

Crear:

```text
Static Site
```

Configurar:

```text
Root Directory: frontend

Build Command:
npm install && npm run build

Publish Directory:
dist
```

Variable:

```env
VITE_API_URL=https://URL_DEL_BACKEND
```

---

## 5. Configurar OAuth para producción

Authorized JavaScript Origins:

```text
https://URL_DEL_FRONTEND
```

Authorized Redirect URIs:

```text
https://URL_DEL_BACKEND/auth/google/callback
```

---

# Endpoints principales

## Autenticación

| Método | Ruta                  |
| ------ | --------------------- |
| GET    | /auth/google          |
| GET    | /auth/google/callback |
| GET    | /auth/me              |
| GET    | /auth/logout          |

---

## Tareas

| Método | Ruta            |
| ------ | --------------- |
| GET    | /api/tareas     |
| POST   | /api/tareas     |
| PUT    | /api/tareas/:id |
| DELETE | /api/tareas/:id |

---

## Archivos

| Método | Ruta              |
| ------ | ----------------- |
| GET    | /api/archivos     |
| POST   | /api/archivos     |
| GET    | /api/archivos/:id |
| DELETE | /api/archivos/:id |
| DELETE | /api/archivos     |

---

# Consideraciones de seguridad

* Las tareas están asociadas al usuario autenticado.
* Los archivos están asociados al usuario autenticado.
* Un usuario no puede acceder a la información de otro usuario.
* Las credenciales nunca deben subirse al repositorio.
* El archivo .env debe permanecer en .gitignore.

---

# Autor

Proyecto desarrollado como práctica de desarrollo web utilizando React, Node.js, Express, MongoDB Atlas, Google OAuth y Render.
