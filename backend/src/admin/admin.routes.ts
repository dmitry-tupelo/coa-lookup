import { Router } from "express";
import z from "zod";
import { createCoa, getByAccession } from "../coa/coa.service.js";

export const adminRouter = Router();

const CreateCoaBodySchema = z.strictObject({
  accessionNumber: z.string().trim().min(1, "Accession number required").max(100),
  lotNumber: z.string().trim().min(1, "LOT number required").max(100),
  productName: z.string().trim().min(1, "Product name required").max(100),
});

adminRouter.get("/ping", (_req,res) => res.json({ok: true}))

adminRouter.post("/coa", async (req, res) =>  {
    const requestBody = CreateCoaBodySchema.parse(req.body);
    const createdCoa = await createCoa(requestBody)
    return res.status(201).location(`/admin/coa/${encodeURIComponent(createdCoa.accessionNumber)}`).json(createdCoa)
});

adminRouter.get("/coa/:accession", async (req, res) => {
  const coa = await getByAccession(req.params.accession);
  if(!coa) return res.status(404).json({error: "COA not found"})

  return res.json(coa)
})