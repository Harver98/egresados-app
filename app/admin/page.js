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

  // ✅ ELIMINAR
  const eliminarEgresado = async (id) => {
    const confirmar = confirm("¿Seguro que deseas eliminar este egresado?")
    if (!confirmar) return

    const res = await fetch('/api/egresados', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })

    const data = await res.json()
    setMsg(data.mensaje || data.error)
    cargarEgresados()
  }

  // ✅ REGISTRAR PAGO DINÁMICO
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

    // limpiar input
    setDias(prev => ({ ...prev, [egresado_id]: '' }))

    cargarEgresados()
  }

  const agregarEgresado = async (e) => {
    e.preventDefault()

    if (!nuevo.cedula || !nuevo.nombre_completo) {
      setMsg("Cédula y nombre son obligatorios")
      return
    }

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

  // 🔐 LOGIN
  if (!session) return (
    <main style={{ maxWidth: 360, margin: '100px auto', padding: '0 24px', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 24 }}>Panel de administración</h1>
      {msg && <p style={{ color: 'red', marginBottom: 16 }}>{msg}</p>}
      <form onSubmit={login} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input placeholder="Correo" value={email} onChange={e => setEmail(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: 8, border: '1.5px solid #ddd' }} />
        <input placeholder="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: 8, border: '1.5px solid #ddd' }} />
        <button style={{ padding: 12, background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8 }}>
          Ingresar
        </button>
      </form>
    </main>
  )

  return (
    <main style={{ maxWidth: 900, margin: '40px auto', padding: '0 24px', fontFamily: 'system-ui' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600 }}>Gestión de egresados</h1>
        <button onClick={logout} style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: 8 }}>
          Cerrar sesión
        </button>
      </div>

      {msg && (
        <div style={{ padding: 12, background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: 8, color: '#166534', marginBottom: 20 }}>{msg}</div>
      )}

      {/* FORMULARIO */}
      <details style={{ marginBottom: 32, background: '#f8fafc', borderRadius: 8, padding: 16 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 500 }}>+ Agregar nuevo egresado</summary>
        <form onSubmit={agregarEgresado} style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          <input placeholder="Cédula *" value={nuevo.cedula} onChange={e => setNuevo({...nuevo, cedula: e.target.value})}
            style={{ flex: 1, minWidth: 140, padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd' }} />
          <input placeholder="Nombre completo *" value={nuevo.nombre_completo} onChange={e => setNuevo({...nuevo, nombre_completo: e.target.value})}
            style={{ flex: 2, minWidth: 200, padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd' }} />
          <input placeholder="Email" value={nuevo.email} onChange={e => setNuevo({...nuevo, email: e.target.value})}
            style={{ flex: 2, minWidth: 180, padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd' }} />
          <button type="submit" style={{ padding: '8px 20px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8 }}>
            Guardar
          </button>
        </form>
      </details>

      {/* BUSCADOR */}
      <input
        placeholder="Buscar por nombre o cédula..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        style={{ width: '100%', padding: '10px 14px', borderRadius: 8,
          border: '1.5px solid #ddd', marginBottom: 16 }}
      />

      {/* TABLA */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              {['Cédula', 'Nombre', 'Estado', 'Vigencia', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left' }}>{h}</th>
              ))}
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
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>

                    <button onClick={() => cambiarEstado(eg.id, eg.estado)}>
                      {eg.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                    </button>

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
                      style={{ width: 60 }}
                    />

                    <button onClick={() => registrarPago(eg.id)}>
                      Agregar
                    </button>

                    <button onClick={() =>
                      setDias(prev => ({ ...prev, [eg.id]: 365 }))
                    }>
                      +365
                    </button>

                    <button
                      onClick={() => eliminarEgresado(eg.id)}
                      style={{ background: '#ef4444', color: '#fff' }}>
                      Eliminar
                    </button>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtrados.length === 0 && (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>
            No se encontraron egresados.
          </p>
        )}
      </div>
    </main>
  )
}