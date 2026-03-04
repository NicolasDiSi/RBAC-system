import { StorageService } from "./types";
import { s3Driver } from "./s3";
import { googleDriveDriver } from "./google-drive";
import { ConfigurationError } from "@/lib/errors";

const dummyStorageProvider: StorageService = {
  upload: async () => {
    throw new ConfigurationError("Storage provider is not configured.");
  },
  getPresignedUploadUrl: async () => {
    throw new ConfigurationError("Storage provider is not configured.");
  },
  getPresignedDownloadUrl: async () => {
    throw new ConfigurationError("Storage provider is not configured.");
  },
  deleteFile: async () => {
    throw new ConfigurationError("Storage provider is not configured.");
  },
  createFolder: async () => {
    throw new ConfigurationError("Storage provider is not configured.");
  },
  moveFile: async () => {
    throw new ConfigurationError("Storage provider is not configured.");
  },
  listFolderContents: async () => {
    throw new ConfigurationError("Storage provider is not configured.");
  },
};

let storageService: StorageService;

/**
 * Returns a singleton instance of the storage service based on the
 * STORAGE_PROVIDER environment variable.
 *
 * @returns An instance of StorageService.
 */
function getStorageService(): StorageService {
  const storageProvider = process.env.STORAGE_PROVIDER;

  if (!storageProvider) {
    console.warn(
      "⚠️ STORAGE_PROVIDER environment variable is not set. Using dummy storage provider that will throw errors on use."
    );
    return dummyStorageProvider;
  }

  switch (storageProvider) {
    case "s3":
      console.log("Using S3 storage provider.");
      return s3Driver;
    case "google-drive":
      console.log("Using Google Drive storage provider.");
      return googleDriveDriver;
    default:
      throw new ConfigurationError(
        `Invalid STORAGE_PROVIDER: "${storageProvider}". Must be "s3" or "google-drive".`
      );
  }
}

// Create a single instance of the storage service for the application lifecycle.
storageService = getStorageService();

export { storageService };
