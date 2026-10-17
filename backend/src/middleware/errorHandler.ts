import type { ErrorRequestHandler } from "express";
import { MulterError } from "multer";
import { STATUS_CODES } from 'node:http';
import { ZodError } from "zod";
import { ALLOWED_PDF_FILESIZE_BYTES } from "../config.js";

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "Invalid request", details: err.issues });
    return;
  }

  if(err instanceof MulterError) {
    if(err.code === 'LIMIT_FILE_SIZE') {
      const maxMb = ALLOWED_PDF_FILESIZE_BYTES / (1024 * 1024);
      req.log.warn({ err, maxBytes: ALLOWED_PDF_FILESIZE_BYTES }, "Uploaded file too large");
      res.status(413).json({error: `File size should be not more than ${maxMb}MB`});
      return;
    }
    req.log.warn(err, "Invalid multipart upload");
    res.status(400).json({error: "Invalid request"});
    return;
  }

  if(err.status && typeof err.status === 'number' && (err.status >= 400 && err.status <500 )) {
    req.log.warn(err, 'Client error')
    res.status(err.status).json({error: err.expose ? err.message : STATUS_CODES[err.status]})
    return;
  }
  req.log.error(err, "Unhandled error");
  res.status(500).json({ error: "Internal server error" });
};
