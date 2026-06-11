// src/screens/auth/RecuperarScreen.tsx
import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../hooks/useAuth'
import { colors } from '../../lib/theme'

export default function RecuperarScreen({ navigation }: any) {
  const [cedula,  setCedula]  = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const { resetPassword } = useAuth()

  async function handleReset() {
    if (!cedula.trim()) { Alert.alert('Ingresa tu número de cédula.'); return }
    setLoading(true)
    const { error } = await resetPassword(cedula.trim())
    setLoading(false)
    if (error) Alert.alert('Error', error)
    else setEnviado(true)
  }

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Recuperar contraseña</Text>
      </View>

      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        <View style={s.iconBox}>
          <Text style={s.iconText}>✉️</Text>
        </View>
        <Text style={s.title}>¿Olvidaste tu contraseña?</Text>
        <Text style={s.desc}>
          Ingresa tu número de cédula y te enviaremos un enlace para restablecerla.
        </Text>

        <View style={s.card}>
          <Text style={s.label}>Número de cédula</Text>
          <View style={s.inputRow}>
            <Text style={s.inputIcon}>🪪</Text>
            <TextInput
              style={s.input}
              placeholder="Ej: 1098765432"
              placeholderTextColor={colors.textMuted}
              value={cedula}
              onChangeText={setCedula}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={[s.btn, loading && { opacity: 0.6 }]}
            onPress={handleReset}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={colors.white} />
              : <Text style={s.btnText}>Enviar enlace de recuperación</Text>
            }
          </TouchableOpacity>

          {enviado && (
            <View style={s.successBox}>
              <Text style={s.successText}>
                ✓  Revisa tu correo electrónico. El enlace expira en 60 minutos.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: colors.primaryLight },
  header:     { backgroundColor: colors.primary, paddingTop: 16, paddingBottom: 16, paddingHorizontal: 20 },
  backBtn:    { marginBottom: 8 },
  backText:   { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  headerTitle:{ color: colors.white, fontSize: 18, fontWeight: '700' },
  body:       { padding: 20 },
  iconBox:    { width: 80, height: 80, backgroundColor: colors.white, borderRadius: 40, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16, borderWidth: 2, borderColor: colors.primaryBorder },
  iconText:   { fontSize: 32 },
  title:      { fontSize: 20, fontWeight: '700', color: '#1E1E1E', textAlign: 'center', marginBottom: 8 },
  desc:       { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  card:       { backgroundColor: colors.white, borderRadius: 18, padding: 20, borderWidth: 1, borderColor: colors.primaryBorder },
  label:      { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  inputRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBg, borderWidth: 1.5, borderColor: colors.inputBorder, borderRadius: 12, paddingHorizontal: 14, height: 52 },
  inputIcon:  { fontSize: 18, marginRight: 10 },
  input:      { flex: 1, fontSize: 15, color: colors.textPrimary },
  btn:        { backgroundColor: colors.primary, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 16 },
  btnText:    { color: colors.white, fontSize: 14, fontWeight: '700' },
  successBox: { backgroundColor: colors.successLight, borderRadius: 12, padding: 14, marginTop: 14, borderWidth: 1, borderColor: colors.successBorder },
  successText:{ fontSize: 13, color: colors.success, lineHeight: 20 },
})
