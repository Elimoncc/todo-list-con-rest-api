import ItemTarea from './ItemTarea'
import styles from './ListaTareas.module.css'

function ListaTareas({ tareas, onEditar, onEliminar, onToggleCompletada }) {
  return (
    <div className={styles.cont2}>
      <h2 className={styles.titulo}>TODO LIST</h2>
      <div className={styles.header}>
        <div>Descripción</div>
        <div>Fecha</div>
        <div>Estado</div>
        <div>Acciones</div>
      </div>
      {tareas.map(tarea => (
        <ItemTarea
          key={tarea.id}
          tarea={tarea}
          onEditar={onEditar}
          onEliminar={onEliminar}
          onToggleCompletada={onToggleCompletada}
        />
      ))}
    </div>
  )
}

export default ListaTareas