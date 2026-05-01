import {
    USER_LOGIN,
    USER_LOGIN_COMPLETED,
    USER_LOGIN_ERROR,
    USER_LOGIN_REQUEST,
    USER_LOGIN_RESET,
} from '../actions';
import { logInteraction } from '../../utils/logger';

const INITIAL_STATE = {
    data: null,
    isLoading: false,
    isError: false,
    errorMessage: null,
    pendingApproval: false,
};

export default function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case USER_LOGIN_REQUEST:
            logInteraction('Auth: login requested');
            return {
                ...state,
                data: null,
                isLoading: true,
                isError: false,
                errorMessage: null,
                pendingApproval: false,
            };

        case USER_LOGIN_COMPLETED:
            logInteraction('Auth: login successful', {
                username: action.payload?.user?.username || action.payload?.username || 'unknown',
            });
            return {
                ...state,
                data: action.payload,
                isLoading: false,
                isError: false,
                errorMessage: null,
                pendingApproval: false,
            };

        case USER_LOGIN_ERROR:
            logInteraction('Auth: login failed', {
                reason: action.payload || 'Unknown error',
            });

            const nextMessage = action.payload ? String(action.payload) : null;
            const normalizedMessage = (nextMessage || '').toLowerCase();
            const isPendingApproval =
                normalizedMessage.includes('pending admin approval') ||
                normalizedMessage.includes('not approved');

            return {
                data: null,
                isLoading: false,
                isError: true,
                errorMessage: nextMessage,
                pendingApproval: isPendingApproval,
            };

        case USER_LOGIN_RESET:
            logInteraction('Auth: state reset / logout');
            return INITIAL_STATE;

        default:
            return state;
    }
}

export const userLogin = payload => ({
    type: USER_LOGIN,
    payload,
});

export const resetLogin = () => ({
    type: USER_LOGIN_RESET,
});
