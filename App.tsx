// App.tsx
import 'react-native-gesture-handler'
import 'react-native-url-polyfill/auto'
import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { ActivityIndicator, View, Text } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { AuthContext, useAuthProvider } from './src/hooks/useAuth'
import { colors } from './src/lib/theme'

import LoginScreen        from './src/screens/auth/LoginScreen'
import RecuperarScreen    from './src/screens/auth/RecuperarScreen'
import CarnetScreen       from './src/screens/carnet/CarnetScreen'
import MiQRScreen         from './src/screens/qr/MiQRScreen'
import PerfilScreen       from './src/screens/profile/PerfilScreen'
import ConveniosScreen    from './src/screens/convenios/ConveniosScreen'
import ConfigScreen       from './src/screens/config/ConfigScreen'
import EscanerScreen      from './src/screens/qr/EscanerScreen'
import ResultadoScreen    from './src/screens/qr/ResultadoScreen'

const Stack = createStackNavigator()
const Tab   = createBottomTabNavigator()

// ── Icono simple con texto ────────────────────────────────────
function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>{emoji}</Text>
  )
}

// ── Tabs Egresado ─────────────────────────────────────────────
function EgresadoTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor:  colors.inputBorder,
          paddingBottom:   8,
          height:          62,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Carnet"
        component={CarnetScreen}
        options={{
          title: 'Carnet',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🪪" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="MiQR"
        component={MiQRScreen}
        options={{
          title: 'Mi QR',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⬛" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Convenios"
        component={ConveniosScreen}
        options={{
          title: 'Convenios',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏢" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Config"
        component={ConfigScreen}
        options={{
          title: 'Config.',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  )
}

// ── Tabs Secretario ───────────────────────────────────────────
function SecretarioStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Escanear"  component={EscanerScreen} />
      <Stack.Screen name="Resultado" component={ResultadoScreen} />
    </Stack.Navigator>
  )
}

function SecretarioTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor:  colors.inputBorder,
          paddingBottom:   8,
          height:          62,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="ValidarTab"
        component={SecretarioStack}
        options={{
          title: 'Validar QR',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📷" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ConfigSec"
        component={ConfigScreen}
        options={{
          title: 'Config.',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  )
}

// ── Navegación raíz ───────────────────────────────────────────
function RootNavigator() {
  const { session, rol, loading } = useAuthProvider()

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          <>
            <Stack.Screen name="Login"     component={LoginScreen} />
            <Stack.Screen name="Recuperar" component={RecuperarScreen} />
          </>
        ) : rol === 'egresado' ? (
          <Stack.Screen name="EgresadoTabs" component={EgresadoTabs} />
        ) : (
          <Stack.Screen name="SecretarioTabs" component={SecretarioTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

// ── Root App ──────────────────────────────────────────────────
export default function App() {
  const auth = useAuthProvider()
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthContext.Provider value={auth}>
          <RootNavigator />
        </AuthContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
