import { z } from "zod";


export const CoaSchema = z.object({
    id: z.number(),
    accessionNumber: z.string(),
    lotNumber: z.string(),
    productName: z.string(),
    pdfFilename: z.string(),
    // Null until upload-pdfs.ts has pushed the file to Vercel Blob; such rows
    // fall back to the file served from public/pdfs.
    // nullish, not nullable: if this build reaches a database where the
    // pdf_url migration has not run yet, SELECT * returns no such key at all.
    // Tolerating that degrades to the static fallback instead of failing every
    // row and taking the endpoint down.
    pdfUrl: z.string().nullish(),
    createdAt: z.date()
});

export type Coa = z.infer<typeof CoaSchema>;