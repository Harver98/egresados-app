// src/screens/qr/EscanerScreen.tsx
import React, { useState, useEffect, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, Vibration,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useNavigation } from '@react-navigation/native'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { colors } from '../../lib/theme'
import { ResultadoValidacion } from '../../types'

function pad(n: number) { return n.toString().padStart(2, '0') }
function formatHora(d: Date) { return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` }
function formatFechaCorta(d: Date) {
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return `${d.getDate()} de ${meses[d.getMonth()]} ${d.getFullYear()}`
}

export default function EscanerScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [activo,    setActivo]    = useState(true)
  const [ahora,     setAhora]     = useState(new Date())
  const navigation = useNavigation<any>()
  const { user }   = useAuth()
  const cooldown   = useRef(false)

  useEffect(() => {
    const t = setInterval(() => setAhora(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  async function handleQR({ data }: { data: string }) {
    if (!activo || cooldown.current) return
    cooldown.current = true
    setActivo(false)
    Vibration.vibrate(80)

    const horaScan    = new Date()
    const horaScanStr = formatHora(horaScan)

    // Extraer UUID del URL
    const partes  = data.split('/')
    const qrUuid  = partes[partes.length - 1]
    const uuidReg = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    if (!uuidReg.test(qrUuid)) {
      await guardarValidacion(null, 'no_encontrado', horaScan)
      navigation.navigate('Resultado', {
        resultado: {
          resultado: 'no_encontrado',
          hora_scan: horaScanStr,
          mensaje:   'Código QR no registrado en el sistema.',
        } as ResultadoValidacion,
      })
      return
    }

    const { data: egresado } = await supabase
      .from('egresados').select('*').eq('qr_uuid', qrUuid).single()

    if (!egresado) {
      await guardarValidacion(null, 'no_encontrado', horaScan)
      navigation.navigate('Resultado', {
        resultado: {
          resultado: 'no_encontrado',
          hora_scan: horaScanStr,
          mensaje:   'Código QR no encontrado en el sistema.',
        } as ResultadoValidacion,
      })
      return
    }

    const resultado = egresado.estado as 'activo' | 'vencido' | 'inactivo'
    const mensajes  = {
      activo:   'Carnet válido y vigente.',
      vencido:  'Carnet vencido. Requiere renovación.',
      inactivo: 'Carnet suspendido o inactivo.',
    }

    await guardarValidacion(egresado.id, resultado, horaScan)
    navigation.navigate('Resultado', {
      resultado: {
        resultado,
        egresado,
        hora_scan: horaScanStr,
        mensaje:   mensajes[resultado],
      } as ResultadoValidacion,
    })
  }

  async function guardarValidacion(egresadoId: string | null, resultado: string, hora: Date) {
    await supabase.from('validaciones').insert({
      egresado_id:    egresadoId,
      secretario_id:  user?.id,
      resultado,
      hora_validacion: hora.toISOString(),
      fecha: `${hora.getFullYear()}-${pad(hora.getMonth()+1)}-${pad(hora.getDate())}`,
      hora:  formatHora(hora),
    })
  }

  function reiniciar() {
    cooldown.current = false
    setActivo(true)
  }

  if (!permission) {
    return <View style={s.center}><Text style={s.centerText}>Cargando cámara...</Text></View>
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={s.root} edges={['top']}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Validar carnet</Text>
        </View>
        <View style={s.center}>
          <Text style={s.centerText}>📷  Sin acceso a la cámara</Text>
          <Text style={s.centerSub}>Ve a Configuración → Permisos → Cámara</Text>
          <TouchableOpacity style={s.permBtn} onPress={requestPermission}>
            <Text style={s.permBtnText}>Dar permiso</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Validar carnet</Text>
        <Text style={s.headerSub}>Apunta la cámara al código QR del egresado</Text>
      </View>

      <View style={s.cameraWrap}>
        {activo && (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={handleQR}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          />
        )}
        <View style={s.overlay}>
          <View style={s.frame}>
            <View style={[s.corner, s.tl]} />
            <View style={[s.corner, s.tr]} />
            <View style={[s.corner, s.bl]} />
            <View style={[s.corner, s.br]} />
          </View>
          <Text style={s.scanHint}>Mantén el QR dentro del marco</Text>
        </View>
      </View>

      {/* Reloj del escaneo */}
      <View style={s.clockBar}>
        <View>
          <Text style={s.clockLabel}>Hora del escaneo</Text>
          <Text style={s.clockTime}>{formatHora(ahora)}</Text>
        </View>
        <Text style={s.clockDate}>{formatFechaCorta(ahora)}</Text>
      </View>

      {!activo && (
        <TouchableOpacity style={s.reiniciarBtn} onPress={reiniciar}>
          <Text style={s.reiniciarText}>Escanear otro carnet</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  )
}

const C = 22
const W = 3
const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#111' },
  center:        { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryLight, padding: 24 },
  centerText:    { fontSize: 16, color: colors.textPrimary, fontWeight: '600', textAlign: 'center' },
  centerSub:     { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 8 },
  permBtn:       { backgroundColor: colors.primary, borderRadius: 12, padding: 14, marginTop: 20 },
  permBtnText:   { color: colors.white, fontSize: 14, fontWeight: '700' },
  header:        { backgroundColor: colors.primary, paddingTop: 12, paddingBottom: 14, paddingHorizontal: 20 },
  headerTitle:   { color: colors.white, fontSize: 18, fontWeight: '700' },
  headerSub:     { color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 3 },
  cameraWrap:    { flex: 1, position: 'relative' },
  overlay:       { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', gap: 20 },
  frame:         { width: 230, height: 230, position: 'relative' },
  corner:        { position: 'absolute', width: C, height: C, borderColor: colors.primary },
  tl:            { top: 0, left: 0, borderTopWidth: W, borderLeftWidth: W, borderTopLeftRadius: 4 },
  tr:            { top: 0, right: 0, borderTopWidth: W, borderRightWidth: W, borderTopRightRadius: 4 },
  bl:            { bottom: 0, left: 0, borderBottomWidth: W, borderLeftWidth: W, borderBottomLeftRadius: 4 },
  br:            { bottom: 0, right: 0, borderBottomWidth: W, borderRightWidth: W, borderBottomRightRadius: 4 },
  scanHint:      { color: '#ccc', fontSize: 13, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  clockBar:      { backgroundColor: colors.primaryLight, paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.primaryBorder },
  clockLabel:    { fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600', marginBottom: 2 },
  clockTime:     { fontSize: 26, fontWeight: '700', color: colors.primary },
  clockDate:     { fontSize: 12, color: colors.textMuted },
  reiniciarBtn:  { backgroundColor: colors.primary, margin: 16, borderRadius: 14, padding: 16, alignItems: 'center' },
  reiniciarText: { color: colors.white, fontSize: 15, fontWeight: '700' },
})
