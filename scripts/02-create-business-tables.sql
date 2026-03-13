-- ============================================================================
-- Business Tables - HR Management System
-- ============================================================================
-- Description: Creates core business tables for employee and project management
-- Dependencies: users table (for created_by foreign keys)
-- Idempotent: Yes - can be run multiple times safely
-- ============================================================================

-- Start transaction for atomicity
BEGIN;

-- ============================================================================
-- TABLE: empleados (Employees)
-- Description: Stores employee personal and employment information
-- ============================================================================
CREATE TABLE IF NOT EXISTS empleados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  dni VARCHAR(20) UNIQUE NOT NULL,
  cuil VARCHAR(13), -- CUIL format: XX-XXXXXXXX-X
  fecha_nacimiento DATE,
  telefono VARCHAR(20),
  email VARCHAR(255),
  direccion TEXT,
  fecha_ingreso DATE NOT NULL,
  fecha_egreso DATE,
  estado VARCHAR(50) DEFAULT 'activo', -- activo, inactivo, suspendido
  tipo_contrato VARCHAR(50), -- planta_permanente, contratado, eventual
  categoria VARCHAR(100), -- oficial, medio_oficial, ayudante, peon
  empresa_tercera VARCHAR(255), -- Only for tipo_contrato = 'contratado'
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  CONSTRAINT chk_estado CHECK (estado IN ('activo', 'inactivo', 'suspendido')),
  CONSTRAINT chk_tipo_contrato CHECK (tipo_contrato IN ('planta_permanente', 'contratado', 'eventual')),
  CONSTRAINT chk_categoria CHECK (categoria IN ('oficial', 'medio_oficial', 'ayudante', 'peon')),
  CONSTRAINT chk_fecha_egreso CHECK (fecha_egreso IS NULL OR fecha_egreso >= fecha_ingreso),
  CONSTRAINT chk_cuil_format CHECK (cuil IS NULL OR cuil ~ '^\d{2}-\d{8}-\d{1}$')
);

-- ============================================================================
-- TABLE: obras (Construction Projects)
-- Description: Stores construction project information
-- ============================================================================
CREATE TABLE IF NOT EXISTS obras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  codigo VARCHAR(50) UNIQUE,
  ubicacion TEXT,
  fecha_inicio DATE,
  fecha_fin_estimada DATE,
  fecha_fin_real DATE,
  estado VARCHAR(50) DEFAULT 'planificada', -- planificada, en_curso, finalizada, suspendida
  presupuesto DECIMAL(15, 2),
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  CONSTRAINT chk_obra_estado CHECK (estado IN ('planificada', 'en_curso', 'finalizada', 'suspendida')),
  CONSTRAINT chk_fecha_fin CHECK (fecha_fin_estimada IS NULL OR fecha_fin_estimada >= fecha_inicio),
  CONSTRAINT chk_presupuesto CHECK (presupuesto IS NULL OR presupuesto >= 0)
);

-- ============================================================================
-- TABLE: asignaciones_contratos (Assignments/Contracts)
-- Description: Tracks employee assignments to construction projects
-- Dependencies: empleados, obras tables
-- ============================================================================
CREATE TABLE IF NOT EXISTS asignaciones_contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empleado_id UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
  obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  tipo_contrato VARCHAR(50) NOT NULL, -- planta_permanente, contratado, eventual
  categoria VARCHAR(100), -- oficial, medio_oficial, ayudante, peon
  salario DECIMAL(12, 2),
  estado VARCHAR(50) DEFAULT 'activo', -- activo, finalizado, suspendido
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  CONSTRAINT chk_asignacion_estado CHECK (estado IN ('activo', 'finalizado', 'suspendido')),
  CONSTRAINT chk_asignacion_tipo_contrato CHECK (tipo_contrato IN ('planta_permanente', 'contratado', 'eventual')),
  CONSTRAINT chk_asignacion_categoria CHECK (categoria IN ('oficial', 'medio_oficial', 'ayudante', 'peon')),
  CONSTRAINT chk_asignacion_fecha_fin CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio),
  CONSTRAINT chk_asignacion_salario CHECK (salario IS NULL OR salario >= 0)
);

-- ============================================================================
-- TABLE: documentos (Documents)
-- Description: Stores employee document metadata and file references
-- Dependencies: empleados table
-- ============================================================================
CREATE TABLE IF NOT EXISTS documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empleado_id UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
  tipo_documento VARCHAR(100) NOT NULL, -- dni, contrato, certificado, etc.
  nombre_archivo VARCHAR(255) NOT NULL,
  url_archivo TEXT NOT NULL, -- URL to file in storage (Vercel Blob or similar)
  fecha_subida TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_vencimiento DATE,
  estado VARCHAR(50) DEFAULT 'vigente', -- vigente, vencido, por_vencer
  observaciones TEXT,
  uploaded_by UUID REFERENCES users(id),
  CONSTRAINT chk_documento_estado CHECK (estado IN ('vigente', 'vencido', 'por_vencer'))
);

