import cors from "cors";
import express from "express";
import { coaRouter } from "./coa/coa.routes.js";
import { env } from "./env.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

app.use("/coa", coaRouter);

app.use(errorHandler);

app.listen(env.PORT, () => console.log(`API on :${env.PORT}`));