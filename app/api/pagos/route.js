/*import { NextResponse } from 'next/server'
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
}*/

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request) {
  try {
    const body = await request.json()

    const { egresado_id, monto, observaciones, email, dias } = body

    console.log("BODY:", body)

    // 🔐 Validación admin
    if (email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
    }

    if (!egresado_id) {
      return NextResponse.json(
        { error: 'ID de egresado requerido.' },
        { status: 400 }
      )
    }

    // 🔍 1. Obtener fecha actual del egresado
    const { data: egresado, error: errorEgresado } = await supabaseAdmin
      .from('egresados')
      .select('fecha_vencimiento')
      .eq('id', egresado_id)
      .single()

    if (errorEgresado) {
      return NextResponse.json(
        { error: errorEgresado.message },
        { status: 500 }
      )
    }

    // 🧠 2. Calcular nueva fecha
    const diasSumar = dias || 365

    let fechaBase = egresado.fecha_vencimiento
      ? new Date(egresado.fecha_vencimiento)
      : new Date()

    // 👉 Si ya venció, empieza desde hoy
    const hoy = new Date()
    if (fechaBase < hoy) {
      fechaBase = hoy
    }

    fechaBase.setDate(fechaBase.getDate() + diasSumar)

    // 💾 3. Actualizar egresado
    const { error: errorUpdate } = await supabaseAdmin
      .from('egresados')
      .update({
        fecha_vencimiento: fechaBase.toISOString(),
        estado: 'Activo'
      })
      .eq('id', egresado_id)

    if (errorUpdate) {
      return NextResponse.json(
        { error: errorUpdate.message },
        { status: 500 }
      )
    }

    // 💾 4. Registrar pago
    const { data, error } = await supabaseAdmin
      .from('pagos')
      .insert({
        egresado_id,
        monto: monto || 0,
        observaciones: observaciones || `Renovación por ${diasSumar} días`
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // ✅ Respuesta final
    return NextResponse.json({
      success: true,
      mensaje: `Vigencia extendida ${diasSumar} días correctamente.`,
      pago: data
    })

  } catch (err) {
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}