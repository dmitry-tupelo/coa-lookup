import request from 'supertest';
import { describe, expect, it } from "vitest";
import { app } from "../src/app";
import { RATE_LIMIT_REQUESTS } from '../src/config';


describe("Rate Limit", () => {
    it("return 429 when rate limit hits", async () => {
        for(let i = 0; i < RATE_LIMIT_REQUESTS; i++) {
            await request(app).get('/admin/coa');
        }
        const res  = await request(app).get('/admin/coa');

        expect(res.status).toBe(429)
    })
})