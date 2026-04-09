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

  return (
    <main style={{ maxWidth: 480, margin: '80px auto', padding: '0 24px', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
        Consulta de afiliación ASEDUIS Bucaramanga
      </h1>
      <p style={{ color: '#666', marginBottom: 32 }}>
        Ingresa tu número de cédula para verificar tu estado de afiliación.
      </p>

      <form onSubmit={consultar}>
        <input
          type="text"
          placeholder="Ej: 1098765432"
          value={cedula}
          onChange={e => setCedula(e.target.value)}
          maxLength={12}
          style={{
            width: '100%', padding: '12px 16px', fontSize: 16,
            border: '1.5px solid #ddd', borderRadius: 8, boxSizing: 'border-box',
            marginBottom: 12, outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={cargando || !cedula}
          style={{
            width: '100%', padding: '12px', fontSize: 16, fontWeight: 500,
            background: '#1d4ed8', color: '#fff', border: 'none',
            borderRadius: 8, cursor: 'pointer', opacity: cargando ? 0.7 : 1
          }}
        >
          {cargando ? 'Consultando...' : 'Consultar estado'}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: 24, padding: 16, background: '#fef2f2',
          borderRadius: 8, color: '#991b1b', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      {resultado && (
        <div style={{ marginTop: 24, padding: 20, background: '#f8fafc',
          borderRadius: 8, border: '1px solid #e2e8f0' }}>
          <p style={{ margin: '0 0 8px', fontWeight: 500, fontSize: 18 }}>
            {resultado.nombre_completo}
          </p>
          <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: 14 }}>
            C.C. {resultado.cedula}
          </p>
          <div style={{
            display: 'inline-block', marginTop: 12, padding: '6px 16px',
            borderRadius: 20, fontWeight: 600, fontSize: 15,
            background: resultado.estado === 'Activo' ? '#dcfce7' : '#fee2e2',
            color: resultado.estado === 'Activo' ? '#166534' : '#991b1b'
          }}>
            {resultado.estado === 'Activo' ? '✓ Activo' : '✕ Inactivo'}
          </div>
          {resultado.vigente_hasta && (
            <p style={{ margin: '12px 0 0', color: '#64748b', fontSize: 13 }}>
              Vigente hasta: {resultado.vigente_hasta}
            </p>
          )}
        </div>
      )}
    </main>
  )
}