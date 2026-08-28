import cors from "cors";
import express from "express";
import { coaRouter } from "./coa/coa.routes.js";
import { PUBLIC_DIR } from "./config.js";
import { env } from "./env.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

// Serves public/ locally; on Vercel this is ignored and the CDN serves it.
app.use(express.static(PUBLIC_DIR));

app.use("/coa", coaRouter);

app.use(errorHandler);

app.listen(env.PORT, () => console.log(`API on :${env.PORT}`));