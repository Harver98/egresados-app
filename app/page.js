'use client'

import { useState, useRef } from 'react'

export default function Home() {
  const [cedula, setCedula] = useState('')
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [consultado, setConsultado] = useState(false)
  const inputRef = useRef(null)

  const consultar = async () => {
    const val = cedula.trim()
    if (!val) return
    setCargando(true)
    setError(null)
    setResultado(null)
    setConsultado(false)
    try {
      const res = await fetch(`/api/consultar?cedula=${encodeURIComponent(val)}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al consultar.')
      } else {
        setResultado(data)
      }
    } catch {
      setError('Error de red. Intenta de nuevo.')
    } finally {
      setCargando(false)
      setConsultado(true)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') consultar()
  }

  const reset = () => {
    setCedula('')
    setResultado(null)
    setError(null)
    setConsultado(false)
    inputRef.current?.focus()
  }

  const esActivo = resultado?.estado?.toLowerCase() === 'activo'

  return (
    <main className="page-root">
      {/* Fondo decorativo */}
      <div className="bg-deco" aria-hidden="true">
        <div className="bg-circle bg-c1" />
        <div className="bg-circle bg-c2" />
        <div className="bg-grid" />
      </div>

      <div className="contenedor">
        {/* Header con logo */}
        <header className="encabezado">
          <div className="logo-wrap">
            {/* Logo SVG placeholder - reemplaza el src con tu logo real */}
            <div className="logo-circulo">
              <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-svg">
                <circle cx="40" cy="40" r="38" stroke="white" strokeWidth="2.5" opacity="0.6"/>
                <path d="M20 52 L40 24 L60 52" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M28 52 L52 52" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
                <circle cx="40" cy="36" r="5" fill="white" opacity="0.9"/>
              </svg>
            </div>
            <div className="logo-texto">
              <span className="logo-nombre">Asociación de Egresados</span>
              <span className="logo-sub">Portal de Verificación de Membresía</span>
            </div>
          </div>
        </header>

        {/* Tarjeta principal */}
        <section className="tarjeta-principal">
          <div className="tarjeta-inner">

            <div className="tarjeta-titulo-wrap">
              <div className="icono-titulo">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h1 className="tarjeta-titulo">Consulta tu estado</h1>
            </div>

            <p className="tarjeta-desc">
              Ingresa tu número de cédula para verificar tu membresía y estado de afiliación.
            </p>

            <div className="campo-grupo">
              <label className="campo-label" htmlFor="cedula-input">
                Número de cédula
              </label>
              <div className="campo-input-wrap">
                <span className="campo-icono" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                </span>
                <input
                  id="cedula-input"
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  className="campo-input"
                  placeholder="Ej: 1098765432"
                  value={cedula}
                  onChange={e => setCedula(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={handleKey}
                  maxLength={12}
                  autoComplete="off"
                />
                {cedula && (
                  <button className="campo-clear" onClick={() => setCedula('')} aria-label="Limpiar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <button
              className={`btn-consultar${cargando ? ' btn-cargando' : ''}`}
              onClick={consultar}
              disabled={cargando || !cedula.trim()}
            >
              {cargando ? (
                <>
                  <span className="spinner" aria-hidden="true"/>
                  Consultando…
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  Consultar membresía
                </>
              )}
            </button>

            {/* Resultado */}
            {consultado && resultado && (
              <div className={`resultado-card resultado-${esActivo ? 'activo' : 'inactivo'}`}>
                <div className="resultado-header">
                  <div className={`resultado-badge ${esActivo ? 'badge-activo' : 'badge-inactivo'}`}>
                    {esActivo ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    )}
                    {esActivo ? 'Activo' : 'Inactivo'}
                  </div>
                  <span className="resultado-cedula">C.C. {resultado.cedula}</span>
                </div>

                <div className="resultado-nombre">{resultado.nombre_completo}</div>

                <div className="resultado-detalles">
                  {resultado.vigente_hasta && (
                    <div className="detalle-item">
                      <span className="detalle-label">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        Vigente hasta
                      </span>
                      <span className="detalle-valor">{resultado.vigente_hasta}</span>
                    </div>
                  )}
                  <div className="detalle-item">
                    <span className="detalle-label">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      Estado
                    </span>
                    <span className="detalle-valor">{resultado.estado}</span>
                  </div>
                </div>

                {resultado.alerta_vencimiento && (
                  <div className="alerta-vencimiento">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {resultado.alerta_vencimiento}
                  </div>
                )}

                <button className="btn-nueva" onClick={reset}>
                  Realizar otra consulta
                </button>
              </div>
            )}

            {/* Error */}
            {consultado && error && (
              <div className="error-card">
                <div className="error-icono" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <div className="error-texto">
                  <strong>No encontrado</strong>
                  <span>{error}</span>
                </div>
                <button className="btn-nueva" onClick={reset}>Intentar de nuevo</button>
              </div>
            )}
          </div>
        </section>

        <footer className="pie">
          <p>Sistema de verificación de membresías · {new Date().getFullYear()}</p>
        </footer>
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .page-root {
          min-height: 100vh;
          background: #0a0f1e;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Segoe UI', system-ui, sans-serif;
          position: relative;
          overflow: hidden;
          padding: 2rem 1rem;
        }

        .bg-deco {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .bg-circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.18;
        }

        .bg-c1 {
          width: 600px; height: 600px;
          top: -200px; right: -150px;
          background: #be1522;
        }

        .bg-c2 {
          width: 500px; height: 500px;
          bottom: -200px; left: -100px;
          background: #7b0d15;
        }

        .bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .contenedor {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 480px;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Header */
        .encabezado {
          text-align: center;
          animation: deslizar .5s ease both;
        }

        .logo-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: .75rem;
        }

        .logo-circulo {
          width: 80px; height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #be1522, #7b0d15);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(255,255,255,0.12);
          box-shadow: 0 0 40px rgba(190,21,34,0.4);
        }

        .logo-svg { width: 52px; height: 52px; }

        .logo-nombre {
          display: block;
          font-size: 1.1rem;
          font-weight: 700;
          color: #f0f9ff;
          letter-spacing: -.01em;
        }

        .logo-sub {
          display: block;
          font-size: .78rem;
          color: rgba(186,230,253,0.6);
          letter-spacing: .04em;
          text-transform: uppercase;
          margin-top: 2px;
        }

        /* Tarjeta */
        .tarjeta-principal {
          background: rgba(15,23,42,0.75);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          overflow: hidden;
          animation: deslizar .5s .1s ease both;
        }

        .tarjeta-inner {
          padding: 2rem;
        }

        .tarjeta-titulo-wrap {
          display: flex;
          align-items: center;
          gap: .75rem;
          margin-bottom: .75rem;
        }

        .icono-titulo {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: rgba(190,21,34,0.18);
          border: 1px solid rgba(190,21,34,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fca5a5;
          flex-shrink: 0;
        }

        .tarjeta-titulo {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f0f9ff;
          letter-spacing: -.02em;
        }

        .tarjeta-desc {
          font-size: .88rem;
          color: rgba(186,230,253,0.55);
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        /* Campo */
        .campo-grupo { margin-bottom: 1rem; }

        .campo-label {
          display: block;
          font-size: .78rem;
          font-weight: 600;
          color: rgba(186,230,253,0.7);
          letter-spacing: .05em;
          text-transform: uppercase;
          margin-bottom: .5rem;
        }

        .campo-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .campo-icono {
          position: absolute;
          left: 14px;
          color: rgba(190,21,34,0.5);
          display: flex;
          pointer-events: none;
        }

        .campo-input {
          width: 100%;
          height: 52px;
          padding: 0 44px 0 46px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: #f0f9ff;
          font-size: 1rem;
          font-family: 'Courier New', monospace;
          letter-spacing: .08em;
          outline: none;
          transition: border-color .2s, background .2s, box-shadow .2s;
        }

        .campo-input::placeholder { color: rgba(186,230,253,0.25); letter-spacing: .02em; font-family: 'Segoe UI', sans-serif; }

        .campo-input:focus {
          border-color: rgba(190,21,34,0.5);
          background: rgba(190,21,34,0.06);
          box-shadow: 0 0 0 3px rgba(190,21,34,0.1);
        }

        .campo-clear {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: rgba(186,230,253,0.4);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          display: flex;
          transition: color .15s;
        }
        .campo-clear:hover { color: rgba(186,230,253,0.8); }

        /* Botón principal */
        .btn-consultar {
          width: 100%;
          height: 52px;
          margin-top: .5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: .6rem;
          background: linear-gradient(135deg, #be1522, #7b0d15);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: .95rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity .2s, transform .15s, box-shadow .2s;
          box-shadow: 0 4px 20px rgba(190,21,34,0.4);
        }

        .btn-consultar:hover:not(:disabled) {
          opacity: .9;
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(190,21,34,0.5);
        }

        .btn-consultar:active:not(:disabled) { transform: translateY(0); }

        .btn-consultar:disabled {
          opacity: .35;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* Spinner */
        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: girar .7s linear infinite;
        }

        /* Resultado */
        .resultado-card {
          margin-top: 1.5rem;
          border-radius: 14px;
          padding: 1.25rem;
          animation: aparecer .35s ease both;
          border: 1px solid;
        }

        .resultado-activo {
          background: rgba(15,118,110,0.12);
          border-color: rgba(15,118,110,0.3);
        }

        .resultado-inactivo {
          background: rgba(153,27,27,0.1);
          border-color: rgba(153,27,27,0.3);
        }

        .resultado-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: .75rem;
        }

        .resultado-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: .75rem;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 99px;
          letter-spacing: .04em;
          text-transform: uppercase;
        }

        .badge-activo {
          background: rgba(20,184,166,0.2);
          color: #5eead4;
          border: 1px solid rgba(20,184,166,0.3);
        }

        .badge-inactivo {
          background: rgba(239,68,68,0.15);
          color: #fca5a5;
          border: 1px solid rgba(239,68,68,0.3);
        }

        .resultado-cedula {
          font-size: .78rem;
          color: rgba(186,230,253,0.4);
          font-family: 'Courier New', monospace;
        }

        .resultado-nombre {
          font-size: 1.15rem;
          font-weight: 700;
          color: #f0f9ff;
          margin-bottom: 1rem;
          letter-spacing: -.01em;
        }

        .resultado-detalles {
          display: flex;
          flex-direction: column;
          gap: .5rem;
          margin-bottom: .75rem;
        }

        .detalle-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: .5rem .75rem;
          background: rgba(255,255,255,0.04);
          border-radius: 8px;
        }

        .detalle-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: .82rem;
          color: rgba(186,230,253,0.55);
        }

        .detalle-valor {
          font-size: .85rem;
          font-weight: 600;
          color: #bae6fd;
        }

        .alerta-vencimiento {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(245,158,11,0.12);
          border: 1px solid rgba(245,158,11,0.3);
          border-radius: 8px;
          padding: .6rem .9rem;
          font-size: .82rem;
          color: #fde68a;
          margin-bottom: .75rem;
        }

        /* Error */
        .error-card {
          margin-top: 1.5rem;
          border-radius: 14px;
          padding: 1.25rem;
          background: rgba(127,29,29,0.15);
          border: 1px solid rgba(153,27,27,0.3);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: .75rem;
          text-align: center;
          animation: aparecer .35s ease both;
        }

        .error-icono {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: rgba(239,68,68,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fca5a5;
        }

        .error-texto {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .error-texto strong {
          font-size: .95rem;
          color: #fca5a5;
        }

        .error-texto span {
          font-size: .82rem;
          color: rgba(252,165,165,0.65);
        }

        /* Botón secundario */
        .btn-nueva {
          width: 100%;
          padding: .6rem;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 9px;
          color: rgba(186,230,253,0.7);
          font-size: .82rem;
          cursor: pointer;
          transition: background .2s, color .2s;
          margin-top: .25rem;
        }

        .btn-nueva:hover {
          background: rgba(255,255,255,0.1);
          color: #bae6fd;
        }

        /* Footer */
        .pie {
          text-align: center;
          animation: deslizar .5s .2s ease both;
        }

        .pie p {
          font-size: .73rem;
          color: rgba(186,230,253,0.25);
          letter-spacing: .02em;
        }

        /* Animaciones */
        @keyframes deslizar {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes aparecer {
          from { opacity: 0; transform: scale(.97); }
          to   { opacity: 1; transform: scale(1); }
        }

        @keyframes girar {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .tarjeta-inner { padding: 1.5rem; }
        }
      `}</style>
    </main>
  )
}