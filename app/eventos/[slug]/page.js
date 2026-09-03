'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { getEvento } from '@/lib/eventos'

export default function EventoPage() {
  const { slug } = useParams()
  const evento = getEvento(slug)

  const [cedula, setCedula] = useState('')
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [consultado, setConsultado] = useState(false)

  const consultar = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')
    setResultado(null)
    setConsultado(false)

    try {
      const res = await fetch(`/api/consultar?cedula=${cedula}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        setResultado({ estado: 'Inactivo' }) // no encontrado = tratar como no asociado
      } else {
        setResultado(data)
      }
    } catch {
      setError('Ocurrió un error al consultar. Intenta de nuevo.')
    }

    setConsultado(true)
    setCargando(false)
  }

  const esAsociado = resultado?.estado === 'Activo'

  const mensajeWhatsapp = evento
    ? encodeURIComponent(
        `Hola, no soy asociado de ASEDUIS.\n\nMi nombre completo es: \nMi vínculo con la UIS es (egresado/estudiante/docente, programa, año): \n\nEstoy interesado(a) en el evento "${evento.nombre}".`
      )
    : ''

  const styles = {
    page: { minHeight: '100vh', background: '#f4f4f5', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '52px 20px 64px', fontFamily: '"Geist", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
    wrapper: { width: '100%', maxWidth: 560 },
    brand: { textAlign: 'center', marginBottom: 28 },
    eventTitle: { fontSize: 22, fontWeight: 700, color: '#09090b', letterSpacing: '-0.02em', margin: '0 0 4px' },
    eventSub: { fontSize: 14, color: '#be1522', fontWeight: 600, margin: '0 0 10px' },
    eventMeta: { fontSize: 13, color: '#71717a', margin: '2px 0' },
    card: { background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 14, padding: '22px 22px 20px', marginBottom: 10 },
    fieldLabel: { display: 'block', fontSize: 11, fontWeight: 600, color: '#52525b', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 },
    form: { display: 'flex', flexDirection: 'column', gap: 10 },
    input: { width: '100%', padding: '11px 14px', fontSize: 15, fontFamily: '"Geist Mono", monospace', letterSpacing: '0.04em', border: '1px solid #d4d4d8', borderRadius: 9, boxSizing: 'border-box', outline: 'none', color: '#09090b', background: '#fafafa' },
    button: { width: '100%', padding: '11px', fontSize: 14, fontWeight: 500, background: '#be1522', color: '#fff', border: '1px solid transparent', borderRadius: 9, cursor: 'pointer' },
    resultCard: (ok) => ({ background: ok ? '#f0fdf4' : '#fffaf0', border: `1px solid ${ok ? '#bbf7d0' : '#fed7aa'}`, borderRadius: 16, padding: '24px 22px', marginBottom: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }),
    statusHeader: { display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
    statusIcon: (ok) => ({ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: ok ? '#dcfce7' : '#fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }),
    statusTitle: (ok) => ({ fontSize: 16, fontWeight: 700, color: ok ? '#166534' : '#9a3412', margin: '4px 0 0' }),
    statusSub: { fontSize: 13.5, color: '#52525b', lineHeight: 1.55, margin: '0 0 20px' },
    couponBox: { marginTop: 4, padding: '14px', background: '#dcfce7', border: '1px dashed #86efac', borderRadius: 9, textAlign: 'center' },
    couponLabel: { fontSize: 11, color: '#166534', fontWeight: 600, margin: '0 0 4px' },
    couponCode: { fontSize: 19, fontWeight: 700, color: '#166534', fontFamily: '"Geist Mono", monospace', letterSpacing: '0.05em' },
    ctaButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px', fontSize: 14, fontWeight: 600, background: '#be1522', color: '#fff', borderRadius: 10, textDecoration: 'none', boxSizing: 'border-box', marginTop: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.08)' },
    ctaButtonOutline: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px', fontSize: 14, fontWeight: 600, background: '#ffffff', color: '#be1522', borderRadius: 10, textDecoration: 'none', boxSizing: 'border-box', border: '1.5px solid #be1522', marginTop: 10 },
    whatsappButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px', fontSize: 14, fontWeight: 600, background: '#25D366', color: '#fff', borderRadius: 10, textDecoration: 'none', boxSizing: 'border-box', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' },
    eventImageWrap: { width: '100%', aspectRatio: '2172 / 724', overflow: 'hidden', borderRadius: 14, marginBottom: 18 },
    eventImage: { width: '100%', height: '110%', objectFit: 'cover', objectPosition: 'center 40%', display: 'block' },
    tituloDescuentoBadge: { display: 'inline-block', fontSize: 12, fontWeight: 700, color: '#166534', background: '#dcfce7', border: '1px solid #86efac', padding: '6px 14px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '4px 0 14px' },
    footer: { textAlign: 'center', fontSize: 12, color: '#a1a1aa', marginTop: 24 },
  }

  if (!evento) {
    return (
      <main style={styles.page}>
        <div style={styles.wrapper}>
          <p>Evento no encontrado.</p>
        </div>
      </main>
    )
  }

  return (
    <main style={styles.page}>
      <div style={styles.wrapper}>
        <div style={styles.brand}>
          {evento.imagen && (
            <div style={styles.eventImageWrap}>
              <img src={evento.imagen} alt={evento.nombre} style={styles.eventImage} />
            </div>
          )}
          {evento.tituloDescuento && (
            <div style={styles.tituloDescuentoBadge}>{evento.tituloDescuento}</div>
          )}
          <h1 style={styles.eventTitle}>{evento.nombre}</h1>
          <p style={styles.eventSub}>{evento.subtitulo}</p>
          <p style={styles.eventMeta}>{evento.lugar}</p>
          <p style={styles.eventMeta}>{evento.fecha}</p>
        </div>

        <div style={styles.card}>
          <label style={styles.fieldLabel}>Verifica tu descuento — Número de cédula</label>
          <form onSubmit={consultar} style={styles.form}>
            <input
              type="text"
              placeholder="Ej: 1098765432"
              value={cedula}
              onChange={e => setCedula(e.target.value.replace(/\D/g, ''))}
              maxLength={12}
              style={styles.input}
            />
            <button type="submit" disabled={cargando || !cedula} style={styles.button}>
              {cargando ? 'Consultando...' : 'Verificar'}
            </button>
          </form>
        </div>

        {consultado && esAsociado && (
          <div style={styles.resultCard(true)}>
            <div style={styles.statusHeader}>
              <div style={styles.statusIcon(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              </div>
              <div>
                <p style={styles.statusTitle(true)}>Eres asociado ASEDUIS</p>
              </div>
            </div>
            <p style={styles.statusSub}>
              {resultado.nombre_completo} — tienes {evento.descuentoAsociado}% de descuento
            </p>

            <div style={styles.couponBox}>
              <p style={styles.couponLabel}>Aplica este código en la boletería</p>
              <p style={styles.couponCode}>{evento.cuponAsociado}</p>
            </div>

            <a href={evento.ticketUrl} target="_blank" rel="noopener noreferrer" style={styles.ctaButton}>
              Comprar boletas
            </a>
          </div>
        )}

        {consultado && !esAsociado && (
          <div style={styles.resultCard(false)}>
            <div style={styles.statusHeader}>
              <div style={styles.statusIcon(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9a3412" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                </svg>
              </div>
              <div>
                <p style={styles.statusTitle(false)}>No eres asociado ASEDUIS</p>
              </div>
            </div>
            <p style={styles.statusSub}>
              Si eres egresado UIS puedes aplicar a un descuento del 10%. Cuéntanos tu nombre completo y tu vínculo con la UIS para verificarlo por WhatsApp.
            </p>
            <a href={`https://wa.me/${evento.whatsappNumero}?text=${mensajeWhatsapp}`} target="_blank" rel="noopener noreferrer" style={styles.whatsappButton}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm5.83 14.13c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.13.11-1.82-.11-.42-.14-.96-.32-1.65-.62-2.9-1.25-4.79-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-3 0-1.43.75-2.13 1.02-2.42.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.81 2.01.88 2.15.07.15.12.32.02.51-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.56.16.28.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.44.12.6-.07.17-.19.71-.83.9-1.11.19-.28.38-.24.63-.14.26.09 1.64.77 1.92.91.28.14.47.21.54.33.07.12.07.68-.17 1.36z"/></svg>
              Escribir por WhatsApp
            </a>
            <a href={evento.ticketUrl} target="_blank" rel="noopener noreferrer" style={styles.ctaButtonOutline}>
              Comprar boleta sin descuento
            </a>
          </div>
        )}
        <footer style={styles.footer}>
          <span>Copyright © 2026 • Diseñado y Desarrollado por Alejandro Sierra</span>
        </footer>
      </div>
    </main>
  )
}
