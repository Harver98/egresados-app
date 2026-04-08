import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

async function verificarAdmin(request) {
  const cookieStore = cookies()
  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )
  const { data: { session } } = await client.auth.getSession()
  return session?.user?.email === process.env.ADMIN_EMAIL ? session : null
}

export async function POST(request) {
  const session = await verificarAdmin(request)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  const { egresado_id, monto, observaciones } = await request.json()

  if (!egresado_id) {
    return NextResponse.json({ error: 'ID de egresado requerido.' }, { status: 400 })
  }

  // Al insertar en pagos, el TRIGGER en la DB extiende automáticamente la vigencia
  const { data, error } = await supabaseAdmin
    .from('pagos')
    .insert({ egresado_id, monto: monto || 0, observaciones })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    mensaje: 'Pago registrado. Vigencia extendida 365 días.',
    pago: data
  })
}