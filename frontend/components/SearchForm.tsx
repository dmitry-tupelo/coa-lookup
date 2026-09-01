"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type Coa = {
  id: number;
  accessionNumber: string;
  lotNumber: string;
  productName: string;
  pdfFilename: string;
  createdAt: string;
};

export function SearchForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lotFromUrl = searchParams.get("lot")?.trim() ?? "";

  const [lot, setLot] = useState(lotFromUrl);
  const [results, setResults] = useState<Coa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  // Last value we actually looked up, so writing ?lot= to the URL below does
  // not bounce back through the effect and fire the same search twice.
  const lastSearched = useRef<string | null>(null);

  const runSearch = useCallback(async (value: string) => {
    lastSearched.current = value;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${API_URL}/coa?lot=${encodeURIComponent(value)}`
      );
      if (!res.ok) {
        throw new Error("Search failed");
      }
      const data = await res.json();
      setResults(data.results);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, []);

  // ?lot=LOT123 — the input is seeded above, look it up right away.
  useEffect(() => {
    if (!lotFromUrl || lastSearched.current === lotFromUrl) return;
    runSearch(lotFromUrl);
  }, [lotFromUrl, runSearch]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = lot.trim();

    runSearch(value);
    // Mirror the search into the URL so the result is shareable. `replace`
    // keeps the back button pointing wherever the visitor came from.
    router.replace(value ? `${pathname}?lot=${encodeURIComponent(value)}` : pathname, {
      scroll: false,
    });
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={lot}
          onChange={(e) => setLot(e.target.value)}
          placeholder="Enter LOT number"
          className="flex-1 rounded-md border border-zinc-300 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-zinc-900 px-6 py-3 font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? "Searching…" : "Look up"}
        </button>
      </form>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {searched && !error && results.length === 0 && (
        <p className="mt-4 text-zinc-600">No COA found for this LOT number.</p>
      )}

      {results.length > 0 && (
        <ul className="mt-6 space-y-3">
          {results.map((coa) => (
            <li
              key={coa.id}
              className="flex items-center justify-between rounded-md border border-zinc-200 bg-white p-4"
            >
              <div>
                <p className="font-medium text-zinc-900">{coa.productName}</p>
                <p className="text-sm text-zinc-600">LOT: {coa.lotNumber}</p>
              </div>
              <a
                href={`${API_URL}/coa/${coa.accessionNumber}/pdf`}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Download PDF
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
