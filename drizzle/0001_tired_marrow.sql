CREATE TYPE "public"."thread_status" AS ENUM('abierto', 'cerrado');--> statement-breakpoint
CREATE TYPE "public"."thread_task_status" AS ENUM('pendiente', 'presentado', 'aceptado', 'rechazado');--> statement-breakpoint
CREATE TABLE "hilos_solicitud_documento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empleado_id" uuid NOT NULL,
	"titulo" varchar(255) NOT NULL,
	"status" "thread_status" DEFAULT 'abierto' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" uuid,
	"closed_by" uuid
);
--> statement-breakpoint
CREATE TABLE "mensajes_solicitud_documento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hilo_id" uuid NOT NULL,
	"remitente_id" uuid,
	"cuerpo" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tareas_del_hilo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hilo_id" uuid NOT NULL,
	"tarea_id" uuid NOT NULL,
	"status" "thread_task_status" DEFAULT 'pendiente' NOT NULL,
	"documento_id" uuid,
	"reviewed_by" uuid,
	"rejection_reason" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tareas_solicitud_documento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" varchar(255) NOT NULL,
	"descripcion" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "tareas_solicitud_documento_nombre_unique" UNIQUE("nombre")
);
--> statement-breakpoint
ALTER TABLE "hilos_solicitud_documento" ADD CONSTRAINT "hilos_solicitud_documento_empleado_id_empleados_id_fk" FOREIGN KEY ("empleado_id") REFERENCES "public"."empleados"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hilos_solicitud_documento" ADD CONSTRAINT "hilos_solicitud_documento_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hilos_solicitud_documento" ADD CONSTRAINT "hilos_solicitud_documento_closed_by_users_id_fk" FOREIGN KEY ("closed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensajes_solicitud_documento" ADD CONSTRAINT "mensajes_solicitud_documento_hilo_id_hilos_solicitud_documento_id_fk" FOREIGN KEY ("hilo_id") REFERENCES "public"."hilos_solicitud_documento"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensajes_solicitud_documento" ADD CONSTRAINT "mensajes_solicitud_documento_remitente_id_users_id_fk" FOREIGN KEY ("remitente_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tareas_del_hilo" ADD CONSTRAINT "tareas_del_hilo_hilo_id_hilos_solicitud_documento_id_fk" FOREIGN KEY ("hilo_id") REFERENCES "public"."hilos_solicitud_documento"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tareas_del_hilo" ADD CONSTRAINT "tareas_del_hilo_tarea_id_tareas_solicitud_documento_id_fk" FOREIGN KEY ("tarea_id") REFERENCES "public"."tareas_solicitud_documento"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tareas_del_hilo" ADD CONSTRAINT "tareas_del_hilo_documento_id_documentos_id_fk" FOREIGN KEY ("documento_id") REFERENCES "public"."documentos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tareas_del_hilo" ADD CONSTRAINT "tareas_del_hilo_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_hilos_empleado_id" ON "hilos_solicitud_documento" USING btree ("empleado_id");--> statement-breakpoint
CREATE INDEX "idx_hilos_status" ON "hilos_solicitud_documento" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_mensajes_hilo_id" ON "mensajes_solicitud_documento" USING btree ("hilo_id");--> statement-breakpoint
CREATE INDEX "idx_tareas_del_hilo_hilo_id" ON "tareas_del_hilo" USING btree ("hilo_id");--> statement-breakpoint
CREATE INDEX "idx_tareas_del_hilo_tarea_id" ON "tareas_del_hilo" USING btree ("tarea_id");