import { call, put, takeEvery } from 'redux-saga/effects';
import { authLogin } from '../api/authApi';
import type { LoginCredentials } from '../api/authApi';
import { saveToken } from '../../utils/tokenStorage';
import {
    logCrashlytics,
    logEvent,
    recordError,
    setAnalyticsUserId,
    setCrashlyticsUserId,
} from '../../utils/firebase';
import {
    USER_LOGIN,
    USER_LOGIN_REQUEST,
    USER_LOGIN_COMPLETED,
    USER_LOGIN_ERROR,
} from '../actions';

// ─── Action Type ──────────────────────────────────────────────────────────────
interface LoginAction {
    type:    typeof USER_LOGIN;
    payload: LoginCredentials;
}

// ─── Worker Saga ──────────────────────────────────────────────────────────────
export function* userLoginAsync(action: LoginAction) {
    yield put({ type: USER_LOGIN_REQUEST });
    try {
        yield call(logCrashlytics, 'Auth login started');
        const response: Awaited<ReturnType<typeof authLogin>> =
            yield call(authLogin, action.payload);

        yield call(saveToken, response.token);

        const analyticsUserId =
            response?.user?.id   ??
            response?.user?.username ??
            action.payload?.username;

        if (analyticsUserId != null) {
            yield call(setAnalyticsUserId, String(analyticsUserId));
            yield call(setCrashlyticsUserId, String(analyticsUserId));
        }

        yield call(logEvent, 'user_login', { method: 'password' });
        yield call(logCrashlytics, 'Auth login completed');

        yield put({ type: USER_LOGIN_COMPLETED, payload: response });

    } catch (error: unknown) {
        yield call(recordError, error, 'Auth userLoginAsync failed');
        const message = error instanceof Error ? error.message : 'Login failed';
        yield put({ type: USER_LOGIN_ERROR, payload: message });
    }
}

// ─── Watcher Saga ─────────────────────────────────────────────────────────────
export function* userLogin() {
    yield takeEvery(USER_LOGIN, userLoginAsync);
}
