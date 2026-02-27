import { StorageService } from './types';
import { s3Driver } from './s3';
import { googleDriveDriver } from './google-drive';

let storageService: StorageService;

/**
 * Returns a singleton instance of the storage service based on the
 * STORAGE_PROVIDER environment variable.
 *
 * @throws Error if the STORAGE_PROVIDER environment variable is not set or is invalid.
 * @returns An instance of IStorageService.
 */
function getStorageService(): StorageService {
  const storageProvider = process.env.STORAGE_PROVIDER;

  if (!storageProvider) {
    throw new Error('STORAGE_PROVIDER environment variable is not set.');
  }

  switch (storageProvider) {
    case 's3':
      console.log('Using S3 storage provider.');
      return s3Driver;
    case 'google-drive':
      console.log('Using Google Drive storage provider.');
      return googleDriveDriver;
    default:
      throw new Error(
        `Invalid STORAGE_PROVIDER: "${storageProvider}". Must be "s3" or "google-drive".`
      );
  }
}

// Create a single instance of the storage service for the application lifecycle.
storageService = getStorageService();

export { storageService };
