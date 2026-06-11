// src/screens/profile/PerfilScreen.tsx
import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { colors } from '../../lib/theme'

export default function PerfilScreen() {
  const { egresado, refreshEgresado } = useAuth()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    telefono:          egresado?.telefono          ?? '',
    ciudad_nacimiento: egresado?.ciudad_nacimiento ?? '',
    direccion:         egresado?.direccion         ?? '',
    empresa:           egresado?.empresa           ?? '',
    cargo:             egresado?.cargo             ?? '',
    hobbies:           egresado?.hobbies           ?? '',
  })

  function upd(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') { Alert.alert('Sin permiso para acceder a las fotos.'); return }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.7,
    })
    if (result.canceled || !result.assets[0]) return
    const asset = result.assets[0]
    const ext   = asset.uri.split('.').pop() ?? 'jpg'
    const path  = `${egresado!.id}/perfil.${ext}`
    const res   = await fetch(asset.uri)
    const blob  = await res.blob()
    const { error: upErr } = await supabase.storage
      .from('fotos-egresados').upload(path, blob, { upsert: true, contentType: `image/${ext}` })
    if (upErr) { Alert.alert('Error al subir la foto.'); return }
    const { data: urlData } = supabase.storage.from('fotos-egresados').getPublicUrl(path)
    await supabase.from('egresados').update({ foto_perfil: urlData.publicUrl }).eq('id', egresado!.id)
    await refreshEgresado()
    Alert.alert('✓', 'Foto actualizada.')
  }

  async function guardar() {
    setLoading(true)
    const { error } = await supabase.from('egresados').update(form).eq('id', egresado!.id)
    setLoading(false)
    if (error) Alert.alert('Error', 'No se pudo guardar.')
    else { await refreshEgresado(); Alert.alert('✓', 'Perfil actualizado.') }
  }

  if (!egresado) return null
  const initials = egresado.nombre_completo.split(' ').slice(0,2).map(n=>n[0]).join('')

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.avWrap} onPress={pickPhoto}>
          {egresado.foto_perfil
            ? <Image source={{ uri: egresado.foto_perfil }} style={s.avImg} />
            : <View style={s.avBox}><Text style={s.avText}>{initials}</Text></View>
          }
          <View style={s.camBtn}><Text style={s.camText}>📷</Text></View>
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>Editar perfil</Text>
          <Text style={s.headerSub}>Toca la foto para cambiarla</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.sec}>
          <Text style={s.secTitle}>Información personal</Text>
          <Text style={s.lbl}>Nombre completo</Text>
          <Text style={s.readOnly}>{egresado.nombre_completo}</Text>
          <Text style={s.lbl}>Cédula</Text>
          <Text style={[s.readOnly, s.locked]}>{egresado.cedula} — no editable</Text>
          <Text style={s.lbl}>Teléfono</Text>
          <TextInput style={s.inp} value={form.telefono} onChangeText={v=>upd('telefono',v)} placeholder="+57 300..." placeholderTextColor={colors.textMuted} keyboardType="phone-pad"/>
          <Text style={s.lbl}>Ciudad</Text>
          <TextInput style={s.inp} value={form.ciudad_nacimiento} onChangeText={v=>upd('ciudad_nacimiento',v)} placeholder="Ciudad de nacimiento" placeholderTextColor={colors.textMuted}/>
          <Text style={s.lbl}>Dirección</Text>
          <TextInput style={s.inp} value={form.direccion} onChangeText={v=>upd('direccion',v)} placeholder="Dirección actual" placeholderTextColor={colors.textMuted}/>
        </View>
        <View style={s.sec}>
          <Text style={s.secTitle}>Información laboral</Text>
          <Text style={s.lbl}>Empresa</Text>
          <TextInput style={s.inp} value={form.empresa} onChangeText={v=>upd('empresa',v)} placeholder="Ej: Bancolombia S.A." placeholderTextColor={colors.textMuted}/>
          <Text style={s.lbl}>Cargo</Text>
          <TextInput style={s.inp} value={form.cargo} onChangeText={v=>upd('cargo',v)} placeholder="Ej: Analista" placeholderTextColor={colors.textMuted}/>
        </View>
        <View style={s.sec}>
          <Text style={s.secTitle}>Hobbies</Text>
          <TextInput style={[s.inp,{height:70,textAlignVertical:'top',paddingTop:12}]} value={form.hobbies} onChangeText={v=>upd('hobbies',v)} placeholder="Fotografía, senderismo..." placeholderTextColor={colors.textMuted} multiline/>
        </View>
        <TouchableOpacity style={[s.btn,loading&&{opacity:.6}]} onPress={guardar} disabled={loading}>
          {loading?<ActivityIndicator color="#fff"/>:<Text style={s.btnText}>Guardar cambios</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root:       { flex:1, backgroundColor: colors.primaryLight },
  header:     { backgroundColor: colors.primary, paddingTop:12, paddingBottom:20, paddingHorizontal:20, flexDirection:'row', alignItems:'center', gap:14 },
  avWrap:     { position:'relative', flexShrink:0 },
  avImg:      { width:64, height:64, borderRadius:32, borderWidth:2.5, borderColor:'rgba(255,255,255,0.5)' },
  avBox:      { width:64, height:64, borderRadius:32, backgroundColor:'rgba(255,255,255,0.2)', borderWidth:2.5, borderColor:'rgba(255,255,255,0.5)', alignItems:'center', justifyContent:'center' },
  avText:     { color:'#fff', fontSize:22, fontWeight:'700' },
  camBtn:     { position:'absolute', bottom:-2, right:-2, width:22, height:22, backgroundColor:'#fff', borderRadius:11, alignItems:'center', justifyContent:'center' },
  camText:    { fontSize:11 },
  headerTitle:{ color:'#fff', fontSize:17, fontWeight:'700' },
  headerSub:  { color:'rgba(255,255,255,0.65)', fontSize:11, marginTop:2 },
  scroll:     { padding:14 },
  sec:        { backgroundColor:'#fff', borderRadius:16, borderWidth:0.5, borderColor: colors.primaryBorder, padding:14, marginBottom:12 },
  secTitle:   { fontSize:11, fontWeight:'700', color: colors.primary, textTransform:'uppercase', letterSpacing:0.5, marginBottom:10 },
  lbl:        { fontSize:11, fontWeight:'600', color: colors.textMuted, textTransform:'uppercase', letterSpacing:0.4, marginBottom:4, marginTop:10 },
  readOnly:   { backgroundColor: colors.inputBg, borderWidth:1, borderColor: colors.inputBorder, borderRadius:10, padding:11, fontSize:13, color: colors.textPrimary },
  locked:     { backgroundColor:'#F5F5F5', color: colors.textMuted, borderColor:'#EDE8E8' },
  inp:        { backgroundColor: colors.inputBg, borderWidth:1.5, borderColor: colors.inputBorder, borderRadius:10, paddingHorizontal:14, height:48, fontSize:13, color: colors.textPrimary },
  btn:        { backgroundColor: colors.primary, borderRadius:14, padding:16, alignItems:'center', marginBottom:24 },
  btnText:    { color:'#fff', fontSize:15, fontWeight:'700' },
})
