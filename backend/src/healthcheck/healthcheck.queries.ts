import { sql } from "../db.js";

export async function healthCheck() {
    const result = sql`
    SELECT pg_sleep(5)
    `;

    return await result;
}