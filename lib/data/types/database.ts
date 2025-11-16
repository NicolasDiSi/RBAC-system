// Database types for type-safe queries

export interface User {
  id: string
  email: string
  google_id: string | null
  name: string
  avatar_url: string | null
  is_active: boolean
  role_id: string | null
  hashed_password: string | null
  created_at: string
  updated_at: string
}

export interface Role {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Permission {
  id: string
  name: string
  description: string | null
  resource: string
  action: string
  created_at: string
}

export interface RolePermission {
  id: string
  role_id: string
  permission_id: string
  created_at: string
}

export interface Empleado {
  id: string
  nombre: string
  apellido: string
  dni: string
  fecha_nacimiento: string | null
  telefono: string | null
  email: string | null
  direccion: string | null
  fecha_ingreso: string
  estado: string
  tipo_contrato: string | null
  categoria: string | null
  observaciones: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface Obra {
  id: string
  codigo: string
  nombre: string
  ubicacion: string | null
  fecha_inicio: string | null
  fecha_fin_estimada: string | null
  fecha_fin_real: string | null
  estado: string
  presupuesto: number | null
  descripcion: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface AsignacionContrato {
  id: string
  empleado_id: string
  obra_id: string
  fecha_inicio: string
  fecha_fin: string | null
  tipo_contrato: string
  categoria: string | null
  salario: number | null
  estado: string
  observaciones: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface Documento {
  id: string
  empleado_id: string
  tipo_documento: string
  nombre_archivo: string
  url_archivo: string
  fecha_subida: string
  fecha_vencimiento: string | null
  estado: string
  observaciones: string | null
  uploaded_by: string | null
  created_at: string
}

export interface HistorialRelacionLaboral {
  id: string
  empleado_id: string
  fecha_evento: string
  tipo_evento: string
  descripcion: string
  obra_id: string | null
  categoria_anterior: string | null
  categoria_nueva: string | null
  observaciones: string | null
  created_at: string
  created_by: string | null
}