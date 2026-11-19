import { searchCoa } from "@/lib/coa";

interface ISearchResults {
    lot: string;
}

const SearchResults = async ({ lot }: ISearchResults) => {
    const searchResult = await searchCoa(lot);
    if (!searchResult.ok) return (<div className="text-red-600 mt-3 text-sm">{searchResult.error}</div>)
    if (!searchResult.data.found) return (<div className="text-red-600 mt-3 text-sm">No COA found for {lot}</div>)


    return (
        <div className="flex flex-col mt-8 gap-4">
            {searchResult.data.results.map((coa) => {
                return (
                    <div key={coa.accessionNumber} className="flex flex-row justify-between bg-gray-100 p-4 rounded-md items-center">
                        <div>
                            <p className="font-bold text-xl">{coa.productName}</p>
                            <p className="text-sm">{coa.accessionNumber}</p>
                        </div>
                        {coa.pdfUrl && (
                            <div>
                                <a target="_blank" rel="noopener" href={coa.pdfUrl} className="rounded-md bg-slate-800 px-6 py-3 font-medium text-white hover:bg-slate-400 ">Download</a>
                            </div>
                        )
                        }
                    </div>
                )
            })}
        </div>)
}

export default SearchResults;