import { useState } from 'react'
import styles from './ModalEditar.module.css'

function ModalEditar({ tarea, onGuardar, onCancelar }) {
  const [desc, setDesc] = useState(tarea.descripcion)
  const [fecha, setFecha] = useState(tarea.fecha)
  const [error, setError] = useState('')

  const handleGuardar = () => {
    if (!desc.trim()) return setError('La descripción no puede estar vacía')
    if (desc.trim().length > 200) return setError('Máximo 200 caracteres')
    if (!fecha) return setError('La fecha es requerida')
    setError('')
    onGuardar({ descripcion: desc.trim(), fecha })
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.box}>
        <h3>Editar Tarea</h3>

        {error && <p className={styles.error}>{error}</p>}

        <label>Descripción</label>
        <input
          type="text"
          value={desc}
          onChange={e => setDesc(e.target.value)}
        />

        <label>Fecha</label>
        <input
          type="date"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
        />

        <div className={styles.botones}>
          <button className={styles.btnCancelar} onClick={onCancelar}>Cancelar</button>
          <button className={styles.btnGuardar} onClick={handleGuardar}>Guardar</button>
        </div>
      </div>
    </div>
  )
}

export default ModalEditar