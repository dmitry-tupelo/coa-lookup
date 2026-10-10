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

const envSchema = z.object({
    DATABASE_URL: z.url(),
    PORT: z.coerce.number().default(3001),
    CORS_ORIGIN: z.string().default("http://localhost:3000"),
    NODE_ENV: z.enum(ENV).default(ENV.PROD),
    LOG_LEVEL: z.enum(LOG_LEVEL).default(LOG_LEVEL.INFO),
    ADMIN_API_KEY: z.string().min(32),
})

export const env = envSchema.parse(process.env)