-- ============================================================================
-- TABLE: historial_relacion_laboral (Employment History)
-- Description: Audit trail of all employment-related events
-- Dependencies: empleados, obras tables
-- ============================================================================
CREATE TABLE IF NOT EXISTS historial_relacion_laboral (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empleado_id UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
  fecha_evento DATE NOT NULL,
  tipo_evento VARCHAR(100) NOT NULL, -- ingreso, cambio_categoria, cambio_obra, suspension, egreso
  descripcion TEXT NOT NULL,
  obra_id UUID REFERENCES obras(id),
  categoria_anterior VARCHAR(100),
  categoria_nueva VARCHAR(100),
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  CONSTRAINT chk_tipo_evento CHECK (tipo_evento IN ('ingreso', 'cambio_categoria', 'cambio_obra', 'suspension', 'egreso', 'reingreso'))
);

-- ============================================================================
-- INDEXES: Performance optimization for common queries
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_empleados_dni ON empleados(dni);
CREATE INDEX IF NOT EXISTS idx_empleados_cuil ON empleados(cuil);
CREATE INDEX IF NOT EXISTS idx_empleados_estado ON empleados(estado);
CREATE INDEX IF NOT EXISTS idx_empleados_tipo_contrato ON empleados(tipo_contrato);
CREATE INDEX IF NOT EXISTS idx_empleados_nombre_apellido ON empleados(nombre, apellido);

CREATE INDEX IF NOT EXISTS idx_obras_codigo ON obras(codigo);
CREATE INDEX IF NOT EXISTS idx_obras_estado ON obras(estado);
CREATE INDEX IF NOT EXISTS idx_obras_fecha_inicio ON obras(fecha_inicio);

CREATE INDEX IF NOT EXISTS idx_asignaciones_empleado_id ON asignaciones_contratos(empleado_id);
CREATE INDEX IF NOT EXISTS idx_asignaciones_obra_id ON asignaciones_contratos(obra_id);
CREATE INDEX IF NOT EXISTS idx_asignaciones_estado ON asignaciones_contratos(estado);
CREATE INDEX IF NOT EXISTS idx_asignaciones_fecha_inicio ON asignaciones_contratos(fecha_inicio);

CREATE INDEX IF NOT EXISTS idx_documentos_empleado_id ON documentos(empleado_id);
CREATE INDEX IF NOT EXISTS idx_documentos_estado ON documentos(estado);
CREATE INDEX IF NOT EXISTS idx_documentos_tipo ON documentos(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_documentos_fecha_vencimiento ON documentos(fecha_vencimiento);

CREATE INDEX IF NOT EXISTS idx_historial_empleado_id ON historial_relacion_laboral(empleado_id);
CREATE INDEX IF NOT EXISTS idx_historial_fecha_evento ON historial_relacion_laboral(fecha_evento);
CREATE INDEX IF NOT EXISTS idx_historial_tipo_evento ON historial_relacion_laboral(tipo_evento);

-- ============================================================================
-- TRIGGERS: Automatic timestamp updates
-- ============================================================================

-- Drop triggers if they exist (idempotent)
DROP TRIGGER IF EXISTS update_empleados_updated_at ON empleados;
DROP TRIGGER IF EXISTS update_obras_updated_at ON obras;
DROP TRIGGER IF EXISTS update_asignaciones_updated_at ON asignaciones_contratos;

-- Create triggers
CREATE TRIGGER update_empleados_updated_at
  BEFORE UPDATE ON empleados
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_obras_updated_at
  BEFORE UPDATE ON obras
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asignaciones_updated_at
  BEFORE UPDATE ON asignaciones_contratos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Commit transaction
COMMIT;

-- ============================================================================
-- VERIFICATION: Check if tables were created successfully
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE 'Business tables created successfully:';
  RAISE NOTICE '  - empleados: % rows', (SELECT COUNT(*) FROM empleados);
  RAISE NOTICE '  - obras: % rows', (SELECT COUNT(*) FROM obras);
  RAISE NOTICE '  - asignaciones_contratos: % rows', (SELECT COUNT(*) FROM asignaciones_contratos);
  RAISE NOTICE '  - documentos: % rows', (SELECT COUNT(*) FROM documentos);
  RAISE NOTICE '  - historial_relacion_laboral: % rows', (SELECT COUNT(*) FROM historial_relacion_laboral);
END $$;
