import 'server-only';

const requireEnv = (key: string) => {
    if(!process.env[key]) {
        throw new Error(`Env key ${key} is not set (frontend/.env.local or Vercel env)`);
    }
    return process.env[key];
}

export const ADMIN_API_KEY = requireEnv("ADMIN_API_KEY");
export const SESSION_SECRET = requireEnv("SESSION_SECRET");
export const ADMIN_PASSWORD = requireEnv("ADMIN_PASSWORD");