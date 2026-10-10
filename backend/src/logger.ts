import pino from "pino";
import { env, ENV, LOG_LEVEL } from "./env.js";

export const logger = pino({
    transport: env.NODE_ENV === ENV.DEV ? {
        target: 'pino-pretty'
    } : undefined,
    level: env.NODE_ENV === ENV.TEST ? LOG_LEVEL.SILENT : env.LOG_LEVEL,
    redact: ['req.headers.authorization'] 
});

