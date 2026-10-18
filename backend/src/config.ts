import path from "node:path";

// PDFs live in public/ so Vercel serves them from its CDN.
// Locally the same files are served by express.static (see index.ts),
// so the public URL path is identical in both environments.
export const PUBLIC_DIR = path.resolve("public");

export const PDF_URL_PREFIX = "/pdfs";

// Vercel Functions reject request bodies over 4.5 MB before they reach
// Express, and multipart framing adds a little on top of the file itself.
export const ALLOWED_PDF_FILESIZE_BYTES = 4 * 1024 * 1024;
