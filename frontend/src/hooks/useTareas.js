import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL

export function useTareas(habilitado) {
  const [tareas, setTareas] = useState([])

  useEffect(() => {
    if (!habilitado) return

    fetch(`${API_URL}/api/tareas`, {
      credentials: 'include'
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setTareas(data)
        else setTareas([])
      })
      .catch(() => setTareas([]))
  }, [habilitado])

  const agregarTarea = async (descripcion, fecha) => {
    const res = await fetch(`${API_URL}/api/tareas`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        descripcion,
        fecha
      })
    })

    const data = await res.json()

    if (!res.ok) throw data

    setTareas(prev => [...prev, data])
  }

  const eliminarTarea = async (id) => {
    const res = await fetch(`${API_URL}/api/tareas/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })

    const data = await res.json()

    if (!res.ok) throw data

    setTareas(prev => prev.filter(t => t._id !== id))
  }

  const actualizarTarea = async (id, cambios) => {
    const res = await fetch(`${API_URL}/api/tareas/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cambios)
    })

    const data = await res.json()

    if (!res.ok) throw data

    setTareas(prev =>
      prev.map(t => t._id === id ? data : t)
    )
  }

  return {
    tareas,
    agregarTarea,
    eliminarTarea,
    actualizarTarea
  }
}