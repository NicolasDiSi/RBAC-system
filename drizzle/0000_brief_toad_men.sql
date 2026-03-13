CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"resource" varchar(100) NOT NULL,
	"action" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "permissions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "signup_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(6) NOT NULL,
	"role_id" uuid,
	"expires_at" timestamp with time zone NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"used_by_user_id" uuid,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "signup_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"hashed_password" text,
	"google_id" varchar(255),
	"name" varchar(255) NOT NULL,
	"avatar_url" text,
	"is_active" boolean DEFAULT false,
	"role_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"verified_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" varchar(255) NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "verification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "asignaciones_contratos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empleado_id" uuid NOT NULL,
	"obra_id" uuid NOT NULL,
	"fecha_inicio" date NOT NULL,
	"fecha_fin" date,
	"tipo_contrato" varchar(50) NOT NULL,
	"categoria" varchar(100),
	"salario" numeric(12, 2),
	"estado" varchar(50) DEFAULT 'activo',
	"observaciones" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "documentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empleado_id" uuid NOT NULL,
	"tipo_documento" varchar(100) NOT NULL,
	"nombre_archivo" varchar(255) NOT NULL,
	"url_archivo" text NOT NULL,
	"fecha_subida" timestamp with time zone DEFAULT now(),
	"fecha_vencimiento" date,
	"estado" varchar(50) DEFAULT 'vigente',
	"observaciones" text,
	"uploaded_by" uuid
);
--> statement-breakpoint
CREATE TABLE "empleados" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" varchar(255) NOT NULL,
	"apellido" varchar(255) NOT NULL,
	"dni" varchar(20) NOT NULL,
	"cuil" varchar(13),
	"fecha_nacimiento" date,
	"telefono" varchar(20),
	"email" varchar(255),
	"direccion" text,
	"fecha_ingreso" date NOT NULL,
	"fecha_egreso" date,
	"estado" varchar(50) DEFAULT 'activo',
	"tipo_contrato" varchar(50),
	"categoria" varchar(100),
	"empresa_tercera" varchar(255),
	"observaciones" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" uuid,
	CONSTRAINT "empleados_dni_unique" UNIQUE("dni")
);
--> statement-breakpoint
CREATE TABLE "historial_relacion_laboral" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empleado_id" uuid NOT NULL,
	"fecha_evento" date NOT NULL,
	"tipo_evento" varchar(100) NOT NULL,
	"descripcion" text NOT NULL,
	"obra_id" uuid,
	"categoria_anterior" varchar(100),
	"categoria_nueva" varchar(100),
	"observaciones" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "obras" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" varchar(255) NOT NULL,
	"codigo" varchar(50),
	"ubicacion" text,
	"fecha_inicio" date,
	"fecha_fin_estimada" date,
	"fecha_fin_real" date,
	"estado" varchar(50) DEFAULT 'planificada',
	"presupuesto" numeric(15, 2),
	"descripcion" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" uuid,
	CONSTRAINT "obras_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "share_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" varchar(255) NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"region_restriction" text,
	"timezone_restriction" text,
	"is_used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "share_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signup_codes" ADD CONSTRAINT "signup_codes_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signup_codes" ADD CONSTRAINT "signup_codes_used_by_user_id_users_id_fk" FOREIGN KEY ("used_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asignaciones_contratos" ADD CONSTRAINT "asignaciones_contratos_empleado_id_empleados_id_fk" FOREIGN KEY ("empleado_id") REFERENCES "public"."empleados"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asignaciones_contratos" ADD CONSTRAINT "asignaciones_contratos_obra_id_obras_id_fk" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asignaciones_contratos" ADD CONSTRAINT "asignaciones_contratos_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_empleado_id_empleados_id_fk" FOREIGN KEY ("empleado_id") REFERENCES "public"."empleados"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "empleados" ADD CONSTRAINT "empleados_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "historial_relacion_laboral" ADD CONSTRAINT "historial_relacion_laboral_empleado_id_empleados_id_fk" FOREIGN KEY ("empleado_id") REFERENCES "public"."empleados"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "historial_relacion_laboral" ADD CONSTRAINT "historial_relacion_laboral_obra_id_obras_id_fk" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "historial_relacion_laboral" ADD CONSTRAINT "historial_relacion_laboral_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "obras" ADD CONSTRAINT "obras_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_tokens" ADD CONSTRAINT "share_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_permissions_resource" ON "permissions" USING btree ("resource");--> statement-breakpoint
