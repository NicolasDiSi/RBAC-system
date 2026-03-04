# High-Level Architecture

This document provides a high-level overview of the project's architecture, technologies, and key concepts.

## Core Technologies

-   **Framework**: [Next.js](https://nextjs.org/) (using the App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Database**: [PostgreSQL](https://www.postgresql.org/)
-   **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components.
-   **Authentication**: [Supabase Auth](https://supabase.com/docs/guides/auth) (primarily for session management).
-   **Deployment**: Assumed to be on a platform like Vercel, given the Next.js focus.

## Project Structure

The codebase is organized into the following key directories:

-   **/app**: Contains all the routes and UI for the application, following the Next.js App Router paradigm.
    -   **/app/(admin-dashboard)/**: A route group for all pages under the main authenticated layout.
    -   **/app/actions/**: Hosts all Next.js Server Actions. These are functions that run exclusively on the server and are the primary way the frontend interacts with the backend logic.
    -   **/app/api/**: For traditional API routes.
    -   **/app/auth/**: Contains pages related to the authentication lifecycle (login, signup, etc.).

-   **/components**: Contains all shared React components.
    -   **/components/ui/**: Core UI components from the `shadcn/ui` library.
    -   **/components/auth/**, **/components/admin/**, etc.: Components specific to a certain feature or domain.

-   **/lib**: The core logic of the application resides here.
    -   **/lib/db/**: Drizzle ORM setup, including schema definitions (`/schema`) and configuration.
    -   **/lib/data/**: Data Access Objects (DAOs). These files are responsible for all database queries using Drizzle (e.g., `user.ts`, `role.ts`). Server Actions call these DAOs to interact with the database.
    -   **/lib/services/**: Contains logic for interacting with external services.
        -   **/lib/services/auth/**: The application-level authorization logic (`permissions.ts`).
        -   **/lib/services/email/**: Email sending service (e.g., Nodemailer).
        -   **/lib/services/storage/**: The abstracted file storage service.
    -   **/lib/validations/**: Zod schemas for validating data from forms and API requests.

-   **/drizzle**: Contains all auto-generated database migration files created by `drizzle-kit`.

-   **/scripts**: Contains helper scripts, most notably the `seed.ts` file for populating the database.

## Key Architectural Concepts

### Server Actions

The application heavily uses Next.js Server Actions for backend communication. Instead of creating traditional API endpoints for creating, updating, or deleting data, the frontend calls Server Actions defined in `/app/actions/`. This simplifies the codebase by co-locating backend logic with the framework's features.

### Data Access Layer (DAO)

All database interactions are abstracted into a Data Access Layer in `/lib/data/`. A file like `lib/data/user.ts` contains all the functions for querying the `users` table (e.g., `getUserById`, `createUser`, `updateUser`). This pattern keeps the database logic separate from the server actions, making the code cleaner and easier to maintain.

### Application-Level Authorization

As detailed in `DB_SETUP.md`, authorization is handled within the Server Actions. Each action that performs a sensitive operation calls `checkPermission()` to ensure the user has the required rights before executing the database query. This provides a secure and explicit way to manage permissions.

### Abstracted Storage Service

The file storage system is designed as an abstracted service in `/lib/services/storage/`. It uses a Strategy Pattern to switch between different storage providers (e.g., AWS S3, Google Drive) based on an environment variable. This is explained in more detail in `STORAGE_SERVICE.md`.
