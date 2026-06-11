// src/screens/qr/ResultadoScreen.tsx
import React from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { colors } from '../../lib/theme'
import { ResultadoValidacion } from '../../types'

const CONFIGS = {
  activo:        { color: '#15803D', fondo: '#DCFCE7', borde: '#BBF7D0', emoji: '✅', titulo: 'Carnet válido' },
  vencido:       { color: '#B45309', fondo: '#FEF3C7', borde: '#FDE68A', emoji: '⚠️', titulo: 'Carnet vencido' },
  inactivo:      { color: '#DC2626', fondo: '#FEE2E2', borde: '#FECACA', emoji: '❌', titulo: 'Carnet no válido' },
  no_encontrado: { color: '#DC2626', fondo: '#FEE2E2', borde: '#FECACA', emoji: '❓', titulo: 'QR no encontrado' },
}

export default function ResultadoScreen() {
  const navigation = useNavigation<any>()
  const route      = useRoute<any>()
  const { resultado } = route.params as { resultado: ResultadoValidacion }
  const cfg = CONFIGS[resultado.resultado]
  const eg  = resultado.egresado

  const initials = eg?.nombre_completo
    .split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() ?? '?'

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Resultado validación</Text>
        <Text style={s.headerSub}>Verificado en tiempo real</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>

        {/* Tarjeta principal */}
        <View style={[s.card, { borderColor: cfg.borde }]}>

          {/* Banda */}
          <View style={[s.top, { backgroundColor: cfg.fondo }]}>
            <Text style={s.topEmoji}>{cfg.emoji}</Text>
            <View>
              <Text style={[s.topTitle, { color: cfg.color }]}>{cfg.titulo}</Text>
              <Text style={[s.topMsg, { color: cfg.color }]}>{resultado.mensaje}</Text>
            </View>
          </View>

          {/* Datos egresado */}
          {eg && (
            <View style={s.body}>
              <View style={[s.avatar, { backgroundColor: cfg.fondo, borderColor: cfg.borde }]}>
                {eg.foto_perfil
                  ? <Image source={{ uri: eg.foto_perfil }} style={s.avatarImg} />
                  : <Text style={[s.avatarText, { color: cfg.color }]}>{initials}</Text>
                }
              </View>
              <View style={s.egInfo}>
                <Text style={s.egName}>{eg.nombre_completo}</Text>
                <Text style={s.egDetail}>CC: {eg.cedula}</Text>
                {eg.empresa && <Text style={s.egDetail}>{eg.empresa}</Text>}
                {eg.cargo   && <Text style={s.egDetail}>{eg.cargo}</Text>}
              </View>
            </View>
          )}

          {/* Footer con hora prominente */}
          <View style={s.footer}>
            <View>
              <Text style={s.footerLabel}>Hora del escaneo</Text>
              <Text style={[s.footerHora, { color: cfg.color }]}>{resultado.hora_scan}</Text>
            </View>
            {eg?.fecha_vencimiento && (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.footerLabel}>Vencimiento</Text>
                <Text style={[s.footerVig, { color: cfg.color }]}>{eg.fecha_vencimiento}</Text>
              </View>
            )}
          </View>
        </View>

        {resultado.resultado === 'no_encontrado' && (
          <View style={s.warnBox}>
            <Text style={s.warnText}>
              Este código QR no está registrado. Repórtalo al administrador del sistema.
            </Text>
          </View>
        )}

        <TouchableOpacity style={s.btn} onPress={() => navigation.goBack()}>
          <Text style={s.btnText}>Escanear otro carnet</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: colors.primaryLight },
  header:     { backgroundColor: colors.primary, paddingTop: 12, paddingBottom: 14, paddingHorizontal: 20 },
  headerTitle:{ color: colors.white, fontSize: 18, fontWeight: '700' },
  headerSub:  { color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 3 },
  scroll:     { padding: 16 },
  card:       { backgroundColor: colors.white, borderRadius: 18, overflow: 'hidden', borderWidth: 2, marginBottom: 14 },
  top:        { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  topEmoji:   { fontSize: 32 },
  topTitle:   { fontSize: 17, fontWeight: '700' },
  topMsg:     { fontSize: 12, marginTop: 2 },
  body:       { padding: 16, flexDirection: 'row', gap: 14, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  avatar:     { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 2, overflow: 'hidden', flexShrink: 0 },
  avatarImg:  { width: '100%', height: '100%' },
  avatarText: { fontSize: 20, fontWeight: '700' },
  egInfo:     { flex: 1 },
  egName:     { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 3 },
  egDetail:   { fontSize: 12, color: colors.textSecondary, marginBottom: 1 },
  footer:     { backgroundColor: '#F9FAFB', borderTopWidth: 1, borderTopColor: '#E5E7EB', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerLabel:{ fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600', marginBottom: 4 },
  footerHora: { fontSize: 28, fontWeight: '700' },
  footerVig:  { fontSize: 14, fontWeight: '700' },
  warnBox:    { backgroundColor: colors.dangerLight, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.dangerBorder, marginBottom: 14 },
  warnText:   { fontSize: 13, color: '#991B1B', lineHeight: 20 },
  btn:        { backgroundColor: colors.primary, borderRadius: 14, padding: 16, alignItems: 'center' },
  btnText:    { color: colors.white, fontSize: 15, fontWeight: '700' },
})
