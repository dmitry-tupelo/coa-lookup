import 'server-only';

import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { SESSION_SECRET } from './env';

const encodedKey = new TextEncoder().encode(SESSION_SECRET);

export const createSession = async () => {
    const expiresAt = new Date(Date.now() + ( 7 * 24 * 60 * 60 * 1000)) // 7 days

    const token = await new SignJWT({role: "admin"})               
    .setProtectedHeader({ alg: 'HS256' })  
    .setIssuedAt()                   
    .setExpirationTime(expiresAt)         
    .sign(encodedKey);  

    (await cookies()).set("session", token, {httpOnly: true, secure: true, sameSite: 'lax', expires: expiresAt, path: "/"})
}

export const verifySession = async (): Promise<boolean> => {
    const cookie = (await cookies()).get("session");
    if(!cookie) return false;
    try{
        const verifiedToken =  await jwtVerify(cookie.value, encodedKey, { algorithms: ['HS256'] })
        return verifiedToken && verifiedToken.payload.role === 'admin' 
    } catch(error) {
        return false;
    }
}
export const deleteSession = async () => {
    (await cookies()).delete("session");
}