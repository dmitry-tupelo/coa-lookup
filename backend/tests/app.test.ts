import request from 'supertest';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { app } from "../src/app.js";
import { sql } from '../src/db.js';
import { env } from '../src/env.js';


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

describe("Admin auth", () => {
    it('without header', async () => {
        const res = await request(app).get('/admin/ping');

        expect(res.status).toBe(401);
        expect(res.body.error).toBe("Unauthorized");
    })

    it('wrong key', async () => {
        const res = await request(app).get('/admin/ping').set("Authorization", "Bearer 15bde954e614b966062bd2bd00f32ef66d0c24cd49c1093b9eb8be75baa68a1c");
        
        expect(res.status).toBe(401);
        expect(res.body.error).toBe("Unauthorized");
    })

    it('Malformed Bearer prefix', async () => {
        const res = await request(app).get('/admin/ping').set("Authorization", `Bearer${env.ADMIN_API_KEY}`);
        
        expect(res.status).toBe(401);
        expect(res.body.error).toBe("Unauthorized");
    })

    it("key wrong length", async () => {
        const res = await request(app).get('/admin/ping').set("Authorization", `Bearer test length`);

        expect(res.status).toBe(401);
        expect(res.body.error).toBe("Unauthorized");
    })

    it('real key', async () => {
        const res = await request(app).get('/admin/ping').set('Authorization', `Bearer ${env.ADMIN_API_KEY}`);

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true)
    })
})

describe("Admin: create COA", () => {
    const authHeader = {Authorization: `Bearer ${env.ADMIN_API_KEY}`};
    
    const cleanup = async () => {
        await sql`DELETE FROM coa WHERE accession_number LIKE 'TEST-%'`;
    }

    beforeAll(cleanup);
    afterEach(cleanup);


    it("POST → 201, Location, normalized lot", async () => {
        const testCoa = {"lotNumber": "test-0001", "productName": "TEST-0001", "accessionNumber": "TEST-0001"}

        const res = await request(app).post('/admin/coa').send(testCoa).set(authHeader);

        expect(res.status).toBe(201);
        expect(res.headers.location).toBe(`/admin/coa/${testCoa.accessionNumber}`);
        expect(res.body.lotNumber).toBe('TEST-0001');
    });
    it("GET by Location → 200 and same body", async () => { 
        const testCoa = {"lotNumber": "TEST-0001", "productName": "TEST-0001", "accessionNumber": "TEST-0001"}

        const insertCoaRes = await request(app).post('/admin/coa').send(testCoa).set(authHeader);
        const res = await request(app).get(insertCoaRes.headers.location).set(authHeader);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(insertCoaRes.body)
    });
    it("repeat POST → 409", async () => {
        const testCoa = {"lotNumber": "test-0001", "productName": "TEST-0001", "accessionNumber": "TEST-0001"}

        const res1 = await request(app).post('/admin/coa').send(testCoa).set(authHeader);
        const res2 = await request(app).post('/admin/coa').send(testCoa).set(authHeader);
        
        expect(res1.status).toBe(201);
        expect(res2.status).toBe(409);
        expect(res2.body.error).toBe(`COA with number ${testCoa.accessionNumber} already exists`)
    });
    it("invalid body → 400", async () => {
        const testCoa = {"lotNumber": "test-0001", "accessionNumber": "TEST-0001"}

        const res = await request(app).post('/admin/coa').send(testCoa).set(authHeader);
        
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Invalid request')
    });
    it("extra field → 400",async () => {
        const testCoa = {"extraField": "test","lotNumber": "test-0001", "productName": "TEST-0001", "accessionNumber": "TEST-0001"}

        const res = await request(app).post('/admin/coa').send(testCoa).set(authHeader);
        
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Invalid request')

    });
});