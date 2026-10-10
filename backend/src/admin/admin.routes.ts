import { Router } from "express";

export const adminRouter = Router();


adminRouter.get("/ping", (_req,res) => res.json({ok: true}))