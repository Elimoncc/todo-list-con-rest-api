import { useState } from 'react'
import styles from './FormularioTarea.module.css'

function FormularioTarea({ onAgregar }) {
  const [descripcion, setDescripcion] = useState('')
  const [fecha, setFecha] = useState('')

  const handleGuardar = async () => {
    try {
      await onAgregar(descripcion, fecha)
      setDescripcion('')
      setFecha('')
    } catch (e) {
      // el error lo maneja App.jsx
    }
  }

  return (
    <div className={styles.cont1}>
      <h2>Nueva Tarea</h2>
      <div className={styles.entradaDatos}>
        <div className={styles.campo}>
          <label>Descripción</label>
          <input
            type="text"
            className={styles.entDat}
            placeholder="Ej: Estudiar React"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
          />
        </div>
        <div className={styles.campo}>
          <label>Fecha</label>
          <input
            type="date"
            className={styles.entDat}
            value={fecha}
            onChange={e => setFecha(e.target.value)}
          />
        </div>
        <button className={styles.btnPrimario} onClick={handleGuardar}>
          Guardar
        </button>
      </div>
    </div>
  )
}

export default FormularioTarea