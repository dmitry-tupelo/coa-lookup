import { Router } from "express";
import z from "zod";

export const adminRouter = Router();

const CreateCoaBodySchema = z.strictObject({
    accessionNumber: z.string().trim().min(1, "Accession number required").max(100),
  lotNumber: z.string().trim().min(1, "LOT number required").max(100),
  productName: z.string().trim().min(1, "Product name required").max(100),
});

adminRouter.get("/ping", (_req,res) => res.json({ok: true}))

adminRouter.post("/coa", (req, res) => {
    const result = CreateCoaBodySchema.parse(req.body);
    return res.json(result);
});