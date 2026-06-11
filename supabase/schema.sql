-- ============================================================
-- SCHEMA COMPLETO — APP EGRESADOS ASEDUIS
-- Pegar en: Supabase → SQL Editor → Run
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.egresados (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cedula            VARCHAR(20) UNIQUE NOT NULL,
  nombre_completo   VARCHAR(200) NOT NULL,
  email             VARCHAR(200) UNIQUE NOT NULL,
  telefono          VARCHAR(20),
  fecha_nacimiento  DATE,
  ciudad_nacimiento VARCHAR(100),
  pais_nacimiento   VARCHAR(100) DEFAULT 'Colombia',
  direccion         TEXT,
  hobbies           TEXT,
  empresa           VARCHAR(200),
  cargo             VARCHAR(200),
  foto_perfil       TEXT,
  qr_uuid           UUID UNIQUE DEFAULT uuid_generate_v4(),
  estado            VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo','vencido','inactivo')),
  fecha_vencimiento DATE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.secretarios (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  cedula          VARCHAR(20) UNIQUE NOT NULL,
  nombre_completo VARCHAR(200) NOT NULL,
  email           VARCHAR(200) UNIQUE NOT NULL,
  activo          BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.administradores (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  cedula          VARCHAR(20) UNIQUE NOT NULL,
  nombre_completo VARCHAR(200) NOT NULL,
  email           VARCHAR(200) UNIQUE NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.validaciones (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  egresado_id     UUID REFERENCES public.egresados(id) ON DELETE SET NULL,
  secretario_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resultado       VARCHAR(20) NOT NULL CHECK (resultado IN ('activo','vencido','inactivo','no_encontrado')),
  hora_validacion TIMESTAMPTZ DEFAULT NOW(),
  fecha           DATE DEFAULT CURRENT_DATE,
  hora            TIME DEFAULT CURRENT_TIME,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER on_egresados_updated  BEFORE UPDATE ON public.egresados  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_secretarios_updated BEFORE UPDATE ON public.secretarios FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.egresados       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secretarios     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.administradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validaciones    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "egresado_ver_propio"    ON public.egresados FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "egresado_editar_propio" ON public.egresados FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "staff_ver_egresados"    ON public.egresados FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.secretarios    WHERE user_id = auth.uid() AND activo = TRUE) OR
  EXISTS (SELECT 1 FROM public.administradores WHERE user_id = auth.uid())
);
CREATE POLICY "admin_todo_egresados"   ON public.egresados FOR ALL USING (
  EXISTS (SELECT 1 FROM public.administradores WHERE user_id = auth.uid())
);
CREATE POLICY "staff_validaciones"     ON public.validaciones FOR ALL USING (
  EXISTS (SELECT 1 FROM public.secretarios    WHERE user_id = auth.uid() AND activo = TRUE) OR
  EXISTS (SELECT 1 FROM public.administradores WHERE user_id = auth.uid())
);
CREATE POLICY "admin_secretarios"      ON public.secretarios FOR ALL USING (
  EXISTS (SELECT 1 FROM public.administradores WHERE user_id = auth.uid())
);
CREATE POLICY "secretario_ver_propio"  ON public.secretarios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admin_admins"           ON public.administradores FOR ALL USING (
  EXISTS (SELECT 1 FROM public.administradores WHERE user_id = auth.uid())
);

CREATE INDEX IF NOT EXISTS idx_egresados_cedula  ON public.egresados(cedula);
CREATE INDEX IF NOT EXISTS idx_egresados_qr_uuid ON public.egresados(qr_uuid);
CREATE INDEX IF NOT EXISTS idx_egresados_estado  ON public.egresados(estado);
CREATE INDEX IF NOT EXISTS idx_validaciones_fecha ON public.validaciones(fecha);
