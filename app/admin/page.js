'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [egresados, setEgresados] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [nuevo, setNuevo] = useState({ cedula: '', nombre_completo: '', email: '' })
  const [msg, setMsg] = useState('')
  const [msgTipo, setMsgTipo] = useState('success')
  const [dias, setDias] = useState({})
  const [fechas, setFechas] = useState({}) // 👈 NUEVO
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [alertas, setAlertas] = useState([])
  const [mostrarAlertas, setMostrarAlertas] = useState(true)
  const [filtroVigencia, setFiltroVigencia] = useState('todos')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    supabase.auth.onAuthStateChange((_, s) => setSession(s))
  }, [])

  useEffect(() => {
    if (session) cargarEgresados()
  }, [session])

  const mostrarMensaje = (texto, tipo = 'success') => {
    setMsg(texto)
    setMsgTipo(tipo)
    setTimeout(() => setMsg(''), 4000)
  }

  const login = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) mostrarMensaje('Credenciales incorrectas.', 'error')
  }

  const logout = () => supabase.auth.signOut()

  const cargarEgresados = async () => {
    const res = await fetch('/api/egresados')
    const data = await res.json()
    setEgresados(data)

    const ahora = new Date()
    const proximos = data.filter(eg => {
      if (!eg.fecha_vencimiento || eg.estado !== 'Activo') return false
      const venc = new Date(eg.fecha_vencimiento)
      const diff = Math.ceil((venc - ahora) / (1000 * 60 * 60 * 24))
      return diff >= 0 && diff <= 30
    }).map(eg => {
      const venc = new Date(eg.fecha_vencimiento)
      const diff = Math.ceil((venc - ahora) / (1000 * 60 * 60 * 24))
      return { ...eg, diasRestantes: diff }
    }).sort((a, b) => a.diasRestantes - b.diasRestantes)

    setAlertas(proximos)
    setMostrarAlertas(true)
  }

  const cambiarEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo'
    await fetch('/api/egresados', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, estado: nuevoEstado })
    })
    cargarEgresados()
  }

  const eliminarEgresado = async (id) => {
    const confirmar = confirm('¿Seguro que deseas eliminar este egresado?')
    if (!confirmar) return
    const res = await fetch('/api/egresados', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    const data = await res.json()
    mostrarMensaje(data.mensaje || data.error, data.error ? 'error' : 'success')
    cargarEgresados()
  }

  const registrarPago = async (egresado_id) => {
    const diasSeleccionados = dias[egresado_id] || 365

    let diasFinal = diasSeleccionados

    if (fechas[egresado_id]) {
      const fechaSeleccionada = new Date(fechas[egresado_id])
      const hoy = new Date()

      const diff = Math.ceil(
        (fechaSeleccionada - hoy) / (1000 * 60 * 60 * 24)
      )

      if (diff > 0) {
        diasFinal = diff
      }
    }

    const res = await fetch('/api/pagos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        egresado_id,
        dias: diasFinal,
        monto: 0,
        observaciones: 'Renovación manual',
        email: session?.user?.email
      })
    })

    const data = await res.json()
    mostrarMensaje(data.mensaje || data.error, data.error ? 'error' : 'success')
    setDias(prev => ({ ...prev, [egresado_id]: '' }))
    setFechas(prev => ({ ...prev, [egresado_id]: '' }))
    cargarEgresados()
  }

  const agregarEgresado = async (e) => {
    e.preventDefault()
    if (!nuevo.cedula || !nuevo.nombre_completo) {
      mostrarMensaje('Cédula y nombre son obligatorios', 'error')
      return
    }
    const existe = egresados.some(eg => eg.cedula === nuevo.cedula.trim())
    if (existe) {
      mostrarMensaje(`La cédula ${nuevo.cedula} ya está registrada.`, 'error')
      return
    }
    const res = await fetch('/api/egresados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevo)
    })
    if (res.ok) {
      setNuevo({ cedula: '', nombre_completo: '', email: '' })
      mostrarMensaje('Egresado agregado correctamente.')
      setMostrarFormulario(false)
      cargarEgresados()
    }
  }

  if (!session) return <div />

  return (
    <main>
      <table>
        <tbody>
          {egresados.map((eg) => (
            <tr key={eg.id}>
              <td>{eg.nombre_completo}</td>

              <td>
                <input
                  type="number"
                  placeholder="Días"
                  value={dias[eg.id] || ''}
                  onChange={(e) =>
                    setDias(prev => ({
                      ...prev,
                      [eg.id]: e.target.value ? parseInt(e.target.value) : ''
                    }))
                  }
                />

                <button
                  onClick={() => setDias(prev => ({ ...prev, [eg.id]: 365 }))}
                >
                  +365
                </button>

                {/* 👇 NUEVO INPUT FECHA */}
                <input
                  type="date"
                  value={fechas[eg.id] || ''}
                  onChange={(e) =>
                    setFechas(prev => ({
                      ...prev,
                      [eg.id]: e.target.value
                    }))
                  }
                />

                <button onClick={() => registrarPago(eg.id)}>
                  Renovar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}