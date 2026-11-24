import { getCoaByAccession } from "@/lib/admin-api";


export default async function Page() {
    const coa = await getCoaByAccession("2601270227")

    if (!coa.ok) {
        if (coa.reason === 'not_found') return (<div className="text-red-600 mt-3 text-sm">Coa not found</div>)
        if (coa.reason === 'error') return (<div className="text-red-600 mt-3 text-sm">Error</div>)
    }
    if (coa.ok) {
        return (
            <div>
                {coa.data.productName}
            </div>
        )
    }

}