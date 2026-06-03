import { useState, useEffect } from 'react'

export function useTareas(habilitado) {
  const [tareas, setTareas] = useState([])

  useEffect(() => {
    if (!habilitado) return
    fetch('/api/tareas')
      .then(r => r.json())
      .then(setTareas)
      .catch(() => {})
  }, [habilitado])

  const agregarTarea = async (descripcion, fecha) => {
    const res = await fetch('/api/tareas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descripcion, fecha })
    })
    const data = await res.json()
    if (!res.ok) throw data
    setTareas(prev => [...prev, data])
  }

  const eliminarTarea = async (id) => {
    const res = await fetch(`/api/tareas/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) throw data
    setTareas(prev => prev.filter(t => t.id !== id))
  }

  const actualizarTarea = async (id, cambios) => {
    const res = await fetch(`/api/tareas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cambios)
    })
    const data = await res.json()
    if (!res.ok) throw data
    setTareas(prev => prev.map(t => t.id === id ? data : t))
  }

  return { tareas, agregarTarea, eliminarTarea, actualizarTarea }
}