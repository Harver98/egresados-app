// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../hooks/useAuth'
import { colors } from '../../lib/theme'

export default function LoginScreen({ navigation }: any) {
  const [cedula,   setCedula]   = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const { signIn } = useAuth()

  async function handleLogin() {
    if (!cedula.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Ingresa tu cédula y contraseña.')
      return
    }
    setLoading(true)
    const { error } = await signIn(cedula.trim(), password)
    setLoading(false)
    if (error) Alert.alert('Error al ingresar', error)
  }

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          <View style={s.header}>
            <View style={s.logoCircle}>
              <Text style={s.logoText}>A</Text>
            </View>
            <Text style={s.title}>ASEDUIS</Text>
            <Text style={s.subtitle}>Carnet Digital de Egresados</Text>
          </View>

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
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>

            <Text style={s.label}>Contraseña</Text>
            <View style={s.inputRow}>
              <Text style={s.inputIcon}>🔒</Text>
              <TextInput
                style={[s.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={s.eyeBtn}>
                <Text style={s.eyeText}>{showPass ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={s.forgotBtn}
              onPress={() => navigation.navigate('Recuperar')}
            >
              <Text style={s.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.btn, loading && s.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={colors.white} />
                : <Text style={s.btnText}>Ingresar</Text>
              }
            </TouchableOpacity>

            <View style={s.hint}>
              <Text style={s.hintText}>
                ℹ  Ingresa tu cédula sin puntos ni espacios
              </Text>
            </View>
          </View>

          <Text style={s.footer}>¿Problemas para acceder? Contacta a tu institución</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: colors.primaryLight },
  scroll:     { flexGrow: 1 },
  header:     { backgroundColor: colors.primary, paddingTop: 40, paddingBottom: 48, alignItems: 'center', gap: 10 },
  logoCircle: { width: 80, height: 80, backgroundColor: colors.white, borderRadius: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.25)' },
  logoText:   { fontSize: 32, fontWeight: '800', color: colors.primary },
  title:      { fontSize: 24, fontWeight: '800', color: colors.white, letterSpacing: 1 },
  subtitle:   { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  card:       { backgroundColor: colors.white, marginHorizontal: 20, marginTop: -24, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: colors.primaryBorder, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 5 },
  label:      { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6, marginTop: 16 },
  inputRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBg, borderWidth: 1.5, borderColor: colors.inputBorder, borderRadius: 12, paddingHorizontal: 14, height: 52 },
  inputIcon:  { fontSize: 18, marginRight: 10 },
  input:      { flex: 1, fontSize: 15, color: colors.textPrimary },
  eyeBtn:     { padding: 4 },
  eyeText:    { fontSize: 16 },
  forgotBtn:  { alignSelf: 'flex-end', marginTop: 10 },
  forgotText: { fontSize: 13, color: colors.primary, fontWeight: '500' },
  btn:        { backgroundColor: colors.primary, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 20 },
  btnDisabled:{ opacity: 0.6 },
  btnText:    { color: colors.white, fontSize: 16, fontWeight: '700' },
  hint:       { backgroundColor: colors.primaryTint, borderRadius: 10, padding: 12, marginTop: 14, borderWidth: 1, borderColor: colors.primaryBorder },
  hintText:   { fontSize: 12, color: colors.primary, lineHeight: 18 },
  footer:     { textAlign: 'center', padding: 24, fontSize: 12, color: colors.textMuted },
})
