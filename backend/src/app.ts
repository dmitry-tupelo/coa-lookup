import cors from "cors";
import express from "express";
import helmet from "helmet";
import { randomUUID } from "node:crypto";
import { pinoHttp } from 'pino-http';
import { coaRouter } from "./coa/coa.routes.js";
import { PUBLIC_DIR } from "./config.js";
import { env } from "./env.js";
import { healthCheckRouter } from "./healthcheck/healthcheck.routes.js";
import { logger } from "./logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";

export const app = express();

app.use(pinoHttp({logger: logger, genReqId: function(req, res) {
    const reqID = req.headers["x-request-id"] || randomUUID();
    res.setHeader('X-Request-Id', reqID);
    return reqID;
}}));
app.use(helmet())
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

// Serves public/ locally; on Vercel this is ignored and the CDN serves it.
app.use(express.static(PUBLIC_DIR));

app.use("/health", healthCheckRouter);
app.use("/coa", coaRouter);

app.use(notFound)
app.use(errorHandler);