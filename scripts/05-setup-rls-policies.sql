-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all access to admin" ON public.users;
DROP POLICY IF EXISTS "Allow individual access" ON public.users;
DROP POLICY IF EXISTS "Allow read access to users with permission" ON public.users;
DROP POLICY IF EXISTS "Allow insert access to users with permission" ON public.users;
DROP POLICY IF EXISTS "Allow update access to users with permission" ON public.users;
DROP POLICY IF EXISTS "Allow delete access to users with permission" ON public.users;

DROP POLICY IF EXISTS "Allow all access to admin" ON public.employees;
DROP POLICY IF EXISTS "Allow read access to users with permission" ON public.employees;
DROP POLICY IF EXISTS "Allow insert access to users with permission" ON public.employees;
DROP POLICY IF EXISTS "Allow update access to users with permission" ON public.employees;
DROP POLICY IF EXISTS "Allow delete access to users with permission" ON public.employees;

DROP POLICY IF EXISTS "Allow all access to admin" ON public.documents;
DROP POLICY IF EXISTS "Allow read access to users with permission" ON public.documents;
DROP POLICY IF EXISTS "Allow insert access to users with permission" ON public.documents;
DROP POLICY IF EXISTS "Allow update access to users with permission" ON public.documents;
DROP POLICY IF EXISTS "Allow delete access to users with permission" ON public.documents;

DROP POLICY IF EXISTS "Allow all access to admin" ON public.projects;
DROP POLICY IF EXISTS "Allow read access to users with permission" ON public.projects;
DROP POLICY IF EXISTS "Allow insert access to users with permission" ON public.projects;
DROP POLICY IF EXISTS "Allow update access to users with permission" ON public.projects;
DROP POLICY IF EXISTS "Allow delete access to users with permission" ON public.projects;

-- Create policies for the 'users' table
CREATE POLICY "Allow individual access" ON public.users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow read access to users with permission" ON public.users
FOR SELECT USING (check_permission('users:read'));

CREATE POLICY "Allow insert access to users with permission" ON public.users
FOR INSERT WITH CHECK (check_permission('users:create'));

CREATE POLICY "Allow update access to users with permission" ON public.users
FOR UPDATE USING (
  auth.uid() = id OR check_permission('users:update')
);

CREATE POLICY "Allow delete access to users with permission" ON public.users
FOR DELETE USING (
  auth.uid() <> id AND check_permission('users:delete')
);

-- Create policies for the 'employees' table
CREATE POLICY "Allow read access to users with permission" ON public.employees
FOR SELECT USING (check_permission('employees:read'));

CREATE POLICY "Allow insert access to users with permission" ON public.employees
FOR INSERT WITH CHECK (check_permission('employees:create'));

CREATE POLICY "Allow update access to users with permission" ON public.employees
FOR UPDATE USING (check_permission('employees:update'));

CREATE POLICY "Allow delete access to users with permission" ON public.employees
FOR DELETE USING (check_permission('employees:delete'));

-- Create policies for the 'documents' table
CREATE POLICY "Allow read access to users with permission" ON public.documents
FOR SELECT USING (check_permission('documents:read'));

CREATE POLICY "Allow insert access to users with permission" ON public.documents
FOR INSERT WITH CHECK (check_permission('documents:create'));

CREATE POLICY "Allow update access to users with permission" ON public.documents
FOR UPDATE USING (check_permission('documents:update'));

CREATE POLICY "Allow delete access to users with permission" ON public.documents
FOR DELETE USING (check_permission('documents:delete'));

-- Create policies for the 'projects' table
CREATE POLICY "Allow read access to users with permission" ON public.projects
FOR SELECT USING (check_permission('projects:read'));

CREATE POLICY "Allow insert access to users with permission" ON public.projects
FOR INSERT WITH CHECK (check_permission('projects:create'));

CREATE POLICY "Allow update access to users with permission" ON public.projects
FOR UPDATE USING (check_permission('projects:update'));

CREATE POLICY "Allow delete access to users with permission" ON public.projects
FOR DELETE USING (check_permission('projects:delete'));