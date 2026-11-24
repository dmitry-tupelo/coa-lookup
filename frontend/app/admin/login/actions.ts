'use server';

import { ADMIN_PASSWORD } from "@/lib/env";
import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { timingSafeEqual } from "node:crypto";

export type LoginState = { error: string | null };

const WRONG_PASSWORD = 'Wrong password'

export const login = async (_prevState: LoginState, formData: FormData): Promise<LoginState> => {
    const password = formData.get('password');
    if(typeof password !== 'string') return {error: WRONG_PASSWORD}
    const passwordBuffer = Buffer.from(password);
    const adminPasswordBuffer = Buffer.from(ADMIN_PASSWORD);

    if(passwordBuffer.length !== adminPasswordBuffer.length) return {error: WRONG_PASSWORD};
    const isPasswordValid = timingSafeEqual(passwordBuffer, adminPasswordBuffer);

    if(isPasswordValid) {
        await createSession();
        redirect("/admin");
    }
    return {error: WRONG_PASSWORD};

}