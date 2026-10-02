import { healthCheck as healthCheckQuery } from "./healthcheck.queries.js";

export async function healthCheck() {
    try {
        await healthCheckQuery();
        return true;
    }
    catch {
        console.error('DB is down');
        return false
    }
}