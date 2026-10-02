import { Router } from "express";
import { healthCheck } from "./healthcheck.service.js";

export const healthCheckRouter = Router();

healthCheckRouter.get('/', async (_req, res) => {
    const result = await healthCheck();
    res.status(result ? 200 : 503).json({health: result});
})