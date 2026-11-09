import { Router } from 'express';
import z from 'zod';
import { PDF_URL_PREFIX } from '../config.js';
import { getByAccession, searchByLot } from './coa.service.js';

export const coaRouter = Router();

const searchQuerySchema = z.object({
    lot: z.string().min(1, "lot is required")
})


coaRouter.get('/', async (req, res) => {
    const {lot} = searchQuerySchema.parse(req.query);
    const results = await searchByLot(lot);
    res.json({found: results.length > 0, results})
})

coaRouter.get("/:accession/pdf", async (req, res) => {
    const coa = await getByAccession(req.params.accession);
    if(!coa) return res.status(404).json({error: "COA not found"})

    // Blob returns a fully-encoded absolute URL.
    if(coa.pdfUrl) return res.redirect(coa.pdfUrl);

    // Local fallback for rows that have not been uploaded to Blob yet.
    if(coa.pdfFilename) return res.redirect(`${PDF_URL_PREFIX}/${encodeURIComponent(coa.pdfFilename)}`);

    return res.status(404).json({error: "COA PDF file not available yet"});
})