/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

// Absolute URL returned by Vercel Blob's put(). Stored rather than rebuilt from
// pdf_filename because the certificate names contain spaces, "+" and brackets,
// and the store is the authority on how those are encoded.
// Nullable: rows fall back to the express.static /pdfs path for local dev.
export const up = (pgm) => {
  pgm.addColumn("coa", {
    pdf_url: { type: "text" },
  });
};

export const down = (pgm) => {
  pgm.dropColumn("coa", "pdf_url");
};
