import { useState, useEffect } from 'react'
import { useTareas } from './hooks/useTareas'
import FormularioTarea from './components/FormularioTarea'
import ListaTareas from './components/ListaTareas'
import ModalEditar from './components/ModalEditar'
import GestorArchivos from './components/GestorArchivos'
import styles from './App.module.css'

function App() {
  const [usuario, setUsuario] = useState(undefined) // undefined = cargando
  const { tareas, agregarTarea, eliminarTarea, actualizarTarea } = useTareas(!!usuario)
  const [tareaEditando, setTareaEditando] = useState(null)
  const [errorGlobal, setErrorGlobal]     = useState('')
  const [seccion, setSeccion]             = useState('tareas') // 'tareas' | 'archivos'

  useEffect(() => {
    fetch('/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(u => setUsuario(u))
      .catch(() => setUsuario(null))
  }, [])

  if (usuario === undefined) return <div className={styles.loading}>Cargando...</div>

  if (!usuario) return (
    <div className={styles.loginWrap}>
      <div className={styles.card}>
        <h1>Bienvenido</h1>
        <p className={styles.sub}>Inicia sesión con tu cuenta de Google</p>
        <a href="/auth/google" className={styles.btnGoogle}>
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continuar con Google
        </a>
      </div>
    </div>
  )

  const handleAgregar = async (descripcion, fecha) => {
    try { setErrorGlobal(''); await agregarTarea(descripcion, fecha) }
    catch (e) { setErrorGlobal(e.mensaje || 'Error al agregar la tarea') }
  }
  const handleGuardarEdicion = async (cambios) => {
    try { setErrorGlobal(''); await actualizarTarea(tareaEditando._id, cambios); setTareaEditando(null) }
    catch (e) { setErrorGlobal(e.mensaje || 'Error al actualizar la tarea') }
  }
  const handleEliminar = async (id) => {
    try { setErrorGlobal(''); await eliminarTarea(id) }
    catch (e) { setErrorGlobal(e.mensaje || 'Error al eliminar la tarea') }
  }
  const handleToggle = async (tarea) => {
    try { await actualizarTarea(tarea._id, { completada: !tarea.completada }) }
    catch (e) { setErrorGlobal(e.mensaje || 'Error al actualizar') }
  }

  return (
    <div className={styles.container}>
      {errorGlobal && <div className={styles.errorGlobal}>{errorGlobal}</div>}

      {tareaEditando && (
        <ModalEditar
          tarea={tareaEditando}
          onGuardar={handleGuardarEdicion}
          onCancelar={() => setTareaEditando(null)}
        />
      )}

      <div className={styles.topBar}>
        <h1 className={styles.titulo}>CHECK LIST</h1>
        <div className={styles.userInfo}>
          <img src={usuario.foto} alt={usuario.nombre} className={styles.avatar} />
          <span>{usuario.nombre}</span>
          <a href="/auth/logout" className={styles.btnLogout}>Salir</a>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={seccion === 'tareas' ? styles.tabActivo : styles.tab}
          onClick={() => setSeccion('tareas')}
        >Tareas</button>
        <button
          className={seccion === 'archivos' ? styles.tabActivo : styles.tab}
          onClick={() => setSeccion('archivos')}
        >Archivos</button>
      </div>

      {seccion === 'tareas' && (
        <>
          <FormularioTarea onAgregar={handleAgregar} />
          <ListaTareas
            tareas={tareas}
            onEditar={setTareaEditando}
            onEliminar={handleEliminar}
            onToggleCompletada={handleToggle}
          />
        </>
      )}

      {seccion === 'archivos' && <GestorArchivos />}
    </div>
  )
}

export default App