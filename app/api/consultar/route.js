import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const cedula = searchParams.get('cedula')?.trim()

  if (!cedula || !/^\d{6,12}$/.test(cedula)) {
    return NextResponse.json(
      { error: 'Cédula inválida. Debe contener entre 6 y 12 dígitos.' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('egresados')
    .select('nombre_completo, cedula, estado, fecha_vencimiento')
    .eq('cedula', cedula)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: 'Egresado no encontrado.' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    nombre_completo: data.nombre_completo,
    cedula: data.cedula,
    estado: data.estado,
    vigente_hasta: data.fecha_vencimiento
      ? new Date(data.fecha_vencimiento).toLocaleDateString('es-CO')
      : null,
  })
}