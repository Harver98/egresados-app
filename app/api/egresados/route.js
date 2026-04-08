import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('egresados')
    .select('*')
    .order('nombre_completo')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request) {
  const body = await request.json()
  const { cedula, nombre_completo, email } = body

  if (!cedula || !nombre_completo) {
    return NextResponse.json({ error: 'Cédula y nombre son requeridos.' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('egresados')
    .insert({ cedula, nombre_completo, email })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(request) {
  const { id, estado } = await request.json()

  if (!['Activo', 'Inactivo'].includes(estado)) {
    return NextResponse.json({ error: 'Estado inválido.' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('egresados')
    .update({ estado, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}