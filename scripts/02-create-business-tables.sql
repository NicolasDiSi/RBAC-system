-- Business Tables for HR Management System
-- These tables manage employees, projects, assignments, documents, and employment history

-- Empleados (Employees) table: stores employee information
CREATE TABLE IF NOT EXISTS empleados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  dni VARCHAR(20) UNIQUE NOT NULL,
  fecha_nacimiento DATE,
  telefono VARCHAR(20),
  email VARCHAR(255),
  direccion TEXT,
  fecha_ingreso DATE NOT NULL,
  estado VARCHAR(50) DEFAULT 'activo', -- activo, inactivo, suspendido
  tipo_contrato VARCHAR(50), -- planta_permanente, contratado, eventual
  categoria VARCHAR(100), -- oficial, medio_oficial, ayudante, peon
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Obras (Construction Projects) table: stores project information
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
  created_by UUID REFERENCES users(id)
);

-- Asignaciones_Contratos (Assignments/Contracts) table: tracks employee assignments to projects
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
  created_by UUID REFERENCES users(id)
);

-- Documentos (Documents) table: stores employee document metadata
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
  uploaded_by UUID REFERENCES users(id)
);

-- Historial_Relacion_Laboral (Employment History) table: tracks employment history changes
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
  created_by UUID REFERENCES users(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_empleados_dni ON empleados(dni);
CREATE INDEX IF NOT EXISTS idx_empleados_estado ON empleados(estado);
CREATE INDEX IF NOT EXISTS idx_obras_codigo ON obras(codigo);
CREATE INDEX IF NOT EXISTS idx_obras_estado ON obras(estado);
CREATE INDEX IF NOT EXISTS idx_asignaciones_empleado_id ON asignaciones_contratos(empleado_id);
CREATE INDEX IF NOT EXISTS idx_asignaciones_obra_id ON asignaciones_contratos(obra_id);
CREATE INDEX IF NOT EXISTS idx_asignaciones_estado ON asignaciones_contratos(estado);
CREATE INDEX IF NOT EXISTS idx_documentos_empleado_id ON documentos(empleado_id);
CREATE INDEX IF NOT EXISTS idx_documentos_estado ON documentos(estado);
CREATE INDEX IF NOT EXISTS idx_historial_empleado_id ON historial_relacion_laboral(empleado_id);
CREATE INDEX IF NOT EXISTS idx_historial_fecha_evento ON historial_relacion_laboral(fecha_evento);
