// src/screens/convenios/ConveniosScreen.tsx
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../../lib/theme'

const URL = process.env.EXPO_PUBLIC_CONVENIOS_URL ?? 'https://aseduis.edu.co/convenios'

const CATS = [
  { emoji:'🏥', label:'Salud',        count:12 },
  { emoji:'🎓', label:'Educación',    count:8  },
  { emoji:'⚽', label:'Deporte',      count:5  },
  { emoji:'💻', label:'Tecnología',   count:6  },
  { emoji:'🍽', label:'Restaurantes', count:9  },
  { emoji:'🚌', label:'Transporte',   count:4  },
]

export default function ConveniosScreen() {
  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Convenios</Text>
        <Text style={s.headerSub}>Beneficios exclusivos para egresados</Text>
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.hero}>
          <Text style={s.heroEmoji}>🏢</Text>
          <Text style={s.heroTitle}>Convenios institucionales</Text>
          <Text style={s.heroDesc}>Descuentos y beneficios negociados exclusivamente para ti como egresado</Text>
        </View>
        <TouchableOpacity style={s.mainBtn} onPress={() => Linking.openURL(URL)}>
          <Text style={s.mainBtnText}>🌐  Ver todos los convenios</Text>
          <Text style={s.arrow}>↗</Text>
        </TouchableOpacity>
        <Text style={s.secLabel}>Categorías disponibles</Text>
        <View style={s.grid}>
          {CATS.map(c => (
            <TouchableOpacity key={c.label} style={s.catCard} onPress={() => Linking.openURL(URL)}>
              <Text style={s.catEmoji}>{c.emoji}</Text>
              <Text style={s.catLabel}>{c.label}</Text>
              <Text style={s.catCount}>{c.count} convenios</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={s.nota}>
          <Text style={s.notaText}>ℹ  Los convenios se gestionan desde el sitio web institucional. Se abrirá en tu navegador.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root:       { flex:1, backgroundColor: colors.primaryLight },
  header:     { backgroundColor: colors.primary, paddingTop:12, paddingBottom:16, paddingHorizontal:20 },
  headerTitle:{ color:'#fff', fontSize:18, fontWeight:'700' },
  headerSub:  { color:'rgba(255,255,255,0.65)', fontSize:11, marginTop:3 },
  scroll:     { padding:16 },
  hero:       { backgroundColor: colors.primary, borderRadius:16, padding:20, alignItems:'center', marginBottom:14 },
  heroEmoji:  { fontSize:36, marginBottom:8 },
  heroTitle:  { color:'#fff', fontSize:17, fontWeight:'700', marginBottom:6 },
  heroDesc:   { color:'rgba(255,255,255,0.75)', fontSize:12, textAlign:'center', lineHeight:18 },
  mainBtn:    { backgroundColor:'#fff', borderRadius:14, padding:16, flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:18, borderWidth:1, borderColor: colors.primaryBorder },
  mainBtnText:{ fontSize:14, fontWeight:'700', color: colors.primary },
  arrow:      { fontSize:20, color: colors.primary },
  secLabel:   { fontSize:11, fontWeight:'700', color: colors.textMuted, textTransform:'uppercase', letterSpacing:0.5, marginBottom:10 },
  grid:       { flexDirection:'row', flexWrap:'wrap', gap:10, marginBottom:14 },
  catCard:    { width:'30.5%', backgroundColor:'#fff', borderRadius:14, padding:12, alignItems:'center', gap:5, borderWidth:0.5, borderColor: colors.primaryBorder },
  catEmoji:   { fontSize:26 },
  catLabel:   { fontSize:11, fontWeight:'600', color: colors.textPrimary, textAlign:'center' },
  catCount:   { fontSize:9, color: colors.textMuted },
  nota:       { backgroundColor:'#fff', borderRadius:12, padding:14, borderWidth:0.5, borderColor: colors.primaryBorder },
  notaText:   { fontSize:12, color: colors.textSecondary, lineHeight:18 },
})
