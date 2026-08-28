import path from "node:path";

// PDFs live in public/ so Vercel serves them from its CDN.
// Locally the same files are served by express.static (see index.ts),
// so the public URL path is identical in both environments.
export const PUBLIC_DIR = path.resolve("public");

export const PDF_URL_PREFIX = "/pdfs";
