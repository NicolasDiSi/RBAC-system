# Database Setup Guide

This guide details how to set up the database for local development using Docker, Drizzle ORM, and the provided project scripts.

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/) must be installed and running.
- [Node.js](https://nodejs.org/en) (version 20 or higher) and [pnpm](https://pnpm.io/installation) should be installed.

## 1. Environment Configuration

The application uses a `.env` file for environment variables, including the database connection string.

1.  **Create the file**: In the root of the project, create a file named `.env`.
2.  **Add Database URL**: Copy the contents of `.env.example` (if it exists) or add the following line. This URL points to the PostgreSQL database that will be created by Docker.

    ```env
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"
    ```

## 2. Running the Database

The project is configured to run a PostgreSQL database using Docker Compose.

1.  **Start the Container**: Run the following command to start the database container in the background.

    ```bash
    pnpm docker:up
    ```

    You can verify the container is running with `docker ps`. You should see a container named `rbac-system-db-1` or similar.

## 3. Database Migrations & Seeding

The project uses `drizzle-kit` to manage database schema and `tsx` to run seeding scripts.

1.  **Install Dependencies**: If you haven't already, install the project dependencies.

    ```bash
    pnpm install
    ```

2.  **Apply Migrations**: The `drizzle/` directory contains migration files. To apply all migrations and synchronize the database with the schema defined in `lib/db/schema/`, run:

    ```bash
    pnpm db:push
    ```
    
3.  **Seed the Database**: After migrating the schema, populate the database with initial data (e.g., default roles, permissions, and an admin user).

    ```bash
    pnpm db:seed
    ```

    This command executes the `scripts/seed.ts` file, which uses Drizzle ORM to insert the necessary initial records.


# Architecture Overview: Authentication and Authorization

This document describes the entire authentication and authorization process in the application.

## 1. Authentication: Who is the user?

The authentication process determines and verifies the identity of a user. It remains largely the same as the previous implementation.

1.  **Entry Point (`middleware.ts`)**: Most requests are first handled by the Next.js middleware, which protects routes by checking for a valid user session.
2.  **Session Handling (`lib/services/auth/session.ts`)**: This service uses Supabase helpers to get the user's session from secure cookies.
3.  **Redirection**: If no session exists, the user is redirected to the login page.

## 2. Authorization: What can the user do?

Authorization happens *after* authentication. **This has been significantly changed from the old RLS-based system.** Authorization is now performed at the **application level** inside Server Actions.

1.  **Permission Checks in Server Actions**: Instead of relying on database-level RLS policies, every sensitive server action (e.g., in `app/actions/admin.ts`) explicitly checks for permissions at the beginning of its execution.

    ```typescript
    // Example from app/actions/admin.ts
    import { checkPermission } from "@/lib/services/auth/permissions"

    export async function createUser(data: FormData) {
      const hasPermission = await checkPermission("users.create")
      if (!hasPermission) {
        throw new Error("Unauthorized")
      }
      // ... rest of the function
    }
    ```

2.  **The `checkPermission` Function (`lib/services/auth/permissions.ts`)**: This is the new core of the authorization logic.
    1.  It gets the current user's session.
    2.  It looks up the user's role in the database.
    3.  It queries the `role_permissions` table (via Drizzle ORM) to see if the user's role is linked to the required permission.
    4.  Returns `true` if the user has the permission, and `false` otherwise.

This application-level approach centralizes permission logic within the Node.js environment, making it more portable and easier to debug than database-level RLS.

## From SQL to Drizzle ORM

The project has fully transitioned from using raw SQL scripts for schema management to using **Drizzle ORM**.

*   **Legacy Scripts**: The SQL files in the `scripts/` directory (like `01-create-rbac-tables.sql`, `05-setup-rls-policies.sql`, etc.) are **no longer used** to define the database structure. They serve as a reference to the project's history but are not executed.
*   **Schema as Code**: The single source of truth for the database schema is now the set of TypeScript files in `lib/db/schema/`.
*   **Migrations**: Schema changes are managed via `drizzle-kit`. To create a new migration after modifying the schema, run:
    ```bash
    pnpm db:generate
    ```
*   **Seeding**: The `scripts/03-seed-roles-permissions.sql` and `04-seed-default-user.sql` have been replaced by the **`scripts/seed.ts`** script, which uses Drizzle to insert data programmatically.

This entire setup creates a robust and secure system where Next.js middleware handles route-level authentication, and application-level checks in Server Actions handle authorization.
