import createError from 'http-errors';
import postgres from 'postgres';
import { logger } from '../logger.js';
import { removePdf, uploadPdf } from '../storage/blob.js';
import { normalizeLot } from './coa.helpers.js';
import { deleteCoa as deleteCoaQuery, getByAccession as getByAccessionQuery, insertCoa, searchByLot as searchByLotQuery, updateCoaPdf as updateCoaPdfQuery, updateCoa as updateCoaQuery } from './coa.queries.js';
import type { Coa, CoaInsert, CoaUpdate } from './coa.types.js';

export const removePdfBestEffort = async (url: string) => {
  try {
      await removePdf(url);
  } catch (removeErr) {
      logger.warn({ err: removeErr, url }, "Failed to remove orphaned PDF");
  }
}

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

    let updated;
    try { 
        updated = await updateCoaPdfQuery(accessionNumber, url);
        if(!updated) {
            throw createError(404, notFound);

        }
        if(coa.pdfUrl){
            await removePdfBestEffort(coa.pdfUrl);
        }
    } catch(err) {
        await removePdfBestEffort(url);
        throw err;
    }

    return updated;

}

export async function deleteCoa(accessionNumber: string): Promise<void> {
    const deleted = await deleteCoaQuery(accessionNumber);
    if(!deleted) {
        throw createError(404, `COA with ${accessionNumber} accession number doesn't exist`)
    }
    if(deleted.pdfUrl) {
        await removePdfBestEffort(deleted.pdfUrl);
    }
}

export async function updateCoa(accessionNumber: string, coa: CoaUpdate): Promise<Coa>{
    let normalizedCoa = coa;
    if(coa.lotNumber) {
        normalizedCoa = {...coa, lotNumber: normalizeLot(coa.lotNumber)}
    }

    const updated = await updateCoaQuery(normalizedCoa, accessionNumber);
    if(!updated) {
        throw createError(404, `COA with ${accessionNumber} accession number doesn't exist`)
    }
    return updated;
}