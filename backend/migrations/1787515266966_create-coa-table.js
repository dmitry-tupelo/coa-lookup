/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable("coa", {
    id: "id",
    accession_number: { type: "text", notNull: true, unique: true },
    lot_number: { type: "text", notNull: true },
    product_name: { type: "text", notNull: true },
    pdf_filename: { type: "text", notNull: true },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
  });

  pgm.createIndex("coa", "lot_number");
};

export const down = (pgm) => {
  pgm.dropTable("coa");
};