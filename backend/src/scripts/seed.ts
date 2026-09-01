/**
 * Loads seed/coa.json into the coa table, attaching the Vercel Blob URLs that
 * upload-pdfs.ts recorded in seed/blob-urls.json.
 *
 *   npm run seed
 *
 * Idempotent: re-running updates existing rows instead of failing on the
 * accession_number unique constraint, so it is safe to run after every
 * extraction or upload refresh.
 */

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { PDF_URL_PREFIX, PUBLIC_DIR } from "../config.js";
import { sql } from "../db.js";

const SEED_PATH = path.resolve("seed/coa.json");
const URLS_PATH = path.resolve("seed/blob-urls.json");

// extract_coa.py also records sourcePath/source for traceability; the table
// only stores these columns.
const SeedRowSchema = z.object({
  accessionNumber: z.string().trim().min(1),
  lotNumber: z.string().trim().min(1),
  productName: z.string().trim().min(1),
  pdfFilename: z.string().trim().min(1),
});

async function readUrlMap(): Promise<Record<string, string>> {
  try {
    const raw = await readFile(URLS_PATH, "utf8");
    return z.record(z.string(), z.string()).parse(JSON.parse(raw));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.warn(
        "seed/blob-urls.json not found — seeding without PDF URLs. " +
          "Run `npm run upload-pdfs` first, then re-run this to fill them in.",
      );
      return {};
    }
    throw error;
  }
}

async function main() {
  const parsed = z
    .array(SeedRowSchema)
    .parse(JSON.parse(await readFile(SEED_PATH, "utf8")));
  const blobUrls = await readUrlMap();

  const rows = parsed.map(
    ({ accessionNumber, lotNumber, productName, pdfFilename }) => ({
      accessionNumber,
      // searchByLot() normalises the query the same way, so the stored value
      // has to be normalised too or exact-match lookups miss.
      lotNumber: lotNumber.toUpperCase(),
      productName,
      pdfFilename,
      pdfUrl: blobUrls[pdfFilename] ?? null,
    }),
  );

  if (rows.length === 0) {
    throw new Error(`${SEED_PATH} contains no rows`);
  }

  const result = await sql`
    INSERT INTO coa ${sql(
      rows,
      "accessionNumber",
      "lotNumber",
      "productName",
      "pdfFilename",
      "pdfUrl",
    )}
    ON CONFLICT (accession_number) DO UPDATE SET
      lot_number   = EXCLUDED.lot_number,
      product_name = EXCLUDED.product_name,
      pdf_filename = EXCLUDED.pdf_filename,
      pdf_url      = EXCLUDED.pdf_url
    RETURNING (xmax = 0) AS inserted
  `;

  const inserted = (result as unknown as { inserted: boolean }[]).filter(
    (r) => r.inserted,
  ).length;
  console.log(
    `seeded ${result.length} rows (${inserted} inserted, ${result.length - inserted} updated)`,
  );
  console.log(
    `  with a Blob URL: ${rows.filter((r) => r.pdfUrl !== null).length}/${rows.length}`,
  );

  // A row with no Blob URL is only reachable if the file also sits in public/,
  // which is the local-dev fallback in coa.routes.ts.
  const pdfDir = path.join(PUBLIC_DIR, PDF_URL_PREFIX);
  const unreachable = rows.filter(
    (row) =>
      row.pdfUrl === null && !existsSync(path.join(pdfDir, row.pdfFilename)),
  );
  if (unreachable.length > 0) {
    console.warn(
      `WARNING: ${unreachable.length}/${rows.length} rows have neither a Blob URL nor a ` +
        `local file in ${path.relative(process.cwd(), pdfDir)} — /coa/:accession/pdf will 404 for them.`,
    );
    for (const row of unreachable.slice(0, 10)) {
      console.warn(`  ${row.accessionNumber}  ${row.pdfFilename}`);
    }
    if (unreachable.length > 10) {
      console.warn(`  ... and ${unreachable.length - 10} more`);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
