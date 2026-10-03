import { sql } from "../db.js";

export async function healthCheck() {
    const result = sql`
    SELECT 1+1
    `;

    return await result;
}