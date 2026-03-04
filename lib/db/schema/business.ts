
import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
    index,
    date,
    decimal,
  } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './rbac';
  
// Business Tables
  
export const empleados = pgTable(
'empleados',
{
    id: uuid('id').defaultRandom().primaryKey(),
    nombre: varchar('nombre', { length: 255 }).notNull(),
    apellido: varchar('apellido', { length: 255 }).notNull(),
    dni: varchar('dni', { length: 20 }).unique().notNull(),
    cuil: varchar('cuil', { length: 13 }),
    fechaNacimiento: date('fecha_nacimiento'),
    telefono: varchar('telefono', { length: 20 }),
    email: varchar('email', { length: 255 }),
    direccion: text('direccion'),
    fechaIngreso: date('fecha_ingreso').notNull(),
    fechaEgreso: date('fecha_egreso'),
    estado: varchar('estado', { length: 50 }).default('activo'),
    tipoContrato: varchar('tipo_contrato', { length: 50 }),
    categoria: varchar('categoria', { length: 100 }),
    empresaTercera: varchar('empresa_tercera', { length: 255 }),
    observaciones: text('observaciones'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    createdBy: uuid('created_by').references(() => users.id),
},
(table) => {
    return {
    dniIndex: index('idx_empleados_dni').on(table.dni),
    cuilIndex: index('idx_empleados_cuil').on(table.cuil),
    estadoIndex: index('idx_empleados_estado').on(table.estado),
    tipoContratoIndex: index('idx_empleados_tipo_contrato').on(table.tipoContrato),
    nombreApellidoIndex: index('idx_empleados_nombre_apellido').on(table.nombre, table.apellido),
    };
},
);
  
export const obras = pgTable(
'obras',
{
    id: uuid('id').defaultRandom().primaryKey(),
    nombre: varchar('nombre', { length: 255 }).notNull(),
    codigo: varchar('codigo', { length: 50 }).unique(),
    ubicacion: text('ubicacion'),
    fechaInicio: date('fecha_inicio'),
    fechaFinEstimada: date('fecha_fin_estimada'),
    fechaFinReal: date('fecha_fin_real'),
    estado: varchar('estado', { length: 50 }).default('planificada'),
    presupuesto: decimal('presupuesto', { precision: 15, scale: 2 }),
    descripcion: text('descripcion'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    createdBy: uuid('created_by').references(() => users.id),
},
(table) => {
    return {
    codigoIndex: index('idx_obras_codigo').on(table.codigo),
    estadoIndex: index('idx_obras_estado').on(table.estado),
    fechaInicioIndex: index('idx_obras_fecha_inicio').on(table.fechaInicio),
    };
},
);
  
export const asignacionesContratos = pgTable(
'asignaciones_contratos',
{
    id: uuid('id').defaultRandom().primaryKey(),
    empleadoId: uuid('empleado_id')
    .notNull()
    .references(() => empleados.id, { onDelete: 'cascade' }),
    obraId: uuid('obra_id')
    .notNull()
    .references(() => obras.id, { onDelete: 'cascade' }),
    fechaInicio: date('fecha_inicio').notNull(),
    fechaFin: date('fecha_fin'),
    tipoContrato: varchar('tipo_contrato', { length: 50 }).notNull(),
    categoria: varchar('categoria', { length: 100 }),
    salario: decimal('salario', { precision: 12, scale: 2 }),
    estado: varchar('estado', { length: 50 }).default('activo'),
    observaciones: text('observaciones'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    createdBy: uuid('created_by').references(() => users.id),
},
(table) => {
    return {
    empleadoIdIndex: index('idx_asignaciones_empleado_id').on(table.empleadoId),
    obraIdIndex: index('idx_asignaciones_obra_id').on(table.obraId),
    estadoIndex: index('idx_asignaciones_estado').on(table.estado),
    fechaInicioIndex: index('idx_asignaciones_fecha_inicio').on(table.fechaInicio),
    };
},
);

export const documentos = pgTable(
  'documentos',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    storageKey: text('storage_key').notNull(),
    storageProvider: varchar('storage_provider', { length: 50 }).notNull(),
    fileType: varchar('file_type', { length: 100 }).notNull(),
    checksum: varchar('checksum', { length: 255 }),
    folderId: uuid('folder_id').references(() => folders.id, {
      onDelete: 'cascade',
    }),
    empleadoId: uuid('empleado_id').references(() => empleados.id, {
      onDelete: 'set null',
    }),
    fechaSubida: timestamp('fecha_subida', { withTimezone: true }).defaultNow(),
    fechaVencimiento: date('fecha_vencimiento'),
    estado: varchar('estado', { length: 50 }).default('vigente'),
    observaciones: text('observaciones'),
    uploadedBy: uuid('uploaded_by').references(() => users.id),
  },
  (table) => {
    return {
      folderIdIndex: index('idx_documentos_folder_id').on(table.folderId),
      empleadoIdIndex: index('idx_documentos_empleado_id').on(table.empleadoId),
      fileTypeIndex: index('idx_documentos_tipo').on(table.fileType),
    };
  },
);

export const folders = pgTable(
  'folders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    path: text('path').notNull(),
    parentId: uuid('parent_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    createdBy: uuid('created_by').references(() => users.id),
  },
  (table) => {
    return {
      pathIndex: index('idx_folders_path').on(table.path),
      parentIndex: index('idx_folders_parent_id').on(table.parentId),
    };
  },
);

export const historialRelacionLaboral = pgTable(
  'historial_relacion_laboral',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    empleadoId: uuid('empleado_id')
      .notNull()
      .references(() => empleados.id, { onDelete: 'cascade' }),
    fechaEvento: date('fecha_evento').notNull(),
    tipoEvento: varchar('tipo_evento', { length: 100 }).notNull(),
    descripcion: text('descripcion').notNull(),
    obraId: uuid('obra_id').references(() => obras.id),
    categoriaAnterior: varchar('categoria_anterior', { length: 100 }),
    categoriaNueva: varchar('categoria_nueva', { length: 100 }),
    observaciones: text('observaciones'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    createdBy: uuid('created_by').references(() => users.id),
  },
  (table) => {
    return {
      empleadoIdIndex: index('idx_historial_empleado_id').on(table.empleadoId),
      fechaEventoIndex: index('idx_historial_fecha_evento').on(
        table.fechaEvento,
      ),
      tipoEventoIndex: index('idx_historial_tipo_evento').on(table.tipoEvento),
    };
  },
);

// --- RELATIONS ---

export const empleadosRelations = relations(empleados, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [empleados.createdBy],
    references: [users.id],
  }),
  asignacionesContratos: many(asignacionesContratos),
  documentos: many(documentos),
  historialRelacionLaboral: many(historialRelacionLaboral),
}));

