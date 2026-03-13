-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all access to admin" ON public.users;
DROP POLICY IF EXISTS "Allow user select access" ON public.users;
DROP POLICY IF EXISTS "Allow insert access to users with permission" ON public.users;
DROP POLICY IF EXISTS "Allow update access to users with permission" ON public.users;
DROP POLICY IF EXISTS "Allow delete access to users with permission" ON public.users;

DROP POLICY IF EXISTS "Allow all access to admin" ON public.empleados;
DROP POLICY IF EXISTS "Allow read access to users with permission" ON public.empleados;
DROP POLICY IF EXISTS "Allow insert access to users with permission" ON public.empleados;
DROP POLICY IF EXISTS "Allow update access to users with permission" ON public.empleados;
DROP POLICY IF EXISTS "Allow delete access to users with permission" ON public.empleados;

DROP POLICY IF EXISTS "Allow all access to admin" ON public.documentos;
DROP POLICY IF EXISTS "Allow read access to users with permission" ON public.documentos;
DROP POLICY IF EXISTS "Allow insert access to users with permission" ON public.documentos;
DROP POLICY IF EXISTS "Allow update access to users with permission" ON public.documentos;
DROP POLICY IF EXISTS "Allow delete access to users with permission" ON public.documentos;

DROP POLICY IF EXISTS "Allow all access to admin" ON public.obras;
DROP POLICY IF EXISTS "Allow read access to users with permission" ON public.obras;
DROP POLICY IF EXISTS "Allow insert access to users with permission" ON public.obras;
DROP POLICY IF EXISTS "Allow update access to users with permission" ON public.obras;
DROP POLICY IF EXISTS "Allow delete access to users with permission" ON public.obras;

-- Create policies for the 'users' table
CREATE POLICY "Allow user select access" ON public.users
FOR SELECT USING (
  check_permission('users.read') AND id <> get_current_user_id()
);

CREATE POLICY "Allow insert access to users with permission" ON public.users
FOR INSERT WITH CHECK (check_permission('users.create'));

CREATE POLICY "Allow update access to users with permission" ON public.users
FOR UPDATE USING (
  get_current_user_id() = id OR check_permission('users.update')
);

CREATE POLICY "Allow delete access to users with permission" ON public.users
FOR DELETE USING (
  get_current_user_id() <> id AND check_permission('users.delete')
);

-- Create policies for the 'employees' table
CREATE POLICY "Allow read access to users with permission" ON public.empleados
FOR SELECT USING (check_permission('employees.read'));

CREATE POLICY "Allow insert access to users with permission" ON public.empleados
FOR INSERT WITH CHECK (check_permission('employees.create'));

CREATE POLICY "Allow update access to users with permission" ON public.empleados
FOR UPDATE USING (check_permission('employees.update'));

CREATE POLICY "Allow delete access to users with permission" ON public.empleados
FOR DELETE USING (check_permission('employees.delete'));

-- Create policies for the 'documents' table
CREATE POLICY "Allow read access to users with permission" ON public.documentos
FOR SELECT USING (check_permission('documents.read'));

CREATE POLICY "Allow insert access to users with permission" ON public.documentos
FOR INSERT WITH CHECK (check_permission('documents.create'));

CREATE POLICY "Allow update access to users with permission" ON public.documentos
FOR UPDATE USING (check_permission('documents.update'));

CREATE POLICY "Allow delete access to users with permission" ON public.documentos
FOR DELETE USING (check_permission('documents.delete'));

-- Create policies for the 'projects' table
CREATE POLICY "Allow read access to users with permission" ON public.obras
FOR SELECT USING (check_permission('projects.read'));

CREATE POLICY "Allow insert access to users with permission" ON public.obras
FOR INSERT WITH CHECK (check_permission('projects.create'));

CREATE POLICY "Allow update access to users with permission" ON public.obras
FOR UPDATE USING (check_permission('projects.update'));

CREATE POLICY "Allow delete access to users with permission" ON public.obras
FOR DELETE USING (check_permission('projects.delete'));