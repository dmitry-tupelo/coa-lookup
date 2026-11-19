import { searchCoa } from "@/lib/coa";

interface ISearchResults {
    lot: string;
}

const SearchResults = async ({ lot }: ISearchResults) => {
    const searchResult = await searchCoa(lot);
    if (!searchResult.ok) return (<div className="text-red-600 mt-3 text-sm">{searchResult.error}</div>)
    if (searchResult.ok && !searchResult.data.found) return (<div className="text-red-600 mt-3 text-sm">No COA found for {lot}</div>)


    return searchResult.data.results.map((coa) => {
        return (
            <div key={coa.accessionNumber}>
                {coa.accessionNumber}
                {coa.productName}
            </div>
        )
    })
}

export default SearchResults;