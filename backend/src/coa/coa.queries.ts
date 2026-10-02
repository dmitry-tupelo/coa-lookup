import { sql } from "../db.js";
import { CoaSchema, type Coa } from "./coa.types.js";

export async function searchByLot(lot: string): Promise<Coa[]> {
    const rows = await sql`
    SELECT * FROM coa WHERE lot_number = ${lot}
    `;
    return rows.map((row) => CoaSchema.parse(row));
}

export async function getByAccession(accession: string): Promise<Coa | null> {
    const rows = await sql`
    SELECT * FROM coa WHERE accession_number = ${accession}
    `;

    if(rows.length === 0) return null;
    return CoaSchema.parse(rows[0])
}