import cors from "cors";
import express from "express";
import { coaRouter } from "./coa/coa.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/coa", coaRouter);

app.use(errorHandler);

app.listen(3001, () => console.log("API on :3001"));