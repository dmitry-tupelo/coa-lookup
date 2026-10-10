import type { RequestHandler } from "express";
import { timingSafeEqual } from "node:crypto";
import { env } from "../env.js";

const PREFIX = 'Bearer '

export const requireApiKey: RequestHandler = (req,res, next) => {

    const restrictedAccess = () => res.status(401).json({error: "Unauthorized"})

    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith(PREFIX)) return restrictedAccess();

    const key = authHeader.slice(PREFIX.length);
    const keyBuffer = Buffer.from(key); 
    if(keyBuffer.length !== env.ADMIN_API_KEY.length) return restrictedAccess();

    const isBearerValid = timingSafeEqual(keyBuffer, Buffer.from(env.ADMIN_API_KEY));
    if(!isBearerValid) return restrictedAccess();
    next();
}