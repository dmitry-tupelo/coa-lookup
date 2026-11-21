import { afterEach, describe, expect, it, vi } from "vitest";
import { searchCoa } from "./coa";

describe("searchCoa", () => {
    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it("returns ok: true with data on 200", async () => {
        const body = { found: true, results: [] };
        const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), {status: 200})
        );
        vi.stubGlobal("fetch", fetchMock);

        const result = await searchCoa("64003");
        expect(result).toEqual({ok: true, data : body });
    })
    it("returns ok: false on 500", async () => {
      const body = { found: true, results: [] };
        const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), {status: 500})
        );
        vi.stubGlobal("fetch", fetchMock);

        const result = await searchCoa("64003");
        expect(result.ok).toBe(false);
  });

  it("returns ok: false when fetch throws", async () => {
        const fetchMock = vi.fn().mockRejectedValue(new Error('500 error test')
        );
        vi.stubGlobal("fetch", fetchMock);

        const result = await searchCoa("64003");
        expect(result.ok).toBe(false);
  });
})