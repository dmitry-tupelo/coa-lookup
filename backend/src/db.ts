import postgres from "postgres";
import { env } from "./env.js";

export const sql = postgres(env.DATABASE_URL, {
    transform: postgres.camel
})