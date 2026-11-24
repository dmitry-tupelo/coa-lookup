import 'server-only';
import { API_URL } from './constants';
import { ADMIN_API_KEY } from './env';
import { CoaItem } from './types';

type CoaResult =
  | { ok: true; data: CoaItem }
  | { ok: false; reason: "not_found" | "error"; };


export const getCoaByAccession = async (accession: string): Promise<CoaResult> => {

    try {
        const res = await fetch(`${API_URL}/admin/coa/${encodeURIComponent(accession)}`, 
            { 
                headers : {
                'Authorization': `Bearer ${ADMIN_API_KEY}` 
            }
        });

        if(res.status === 404) return {ok: false, reason: "not_found"}
    
        if(!res.ok) return {ok: false, reason: "error"};
        return {ok:true, data: await res.json()}
    } catch (error) {
        console.error(error)
        return {ok:false, reason: 'error'}
    }
}