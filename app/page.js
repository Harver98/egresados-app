'use client'
import { useState } from 'react'

export default function ConsultaPage() {
  const [cedula, setCedula] = useState('')
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const consultar = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')
    setResultado(null)

    const res = await fetch(`/api/consultar?cedula=${cedula}`)
    const data = await res.json()

    if (!res.ok) setError(data.error)
    else setResultado(data)
    setCargando(false)
  }

  const activo = resultado?.estado === 'Activo'

  const styles = {
    page: {
      minHeight: '100vh',
      background: '#f4f4f5',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '52px 20px 64px',
      fontFamily: '"Geist", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    wrapper: {
      width: '100%',
      maxWidth: 420,
    },
    brand: { textAlign: 'center', marginBottom: 32 },
    logoWrap: { width: '100%', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    logoImg: { width: 'auto', height: '100%', maxHeight: 120, objectFit: 'contain' },
    brandTitle: { fontSize: 17, fontWeight: 600, color: '#09090b', margin: '0 0 4px' },
    brandSub: { fontSize: 13, color: '#71717a', margin: 0 },
    card: { background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 14, padding: '22px 22px 20px', marginBottom: 10 },
    fieldLabel: { display: 'block', fontSize: 11, fontWeight: 600, color: '#52525b', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 },
    form: { display: 'flex', flexDirection: 'column', gap: 10 },
    inputWrap: { position: 'relative' },
    inputIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa', pointerEvents: 'none', display: 'flex' },
    input: { width: '100%', padding: '10px 14px 10px 36px', fontSize: 15, fontFamily: '"Geist Mono", monospace', border: '1px solid #d4d4d8', borderRadius: 9, boxSizing: 'border-box', outline: 'none', color: '#09090b', background: '#fafafa' },
    alertBase: { padding: '11px 14px', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 10 },
    alertError: { background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' },
    alertWarn: { background: '#fffbeb', border: '1px solid #fcd34d', color: '#92400e' },
    resultCard: (activo) => ({ background: '#ffffff', border: `1px solid ${activo ? '#bbf7d0' : '#fecaca'}`, borderRadius: 14, overflow: 'hidden', marginBottom: 10 }),
    resultHeader: (activo) => ({ background: activo ? '#f0fdf4' : '#fef2f2', padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${activo ? '#bbf7d0' : '#fecaca'}` }),
    statusDot: (activo) => ({ width: 8, height: 8, borderRadius: '50%', background: activo ? '#16a34a' : '#dc2626', flexShrink: 0 }),
    statusLabel: (activo) => ({ fontSize: 13, fontWeight: 600, color: activo ? '#166534' : '#991b1b', margin: 0 }),
    statusSub: (activo) => ({ fontSize: 11, color: activo ? '#16a34a' : '#dc2626', margin: '2px 0 0' }),
    badge: (activo) => ({ marginLeft: 'auto', padding: '3px 10px', borderRadius: 20, background: activo ? '#dcfce7' : '#fee2e2', fontSize: 11, fontWeight: 600, color: activo ? '#166534' : '#991b1b', border: `1px solid ${activo ? '#86efac' : '#fca5a5'}` }),
    resultBody: { padding: '18px 18px 14px' },
    memberInfo: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 },
    avatar: { width: 42, height: 42, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#be1522', border: '1px solid #fecaca' },
    memberName: { fontSize: 15, fontWeight: 600, color: '#09090b', margin: 0 },
    memberCC: { fontSize: 12, color: '#71717a', fontFamily: '"Geist Mono", monospace', margin: '2px 0 0' },
    vigenciaRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 13px', background: '#f4f4f5', borderRadius: 8, border: '1px solid #e4e4e7' },
    vigenciaKey: { fontSize: 12, color: '#71717a', display: 'flex', alignItems: 'center', gap: 6 },
    vigenciaVal: { fontSize: 13, fontWeight: 500, color: '#09090b' },
    footer: { textAlign: 'center', fontSize: 12, color: '#a1a1aa', marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
    contactLink: { color: '#52525b', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }
  }

  return (
    <main style={styles.page}>
      <div style={styles.wrapper}>
        <div style={styles.brand}>
          <div style={styles.logoWrap}>
            <img src="/logo.png" alt="Logo" style={styles.logoImg} onError={(e) => e.target.style.display = 'none'} />
          </div>
          <h1 style={styles.brandTitle}>ASEDUIS Bucaramanga</h1>
          <p style={styles.brandSub}>Portal de consulta de afiliación</p>
        </div>

        <div style={styles.card}>
          <label style={styles.fieldLabel}>Número de cédula</label>
          <form onSubmit={consultar} style={styles.form}>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
              </span>
              <input type="text" placeholder="Ej: 1098765432" value={cedula} onChange={e => setCedula(e.target.value.replace(/\D/g, ''))} maxLength={12} style={styles.input} />
            </div>
            <button type="submit" disabled={cargando || !cedula} style={{ width: '100%', padding: '11px', fontWeight: 500, background: cargando || !cedula ? '#f4f4f5' : '#be1522', color: cargando || !cedula ? '#a1a1aa' : '#fff', border: 'none', borderRadius: 9, cursor: cargando || !cedula ? 'not-allowed' : 'pointer' }}>
              {cargando ? 'Consultando...' : 'Consultar estado'}
            </button>
          </form>
        </div>

        {error && <div style={{ ...styles.alertBase, ...styles.alertError }}>{error}</div>}

        {resultado && (
          <div style={styles.resultCard(activo)}>
            <div style={styles.resultHeader(activo)}>
              <div style={styles.statusDot(activo)} />
              <div>
                <p style={styles.statusLabel(activo)}>{activo ? 'Afiliación activa' : 'Afiliación inactiva'}</p>
              </div>
            </div>
            <div style={styles.resultBody}>
              <div style={styles.memberInfo}>
                <div style={styles.avatar}>{resultado.nombre_completo?.split(' ').slice(0, 2).map(n => n[0]).join('')}</div>
                <div>
                  <p style={styles.memberName}>{resultado.nombre_completo}</p>
                  <p style={styles.memberCC}>C.C. {resultado.cedula}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer style={styles.footer}>
          <a href="https://wa.me/573242606004" target="_blank" rel="noopener noreferrer" style={styles.contactLink}>
            ¿Inconvenientes? Contacta al 324 260 6004
          </a>
          <span>Copyright © 2026 • Diseñado y Desarrollado por Alejandro Sierra</span>
        </footer>
      </div>
    </main>
  )
}