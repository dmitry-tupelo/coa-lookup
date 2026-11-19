
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface CoaItem {
    id: number;
    accessionNumber: string;
    lotNumber: string;
    productName: string;
    pdfFilename: string | null;
    pdfUrl: string | null;
    createdAt: string;
}

interface ApiSearchResponse  {
    found: boolean;
    results: CoaItem[];
}

type SearchResult =
  | { ok: true; data: ApiSearchResponse  }
  | { ok: false; error: string };

export const searchCoa = async (lot: string): Promise<SearchResult>  => {
    try {
    const res = await fetch(
        `${API_URL}/coa?lot=${encodeURIComponent(lot)}`)
        if(!res.ok) return {ok: false, error: "Something went wrong"};
        return {ok: true, data: await res.json() }
    } catch(error) {
        console.error(error)
        return {ok:false, error: "Something went wrong"}
    }
}