export const obrasRelations = relations(obras, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [obras.createdBy],
    references: [users.id],
  }),
  asignacionesContratos: many(asignacionesContratos),
  historialRelacionLaboral: many(historialRelacionLaboral),
}));

export const asignacionesContratosRelations = relations(
  asignacionesContratos,
  ({ one }) => ({
    empleado: one(empleados, {
      fields: [asignacionesContratos.empleadoId],
      references: [empleados.id],
    }),
    obra: one(obras, {
      fields: [asignacionesContratos.obraId],
      references: [obras.id],
    }),
    createdBy: one(users, {
      fields: [asignacionesContratos.createdBy],
      references: [users.id],
    }),
  }),
);

export const documentosRelations = relations(documentos, ({ one }) => ({
  empleado: one(empleados, {
    fields: [documentos.empleadoId],
    references: [empleados.id],
  }),
  uploadedBy: one(users, {
    fields: [documentos.uploadedBy],
    references: [users.id],
  }),
  folder: one(folders, {
    fields: [documentos.folderId],
    references: [folders.id],
  }),
}));

export const foldersRelations = relations(folders, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [folders.createdBy],
    references: [users.id],
  }),
  documents: many(documentos),
  parent: one(folders, {
    fields: [folders.parentId],
    references: [folders.id],
    relationName: 'parent_folder',
  }),
  children: many(folders, {
    relationName: 'parent_folder',
  }),
}));

export const historialRelacionLaboralRelations = relations(
  historialRelacionLaboral,
  ({ one }) => ({
    empleado: one(empleados, {
      fields: [historialRelacionLaboral.empleadoId],
      references: [empleados.id],
    }),
    obra: one(obras, {
      fields: [historialRelacionLaboral.obraId],
      references: [obras.id],
    }),
    createdBy: one(users, {
      fields: [historialRelacionLaboral.createdBy],
      references: [users.id],
    }),
  }),
);
