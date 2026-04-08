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

  console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log("KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

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

  const registrarPago = async (egresado_id) => {
    const res = await fetch('/api/pagos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ egresado_id, monto: 0, observaciones: 'Renovación manual' })
    })
    const data = await res.json()
    setMsg(data.mensaje || data.error)
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
    e.cedula.includes(busqueda) || e.nombre_completo.toLowerCase().includes(busqueda.toLowerCase())
  )

  if (!session) return (
    <main style={{ maxWidth: 360, margin: '100px auto', padding: '0 24px', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 24 }}>Panel de administración</h1>
      {msg && <p style={{ color: 'red', marginBottom: 16 }}>{msg}</p>}
      <form onSubmit={login} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input placeholder="Correo" value={email} onChange={e => setEmail(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 15 }} />
        <input placeholder="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 15 }} />
        <button style={{ padding: 12, background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer' }}>
          Ingresar
        </button>
      </form>
    </main>
  )

  return (
    <main style={{ maxWidth: 900, margin: '40px auto', padding: '0 24px', fontFamily: 'system-ui' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600 }}>Gestión de egresados</h1>
        <button onClick={logout} style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer' }}>
          Cerrar sesión
        </button>
      </div>

      {msg && (
        <div style={{ padding: 12, background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: 8, color: '#166534', marginBottom: 20 }}>{msg}</div>
      )}

      {/* Formulario nuevo egresado */}
      <details style={{ marginBottom: 32, background: '#f8fafc', borderRadius: 8, padding: 16 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 500 }}>+ Agregar nuevo egresado</summary>
        <form onSubmit={agregarEgresado} style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          <input placeholder="Cédula *" value={nuevo.cedula} onChange={e => setNuevo({...nuevo, cedula: e.target.value})}
            style={{ flex: 1, minWidth: 140, padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd' }} />
          <input placeholder="Nombre completo *" value={nuevo.nombre_completo} onChange={e => setNuevo({...nuevo, nombre_completo: e.target.value})}
            style={{ flex: 2, minWidth: 200, padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd' }} />
          <input placeholder="Email" value={nuevo.email} onChange={e => setNuevo({...nuevo, email: e.target.value})}
            style={{ flex: 2, minWidth: 180, padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd' }} />
          <button type="submit" style={{ padding: '8px 20px', background: '#1d4ed8', color: '#fff',
            border: 'none', borderRadius: 8, cursor: 'pointer' }}>Guardar</button>
        </form>
      </details>

      {/* Buscador */}
      <input
        placeholder="Buscar por nombre o cédula..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        style={{ width: '100%', padding: '10px 14px', borderRadius: 8,
          border: '1.5px solid #ddd', marginBottom: 16, fontSize: 15, boxSizing: 'border-box' }}
      />

      {/* Tabla */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              {['Cédula', 'Nombre', 'Estado', 'Vigencia', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left',
                  borderBottom: '1px solid #e2e8f0', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map(eg => (
              <tr key={eg.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 12px', color: '#64748b' }}>{eg.cedula}</td>
                <td style={{ padding: '10px 12px', fontWeight: 500 }}>{eg.nombre_completo}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                    background: eg.estado === 'Activo' ? '#dcfce7' : '#fee2e2',
                    color: eg.estado === 'Activo' ? '#166534' : '#991b1b'
                  }}>{eg.estado}</span>
                </td>
                <td style={{ padding: '10px 12px', color: '#64748b', fontSize: 13 }}>
                  {eg.fecha_vencimiento
                    ? new Date(eg.fecha_vencimiento).toLocaleDateString('es-CO')
                    : '—'}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => cambiarEstado(eg.id, eg.estado)}
                      style={{ padding: '5px 10px', border: '1px solid #ddd',
                        borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                      {eg.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                    </button>
                    <button onClick={() => registrarPago(eg.id)}
                      style={{ padding: '5px 10px', background: '#1d4ed8', color: '#fff',
                        border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                      +365 días
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