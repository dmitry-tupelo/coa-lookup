import { Router } from 'express';
import z from 'zod';
import { PDF_URL_PREFIX } from '../config.js';
import { getByAccession, searchByLot } from './coa.service.js';

export const coaRouter = Router();

const searchQuerySchema = z.object({
    lot: z.string().min(1, "lot is required")
})


coaRouter.get('/', async (req, res, next) => {
    try {
        const {lot} = searchQuerySchema.parse(req.query);
        const results = await searchByLot(lot);
        res.json({found: results.length > 0, results})
    }
    catch (error) {
        next(error)
    }
})

coaRouter.get("/:accession/pdf", async (req, res, next) => {
    try{
        const coa = await getByAccession(req.params.accession);
        if(!coa) {
            res.status(404).json({error: "COA not found"})
            return;
        }
        // Blob returns a fully-encoded absolute URL; the local static path is
        // the fallback for rows that have not been uploaded yet.
        res.redirect(
            coa.pdfUrl ?? `${PDF_URL_PREFIX}/${encodeURIComponent(coa.pdfFilename)}`
        )
    }
    catch (error) {
        next(error)
    }
})