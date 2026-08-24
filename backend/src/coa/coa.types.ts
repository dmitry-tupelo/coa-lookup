import { z } from "zod";


export const CoaSchema = z.object({
    id: z.number(),
    accessionNumber: z.string(),
    lotNumber: z.string(),
    productName: z.string(),
    pdfFilename: z.string(),
    createdAt: z.date()
});

export type Coa = z.infer<typeof CoaSchema>;