
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/services/auth/user";
import { checkPermission } from "@/lib/services/auth/permissions";
import { getDb } from "@/lib/db";
import { documentos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Readable } from "stream";

// This function is a simplified version of the one in the driver
function getDriveClient() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error("Google credentials are not set.");
  }
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  return google.drive({ version: "v3", auth });
}

async function getFileId(drive: any, key: string, folderId: string): Promise<string | null> {
  const res = await drive.files.list({
    q: `name='${key}' and '${folderId}' in parents and trashed=false`,
    fields: "files(id)",
    spaces: "drive",
  });
  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id || null;
  }
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { file_key: string[] } }
) {
  // This route is only for Google Drive
  if (process.env.STORAGE_PROVIDER !== "google-drive") {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const user = await getAuthenticatedUser();
    const hasPermission = await checkPermission("documents.read");
    if (!user || !hasPermission) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const fileKey = params.file_key.join("/");
    const db = await getDb();
    
    const document = await db.query.documentos.findFirst({
        where: eq(documentos.storageKey, fileKey)
    })

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    const drive = getDriveClient();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!folderId) {
      throw new Error("Google Drive folder ID is not configured.");
    }
    const fileId = await getFileId(drive, fileKey, folderId);

    if (!fileId) {
      return new NextResponse("File not found in storage.", { status: 404 });
    }

    const { data: fileStream } = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );
    
    // @ts-ignore
    const readableStream = new Readable().wrap(fileStream);

    return new NextResponse(readableStream, {
        headers: {
            "Content-Type": document.fileType || "application/octet-stream",
            "Content-Disposition": `inline; filename="${document.nombreArchivo}"`,
        },
    });

  } catch (error) {
    console.error("Error streaming file from Google Drive:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
