'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { getEvento, formatoCOP } from '@/lib/eventos'

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
    wrapper: { width: '100%', maxWidth: 460 },
    brand: { textAlign: 'center', marginBottom: 28 },
    eventTitle: { fontSize: 22, fontWeight: 700, color: '#09090b', letterSpacing: '-0.02em', margin: '0 0 4px' },
    eventSub: { fontSize: 14, color: '#be1522', fontWeight: 600, margin: '0 0 10px' },
    eventMeta: { fontSize: 13, color: '#71717a', margin: '2px 0' },
    card: { background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 14, padding: '22px 22px 20px', marginBottom: 10 },
    fieldLabel: { display: 'block', fontSize: 11, fontWeight: 600, color: '#52525b', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 },
    form: { display: 'flex', flexDirection: 'column', gap: 10 },
    input: { width: '100%', padding: '11px 14px', fontSize: 15, fontFamily: '"Geist Mono", monospace', letterSpacing: '0.04em', border: '1px solid #d4d4d8', borderRadius: 9, boxSizing: 'border-box', outline: 'none', color: '#09090b', background: '#fafafa' },
    button: { width: '100%', padding: '11px', fontSize: 14, fontWeight: 500, background: '#be1522', color: '#fff', border: '1px solid transparent', borderRadius: 9, cursor: 'pointer' },
    resultCard: (ok) => ({ background: ok ? '#f0fdf4' : '#fff7ed', border: `1px solid ${ok ? '#bbf7d0' : '#fed7aa'}`, borderRadius: 14, padding: '20px', marginBottom: 10 }),
    statusTitle: (ok) => ({ fontSize: 15, fontWeight: 700, color: ok ? '#166534' : '#9a3412', margin: '0 0 4px' }),
    statusSub: { fontSize: 13, color: '#52525b', margin: '0 0 14px' },
    priceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px dashed #d1fae5' },
    priceName: { fontSize: 13, color: '#166534', fontWeight: 600 },
    priceOld: { fontSize: 12, color: '#a1a1aa', textDecoration: 'line-through', marginRight: 8 },
    priceNew: { fontSize: 15, color: '#166534', fontWeight: 700 },
    couponBox: { marginTop: 14, padding: '10px 14px', background: '#dcfce7', border: '1px dashed #86efac', borderRadius: 9, textAlign: 'center' },
    couponLabel: { fontSize: 10, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 2px' },
    couponCode: { fontSize: 17, fontWeight: 700, color: '#166534', fontFamily: '"Geist Mono", monospace', letterSpacing: '0.05em' },
    ctaButton: { display: 'block', textAlign: 'center', marginTop: 16, width: '100%', padding: '12px', fontSize: 14, fontWeight: 600, background: '#be1522', color: '#fff', borderRadius: 9, textDecoration: 'none' },
    whatsappButton: { display: 'block', textAlign: 'center', marginTop: 16, width: '100%', padding: '12px', fontSize: 14, fontWeight: 600, background: '#25D366', color: '#fff', borderRadius: 9, textDecoration: 'none' },
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
            <p style={styles.statusTitle(true)}>✅ Eres asociado ASEDUIS</p>
            <p style={styles.statusSub}>{resultado.nombre_completo} — tienes {evento.descuentoAsociado}% de descuento</p>

            {evento.localidades.map((loc, i) => {
              const valorConDescuento = Math.round(loc.valor * (1 - evento.descuentoAsociado / 100))
              return (
                <div key={i} style={styles.priceRow}>
                  <span style={styles.priceName}>{loc.nombre}</span>
                  <span>
                    <span style={styles.priceOld}>{formatoCOP(loc.valor)}</span>
                    <span style={styles.priceNew}>{formatoCOP(valorConDescuento)}</span>
                  </span>
                </div>
              )
            })}

            <div style={styles.couponBox}>
              <p style={styles.couponLabel}>Código de cupón</p>
              <p style={styles.couponCode}>{evento.cuponAsociado}</p>
            </div>

            <a href={evento.ticketUrl} target="_blank" rel="noopener noreferrer" style={styles.ctaButton}>
              Comprar boletas
            </a>
          </div>
        )}

        {consultado && !esAsociado && (
          <div style={styles.resultCard(false)}>
            <p style={styles.statusTitle(false)}>No eres asociado ASEDUIS</p>
            <p style={styles.statusSub}>
              Si eres egresado UIS puedes aplicar a un descuento del 10%. Cuéntanos tu nombre completo y tu vínculo con la UIS para verificarlo por WhatsApp.
            </p>
            <a
              href={`https://wa.me/${evento.whatsappNumero}?text=${mensajeWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.whatsappButton}
            >
              Escribir por WhatsApp
            </a>
            <a href={evento.ticketUrl} target="_blank" rel="noopener noreferrer" style={styles.ctaButton}>
              Comprar boleta sin descuento
            </a>
          </div>
        )}
      </div>
    </main>
  )
}