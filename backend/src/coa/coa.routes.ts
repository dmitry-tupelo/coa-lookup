import { Router } from 'express';
import path from "node:path";
import z from 'zod';
import { PDF_STORAGE_DIR } from '../config.js';
import { searchByLot } from './coa.queries.js';
import { getByAccession } from './coa.service.js';

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
        const filepath = path.join(PDF_STORAGE_DIR, coa.pdfFilename);
        res.sendFile(filepath, (error) => {
            if(error) next(error)
        })
    }
    catch (error) {
        next(error)
    }
})