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

  return (
    <main style={{
      minHeight: '100vh',
      background: '#f9fafb',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '64px 24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>

        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 52, height: 52,
            background: '#eff6ff',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            border: '1px solid #bfdbfe'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 6px', color: '#111' }}>
            ASEDUIS Bucaramanga
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
            Consulta tu estado de afiliación
          </p>
        </div>

        {/* Card principal */}
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 16,
          padding: 28,
          marginBottom: 16
        }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 6, letterSpacing: '0.02em' }}>
            Número de cédula
          </label>
          <form onSubmit={consultar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="text"
              placeholder="Ej: 1098765432"
              value={cedula}
              onChange={e => setCedula(e.target.value.replace(/\D/g, ''))}
              maxLength={12}
              style={{
                width: '100%',
                padding: '11px 14px',
                fontSize: 15,
                border: '1.5px solid #d1d5db',
                borderRadius: 10,
                boxSizing: 'border-box',
                outline: 'none',
                color: '#111',
                background: '#fff',
                letterSpacing: '0.05em',
                fontFamily: 'monospace'
              }}
            />
            <button
              type="submit"
              disabled={cargando || !cedula}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: 14,
                fontWeight: 500,
                background: cargando || !cedula ? '#93c5fd' : '#1d4ed8',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                cursor: cargando || !cedula ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              {cargando ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                  Consultando...
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  Consultar estado
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '14px 16px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 12,
            color: '#991b1b',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 12
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
            </svg>
            {error}
          </div>
        )}

        {/* Resultado */}
        {resultado && (
          <div style={{
            background: '#fff',
            border: `1.5px solid ${activo ? '#bbf7d0' : '#fecaca'}`,
            borderRadius: 16,
            overflow: 'hidden'
          }}>
            {/* Banner estado */}
            <div style={{
              background: activo ? '#f0fdf4' : '#fef2f2',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              borderBottom: `1px solid ${activo ? '#bbf7d0' : '#fecaca'}`
            }}>
              <div style={{
                width: 32, height: 32,
                borderRadius: '50%',
                background: activo ? '#dcfce7' : '#fee2e2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={activo ? '#16a34a' : '#dc2626'} strokeWidth="2.5" strokeLinecap="round">
                  {activo
                    ? <path d="M20 6 9 17l-5-5"/>
                    : <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>
                  }
                </svg>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: activo ? '#166534' : '#991b1b' }}>
                  {activo ? 'Afiliación activa' : 'Afiliación inactiva'}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: activo ? '#4ade80' : '#fca5a5', marginTop: 1 }}>
                  {activo ? 'Al día con ASEDUIS' : 'Sin afiliación vigente'}
                </p>
              </div>
              <div style={{
                marginLeft: 'auto',
                padding: '4px 12px',
                borderRadius: 20,
                background: activo ? '#dcfce7' : '#fee2e2',
                fontSize: 11,
                fontWeight: 600,
                color: activo ? '#166534' : '#991b1b',
                border: `1px solid ${activo ? '#86efac' : '#fca5a5'}`
              }}>
                {activo ? 'Activo' : 'Inactivo'}
              </div>
            </div>

            {/* Datos del egresado */}
            <div style={{ padding: '20px 20px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44,
                  borderRadius: '50%',
                  background: '#eff6ff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 600, color: '#1d4ed8',
                  flexShrink: 0,
                  border: '1px solid #bfdbfe'
                }}>
                  {resultado.nombre_completo?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111' }}>
                    {resultado.nombre_completo}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>
                    C.C. {resultado.cedula}
                  </p>
                </div>
              </div>

              {resultado.vigente_hasta && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#f8fafc',
                  borderRadius: 8,
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                    </svg>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>Vigente hasta</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>
                    {resultado.vigente_hasta}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 28 }}>
          ¿Inconvenientes? Contacta a tu sindicato local.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  )
}