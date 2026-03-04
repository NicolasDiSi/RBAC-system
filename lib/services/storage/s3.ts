import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageService, UploadResult } from './types';
import { randomUUID } from 'crypto';
import path from 'path';

const sanitizeKey = (key: string) => {
  // It is a security risk to not sanitize the key, this can lead to path traversal attacks.
  const normalized = path.normalize(key);
  if (normalized.startsWith('..')) {
    throw new Error('Path traversal attempt detected.');
  }
  return normalized;
};

let s3Config: { client: S3Client; bucketName: string } | null = null;

const getS3Config = () => {
  if (s3Config) {
    return s3Config;
  }

  const requiredS3EnvVars = [
    'S3_REGION',
    'S3_ENDPOINT',
    'S3_ACCESS_KEY_ID',
    'S3_SECRET_ACCESS_KEY',
    'S3_BUCKET_NAME',
  ];

  for (const envVar of requiredS3EnvVars) {
    if (!process.env[envVar]) {
      throw new Error(
        `Missing required S3 environment variable for storage: ${envVar}`,
      );
    }
  }

  const client = new S3Client({
    region: process.env.S3_REGION!,
    endpoint: process.env.S3_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true, // Required for MinIO
  });

  const bucketName = process.env.S3_BUCKET_NAME!;

  s3Config = { client, bucketName };
  return s3Config;
};

async function upload(file: File, folder?: string): Promise<UploadResult> {
  const { client, bucketName } = getS3Config();
  const sanitizedFilename = path.basename(file.name);
  const key = folder
    ? `${sanitizeKey(folder)}/${randomUUID()}-${sanitizedFilename}`
    : `${randomUUID()}-${sanitizedFilename}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: file.type,
    ContentLength: file.size,
  });

  await client.send(command);

  return { key, provider: 's3' };
}

async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  size: number,
  checksum: string,
): Promise<{ url: string; key: string }> {
  const { client, bucketName } = getS3Config();
  const sanitizedKey = sanitizeKey(key);
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: sanitizedKey,
    ContentType: contentType,
    ContentLength: size,
    ChecksumSHA256: checksum,
  });

  const url = await getSignedUrl(client, command, { expiresIn: 300 }); // 5 minutes
  return { url, key: sanitizedKey };
}

async function getPresignedDownloadUrl(key: string): Promise<{ url: string }> {
  const { client, bucketName } = getS3Config();
  const sanitizedKey = sanitizeKey(key);
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: sanitizedKey,
  });

  const url = await getSignedUrl(client, command, { expiresIn: 300 }); // 5 minutes
  return { url };
}

async function deleteFile(key: string): Promise<void> {
  const { client, bucketName } = getS3Config();
  const sanitizedKey = sanitizeKey(key);
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: sanitizedKey,
  });

  await client.send(command);
}

export const s3Driver: StorageService = {
  upload,
  getPresignedUploadUrl,
  getPresignedDownloadUrl,
  deleteFile,
  createFolder: async (path: string) => {
    const { client, bucketName } = getS3Config();
    // To simulate a folder in S3, we create a zero-byte object with a trailing slash.
    const sanitizedPath = sanitizeKey(path);
    const folderKey = sanitizedPath.endsWith('/')
      ? sanitizedPath
      : `${sanitizedPath}/`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: folderKey,
      Body: '',
      ContentLength: 0,
    });

    await client.send(command);

    return { folderId: folderKey };
  },
  moveFile: async (sourceKey: string, destinationKey: string) => {
    const { client, bucketName } = getS3Config();
    const sanitizedSourceKey = sanitizeKey(sourceKey);
    const sanitizedDestinationKey = sanitizeKey(destinationKey);
    // S3 move is a copy and then delete operation.
    const copyCommand = new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: `${bucketName}/${sanitizedSourceKey}`,
      Key: sanitizedDestinationKey,
    });

    await client.send(copyCommand);

    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: sanitizedSourceKey,
    });

    await client.send(deleteCommand);
  },

  listFolderContents: async (path: string) => {
    const { client, bucketName } = getS3Config();
    const sanitizedPath = sanitizeKey(path);
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: sanitizedPath,
      Delimiter: '/',
    });

    const response = await client.send(command);

    const folders =
      response.CommonPrefixes?.map(prefix => ({
        key: prefix.Prefix!,
        type: 'folder' as const,
      })) ?? [];

    const files =
      response.Contents?.filter(content => content.Key !== sanitizedPath) // Filter out the folder placeholder itself
        .map(content => ({
          key: content.Key!,
          type: 'file' as const,
          size: content.Size,
          lastModified: content.LastModified,
        })) ?? [];

    return [...folders, ...files];
  },
};
