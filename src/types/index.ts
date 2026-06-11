// src/types/index.ts
export type EstadoCarnet = 'activo' | 'vencido' | 'inactivo'
export type ResultadoQR  = 'activo' | 'vencido' | 'inactivo' | 'no_encontrado'
export type RolUsuario   = 'egresado' | 'secretario' | 'administrador'

export interface Egresado {
  id:                 string
  user_id?:           string
  cedula:             string
  nombre_completo:    string
  email:              string
  telefono?:          string
  fecha_nacimiento?:  string
  ciudad_nacimiento?: string
  pais_nacimiento?:   string
  direccion?:         string
  hobbies?:           string
  empresa?:           string
  cargo?:             string
  foto_perfil?:       string
  qr_uuid:            string
  estado:             EstadoCarnet
  fecha_vencimiento?: string
  created_at:         string
  updated_at:         string
}

export interface Secretario {
  id:              string
  user_id:         string
  cedula:          string
  nombre_completo: string
  email:           string
  activo:          boolean
  created_at:      string
}

export interface ResultadoValidacion {
  resultado:  ResultadoQR
  egresado?:  Egresado
  hora_scan:  string
  mensaje:    string
}
