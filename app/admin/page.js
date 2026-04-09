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
  const [dias, setDias] = useState({}) // ✅ NUEVO

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    supabase.auth.onAuthStateChange((_, s) => setSession(s))
  }, [])

  useEffect(() => {
    if (session) cargarEgresados()
  }, [session])

  const login = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMsg('Credenciales incorrectas.')
  }

  const logout = () => supabase.auth.signOut()

  const cargarEgresados = async () => {
    const res = await fetch('/api/egresados')
    const data = await res.json()
    setEgresados(data)
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

  // ✅ MODIFICADO
  const registrarPago = async (egresado_id) => {
    const diasSeleccionados = dias[egresado_id] || 365

    const res = await fetch('/api/pagos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        egresado_id,
        dias: diasSeleccionados,
        monto: 0,
        observaciones: 'Renovación manual',
        email: session?.user?.email
      })
    })

    const data = await res.json()
    setMsg(data.mensaje || data.error)

    setDias(prev => ({ ...prev, [egresado_id]: '' }))
    cargarEgresados()
  }

  const agregarEgresado = async (e) => {
    e.preventDefault()
    const res = await fetch('/api/egresados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevo)
    })
    if (res.ok) {
      setNuevo({ cedula: '', nombre_completo: '', email: '' })
      setMsg('Egresado agregado correctamente.')
      cargarEgresados()
    }
  }

  const filtrados = egresados.filter(e =>
    e.cedula.includes(busqueda) ||
    e.nombre_completo.toLowerCase().includes(busqueda.toLowerCase())
  )

  if (!session) return (
    <main style={{ maxWidth: 360, margin: '100px auto', padding: '0 24px', fontFamily: 'system-ui' }}>
      <h1>Panel de administración</h1>
      {msg && <p style={{ color: 'red' }}>{msg}</p>}
      <form onSubmit={login}>
        <input placeholder="Correo" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} />
        <button>Ingresar</button>
      </form>
    </main>
  )

  return (
    <main style={{ maxWidth: 900, margin: '40px auto', padding: '0 24px', fontFamily: 'system-ui' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Gestión de egresados</h1>
        <button onClick={logout}>Cerrar sesión</button>
      </div>

      {msg && <div>{msg}</div>}

      <input
        placeholder="Buscar..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
      />

      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Cédula</th>
            <th>Nombre</th>
            <th>Estado</th>
            <th>Vigencia</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {filtrados.map(eg => (
            <tr key={eg.id}>
              <td>{eg.cedula}</td>
              <td>{eg.nombre_completo}</td>
              <td>{eg.estado}</td>
              <td>
                {eg.fecha_vencimiento
                  ? new Date(eg.fecha_vencimiento).toLocaleDateString('es-CO')
                  : '—'}
              </td>

              <td>
                <div style={{ display: 'flex', gap: 8 }}>

                  <button onClick={() => cambiarEstado(eg.id, eg.estado)}>
                    {eg.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                  </button>

                  {/* INPUT DÍAS */}
                  <input
                    type="number"
                    placeholder="Días"
                    value={dias[eg.id] || ''}
                    onChange={(e) =>
                      setDias(prev => ({
                        ...prev,
                        [eg.id]: parseInt(e.target.value)
                      }))
                    }
                    style={{ width: 60 }}
                  />

                  {/* BOTÓN DINÁMICO */}
                  <button onClick={() => registrarPago(eg.id)}>
                    Agregar
                  </button>

                  {/* BOTÓN RÁPIDO */}
                  <button onClick={() =>
                    setDias(prev => ({ ...prev, [eg.id]: 365 }))
                  }>
                    +365
                  </button>

                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}