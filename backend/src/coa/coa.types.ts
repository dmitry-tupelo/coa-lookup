import { z } from "zod";


export const CoaSchema = z.object({
    id: z.number(),
    accessionNumber: z.string(),
    lotNumber: z.string(),
    productName: z.string(),
    pdfFilename: z.string(),
    // Null until upload-pdfs.ts has pushed the file to Vercel Blob; such rows
    // fall back to the file served from public/pdfs.
    pdfUrl: z.string().nullable(),
    createdAt: z.date()
});

export type Coa = z.infer<typeof CoaSchema>;