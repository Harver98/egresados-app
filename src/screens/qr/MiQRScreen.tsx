// src/screens/qr/MiQRScreen.tsx
import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import QRCode from 'react-native-qrcode-svg'
import { useAuth } from '../../hooks/useAuth'
import { colors } from '../../lib/theme'

function pad(n: number) { return n.toString().padStart(2, '0') }
function formatHora(d: Date) { return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` }
function formatFecha(d: Date) {
  const dias  = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  return `${dias[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]}`
}

export default function MiQRScreen() {
  const { egresado } = useAuth()
  const [ahora, setAhora] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setAhora(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  if (!egresado) return null

  const qrUrl = `https://egresados.aseduis.edu.co/carnet/${egresado.qr_uuid}`
  const initials = egresado.nombre_completo.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Mi código QR</Text>
        <Text style={s.headerSub}>Muéstralo para que te validen</Text>
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.card}>
          <View style={s.avatarRow}>
            <View style={s.av}>
              <Text style={s.avText}>{initials}</Text>
            </View>
            <View>
              <Text style={s.name}>{egresado.nombre_completo}</Text>
              <Text style={s.ced}>CC {egresado.cedula}</Text>
            </View>
          </View>

          <View style={s.qrBig}>
            <QRCode value={qrUrl} size={190} color={colors.primary} backgroundColor={colors.white} />
          </View>

          {/* Reloj igual al del carnet */}
          <View style={s.clockBox}>
            <Text style={s.clockLabel}>Hora actual</Text>
            <Text style={s.clockTime}>{formatHora(ahora)}</Text>
            <Text style={s.clockDate}>{formatFecha(ahora)}</Text>
          </View>
        </View>

        <View style={s.infoCard}>
          <View style={s.infoRow}>
            <Text style={s.infoKey}>Estado</Text>
            <View style={s.badge}>
              <Text style={s.badgeText}>{egresado.estado}</Text>
            </View>
          </View>
          <View style={[s.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={s.infoKey}>Vencimiento</Text>
            <Text style={s.infoVal}>{egresado.fecha_vencimiento ?? '—'}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: colors.primaryLight },
  header:    { backgroundColor: colors.primary, paddingTop: 12, paddingBottom: 16, paddingHorizontal: 20 },
  headerTitle:{ color: colors.white, fontSize: 18, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 3 },
  scroll:    { padding: 16 },
  card:      { backgroundColor: colors.white, borderRadius: 18, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: colors.primaryBorder, marginBottom: 14 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12, alignSelf: 'stretch', marginBottom: 20 },
  av:        { width: 50, height: 50, backgroundColor: colors.primaryTint, borderRadius: 25, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.primaryBorder },
  avText:    { fontSize: 18, fontWeight: '700', color: colors.primary },
  name:      { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  ced:       { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  qrBig:     { width: 210, height: 210, backgroundColor: colors.white, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.primaryBorder, marginBottom: 20 },
  clockBox:  { alignItems: 'center' },
  clockLabel:{ fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600' },
  clockTime: { fontSize: 28, fontWeight: '700', color: colors.primary },
  clockDate: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  infoCard:  { backgroundColor: colors.white, borderRadius: 14, borderWidth: 1, borderColor: colors.primaryBorder, overflow: 'hidden' },
  infoRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: colors.primaryLight },
  infoKey:   { fontSize: 12, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  infoVal:   { fontSize: 13, color: colors.textPrimary, fontWeight: '500' },
  badge:     { backgroundColor: colors.primaryTint, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: colors.primaryBorder },
  badgeText: { fontSize: 11, color: colors.primary, fontWeight: '700' },
})
