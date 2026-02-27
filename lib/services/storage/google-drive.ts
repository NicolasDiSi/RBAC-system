import { google } from 'googleapis';
import { StorageService } from './types';

// Ensure all required environment variables are set.
const requiredGoogleEnvVars = [
  'GOOGLE_APPLICATION_CREDENTIALS',
  'GOOGLE_DRIVE_FOLDER_ID',
];

for (const envVar of requiredGoogleEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required Google Drive environment variable for storage: ${envVar}`);
  }
}

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID!;

/**
 * Initializes the Google Drive API client using a service account.
 */
function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  return google.drive({ version: 'v3', auth });
}

/**
 * Finds a file's ID in Google Drive based on its name (key) within the designated folder.
 * @param key The name of the file to find.
 * @returns The file ID or null if not found.
 */
async function getFileId(key: string): Promise<string | null> {
  const drive = getDriveClient();
  try {
    const res = await drive.files.list({
      q: `name='${key}' and '${FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (res.data.files && res.data.files.length > 0) {
      return res.data.files[0].id || null;
    }
    return null;
  } catch (error) {
    console.error(`Failed to find file ID for key: ${key}`, error);
    throw new Error('Could not retrieve file from Google Drive.');
  }
}

/**
 * Generates a unique URL for a resumable upload session in Google Drive.
 * The client will use this URL to directly upload the file content.
 */
async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  size: number
): Promise<{ url: string; key: string }> {
  const drive = getDriveClient();

  const fileMetadata = {
    name: key,
    parents: [FOLDER_ID],
  };

  try {
    const { headers } = await drive.files.create(
      {
        requestBody: fileMetadata,
        media: {
          mimeType: contentType,
        },
        fields: 'id',
        // @ts-ignore
        GaxiosOptions: {
          headers: {
            'X-Upload-Content-Type': contentType,
            'X-Upload-Content-Length': size.toString(),
          },
        },
      },
      {
        responseType: 'full',
      }
    );

    const uploadUrl = headers.location;

    if (!uploadUrl) {
      throw new Error('Could not get resumable upload URL from Google Drive API.');
    }

    return { url: uploadUrl, key };
  } catch (error) {
    console.error('Failed to create Google Drive resumable upload session:', error);
    throw new Error('Could not initiate upload session with Google Drive.');
  }
}

/**
 * Returns a relative URL that points to our own backend endpoint for file viewing.
 * This ensures that all downloads are authenticated and authorized by our app.
 */
async function getPresignedDownloadUrl(key: string): Promise<{ url: string }> {
  // This URL doesn't grant access directly. It points to our Next.js API route
  // that will verify permissions and then stream the file.
  return Promise.resolve({ url: `/api/documents/view/${encodeURIComponent(key)}` });
}

/**
 * Deletes a file from Google Drive. It first needs to find the file's ID.
 */
async function deleteFile(key: string): Promise<void> {
  const fileId = await getFileId(key);

  if (!fileId) {
    // If the file doesn't exist, we can consider the deletion successful.
    console.warn(`File with key "${key}" not found in Google Drive. Nothing to delete.`);
    return;
  }

  const drive = getDriveClient();
  try {
    await drive.files.delete({ fileId });
  } catch (error) {
    console.error(`Failed to delete file with key "${key}" (ID: ${fileId}) from Google Drive:`, error);
    throw new Error('Could not delete file from Google Drive.');
  }
}

export const googleDriveDriver: StorageService = {
  getPresignedUploadUrl,
  getPresignedDownloadUrl,
  deleteFile,
};
