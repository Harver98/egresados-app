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
    page: { minHeight: '100vh', background: '#f4f4f5', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '52px 20px 64px', fontFamily: '"Geist", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
    wrapper: { width: '100%', maxWidth: 420 },
    brand: { textAlign: 'center', marginBottom: 32 },
    logoWrap: { width: '100%', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    logoImg: { width: 'auto', height: '100%', maxHeight: 120, objectFit: 'contain' },
    brandTitle: { fontSize: 17, fontWeight: 600, color: '#09090b', letterSpacing: '-0.02em', margin: '0 0 4px' },
    brandSub: { fontSize: 13, color: '#71717a', margin: 0 },
    card: { background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 14, padding: '22px 22px 20px', marginBottom: 10 },
    fieldLabel: { display: 'block', fontSize: 11, fontWeight: 600, color: '#52525b', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 },
    form: { display: 'flex', flexDirection: 'column', gap: 10 },
    inputWrap: { position: 'relative' },
    inputIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa', pointerEvents: 'none', display: 'flex' },
    input: { width: '100%', padding: '10px 14px 10px 36px', fontSize: 15, fontFamily: '"Geist Mono", monospace', letterSpacing: '0.04em', border: '1px solid #d4d4d8', borderRadius: 9, boxSizing: 'border-box', outline: 'none', color: '#09090b', background: '#fafafa', transition: 'border-color 0.15s, box-shadow 0.15s' },
    alertBase: { padding: '11px 14px', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 10 },
    alertError: { background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' },
    alertWarn: { background: '#fffbeb', border: '1px solid #fcd34d', color: '#92400e' },
    resultCard: (activo) => ({ background: '#ffffff', border: `1px solid ${activo ? '#bbf7d0' : '#fecaca'}`, borderRadius: 14, overflow: 'hidden', marginBottom: 10 }),
    resultHeader: (activo) => ({ background: activo ? '#f0fdf4' : '#fef2f2', padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${activo ? '#bbf7d0' : '#fecaca'}` }),
    statusDot: (activo) => ({ width: 8, height: 8, borderRadius: '50%', background: activo ? '#16a34a' : '#dc2626', boxShadow: activo ? '0 0 0 3px rgba(22,163,74,0.18)' : '0 0 0 3px rgba(220,38,38,0.18)', flexShrink: 0 }),
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
    footer: { textAlign: 'center', fontSize: 12, color: '#a1a1aa', marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
    contactLink: { color: '#52525b', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }
  }

  return (
    <main style={styles.page}>
      <div style={styles.wrapper}>
        <div style={styles.brand}>
          <div style={styles.logoWrap}>
            <img src="/logo.png" alt="Logo ASEDUIS" style={styles.logoImg} onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<div style="background:#fef2f2;border:1px solid #fee2e2;border-radius:14px;padding:12px 24px;color:#be1522;font-weight:700;font-size:18px;">ASEDUIS</div>' }} />
          </div>
          <h1 style={styles.brandTitle}>ASEDUIS Bucaramanga</h1>
          <p style={styles.brandSub}>Portal de consulta de afiliación</p>
        </div>

        <div style={styles.card}>
          <label style={styles.fieldLabel}>Número de cédula</label>
          <form onSubmit={consultar} style={styles.form}>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg></span>
              <input type="text" placeholder="Ej: 1098765432" value={cedula} onChange={e => setCedula(e.target.value.replace(/\D/g, ''))} onFocus={e => { e.target.style.borderColor = '#be1522'; e.target.style.boxShadow = '0 0 0 3px rgba(190,21,34,0.08)'; e.target.style.background = '#fff' }} onBlur={e => { e.target.style.borderColor = '#d4d4d8'; e.target.style.boxShadow = 'none'; e.target.style.background = '#fafafa' }} maxLength={12} style={styles.input} />
            </div>
            <button type="submit" disabled={cargando || !cedula} style={{ width: '100%', padding: '11px', fontSize: 14, fontWeight: 500, background: cargando || !cedula ? '#f4f4f5' : '#be1522', color: cargando || !cedula ? '#a1a1aa' : '#fff', border: cargando || !cedula ? '1px solid #e4e4e7' : '1px solid transparent', borderRadius: 9, cursor: cargando || !cedula ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'background 0.15s' }}>
              {cargando ? <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Consultando...</> : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> Consultar estado</>}
            </button>
          </form>
        </div>

        {error && <div style={{ ...styles.alertBase, ...styles.alertError }}>{error}</div>}

        {resultado && (
          <div style={styles.resultCard(activo)}>
            <div style={styles.resultHeader(activo)}>
              <div style={styles.statusDot(activo)} />
              <div><p style={styles.statusLabel(activo)}>{activo ? 'Afiliación activa' : 'Afiliación inactiva'}</p><p style={styles.statusSub(activo)}>{activo ? 'Al día con ASEDUIS' : 'Sin afiliación vigente'}</p></div>
              <div style={styles.badge(activo)}>{activo ? 'Activo' : 'Inactivo'}</div>
            </div>
            <div style={styles.resultBody}>
              <div style={styles.memberInfo}><div style={styles.avatar}>{resultado.nombre_completo?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}</div><div><p style={styles.memberName}>{resultado.nombre_completo}</p><p style={styles.memberCC}>C.C. {resultado.cedula}</p></div></div>
              {resultado.vigente_hasta && <div style={styles.vigenciaRow}><div style={styles.vigenciaKey}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> Vigente hasta</div><span style={styles.vigenciaVal}>{resultado.vigente_hasta}</span></div>}
            </div>
          </div>
        )}

        <footer style={styles.footer}>
          <a href="https://wa.me/573242606004" target="_blank" rel="noopener noreferrer" style={styles.contactLink}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.07 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17z"/></svg>
            ¿Inconvenientes? Contacta al 324 260 6004
          </a>
          <span>Copyright © 2026 • Diseñado y Desarrollado por Alejandro Sierra</span>
        </footer>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  )
}