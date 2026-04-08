import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request) {
  try {
    // 🔥 Leer body correctamente
    const body = await request.json()

    const egresado_id = body.egresado_id
    const monto = body.monto
    const observaciones = body.observaciones
    const email = body.email

    // 🧪 Debug (puedes quitar luego)
    console.log("BODY:", body)

    // 🔐 Validación admin
    if (email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
    }

    // ✅ Validación básica
    if (!egresado_id) {
      return NextResponse.json(
        { error: 'ID de egresado requerido.' },
        { status: 400 }
      )
    }

    // 💾 Insertar pago
    const { data, error } = await supabaseAdmin
      .from('pagos')
      .insert({
        egresado_id,
        monto: monto || 0,
        observaciones
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // ✅ Respuesta OK
    return NextResponse.json({
      success: true,
      mensaje: 'Pago registrado. Vigencia extendida 365 días.',
      pago: data
    })

  } catch (err) {
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}