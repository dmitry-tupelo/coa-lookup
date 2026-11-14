import rateLimit from "express-rate-limit";
import { RATE_LIMIT_PERIOD_MS, RATE_LIMIT_REQUESTS } from "../config.js";

export const adminRateLimit = rateLimit({
    limit: RATE_LIMIT_REQUESTS,
    windowMs: RATE_LIMIT_PERIOD_MS,
    legacyHeaders: false,
    standardHeaders: "draft-8",
    message: {error: "Requests limit reached, try again later."}
})