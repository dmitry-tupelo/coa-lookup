'use client';

import { useActionState } from "react";
import { login, type LoginState } from './actions';


const initialState: LoginState = { error: null }

const LoginForm = () => {
    const [state, formAction, pending] = useActionState(login, initialState);
    return (
        <div>
            <form action={formAction}>
                <input type="password" name="password" required />
                <button type="submit" disabled={pending}>{pending ? 'Signing in...' : "Login"}</button>
                {state.error && (
                    <div>{state.error}</div>
                )}
            </form>
        </div>
    )
}

export default LoginForm;