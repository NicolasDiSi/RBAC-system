export interface UploadResult {
  key: string;
  provider: string;
}

export interface StorageService {
  /**
   * Uploads a file from a server-side context.
   * @param file The file to upload.
   * @param folder An optional folder to place the file in.
   * @returns A promise that resolves to the storage key and provider.
   */
  upload(file: File, folder?: string): Promise<UploadResult>;
  
  /**
   * Generates a secure URL for uploading a file directly to the storage provider.
   * The service is responsible for creating a unique storage key.
   * @returns A promise that resolves to the presigned URL and the unique key for the file.
   */
  getPresignedUploadUrl(
    fileName: string,
    contentType: string,
    size: number,
    checksum: string
  ): Promise<{ url: string; key: string }>;

  /**
   * Generates a secure, short-lived URL to download or view a file.
   * @param key The unique storage key of the file.
   * @returns A promise that resolves to the presigned URL.
   */
  getPresignedDownloadUrl(key: string): Promise<{ url: string }>;

  /**
   * Deletes a file permanently from the storage provider.
   * @param key The unique storage key of the file.
   */
  deleteFile(key: string): Promise<void>;

  /**
   * Creates a new folder.
   * @param path The full path of the folder to create.
   * @returns A promise that resolves with the unique ID or path of the created folder.
   */
  createFolder(path: string): Promise<{ folderId: string }>;

  /**
   * Moves a file from a source path to a destination path.
   * @param sourceKey The current key of the file.
   * @param destinationKey The new key for the file.
   */
  moveFile(sourceKey: string, destinationKey: string): Promise<void>;

  /**
   * Lists the contents (files and subfolders) of a given folder path.
   * @param path The path of the folder to list.
   * @returns A promise that resolves to a list of items in the folder.
   */
  listFolderContents(path: string): Promise<any[]>; // Replace 'any' with a proper type later
}

