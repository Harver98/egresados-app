// src/screens/carnet/CarnetScreen.tsx
import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView, Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import QRCode from 'react-native-qrcode-svg'
import { useAuth } from '../../hooks/useAuth'
import { colors, shadows } from '../../lib/theme'

function pad(n: number) { return n.toString().padStart(2, '0') }

function formatHora(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function formatFecha(d: Date) {
  const dias   = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']
  const meses  = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  return `${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`
}

function formatFechaCorta(str: string) {
  const [y, m, d] = str.split('-')
  return `${d}/${m}/${y}`
}

export default function CarnetScreen() {
  const { egresado } = useAuth()
  const [ahora, setAhora] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setAhora(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  if (!egresado) return null

  const qrUrl = `https://egresados.aseduis.edu.co/carnet/${egresado.qr_uuid}`

  const initials = egresado.nombre_completo
    .split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

  const estadoConfig: Record<string, { color: string; fondo: string; borde: string }> = {
    activo:   { color: colors.primary,  fondo: colors.primaryTint,  borde: colors.primaryBorder },
    vencido:  { color: colors.warning,  fondo: colors.warningLight, borde: colors.warningBorder },
    inactivo: { color: colors.danger,   fondo: colors.dangerLight,  borde: colors.dangerBorder  },
  }
  const ec = estadoConfig[egresado.estado] ?? estadoConfig.inactivo

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      {/* Header */}
      <View style={s.topBar}>
        <View>
          <Text style={s.topTitle}>Mi carnet</Text>
          <Text style={s.topSub}>Carnet digital institucional</Text>
        </View>
      </View>

      {/* Reloj en tiempo real */}
      <View style={s.clockBar}>
        <Text style={s.clockTime}>{formatHora(ahora)}</Text>
        <Text style={s.clockDate}>{formatFecha(ahora)}</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={[s.carnet, shadows.card]}>

          {/* Header del carnet */}
          <View style={s.carnetHeader}>
            <View style={s.carnetLogo}>
              <Text style={s.carnetLogoText}>A</Text>
            </View>
            <View>
              <Text style={s.carnetInstName}>ASEDUIS</Text>
              <Text style={s.carnetInstSub}>Carnet de Egresado</Text>
            </View>
          </View>

          {/* Franja */}
          <View style={s.stripe} />

          {/* Cuerpo */}
          <View style={s.carnetBody}>
            <View style={s.photoRow}>
              <View style={s.photoBox}>
                {egresado.foto_perfil
                  ? <Image source={{ uri: egresado.foto_perfil }} style={s.photo} />
                  : <Text style={s.photoInitials}>{initials}</Text>
                }
              </View>
              <View style={s.infoBox}>
                <Text style={s.carnetName}>{egresado.nombre_completo}</Text>
                <View style={s.infoRow}>
                  <Text style={s.infoKey}>Cédula</Text>
                  <Text style={s.infoVal}>{egresado.cedula}</Text>
                </View>
                {egresado.empresa ? (
                  <View style={s.infoRow}>
                    <Text style={s.infoKey}>Empresa</Text>
                    <Text style={s.infoVal}>{egresado.empresa}</Text>
                  </View>
                ) : null}
                {egresado.cargo ? (
                  <View style={s.infoRow}>
                    <Text style={s.infoKey}>Cargo</Text>
                    <Text style={s.infoVal}>{egresado.cargo}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <View style={s.divider} />

            <View style={s.bottomRow}>
              <View>
                <View style={[s.estadoBadge, { backgroundColor: ec.fondo, borderColor: ec.borde }]}>
                  <View style={[s.estadoDot, { backgroundColor: ec.color }]} />
                  <Text style={[s.estadoText, { color: ec.color }]}>
                    {egresado.estado.charAt(0).toUpperCase() + egresado.estado.slice(1)}
                  </Text>
                </View>
                <Text style={s.vigKey}>Vigencia</Text>
                <Text style={[s.vigVal, { color: ec.color }]}>
                  {egresado.fecha_vencimiento
                    ? formatFechaCorta(egresado.fecha_vencimiento)
                    : '—'}
                </Text>
              </View>

              {/* QR único sin datos personales */}
              <View style={s.qrContainer}>
                <View style={s.qrBox}>
                  <QRCode
                    value={qrUrl}
                    size={72}
                    color={colors.primary}
                    backgroundColor={colors.white}
                  />
                </View>
                <Text style={s.qrHint}>Escanear para validar</Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={s.carnetFooter}>
            <Text style={s.footerText}>
              Emitido: {formatFechaCorta(egresado.created_at.split('T')[0])}
            </Text>
            <Text style={[s.footerText, { color: ec.color, fontWeight: '700' }]}>
              Válido hasta: {egresado.fecha_vencimiento
                ? formatFechaCorta(egresado.fecha_vencimiento)
                : '—'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root:           { flex: 1, backgroundColor: colors.primaryLight },
  topBar:         { backgroundColor: colors.primary, paddingTop: 12, paddingBottom: 14, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topTitle:       { color: colors.white, fontSize: 18, fontWeight: '700' },
  topSub:         { color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 2 },
  clockBar:       { backgroundColor: colors.primaryLight, paddingHorizontal: 20, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.primaryBorder },
  clockTime:      { fontSize: 16, fontWeight: '700', color: colors.primary },
  clockDate:      { fontSize: 11, color: colors.textMuted },
  scroll:         { padding: 16, paddingBottom: 32 },
  carnet:         { backgroundColor: colors.white, borderRadius: 18, overflow: 'hidden', borderWidth: 2, borderColor: '#E2E8F0' },
  carnetHeader:   { backgroundColor: colors.primary, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  carnetLogo:     { width: 38, height: 38, backgroundColor: colors.white, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  carnetLogoText: { fontSize: 15, fontWeight: '800', color: colors.primary },
  carnetInstName: { color: colors.white, fontSize: 14, fontWeight: '700' },
  carnetInstSub:  { color: 'rgba(255,255,255,0.65)', fontSize: 10, marginTop: 2 },
  stripe:         { height: 4, backgroundColor: colors.primaryDark },
  carnetBody:     { padding: 16 },
  photoRow:       { flexDirection: 'row', gap: 14, alignItems: 'flex-start', marginBottom: 12 },
  photoBox:       { width: 80, height: 100, backgroundColor: colors.primaryTint, borderRadius: 10, borderWidth: 2, borderColor: colors.primaryBorder, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
  photo:          { width: '100%', height: '100%' },
  photoInitials:  { fontSize: 26, fontWeight: '700', color: colors.primary },
  infoBox:        { flex: 1 },
  carnetName:     { fontSize: 14, fontWeight: '700', color: '#1E1E1E', marginBottom: 8, lineHeight: 20 },
  infoRow:        { marginBottom: 5 },
  infoKey:        { fontSize: 9, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600' },
  infoVal:        { fontSize: 11, color: '#1E293B', fontWeight: '500', marginTop: 1 },
  divider:        { borderTopWidth: 1, borderTopColor: '#F1F5F9', marginVertical: 12 },
  bottomRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  estadoBadge:    { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, alignSelf: 'flex-start' },
  estadoDot:      { width: 6, height: 6, borderRadius: 3 },
  estadoText:     { fontSize: 11, fontWeight: '700' },
  vigKey:         { fontSize: 9, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600', marginTop: 10 },
  vigVal:         { fontSize: 12, fontWeight: '700', marginTop: 2 },
  qrContainer:    { alignItems: 'center' },
  qrBox:          { width: 86, height: 86, backgroundColor: '#FDF8F8', borderWidth: 1.5, borderColor: colors.primaryBorder, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  qrHint:         { fontSize: 9, color: colors.textMuted, marginTop: 4 },
  carnetFooter:   { backgroundColor: '#FDF8F8', borderTopWidth: 1, borderTopColor: colors.primaryBorder, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between' },
  footerText:     { fontSize: 10, color: colors.textMuted },
})
