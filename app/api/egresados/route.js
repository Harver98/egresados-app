import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

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
  const { id, estado, cedula, nombre_completo, email } = await request.json()

  if (!id) {
    return NextResponse.json({ error: 'ID requerido.' }, { status: 400 })
  }

  const updates = { updated_at: new Date().toISOString() }

  if (estado !== undefined) {
    if (!['Activo', 'Inactivo'].includes(estado)) {
      return NextResponse.json({ error: 'Estado inválido.' }, { status: 400 })
    }
    updates.estado = estado
  }

  if (cedula !== undefined) updates.cedula = cedula.trim()
  if (nombre_completo !== undefined) updates.nombre_completo = nombre_completo.trim()
  if (email !== undefined) updates.email = email.trim()

  const { data, error } = await supabaseAdmin
    .from('egresados')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ...data, mensaje: 'Egresado actualizado correctamente' })
}

export async function DELETE(request) {
  const { id } = await request.json()

  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('egresados')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ mensaje: 'Egresado eliminado correctamente' })
}