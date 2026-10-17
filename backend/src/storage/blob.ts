import { put } from "@vercel/blob";
import { env } from "../env.js";

export async function uploadPdf (pathname: string, body: Buffer): Promise<string> {
  const uploadBlob = await put(pathname, body, {
          access: "public",
          contentType: "application/pdf",
          token: env.BLOB_READ_WRITE_TOKEN,
          addRandomSuffix: false,
          allowOverwrite: true,
    });

    return uploadBlob.url
}