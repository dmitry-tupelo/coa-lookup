import { getByAccession as getByAccessionQuery, searchByLot as searchByLotQuery } from './coa.queries.js';
import type { Coa } from './coa.types.js';

export async function searchByLot(rawLot: string): Promise<Coa[]> {
    const normalized = rawLot.trim().toUppercase();
    return searchByLotQuery(normalized);
}

export async function getByAccession(accession: string) {
    return getByAccessionQuery(accession)
}