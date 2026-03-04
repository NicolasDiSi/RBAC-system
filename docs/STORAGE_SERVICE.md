# Storage Service Architecture

This document explains the architecture of the flexible file storage service located in `lib/services/storage`.

## 1. Core Goal: Provider Agnosticism

The primary goal of this service is to create a unified interface for file storage operations that is independent of the underlying provider. Whether the application uses **AWS S3** or **Google Drive**, the rest of the application code does not need to change. This is achieved through the **Strategy Design Pattern**.

## 2. The Strategy Pattern

The implementation consists of three main parts:

1.  **The Interface (`IStorageService`)**: This defines a standard contract for what a storage service must be able to do. It is located in `lib/services/storage/types.ts`. Any storage driver *must* implement these methods:
    *   `getPresignedUploadUrl(...)`: Generates a secure, short-lived URL that the client can use to upload a file directly to the storage provider.
    *   `getPresignedDownloadUrl(...)`: Generates a secure, short-lived URL for a client to download or view a file.
    *   `deleteFile(...)`: Permanently deletes a file.
    *   `createFolder(...)`: Creates a new folder/directory.
    *   `moveFile(...)`: Moves a file to a different folder.

2.  **The Concrete Strategies (Drivers)**: These are the specific implementations of the `IStorageService` interface for each provider.
    *   `lib/services/storage/s3.ts`: The driver for AWS S3. It uses the AWS SDK to generate presigned URLs for upload and download operations.
    *   `lib/services/storage/google-drive.ts`: The driver for Google Drive. It uses the Google Drive API and a service account for authentication.

3.  **The Context (`getStorageService`)**: This is the factory function in `lib/services/storage/index.ts` that selects which strategy to use. It reads the `STORAGE_PROVIDER` environment variable and returns an instance of the corresponding driver.

    ```typescript
    // lib/services/storage/index.ts (simplified)
    import { S3StorageService } from './s3';
    import { GoogleDriveStorageService } from './google-drive';

    export const getStorageService = (): IStorageService => {
      const provider = process.env.STORAGE_PROVIDER;

      if (provider === 'google') {
        return new GoogleDriveStorageService();
      }
      
      // S3 is the default
      return new S3StorageService();
    };
    ```

## 3. Configuration

To select the storage provider, set the following environment variable in your `.env` file:

-   **For AWS S3**:
    ```env
    STORAGE_PROVIDER="aws"
    # ... add AWS credentials like AWS_ACCESS_KEY_ID, etc.
    ```

-   **For Google Drive**:
    ```env
    STORAGE_PROVIDER="google"
    # ... add Google Cloud credentials for the service account
    ```

If `STORAGE_PROVIDER` is not set, the service defaults to using AWS S3.

## 4. Security Model

The security of file operations is paramount and is handled by centralizing authorization in the backend.

-   **Backend Authorization**: Clients (browsers) **never** decide what they can upload or download. They must first ask the application's backend for permission.
-   **Server Actions as Gatekeepers**: A server action (e.g., in `app/actions/documents.ts`) is responsible for:
    1.  Verifying the user's identity and permissions using `checkPermission()`.
    2.  If authorized, calling `getStorageService().getPresignedUploadUrl(...)` or `getPresignedDownloadUrl(...)`.
    3.  Returning the secure, temporary URL to the client.
-   **Direct-to-Cloud Operations**: The client then uses the provided URL to upload or download the file directly to or from the cloud provider. This is efficient as the file data does not need to pass through the application server.

This model ensures that the application's RBAC rules are always enforced before any file operation can occur, regardless of the storage provider being used.
