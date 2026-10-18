import createError from 'http-errors';
import postgres from 'postgres';
import { uploadPdf } from '../storage/blob.js';
import { getByAccession as getByAccessionQuery, insertCoa, searchByLot as searchByLotQuery, updateCoaPdf as updateCoaPdfQuery } from './coa.queries.js';
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
    try {
        const result = await insertCoa(normalizedCoa);
        return result;
    } catch (error) {
        if(error instanceof postgres.PostgresError && error.code === '23505') {
            throw createError(409, `COA with number ${coa.accessionNumber} already exists`);
        }
        throw error;
    }
}

export async function uploadCoaPdf(accessionNumber: string, file: Buffer): Promise<Coa> {
    const notFound = `COA with number ${accessionNumber} not found`;

    const coa = await getByAccessionQuery(accessionNumber);
    if (!coa) throw createError(404, notFound);

    const safeName = accessionNumber.replaceAll("/", "_");
    const url = await uploadPdf(`coa/${safeName}.pdf`, file);

    const updated = await updateCoaPdfQuery(accessionNumber, url);
    if (!updated) throw createError(404, notFound);

    return updated;
}