export interface StorageService {
  getPresignedUploadUrl(
    key: string,
    contentType: string,
    size: number,
    checksum: string
  ): Promise<{ url: string; key: string }>;
  getPresignedDownloadUrl(key: string): Promise<{ url: string }>;
  deleteFile(key: string): Promise<void>;
}
