
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './rbac';
import { empleados, documentos } from './business';

// Enum for thread status
export const threadStatusEnum = pgEnum('thread_status', ['abierto', 'cerrado']);

// Enum for task status in a thread
export const threadTaskStatusEnum = pgEnum('thread_task_status', [
  'pendiente',
  'presentado',
  'aceptado',
  'rechazado',
]);

// Main table for the request "thread"
export const hilosSolicitudDocumento = pgTable(
  'hilos_solicitud_documento',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    empleadoId: uuid('empleado_id')
      .notNull()
      .references(() => empleados.id, { onDelete: 'cascade' }),
    titulo: varchar('titulo', { length: 255 }).notNull(),
    status: threadStatusEnum('status').default('abierto').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    createdBy: uuid('created_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    closedBy: uuid('closed_by').references(() => users.id, {
        onDelete: 'set null',
      }),
  },
  (table) => ({
    empleadoIdIndex: index('idx_hilos_empleado_id').on(table.empleadoId),
    statusIndex: index('idx_hilos_status').on(table.status),
  }),
);

// Stores each message within a thread
export const mensajesSolicitudDocumento = pgTable(
  'mensajes_solicitud_documento',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    hiloId: uuid('hilo_id')
      .notNull()
      .references(() => hilosSolicitudDocumento.id, { onDelete: 'cascade' }),
    remitenteId: uuid('remitente_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    cuerpo: text('cuerpo').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    hiloIdIndex: index('idx_mensajes_hilo_id').on(table.hiloId),
  }),
);

// Stores the predefined tasks that can be requested
export const tareasSolicitudDocumento = pgTable(
  'tareas_solicitud_documento',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    nombre: varchar('nombre', { length: 255 }).notNull().unique(),
    descripcion: text('descripcion'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  }
);

// Join table linking threads to tasks and tracking their status
export const tareasDelHilo = pgTable(
  'tareas_del_hilo',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    hiloId: uuid('hilo_id')
      .notNull()
      .references(() => hilosSolicitudDocumento.id, { onDelete: 'cascade' }),
    tareaId: uuid('tarea_id')
      .notNull()
      .references(() => tareasSolicitudDocumento.id, { onDelete: 'cascade' }),
    status: threadTaskStatusEnum('status').default('pendiente').notNull(),
    documentoId: uuid('documento_id').references(() => documentos.id, {
      onDelete: 'set null',
    }),
    reviewedBy: uuid('reviewed_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    rejectionReason: text('rejection_reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    hiloIdIndex: index('idx_tareas_del_hilo_hilo_id').on(table.hiloId),
    tareaIdIndex: index('idx_tareas_del_hilo_tarea_id').on(table.tareaId),
  }),
);


// --- RELATIONS ---

export const hilosSolicitudDocumentoRelations = relations(
  hilosSolicitudDocumento,
  ({ one, many }) => ({
    empleado: one(empleados, {
      fields: [hilosSolicitudDocumento.empleadoId],
      references: [empleados.id],
    }),
    createdBy: one(users, {
      fields: [hilosSolicitudDocumento.createdBy],
      references: [users.id],
      relationName: 'created_by_user',
    }),
    closedBy: one(users, {
        fields: [hilosSolicitudDocumento.closedBy],
        references: [users.id],
        relationName: 'closed_by_user',
      }),
    mensajes: many(mensajesSolicitudDocumento),
    tareas: many(tareasDelHilo),
  }),
);

export const mensajesSolicitudDocumentoRelations = relations(
  mensajesSolicitudDocumento,
  ({ one }) => ({
    hilo: one(hilosSolicitudDocumento, {
      fields: [mensajesSolicitudDocumento.hiloId],
      references: [hilosSolicitudDocumento.id],
    }),
    remitente: one(users, {
      fields: [mensajesSolicitudDocumento.remitenteId],
      references: [users.id],
    }),
  }),
);

export const tareasSolicitudDocumentoRelations = relations(
  tareasSolicitudDocumento,
  ({ many }) => ({
    tareasEnHilos: many(tareasDelHilo),
  }),
);

export const tareasDelHiloRelations = relations(tareasDelHilo, ({ one }) => ({
  hilo: one(hilosSolicitudDocumento, {
    fields: [tareasDelHilo.hiloId],
    references: [hilosSolicitudDocumento.id],
  }),
  tarea: one(tareasSolicitudDocumento, {
    fields: [tareasDelHilo.tareaId],
    references: [tareasSolicitudDocumento.id],
  }),
  documento: one(documentos, {
    fields: [tareasDelHilo.documentoId],
    references: [documentos.id],
  }),
  reviewedBy: one(users, {
    fields: [tareasDelHilo.reviewedBy],
    references: [users.id],
  }),
}));
