/**
 * Uploads the COA PDFs referenced by seed/coa.json to Vercel Blob and records
 * the resulting public URLs in seed/blob-urls.json.
 *
 *   BLOB_READ_WRITE_TOKEN=... npm run upload-pdfs
 *
 * Resumable: files already listed in seed/blob-urls.json are skipped, and the
 * map is flushed to disk as uploads complete, so an interrupted run (or a
 * rate limit) can be restarted without re-uploading ~569 MB.
 *
 * Run `npm run seed` afterwards to write the URLs into the coa table.
 */

// The API server picks .env up via env.ts; this script does not import it
// (it needs no DATABASE_URL), so it loads dotenv itself for the Blob credentials.
// `vercel env pull` writes .env.local, a hand-copied token usually lands in
// .env — read both, first match wins.
import { config } from "dotenv";
config({ path: [".env.local", ".env"] });

import { put } from "@vercel/blob";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const ROOT = path.resolve("..");
const SEED_PATH = path.resolve("seed/coa.json");
const URLS_PATH = path.resolve("seed/blob-urls.json");

// Hobby allows 1500 advanced operations per minute; 8 in flight stays far below
// that while keeping a 569 MB upload from taking all afternoon.
const CONCURRENCY = 8;

const SeedRowSchema = z.object({
  pdfFilename: z.string().trim().min(1),
  sourcePath: z.string().trim().min(1),
});

async function readUrlMap(): Promise<Record<string, string>> {
  try {
    const raw = await readFile(URLS_PATH, "utf8");
    return z.record(z.string(), z.string()).parse(JSON.parse(raw));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw error;
  }
}

// A public store still requires credentials to write; without this check the
// per-file catch below would report the same auth failure 353 times.
function assertCredentials() {
  const hasToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  const hasOidc =
    Boolean(process.env.VERCEL_OIDC_TOKEN) && Boolean(process.env.BLOB_STORE_ID);
  if (hasToken || hasOidc) return;

  throw new Error(
    "No Vercel Blob credentials found. Making the store public affects reads " +
      "only — uploads always need a credential. Either run `vercel env pull` " +
      "in backend/ (writes .env.local), or copy BLOB_READ_WRITE_TOKEN from the " +
      "store's dashboard into backend/.env.",
  );
}

async function main() {
  assertCredentials();

  const rows = z
    .array(SeedRowSchema)
    .parse(JSON.parse(await readFile(SEED_PATH, "utf8")));

  const urls = await readUrlMap();
  const pending = rows.filter((row) => !urls[row.pdfFilename]);

  console.log(
    `${rows.length} PDFs referenced, ${rows.length - pending.length} already uploaded, ${pending.length} to go`,
  );
  if (pending.length === 0) return;

  let done = 0;
  let failed = 0;
  let cursor = 0;

  // Flushing on every completion would rewrite the file 353 times; batching by
  // elapsed time keeps it resumable without the churn.
  let lastFlush = Date.now();
  const flush = async () => {
    await writeFile(URLS_PATH, `${JSON.stringify(urls, null, 2)}\n`);
    lastFlush = Date.now();
  };

  const worker = async () => {
    while (cursor < pending.length) {
      const row = pending[cursor++];
      const body = await readFile(path.join(ROOT, row.sourcePath));

      try {
        const blob = await put(row.pdfFilename, body, {
          access: "public",
          contentType: "application/pdf",
          // Keeps the pathname exactly as stored in pdf_filename.
          addRandomSuffix: false,
          // Without this a re-upload of an existing pathname throws.
          allowOverwrite: true,
        });
        urls[row.pdfFilename] = blob.url;
        done += 1;
      } catch (error) {
        failed += 1;
        console.error(`FAILED ${row.pdfFilename}: ${(error as Error).message}`);
      }

      if (Date.now() - lastFlush > 5000) await flush();
      if ((done + failed) % 25 === 0) {
        console.log(`  ${done + failed}/${pending.length} (${failed} failed)`);
      }
    }
  };

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  await flush();

  console.log(`uploaded ${done}, failed ${failed} -> seed/blob-urls.json`);
  if (failed > 0) {
    console.log("re-run to retry the failures; successful uploads are skipped");
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
