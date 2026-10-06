import { logger } from "../logger.js";
import { healthCheck as healthCheckQuery } from "./healthcheck.queries.js";

export async function healthCheck() {
    try {
        await healthCheckQuery();
        return true;
    }
    catch(err) {
        logger.error(err, "DB is down")
        return false
    }
}