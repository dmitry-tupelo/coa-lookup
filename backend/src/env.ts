import "dotenv/config"
import { z } from "zod"

export enum ENV {
    PROD = "production",
    STAGING ='staging',
    DEV = 'development',
    TEST = 'test'
}

export enum LOG_LEVEL {
    TRACE = 'trace',
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    FATAL = 'fatal',
    SILENT = 'silent'
}

// An origin is scheme + host (+ port) only: browsers send it without a path or
// trailing slash, and CORS compares it character for character.
const isOrigin = (value: string) => URL.canParse(value) && new URL(value).origin === value;

const envSchema = z.object({
    DATABASE_URL: z.url(),
    PORT: z.coerce.number().default(3001),
    // Comma-separated list of browser origins allowed to read API responses,
    // e.g. "https://linkbiomeds.com,https://www.linkbiomeds.com".
    CORS_ORIGIN: z
        .string()
        .default("http://localhost:3000")
        .transform((value) => value.split(",").map((origin) => origin.trim()).filter(Boolean))
        .pipe(
            z.array(
                z.string().refine(isOrigin, "must be an origin like https://example.com (no path, no trailing slash)"),
            ).min(1),
        ),
    NODE_ENV: z.enum(ENV).default(ENV.PROD),
    LOG_LEVEL: z.enum(LOG_LEVEL).default(LOG_LEVEL.INFO),
    ADMIN_API_KEY: z.string().min(32),
    BLOB_READ_WRITE_TOKEN: z.string().startsWith("vercel_blob_rw_"),
})

export const env = envSchema.parse(process.env)