CREATE INDEX "idx_permissions_action" ON "permissions" USING btree ("action");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_role_permission" ON "role_permissions" USING btree ("role_id","permission_id");--> statement-breakpoint
CREATE INDEX "idx_role_permissions_role_id" ON "role_permissions" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "idx_role_permissions_permission_id" ON "role_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_name_key" ON "roles" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_signup_codes_code" ON "signup_codes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_google_id" ON "users" USING btree ("google_id");--> statement-breakpoint
CREATE INDEX "idx_users_role_id" ON "users" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "idx_users_is_active" ON "users" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_verification_tokens_token" ON "verification_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_verification_tokens_user_id" ON "verification_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_asignaciones_empleado_id" ON "asignaciones_contratos" USING btree ("empleado_id");--> statement-breakpoint
CREATE INDEX "idx_asignaciones_obra_id" ON "asignaciones_contratos" USING btree ("obra_id");--> statement-breakpoint
CREATE INDEX "idx_asignaciones_estado" ON "asignaciones_contratos" USING btree ("estado");--> statement-breakpoint
CREATE INDEX "idx_asignaciones_fecha_inicio" ON "asignaciones_contratos" USING btree ("fecha_inicio");--> statement-breakpoint
CREATE INDEX "idx_documentos_empleado_id" ON "documentos" USING btree ("empleado_id");--> statement-breakpoint
CREATE INDEX "idx_documentos_estado" ON "documentos" USING btree ("estado");--> statement-breakpoint
CREATE INDEX "idx_documentos_tipo" ON "documentos" USING btree ("tipo_documento");--> statement-breakpoint
CREATE INDEX "idx_documentos_fecha_vencimiento" ON "documentos" USING btree ("fecha_vencimiento");--> statement-breakpoint
CREATE INDEX "idx_empleados_dni" ON "empleados" USING btree ("dni");--> statement-breakpoint
CREATE INDEX "idx_empleados_cuil" ON "empleados" USING btree ("cuil");--> statement-breakpoint
CREATE INDEX "idx_empleados_estado" ON "empleados" USING btree ("estado");--> statement-breakpoint
CREATE INDEX "idx_empleados_tipo_contrato" ON "empleados" USING btree ("tipo_contrato");--> statement-breakpoint
CREATE INDEX "idx_empleados_nombre_apellido" ON "empleados" USING btree ("nombre","apellido");--> statement-breakpoint
CREATE INDEX "idx_historial_empleado_id" ON "historial_relacion_laboral" USING btree ("empleado_id");--> statement-breakpoint
CREATE INDEX "idx_historial_fecha_evento" ON "historial_relacion_laboral" USING btree ("fecha_evento");--> statement-breakpoint
CREATE INDEX "idx_historial_tipo_evento" ON "historial_relacion_laboral" USING btree ("tipo_evento");--> statement-breakpoint
CREATE INDEX "idx_obras_codigo" ON "obras" USING btree ("codigo");--> statement-breakpoint
CREATE INDEX "idx_obras_estado" ON "obras" USING btree ("estado");--> statement-breakpoint
CREATE INDEX "idx_obras_fecha_inicio" ON "obras" USING btree ("fecha_inicio");--> statement-breakpoint
CREATE INDEX "idx_share_tokens_token" ON "share_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_share_tokens_user_id" ON "share_tokens" USING btree ("user_id");