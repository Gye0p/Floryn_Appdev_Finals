import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../app/reducers';
import {
    userLogin,
    googleLogin,
    userLogout,
    resetLogin,
} from '../app/reducers/auth';
import type { AuthUser, AuthPayload } from '../app/reducers/auth';

// Re-export types so any screen only needs to import from useAuth
export type { AuthUser, AuthPayload };

// ─── useAuth ──────────────────────────────────────────────────────────────────
export const useAuth = () => {
    const dispatch = useDispatch();

    // ── State from Redux ──────────────────────────────────────────────────────
    const data            = useSelector((state: RootState) => state.auth.data);
    const isLoading       = useSelector((state: RootState) => state.auth.isLoading);
    const isError         = useSelector((state: RootState) => state.auth.isError);
    const errorMessage    = useSelector((state: RootState) => state.auth.errorMessage);
    const pendingApproval = useSelector((state: RootState) => state.auth.pendingApproval);

    // ── Derived ───────────────────────────────────────────────────────────────
    const isLoggedIn = !!data;
    const user       = data?.user   ?? null;
    const token      = data?.token  ?? null;

    // ── Actions ───────────────────────────────────────────────────────────────
    const login = (email: string, password: string) =>
        dispatch(userLogin({ email, password }));

    const loginWithGoogle = () =>
        dispatch(googleLogin());

    const logout = () =>
        dispatch(userLogout());

    const reset = () =>
        dispatch(resetLogin());

    return {
        // state
        data,
        user,
        token,
        isLoggedIn,
        isLoading,
        isError,
        errorMessage,
        pendingApproval,
        // actions
        login,
        loginWithGoogle,
        logout,
        reset,
    };
};
