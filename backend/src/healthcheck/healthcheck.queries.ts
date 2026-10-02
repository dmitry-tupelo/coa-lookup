import { sql } from "../db.js";

export async function healthCheck() {
    const result = sql`
    SELECT true
    `;

    return await result;
}