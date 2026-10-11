import type { ErrorRequestHandler } from "express";
import { STATUS_CODES } from 'node:http';
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "Invalid request", details: err.issues });
    return;
  }
  if(err.status && typeof err.status === 'number' && (err.status >= 400 && err.status <500 )) {
    req.log.warn(err, 'Client error')
    res.status(err.status).json({error: STATUS_CODES[err.status]})
    return;
  }
  req.log.error(err, "Unhandled error");
  res.status(500).json({ error: "Internal server error" });
};
