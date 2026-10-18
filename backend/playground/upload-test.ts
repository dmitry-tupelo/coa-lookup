/**
 * Smoke test for src/storage/blob.ts against the dev Blob store.
 *
 *   npx tsx playground/upload-test.ts
 *
 * Uploads public/pdfs/ACC-001.pdf twice through uploadPdf(), checks that each
 * URL serves a PDF and that the random suffix gives every upload its own URL,
 * then deletes both test blobs so the store stays empty.
 */

import { del } from "@vercel/blob";
import { readFile } from "node:fs/promises";
import { env } from "../src/env.js";
import { isPdf } from "../src/coa/isPdf.js";
import { uploadPdf } from "../src/storage/blob.js";

const body = await readFile("public/pdfs/ACC-001.pdf");

const urls = [
  await uploadPdf("playground/acc-001.pdf", body),
  await uploadPdf("playground/acc-001.pdf", body),
];

try {
  for (const url of urls) {
    const res = await fetch(url);
    const bytes = Buffer.from(await res.arrayBuffer());
    console.log(url);
    console.log(
      `  ${res.status} | ${res.headers.get("content-type")} | ` +
        `${bytes.length} bytes | starts with %PDF-: ${isPdf(bytes)}`,
    );
  }
  console.log(`unique URL per upload: ${urls[0] !== urls[1]}`);
} finally {
  await del(urls, { token: env.BLOB_READ_WRITE_TOKEN });
  console.log("test blobs deleted");
}
