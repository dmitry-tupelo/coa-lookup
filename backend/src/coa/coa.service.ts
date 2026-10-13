import { getByAccession as getByAccessionQuery, insertCoa, searchByLot as searchByLotQuery } from './coa.queries.js';
import type { Coa, CoaInsert } from './coa.types.js';
import { normalizeLot } from './normalizeLot.js';

export async function searchByLot(rawLot: string): Promise<Coa[]> {
    return searchByLotQuery(normalizeLot(rawLot));
}

export async function getByAccession(accession: string): Promise<Coa | null> {
    return getByAccessionQuery(accession)
}

export async function createCoa(coa: CoaInsert): Promise<Coa> {
    const normalizedCoa = {...coa, lotNumber: normalizeLot(coa.lotNumber) }
    return insertCoa(normalizedCoa)
}