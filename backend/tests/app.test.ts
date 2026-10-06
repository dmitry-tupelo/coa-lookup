import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from "../src/app.js";


describe("GET /coa", () => {
    it('return 400 when lot is missing', async() => {
        const res = await request(app).get('/coa')

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Invalid request");
    })

    it('return existing lot', async() => {
        const res = await request(app).get('/coa?lot=64003');

        expect(res.status).toBe(200);
        expect(res.body.found).toBe(true);
        expect(res.body.results[0].lotNumber).toBe('64003');
    })


    it('return empty results', async() => {
        const res = await request(app).get('/coa?lot=DOES_NOT_EXIST');

        expect(res.status).toBe(200);
        expect(res.body.found).toBe(false);
        expect(res.body.results).toEqual([])
    })
})

describe("GET /whatever", () => {
    it('return 404 when endpoint missing', async() => {
        const res = await request(app).get('/whatever')

        expect(res.status).toBe(404);
        expect(res.body.error).toBe("Not found");
    })
})

describe("GET /coa/:accession/pdf", () => {
    it('redirects to the PDF', async () => {
        const res = await request(app).get("/coa/2601270227/pdf");

        expect(res.status).toBe(302);
        expect(res.headers.location).toContain("vercel-storage.com");
    })
    it('return 404 if pdf not exist', async() => {
        const res = await request(app).get("/coa/nope/pdf");

        expect(res.status).toBe(404);
        expect(res.body.error).toBe("COA not found");
    })
})

describe("GET /health", () => {
    it('successful health check', async () => {
        const res  = await request(app).get('/health');

        expect(res.status).toBe(200);
        expect(res.body.health).toBe(true)
    })
})

describe("Security header", () => {
    it('x-powered-by doesn\'t exist', async () => {
        const res = await request(app).get("/whatever");

        expect(res.headers['x-powered-by']).toBe(undefined);
    })
    it('x-content-type-options exist and equal nosniff', async () => {
        const res = await request(app).get('/whatever');

        expect(res.headers['x-content-type-options']).toBe('nosniff')
    })
})