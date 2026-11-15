
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
    results: CoaItem[]
}

export const searchCoa = async (lot: string): Promise<ApiSearchResponse>  => {
    const res = await fetch(
        `${API_URL}/coa?lot=${encodeURIComponent(lot)}`)
        if(!res.ok) throw  new Error("Error search COA");
        return res.json()
}