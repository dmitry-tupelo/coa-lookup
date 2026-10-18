import { Router } from "express";
import multer from "multer";
import z from "zod";
import { createCoa, getByAccession, uploadCoaPdf } from "../coa/coa.service.js";
import { isPdf } from "../coa/isPdf.js";
import { ALLOWED_PDF_FILESIZE_BYTES } from "../config.js";

export const adminRouter = Router();

const CreateCoaBodySchema = z.strictObject({
  accessionNumber: z.string().trim().min(1, "Accession number required").max(100),
  lotNumber: z.string().trim().min(1, "LOT number required").max(100),
  productName: z.string().trim().min(1, "Product name required").max(100),
});

const UploadPdfSchema = z.string().trim().min(1, "Accession number required").max(100);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: ALLOWED_PDF_FILESIZE_BYTES }});

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


const middlewareMulter = upload.single( "pdf")
adminRouter.put("/coa/:accession/pdf", middlewareMulter, async (req, res) => {
  if(!req.file) return res.status(400).json({error: "Attach file"});

  if(!isPdf(req.file.buffer)){
    return res.status(415).json({error: 'Please, upload PDF'});
  }
  
  const accessionNumber = UploadPdfSchema.parse(req.params.accession)
  const result = await uploadCoaPdf(accessionNumber, req.file.buffer)

  return res.json(result);
})