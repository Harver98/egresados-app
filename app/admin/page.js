'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

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
  const [fechasBase, setFechasBase] = useState({})
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

  const calcularDiasDesdeFecha = (fecha) => {
  const hoy = new Date()
  const base = new Date(fecha)

  if (isNaN(base)) return ''

  base.setDate(base.getDate() + 365)

  const diff = Math.ceil((base - hoy) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
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

  const getVigenciaEstado = (fecha) => {
    if (!fecha) return null
    const hoy = new Date()
    const venc = new Date(fecha)
    const diff = Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24))
    if (diff < 0) return 'vencido'
    if (diff <= 30) return 'proximo'
    return 'vigente'
  }

  const filtrados = egresados.filter(e => {
    const coincideBusqueda =
      e.cedula.includes(busqueda) ||
      e.nombre_completo.toLowerCase().includes(busqueda.toLowerCase())
    if (!coincideBusqueda) return false
    if (filtroVigencia === 'todos') return true
    if (filtroVigencia === 'activo') return e.estado === 'Activo'
    if (filtroVigencia === 'inactivo') return e.estado === 'Inactivo'
    if (filtroVigencia === 'vencido') {
      if (!e.fecha_vencimiento) return false
      return new Date(e.fecha_vencimiento) < new Date()
    }
    if (filtroVigencia === 'proximo') {
      if (!e.fecha_vencimiento) return false
      const diff = Math.ceil((new Date(e.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24))
      return diff >= 0 && diff <= 30
    }
    return true
  })

  const conteo = (valor) => {
    if (valor === 'activo') return egresados.filter(e => e.estado === 'Activo').length
    if (valor === 'inactivo') return egresados.filter(e => e.estado === 'Inactivo').length
    if (valor === 'vencido') return egresados.filter(e => e.fecha_vencimiento && new Date(e.fecha_vencimiento) < new Date()).length
    if (valor === 'proximo') return egresados.filter(e => {
      if (!e.fecha_vencimiento) return false
      const diff = Math.ceil((new Date(e.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24))
      return diff >= 0 && diff <= 30
    }).length
    return egresados.length
  }

  const exportarReporteEstados = () => {
  if (egresados.length === 0) {
    mostrarMensaje('No hay datos para exportar', 'error')
    return
  }


  const hoy = new Date()
  const activos = []
  const proximos = []
  const vencidos = []

  egresados.forEach(e => {
    if (!e.fecha_vencimiento) return

    const fecha = new Date(e.fecha_vencimiento)
    const diff = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24))

    const registro = {
      Cedula: e.cedula,
      Nombre: e.nombre_completo,
      Email: e.email || '',
      Estado: e.estado,
      'Fecha vencimiento': fecha.toLocaleDateString('es-CO'),
      'Días restantes': diff
    }

    if (diff < 0) {
      vencidos.push(registro)
    } else if (diff <= 30) {
      proximos.push(registro)
    } else {
      activos.push(registro)
    }
  })

  const workbook = XLSX.utils.book_new()

  if (activos.length > 0) {
    const wsActivos = XLSX.utils.json_to_sheet(activos)
    XLSX.utils.book_append_sheet(workbook, wsActivos, 'Activos')
  }

  if (proximos.length > 0) {
    const wsProx = XLSX.utils.json_to_sheet(proximos)
    XLSX.utils.book_append_sheet(workbook, wsProx, 'Próximos')
  }

  if (vencidos.length > 0) {
    const wsVenc = XLSX.utils.json_to_sheet(vencidos)
    XLSX.utils.book_append_sheet(workbook, wsVenc, 'Vencidos')
  }

  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  })

  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  saveAs(blob, `reporte_estados_${new Date().toISOString().slice(0,10)}.xlsx`)
}


  const s = {
    page: { maxWidth: 960, margin: '0 auto', padding: '40px 24px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: '#111' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingBottom: 20, borderBottom: '1px solid #e5e7eb' },
    headerLeft: { display: 'flex', flexDirection: 'column', gap: 2 },
    headerTitle: { fontSize: 22, fontWeight: 600, margin: 0, color: '#111' },
    headerSub: { fontSize: 13, color: '#6b7280', margin: 0 },
    btnPrimary: { padding: '9px 18px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' },
    btnSecondary: { padding: '8px 14px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, cursor: 'pointer' },
    btnGhost: { padding: '5px 10px', background: 'transparent', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, cursor: 'pointer' },
    btnDanger: { padding: '5px 10px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: 6, fontSize: 12, cursor: 'pointer' },
    btnSuccess: { padding: '5px 10px', background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7', borderRadius: 6, fontSize: 12, cursor: 'pointer' },
    btnWarning: { padding: '5px 10px', background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', borderRadius: 6, fontSize: 12, cursor: 'pointer' },
    input: { padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff', color: '#111', width: '100%', boxSizing: 'border-box' },
    inputSmall: { padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12, width: 64, textAlign: 'center', outline: 'none' },
    msgSuccess: { padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, color: '#166534', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 },
    msgError: { padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#991b1b', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 },
    formCard: { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 24 },
    formRow: { display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 },
    searchWrap: { position: 'relative', marginBottom: 16 },
    searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14, pointerEvents: 'none' },
    searchInput: { padding: '9px 12px 9px 36px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none', background: '#fff', color: '#111' },
    tableWrap: { overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
    th: { padding: '11px 14px', textAlign: 'left', color: '#6b7280', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' },
    td: { padding: '12px 14px', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' },
    badgeActivo: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', background: '#d1fae5', color: '#065f46', borderRadius: 20, fontSize: 11, fontWeight: 500 },
    badgeInactivo: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', background: '#f3f4f6', color: '#6b7280', borderRadius: 20, fontSize: 11, fontWeight: 500 },
    accionesRow: { display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
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

  const filtroBtnStyle = (valor) => {
    const activo = filtroVigencia === valor
    const colores = {
      todos:   { bg: '#1d4ed8', color: '#fff', border: 'none' },
      activo:  { bg: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' },
      inactivo:{ bg: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' },
      vencido: { bg: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' },
      proximo: { bg: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' },
    }
    return {
      padding: '6px 14px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'opacity 0.15s',
      opacity: activo ? 1 : 0.6,
      background: activo ? colores[valor].bg : '#fff',
      color: activo ? colores[valor].color : '#6b7280',
      border: activo ? colores[valor].border : '1px solid #e5e7eb',
    }
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
          <button onClick={exportarReporteEstados} style={s.btnSecondary}>
            Reporte por estado
          </button>
          <button onClick={() => setMostrarFormulario(!mostrarFormulario)} style={s.btnPrimary}>
            + Nuevo egresado
          </button>
          <button onClick={logout} style={s.btnSecondary}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* PANEL DE ALERTAS */}
      {mostrarAlertas && alertas.length > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#92400e' }}>
                {alertas.length} membresía{alertas.length !== 1 ? 's' : ''} próxima{alertas.length !== 1 ? 's' : ''} a vencer
              </span>
            </div>
            <button onClick={() => setMostrarAlertas(false)}
              style={{ background: 'transparent', border: 'none', color: '#b45309', fontSize: 16, cursor: 'pointer', padding: '0 4px' }}>
              ✕
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {alertas.map(eg => (
              <div key={eg.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#fff', border: `1px solid ${eg.diasRestantes <= 5 ? '#fca5a5' : '#fde68a'}`,
                borderRadius: 8, padding: '10px 14px', flexWrap: 'wrap', gap: 8
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: eg.diasRestantes <= 5 ? '#fee2e2' : '#fef3c7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 600,
                    color: eg.diasRestantes <= 5 ? '#b91c1c' : '#92400e', flexShrink: 0
                  }}>
                    {eg.nombre_completo.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#111' }}>{eg.nombre_completo}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>C.C. {eg.cedula}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: eg.diasRestantes <= 5 ? '#fee2e2' : '#fef3c7',
                    color: eg.diasRestantes <= 5 ? '#b91c1c' : '#92400e',
                    border: `1px solid ${eg.diasRestantes <= 5 ? '#fca5a5' : '#fcd34d'}`
                  }}>
                    {eg.diasRestantes === 0 ? 'Vence hoy' : `Vence en ${eg.diasRestantes} día${eg.diasRestantes !== 1 ? 's' : ''}`}
                  </span>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>
                    {new Date(eg.fecha_vencimiento).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* FILTROS */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {[
          { valor: 'todos',   label: 'Todos' },
          { valor: 'activo',  label: 'Activos' },
          { valor: 'inactivo',label: 'Inactivos' },
          { valor: 'vencido', label: 'Vencidos' },
          { valor: 'proximo', label: 'Próximos a vencer' },
        ].map(({ valor, label }) => (
          <button key={valor} onClick={() => setFiltroVigencia(valor)} style={filtroBtnStyle(valor)}>
            {label}
            {valor !== 'todos' && (
              <span style={{ marginLeft: 6, fontWeight: 600 }}>
                {conteo(valor)}
              </span>
            )}
          </button>
        ))}
      </div>

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
                      type="date"
                      value={fechasBase[eg.id] || ''}
                      onChange={(e) => {
                        const fecha = e.target.value

                        setFechasBase(prev => ({
                          ...prev,
                          [eg.id]: fecha
                        }))

                        const diasCalculados = calcularDiasDesdeFecha(fecha)

                        setDias(prev => ({
                          ...prev,
                          [eg.id]: diasCalculados
                        }))
                      }}
                      style={{ ...s.inputSmall, width: 130 }}
                      /> 
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
              {busqueda ? `Sin resultados para "${busqueda}"` : `No hay egresados en esta categoría.`}
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