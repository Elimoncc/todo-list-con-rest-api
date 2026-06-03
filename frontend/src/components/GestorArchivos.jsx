import { useState, useEffect } from 'react'
import styles from './GestorArchivos.module.css'

function GestorArchivos() {
  const [archivos, setArchivos] = useState([])
  const [error, setError]       = useState('')

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    try {
      const res = await fetch('/api/archivos')
      setArchivos(await res.json())
      setError('')
    } catch {
      setError('No se pudo conectar al servidor.')
    }
  }

  const subir = async (e) => {
    const files = e.target.files
    if (!files.length) return
    const form = new FormData()
    for (const f of files) form.append('archivos', f)
    try {
      await fetch('/api/archivos', { method: 'POST', body: form })
      e.target.value = ''
      await cargar()
    } catch { setError('Error al subir archivos.') }
  }

  const eliminar = async (id) => {
    try {
      await fetch(`/api/archivos/${id}`, { method: 'DELETE' })
      await cargar()
    } catch { setError('Error al eliminar el archivo.') }
  }

  const eliminarTodo = async () => {
    try {
      await fetch('/api/archivos', { method: 'DELETE' })
      await cargar()
    } catch { setError('Error al eliminar los archivos.') }
  }

  const descargar = (id) => { window.location.href = `/api/archivos/${id}` }

  const formatTamaño = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className={styles.cont}>
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.subida}>
        <input type="file" multiple onChange={subir} />
      </div>

      <div className={styles.lista}>
        <div className={styles.encabezado}>
          <h2>Archivos guardados</h2>
          <button className={styles.btnEliminarTodo} onClick={eliminarTodo}>
            Eliminar todo
          </button>
        </div>

        {archivos.length === 0
          ? <p className={styles.vacio}>No hay archivos guardados</p>
          : archivos.map(a => (
            <div key={a.id} className={styles.archivo}>
              <div className={styles.info}>
                <p><strong>Nombre:</strong> {a.nombre}</p>
                <p><strong>Tamaño:</strong> {formatTamaño(a.tamaño)}</p>
              </div>
              <div className={styles.botones}>
                <button className={styles.btnDescargar} onClick={() => descargar(a.id)}>Descargar</button>
                <button className={styles.btnEliminar}  onClick={() => eliminar(a.id)}>Eliminar</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default GestorArchivos