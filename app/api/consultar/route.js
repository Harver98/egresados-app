import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const cedula = searchParams.get('cedula')?.trim()

  if (!cedula || !/^\d{6,12}$/.test(cedula)) {
    return NextResponse.json(
      { error: 'Cédula inválida. Debe contener entre 6 y 12 dígitos.' },
      { status: 400 }
    )
  }

  const { data, error } = await supabaseAdmin
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

  // ✅ Verificar vencimiento en tiempo real
  const ahora = new Date()
  const vencimiento = data.fecha_vencimiento ? new Date(data.fecha_vencimiento) : null
  const estadoReal = vencimiento && vencimiento < ahora ? 'Inactivo' : data.estado

  return NextResponse.json({
    nombre_completo: data.nombre_completo,
    cedula: data.cedula,
    estado: estadoReal,
    vigente_hasta: vencimiento ? vencimiento.toLocaleDateString('es-CO') : null,
  })
}