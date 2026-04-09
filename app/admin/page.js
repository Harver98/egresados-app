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
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

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
    mostrarMensaje(data.mensaje || data.error, data.error ? 'error' : 'success')
    setDias(prev => ({ ...prev, [egresado_id]: '' }))
    cargarEgresados()
  }

  const agregarEgresado = async (e) => {
    e.preventDefault()
    if (!nuevo.cedula || !nuevo.nombre_completo) {
      mostrarMensaje('Cédula y nombre son obligatorios', 'error')
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

  const filtrados = egresados.filter(e =>
    e.cedula.includes(busqueda) ||
    e.nombre_completo.toLowerCase().includes(busqueda.toLowerCase())
  )

  const getVigenciaEstado = (fecha) => {
    if (!fecha) return null
    const hoy = new Date()
    const venc = new Date(fecha)
    const diff = Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24))
    if (diff < 0) return 'vencido'
    if (diff <= 30) return 'proximo'
    return 'vigente'
  }

  const s = {
    // Layout
    page: { maxWidth: 960, margin: '0 auto', padding: '40px 24px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: '#111' },
    // Header
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingBottom: 20, borderBottom: '1px solid #e5e7eb' },
    headerLeft: { display: 'flex', flexDirection: 'column', gap: 2 },
    headerTitle: { fontSize: 22, fontWeight: 600, margin: 0, color: '#111' },
    headerSub: { fontSize: 13, color: '#6b7280', margin: 0 },
    // Buttons
    btnPrimary: { padding: '9px 18px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' },
    btnSecondary: { padding: '8px 14px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, cursor: 'pointer' },
    btnGhost: { padding: '5px 10px', background: 'transparent', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, cursor: 'pointer' },
    btnDanger: { padding: '5px 10px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: 6, fontSize: 12, cursor: 'pointer' },
    btnSuccess: { padding: '5px 10px', background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7', borderRadius: 6, fontSize: 12, cursor: 'pointer' },
    btnWarning: { padding: '5px 10px', background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', borderRadius: 6, fontSize: 12, cursor: 'pointer' },
    // Input
    input: { padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff', color: '#111', width: '100%', boxSizing: 'border-box' },
    inputSmall: { padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12, width: 64, textAlign: 'center', outline: 'none' },
    // Mensaje
    msgSuccess: { padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, color: '#166534', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 },
    msgError: { padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#991b1b', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 },
    // Card formulario
    formCard: { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 24 },
    formRow: { display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 },
    // Search bar
    searchWrap: { position: 'relative', marginBottom: 16 },
    searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14, pointerEvents: 'none' },
    searchInput: { padding: '9px 12px 9px 36px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none', background: '#fff', color: '#111' },
    // Table
    tableWrap: { overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
    th: { padding: '11px 14px', textAlign: 'left', color: '#6b7280', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' },
    td: { padding: '12px 14px', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' },
    // Badges
    badgeActivo: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', background: '#d1fae5', color: '#065f46', borderRadius: 20, fontSize: 11, fontWeight: 500 },
    badgeInactivo: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', background: '#f3f4f6', color: '#6b7280', borderRadius: 20, fontSize: 11, fontWeight: 500 },
    // Acciones row
    accionesRow: { display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
    // Login
    loginWrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
    loginCard: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 380 },
  }

  const vigenciaBadge = (fecha) => {
    const estado = getVigenciaEstado(fecha)
    if (!fecha) return <span style={{ color: '#9ca3af', fontSize: 13 }}>—</span>
    const dateStr = new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
    if (estado === 'vencido') return <span style={{ display: 'inline-block', padding: '2px 8px', background: '#fee2e2', color: '#b91c1c', borderRadius: 6, fontSize: 12 }}>{dateStr}</span>
    if (estado === 'proximo') return <span style={{ display: 'inline-block', padding: '2px 8px', background: '#fef3c7', color: '#92400e', borderRadius: 6, fontSize: 12 }}>{dateStr}</span>
    return <span style={{ display: 'inline-block', padding: '2px 8px', background: '#f0fdf4', color: '#166534', borderRadius: 6, fontSize: 12 }}>{dateStr}</span>
  }

  // LOGIN
  if (!session) return (
    <div style={s.loginWrap}>
      <div style={s.loginCard}>
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, background: '#eff6ff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 20 }}>🎓</div>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 4px', color: '#111' }}>Panel de administración</h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Ingresa tus credenciales para continuar</p>
        </div>
        {msg && <div style={s.msgError}><span>⚠</span> {msg}</div>}
        <form onSubmit={login} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Correo electrónico</label>
            <input style={s.input} placeholder="admin@ejemplo.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Contraseña</label>
            <input style={s.input} placeholder="••••••••" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" style={{ ...s.btnPrimary, marginTop: 8, width: '100%', padding: 11, fontSize: 14 }}>
            Ingresar
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <main style={s.page}>

      {/* HEADER */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <h1 style={s.headerTitle}>Gestión de egresados</h1>
          <p style={s.headerSub}>{egresados.length} egresado{egresados.length !== 1 ? 's' : ''} registrado{egresados.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => setMostrarFormulario(!mostrarFormulario)} style={s.btnPrimary}>
            + Nuevo egresado
          </button>
          <button onClick={logout} style={s.btnSecondary}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* MENSAJE */}
      {msg && (
        <div style={msgTipo === 'error' ? s.msgError : s.msgSuccess}>
          <span>{msgTipo === 'error' ? '✕' : '✓'}</span>
          {msg}
        </div>
      )}

      {/* FORMULARIO */}
      {mostrarFormulario && (
        <div style={s.formCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 500, fontSize: 14, color: '#111' }}>Nuevo egresado</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280' }}>Completa los campos requeridos para registrar.</p>
            </div>
            <button onClick={() => setMostrarFormulario(false)} style={{ ...s.btnGhost, fontSize: 16, padding: '4px 10px' }}>✕</button>
          </div>
          <form onSubmit={agregarEgresado} style={s.formRow}>
            <input placeholder="Cédula *" value={nuevo.cedula}
              onChange={e => setNuevo({ ...nuevo, cedula: e.target.value })}
              style={{ ...s.input, flex: '1 1 140px', width: 'auto' }} />
            <input placeholder="Nombre completo *" value={nuevo.nombre_completo}
              onChange={e => setNuevo({ ...nuevo, nombre_completo: e.target.value })}
              style={{ ...s.input, flex: '2 1 200px', width: 'auto' }} />
            <input placeholder="Correo electrónico" value={nuevo.email}
              onChange={e => setNuevo({ ...nuevo, email: e.target.value })}
              style={{ ...s.input, flex: '2 1 180px', width: 'auto' }} />
            <button type="submit" style={{ ...s.btnPrimary, flexShrink: 0 }}>
              Guardar
            </button>
          </form>
        </div>
      )}

      {/* BUSCADOR */}
      <div style={s.searchWrap}>
        <span style={s.searchIcon}>⌕</span>
        <input
          style={s.searchInput}
          placeholder="Buscar por nombre o cédula..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {/* TABLA */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {['Cédula', 'Nombre completo', 'Estado', 'Vigencia', 'Acciones'].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map((eg, i) => (
              <tr key={eg.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={s.td}>
                  <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#374151' }}>{eg.cedula}</span>
                </td>
                <td style={s.td}>
                  <span style={{ fontWeight: 500, color: '#111' }}>{eg.nombre_completo}</span>
                </td>
                <td style={s.td}>
                  {eg.estado === 'Activo'
                    ? <span style={s.badgeActivo}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />Activo</span>
                    : <span style={s.badgeInactivo}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#9ca3af', display: 'inline-block' }} />Inactivo</span>
                  }
                </td>
                <td style={s.td}>
                  {vigenciaBadge(eg.fecha_vencimiento)}
                </td>
                <td style={s.td}>
                  <div style={s.accionesRow}>
                    <button
                      onClick={() => cambiarEstado(eg.id, eg.estado)}
                      style={eg.estado === 'Activo' ? s.btnGhost : s.btnSuccess}>
                      {eg.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f3f4f6', borderRadius: 6, padding: '3px 6px' }}>
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
                        style={s.inputSmall}
                      />
                      <button
                        onClick={() => setDias(prev => ({ ...prev, [eg.id]: 365 }))}
                        style={{ padding: '4px 7px', background: 'transparent', border: 'none', color: '#6b7280', fontSize: 11, cursor: 'pointer', borderRadius: 4 }}
                        title="Establecer 365 días">
                        +365
                      </button>
                    </div>

                    <button onClick={() => registrarPago(eg.id)} style={s.btnWarning}>
                      Renovar
                    </button>

                    <button onClick={() => eliminarEgresado(eg.id)} style={s.btnDanger}>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>
              {busqueda ? `Sin resultados para "${busqueda}"` : 'No hay egresados registrados.'}
            </p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <p style={{ textAlign: 'center', color: '#d1d5db', fontSize: 12, marginTop: 32 }}>
        {session?.user?.email} · Panel administrativo
      </p>

    </main>
  )
}