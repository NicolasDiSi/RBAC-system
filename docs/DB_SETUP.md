# Authentication and Authorization Flow

This document describes the entire authentication and authorization process in the application, from the initial user request to the final data retrieval from the database.

## 1. Authentication: Who is the user?

The authentication process determines and verifies the identity of a user.

1.  **Entry Point (`middleware.ts`)**: Most requests to the application are first handled by the Next.js middleware. This middleware's primary job is to protect routes.
    *   It checks if a route is public (e.g., `/auth/login`, `/api/...`). If so, it allows the request to proceed without checking for a user session.
    *   For all other routes, it calls `getSessionFromMiddleware(request)`.

2.  **Session Handling (`lib/services/auth/session.ts`)**: The `getSessionFromMiddleware` function is responsible for retrieving the user's session.
    *   It uses the Supabase SSR helper `createServerClient` to create a Supabase client that can access cookies from the request.
    *   It calls `supabase.auth.getUser()` to get the currently authenticated user from the Supabase session, which is stored in a secure, HTTP-only cookie.

3.  **Redirection**:
    *   If `getSessionFromMiddleware` returns no session (i.e., the user is not logged in), the middleware redirects the user to the `/auth/login` page. It also appends a `redirect_to` query parameter, so the user can be sent back to their original page after logging in.
    *   If a session exists, the middleware allows the request to continue to the requested page.

## 2. Authorization: What can the user do?

Authorization happens *after* authentication and determines if the logged-in user has the necessary permissions to access or modify data. This is where Row-Level Security (RLS) and our custom functions come into play.

1.  **Setting User Context (`lib/data/query.ts`)**: Before any database query that requires authorization is executed, the application sets the current user's ID in the database session using a custom `set_config` function.
    *   A function like `createAuthorizedSupabaseClient` retrieves the user's session and then calls a remote procedure call (RPC) to a PostgreSQL function `set_config('app.current_user_id', user.id)`.
    *   This makes the user's ID available *within the context of the current database transaction*.

2.  **Helper Functions (`04-create-helper-functions.sql`)**:
    *   `get_current_user_id()`: This function safely retrieves the user ID that was just set by `set_config`. RLS policies use this to know who is making the request.
    *   `check_permission(permission_name TEXT)`: This is the core of the authorization logic. It takes a permission name (e.g., `'users:read'`) and:
        1.  Gets the current user's ID using `get_current_user_id()`.
        2.  Looks up that user's `role_id` in the `public.users` table.
        3.  Checks if a record exists in the `public.role_permissions` table that links the user's role to the required permission.
        4.  Returns `true` if the user has the permission, and `false` otherwise.

3.  **RLS Policies (`05-setup-rls-policies.sql`)**: These are the rules that Supabase applies to every database query. They act as a final, secure gatekeeper.
    *   RLS is enabled for all main tables (`users`, `employees`, `documents`, `projects`).
    *   Policies are defined using the `check_permission` function. For example, the policy for reading employees is:
        ```sql
        CREATE POLICY "Allow read access to users with permission" ON public.employees
        FOR SELECT USING (check_permission('employees:read'));
        ```
        This means a `SELECT` query on the `employees` table will only return rows if `check_permission('employees:read')` returns `true` for the current user.

# Review of Setup Scripts

Here is a summary of the SQL scripts and their purpose in setting up this system:

*   **`00-master-setup.sql`**: (Assumed) Likely sets up the initial database configuration or extensions.
*   **`01-create-rbac-tables.sql`**: Creates the core tables for Role-Based Access Control: `roles`, `permissions`, and the `role_permissions` join table.
*   **`02-create-business-tables.sql`**: Creates the tables for the application's data: `users`, `employees`, `documents`, `projects`, etc. The `users` table here is the custom user management table, separate from Supabase's `auth.users`.
*   **`03-seed-roles-permissions.sql`**: Populates the `roles` and `permissions` tables with initial data (e.g., 'admin', 'user' roles and 'users:read', 'documents:create' permissions) and links them in `role_permissions`.
*   **`04-create-helper-functions.sql`**: Creates the crucial `get_current_user_id()` and `check_permission()` functions that RLS policies depend on.
*   **`04-seed-default-user.sql`**: Seeds a default user, likely for testing or initial setup.
*   **`05-setup-rls-policies.sql`**: Enables RLS and applies the permission-checking policies to the tables. This is what enforces the authorization rules at the database level.
*   **`06-create-share-table.sql`**, **`07-create-signup-codes-table.sql`**, **`08-create-share-tokens-table.sql`**: These create additional tables for features related to sharing and user onboarding.
*   **`99-teardown.sql`**: (Assumed) Contains scripts to reverse the setup, useful for testing and development.

This entire setup creates a robust and secure system where Next.js middleware handles route-level authentication, and Supabase RLS, powered by custom SQL functions, handles data-level authorization for every single query.
