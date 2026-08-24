import { sql } from "../db.js";
import { CoaSchema, type Coa } from "./coa.types.js";

export async function searchByLot(lot: string): Promise<Coa[]> {
    const result = await sql`
    SELECT * FROM coa WHERE lot_number = ${lot}
    `;
    const rows = result as unknown as Record<string, unknown>[];
    return rows.map((row) => CoaSchema.parse(row));
}

export async function getByAccession(accession: string): Promise<Coa | null> {
    const result = await sql`
    SELECT * FROM coa WHERE accession_number = ${accession}
    `;

    const rows = result as unknown as Record<string, unknown>[];
    if(rows.length === 0) return null;
    return CoaSchema.parse(rows[0])
}