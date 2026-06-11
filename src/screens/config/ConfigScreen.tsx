// src/screens/config/ConfigScreen.tsx
import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../hooks/useAuth'
import { colors } from '../../lib/theme'

function Row({ emoji, label, sub, last }: { emoji:string; label:string; sub?:string; last?:boolean }) {
  return (
    <View style={[r.wrap, last && r.last]}>
      <View style={r.icon}><Text style={r.iconTxt}>{emoji}</Text></View>
      <View style={r.txt}><Text style={r.lbl}>{label}</Text>{!!sub&&<Text style={r.sub}>{sub}</Text>}</View>
      <Text style={r.arr}>›</Text>
    </View>
  )
}

function SRow({ emoji, label, sub, value, onChange, last }: any) {
  return (
    <View style={[r.wrap, last && r.last]}>
      <View style={r.icon}><Text style={r.iconTxt}>{emoji}</Text></View>
      <View style={r.txt}><Text style={r.lbl}>{label}</Text>{!!sub&&<Text style={r.sub}>{sub}</Text>}</View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary, false: colors.inputBorder }} thumbColor={colors.white}/>
    </View>
  )
}

const r = StyleSheet.create({
  wrap: { flexDirection:'row', alignItems:'center', gap:12, padding:13, borderBottomWidth:0.5, borderBottomColor: colors.primaryLight },
  last: { borderBottomWidth:0 },
  icon: { width:36, height:36, borderRadius:10, backgroundColor: colors.primaryTint, alignItems:'center', justifyContent:'center' },
  iconTxt:{ fontSize:18 },
  txt:  { flex:1 },
  lbl:  { fontSize:13, fontWeight:'500', color: colors.textPrimary },
  sub:  { fontSize:11, color: colors.textMuted, marginTop:1 },
  arr:  { fontSize:20, color: colors.textMuted },
})

export default function ConfigScreen() {
  const { egresado, rol, signOut } = useAuth()
  const [notif,   setNotif]   = useState(true)
  const [oscuro,  setOscuro]  = useState(false)
  const [privado, setPrivado] = useState(true)

  const nombre   = egresado?.nombre_completo ?? 'Usuario'
  const initials = nombre.split(' ').slice(0,2).map((n:string)=>n[0]).join('')

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Configuración</Text>
        <Text style={s.headerSub}>Ajustes de tu cuenta</Text>
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        {/* Perfil */}
        <View style={s.profileCard}>
          <View style={s.av}><Text style={s.avTxt}>{initials}</Text></View>
          <View style={{ flex:1 }}>
            <Text style={s.pName}>{nombre}</Text>
            <Text style={s.pRole}>{rol === 'secretario' ? 'Secretario' : 'Egresado'}</Text>
            {egresado && (
              <View style={s.badge}><Text style={s.badgeTxt}>{egresado.estado}</Text></View>
            )}
          </View>
        </View>

        <Text style={s.secLbl}>Cuenta</Text>
        <View style={s.card}>
          <Row emoji="🔒" label="Cambiar contraseña" sub="Actualiza tu clave" />
          <Row emoji="✉️" label="Correo electrónico"  sub={egresado?.email ?? ''} />
          <Row emoji="📱" label="Teléfono"             sub={egresado?.telefono ?? 'No registrado'} last />
        </View>

        <Text style={s.secLbl}>Preferencias</Text>
        <View style={s.card}>
          <SRow emoji="🔔" label="Notificaciones"   sub="Alertas de vencimiento"    value={notif}   onChange={setNotif} />
          <SRow emoji="🌙" label="Modo oscuro"       sub="Cambiar apariencia"         value={oscuro}  onChange={setOscuro} />
          <SRow emoji="🔐" label="Privacidad"        sub="Solo visible a secretarios" value={privado} onChange={setPrivado} last />
        </View>

        <Text style={s.secLbl}>Soporte</Text>
        <View style={s.card}>
          <Row emoji="❓" label="Centro de ayuda"       sub="Preguntas frecuentes" />
          <Row emoji="💬" label="Contactar institución"  sub="Reportar un problema" />
          <Row emoji="📄" label="Términos y privacidad"  last />
        </View>

        <Text style={s.version}>Versión 1.0.0 · App Egresados ASEDUIS</Text>

        <TouchableOpacity style={s.logoutBtn} onPress={signOut}>
          <Text style={s.logoutTxt}>⬅  Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root:       { flex:1, backgroundColor: colors.primaryLight },
  header:     { backgroundColor: colors.primary, paddingTop:12, paddingBottom:16, paddingHorizontal:20 },
  headerTitle:{ color:'#fff', fontSize:18, fontWeight:'700' },
  headerSub:  { color:'rgba(255,255,255,0.65)', fontSize:11, marginTop:3 },
  scroll:     { padding:14 },
  profileCard:{ backgroundColor:'#fff', borderRadius:16, padding:16, flexDirection:'row', alignItems:'center', gap:14, marginBottom:12, borderWidth:0.5, borderColor: colors.primaryBorder },
  av:         { width:52, height:52, backgroundColor: colors.primaryTint, borderRadius:26, alignItems:'center', justifyContent:'center', borderWidth:2, borderColor: colors.primaryBorder },
  avTxt:      { fontSize:18, fontWeight:'700', color: colors.primary },
  pName:      { fontSize:14, fontWeight:'700', color: colors.textPrimary },
  pRole:      { fontSize:11, color: colors.textMuted, marginTop:2 },
  badge:      { backgroundColor: colors.primaryTint, borderRadius:20, paddingHorizontal:10, paddingVertical:2, alignSelf:'flex-start', marginTop:5, borderWidth:1, borderColor: colors.primaryBorder },
  badgeTxt:   { fontSize:10, color: colors.primary, fontWeight:'700' },
  secLbl:     { fontSize:11, fontWeight:'700', color: colors.textMuted, textTransform:'uppercase', letterSpacing:0.5, marginBottom:8, paddingHorizontal:2 },
  card:       { backgroundColor:'#fff', borderRadius:16, borderWidth:0.5, borderColor: colors.primaryBorder, overflow:'hidden', marginBottom:12 },
  version:    { textAlign:'center', fontSize:11, color: colors.textMuted, marginVertical:10 },
  logoutBtn:  { backgroundColor:'#fff', borderRadius:14, borderWidth:0.5, borderColor: colors.primaryBorder, padding:16, alignItems:'center', marginBottom:24 },
  logoutTxt:  { fontSize:14, fontWeight:'700', color: colors.primary },
})
