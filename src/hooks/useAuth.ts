// src/hooks/useAuth.ts
import { useState, useEffect, createContext, useContext } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Egresado, RolUsuario } from '../types'

interface AuthContextType {
  session:         Session | null
  user:            User | null
  egresado:        Egresado | null
  rol:             RolUsuario | null
  loading:         boolean
  signIn:          (cedula: string, password: string) => Promise<{ error: string | null }>
  signOut:         () => Promise<void>
  resetPassword:   (cedula: string) => Promise<{ error: string | null }>
  refreshEgresado: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}

export function useAuthProvider(): AuthContextType {
  const [session,  setSession]  = useState<Session | null>(null)
  const [user,     setUser]     = useState<User | null>(null)
  const [egresado, setEgresado] = useState<Egresado | null>(null)
  const [rol,      setRol]      = useState<RolUsuario | null>(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) loadProfile(session.user.id)
        else { setEgresado(null); setRol(null); setLoading(false) }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId: string) {
    try {
      const { data: admin } = await supabase
        .from('administradores').select('id').eq('user_id', userId).single()
      if (admin) { setRol('administrador'); return }

      const { data: sec } = await supabase
        .from('secretarios').select('id').eq('user_id', userId).eq('activo', true).single()
      if (sec) { setRol('secretario'); return }

      const { data: eg } = await supabase
        .from('egresados').select('*').eq('user_id', userId).single()
      if (eg) { setEgresado(eg as Egresado); setRol('egresado') }
    } finally {
      setLoading(false)
    }
  }

  // Login por CÉDULA — busca el email y autentica con él
  async function signIn(cedula: string, password: string) {
    const cedulaNorm = cedula.replace(/[.\s-]/g, '')

    // Buscar en egresados
    const { data: eg } = await supabase
      .from('egresados').select('email').eq('cedula', cedulaNorm).single()
    if (eg) {
      const { error } = await supabase.auth.signInWithPassword({ email: eg.email, password })
      return { error: error?.message ?? null }
    }

    // Buscar en secretarios
    const { data: sec } = await supabase
      .from('secretarios').select('email').eq('cedula', cedulaNorm).single()
    if (sec) {
      const { error } = await supabase.auth.signInWithPassword({ email: sec.email, password })
      return { error: error?.message ?? null }
    }

    // Buscar en administradores
    const { data: adm } = await supabase
      .from('administradores').select('email').eq('cedula', cedulaNorm).single()
    if (adm) {
      const { error } = await supabase.auth.signInWithPassword({ email: adm.email, password })
      return { error: error?.message ?? null }
    }

    return { error: 'Cédula no encontrada en el sistema.' }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setEgresado(null)
    setRol(null)
  }

  async function resetPassword(cedula: string) {
    const cedulaNorm = cedula.replace(/[.\s-]/g, '')
    const { data: eg } = await supabase
      .from('egresados').select('email').eq('cedula', cedulaNorm).single()
    if (!eg) return { error: 'Cédula no encontrada.' }
    const { error } = await supabase.auth.resetPasswordForEmail(eg.email, {
      redirectTo: 'egresadosaseduis://reset-password',
    })
    return { error: error?.message ?? null }
  }

  async function refreshEgresado() {
    if (!user) return
    const { data } = await supabase
      .from('egresados').select('*').eq('user_id', user.id).single()
    if (data) setEgresado(data as Egresado)
  }

  return { session, user, egresado, rol, loading, signIn, signOut, resetPassword, refreshEgresado }
}
