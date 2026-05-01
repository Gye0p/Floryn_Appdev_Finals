import { call, put, takeEvery } from 'redux-saga/effects';
import { authLogin } from '../api/authApi';
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

export function* userLoginAsync(action) {
    yield put({ type: USER_LOGIN_REQUEST });
    try {
        yield call(logCrashlytics, 'Auth login started');
        const response = yield call(authLogin, action.payload);

        yield call(saveToken, response.token);

        const analyticsUserId =
            response?.user?.id ??
            response?.id ??
            response?.user?.username ??
            action.payload?.username;

        if (analyticsUserId != null) {
            yield call(setAnalyticsUserId, analyticsUserId);
            yield call(setCrashlyticsUserId, analyticsUserId);
        }

        yield call(logEvent, 'user_login', { method: 'password' });
        yield call(logCrashlytics, 'Auth login completed');

        yield put({ type: USER_LOGIN_COMPLETED, payload: response });
    } catch (error) {
        yield call(recordError, error, 'Auth userLoginAsync failed');
        yield put({ type: USER_LOGIN_ERROR, payload: error.message });
    }
}

export function* userLogin() {
    yield takeEvery(USER_LOGIN, userLoginAsync);
}
