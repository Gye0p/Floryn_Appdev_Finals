import {
    USER_LOGIN,
    USER_LOGIN_COMPLETED,
    USER_LOGIN_ERROR,
    USER_LOGIN_REQUEST,
    USER_LOGIN_RESET,
} from '../actions';
import { logInteraction } from '../../utils/logger';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AuthUser {
    id:       string;
    username: string;
    fullName: string;
    email:    string;
    roles:    string[];
}

export interface AuthPayload {
    token:       string;
    firebaseUid: string;
    user:        AuthUser;
}

export interface AuthState {
    data:            AuthPayload | null;
    isLoading:       boolean;
    isError:         boolean;
    errorMessage:    string | null;
    pendingApproval: boolean;
}

// ─── Initial State ────────────────────────────────────────────────────────────
const INITIAL_STATE: AuthState = {
    data:            null,
    isLoading:       false,
    isError:         false,
    errorMessage:    null,
    pendingApproval: false,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
export default function reducer(
    state: AuthState = INITIAL_STATE,
    action: { type: string; payload?: any },
): AuthState {
    switch (action.type) {

        case USER_LOGIN_REQUEST:
            logInteraction('Auth: login requested');
            return {
                ...state,
                data:            null,
                isLoading:       true,
                isError:         false,
                errorMessage:    null,
                pendingApproval: false,
            };

        case USER_LOGIN_COMPLETED:
            logInteraction('Auth: login successful', {
                username: action.payload?.user?.username || 'unknown',
            });
            return {
                ...state,
                data:            action.payload,
                isLoading:       false,
                isError:         false,
                errorMessage:    null,
                pendingApproval: false,
            };

        case USER_LOGIN_ERROR: {
            logInteraction('Auth: login failed', {
                reason: action.payload || 'Unknown error',
            });
            const nextMessage      = action.payload ? String(action.payload) : null;
            const normalizedMsg    = (nextMessage || '').toLowerCase();
            const isPendingApproval =
                normalizedMsg.includes('pending admin approval') ||
                normalizedMsg.includes('not approved');

            return {
                data:            null,
                isLoading:       false,
                isError:         true,
                errorMessage:    nextMessage,
                pendingApproval: isPendingApproval,
            };
        }

        case USER_LOGIN_RESET:
            logInteraction('Auth: state reset / logout');
            return INITIAL_STATE;

        default:
            return state;
    }
}

// ─── Action Creators ──────────────────────────────────────────────────────────
export const userLogin = (payload: { email: string; password: string }) => ({
    type: USER_LOGIN,
    payload,
});

export const googleLogin = () => ({
    type: 'USER_GOOGLE_LOGIN' as const,
});

export const userLogout = () => ({
    type: 'USER_LOGOUT' as const,
});

export const resetLogin = () => ({
    type: USER_LOGIN_RESET,
});
