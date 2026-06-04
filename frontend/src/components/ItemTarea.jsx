import styles from './ItemTarea.module.css'

function ItemTarea({ tarea, onEditar, onEliminar, onToggleCompletada }) {
  return (
    <div className={styles.item}>
      <span className={tarea.completada ? styles.descripcionCompletada : styles.descripcionPendiente}>
        {tarea.descripcion}
      </span>
      <span>{tarea.fecha}</span>
      <input
        type="checkbox"
        className={styles.check}
        checked={tarea.completada}
        onChange={() => onToggleCompletada(tarea)}
      />
      <div className={styles.botones}>
        <button className={styles.btnEditar}   onClick={() => onEditar(tarea)}>Editar</button>
        <button className={styles.btnEliminar} onClick={() => onEliminar(tarea._id)}>Eliminar</button>
      </div>
    </div>
  )
}

export default ItemTarea