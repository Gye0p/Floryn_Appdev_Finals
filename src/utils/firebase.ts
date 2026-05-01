// utils/firebase.ts
// ---------------------------------------------------------------------
// Centralized Firebase utility - @react-native-firebase (rnfirebase.io)
// Covers: Auth (Email + Google), Analytics, Crashlytics
// ---------------------------------------------------------------------

import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import {
    GoogleSignin,
    statusCodes,
    GoogleSigninButton,
} from '@react-native-google-signin/google-signin';

export { GoogleSigninButton };

export type AuthUser = FirebaseAuthTypes.User | null;
export type AuthCredential = FirebaseAuthTypes.UserCredential;
export interface AnalyticsEventParams {
    [key: string]: string | number | boolean | null;
}

const WEB_CLIENT_ID = '863454685186-6ba6iqdm7lt1dcnmacg8njtsalue6nl6.apps.googleusercontent.com';

let bootstrapped = false;

const toError = (error: unknown): Error => {
    if (error instanceof Error) {
        return error;
    }

    return new Error(String(error));
};

const sanitizeAnalyticsParams = (params: AnalyticsEventParams = {}) => {
    const sanitized: Record<string, string | number | boolean | null> = {};

    Object.entries(params).forEach(([key, value]) => {
        if (value == null) {
            sanitized[key] = null;
            return;
        }

        if (
            typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean'
        ) {
            sanitized[key] = value;
        }
    });

    return sanitized;
};

export const configureGoogleSignIn = (): void => {
    GoogleSignin.configure({
        webClientId: WEB_CLIENT_ID,
        offlineAccess: true,
        forceCodeForRefreshToken: false,
    });
};

export const signInWithEmail = (
    email: string,
    password: string,
): Promise<AuthCredential> => auth().signInWithEmailAndPassword(email, password);

export const signUpWithEmail = (
    email: string,
    password: string,
): Promise<AuthCredential> => auth().createUserWithEmailAndPassword(email, password);

export const sendPasswordReset = (email: string): Promise<void> =>
    auth().sendPasswordResetEmail(email);

export const signInWithGoogle = async (): Promise<AuthCredential> => {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    const idToken = response?.data?.idToken ?? null;

    if (!idToken) {
        throw new Error('Google Sign-In failed: no idToken');
    }

    const credential = auth.GoogleAuthProvider.credential(idToken);
    return auth().signInWithCredential(credential);
};

export const signOut = async (): Promise<void> => {
    await auth().signOut();

    try {
        await GoogleSignin.signOut();
    } catch {
        // Ignore when Google session is not active.
    }
};

export const onAuthStateChanged = (
    callback: (user: AuthUser) => void,
): (() => void) => auth().onAuthStateChanged(callback);

export const getCurrentUser = (): AuthUser => auth().currentUser;

export const logScreenView = async (name: string, cls?: string): Promise<void> => {
    await analytics().logScreenView({ screen_name: name, screen_class: cls ?? name });
};

export const logEvent = async (
    name: string,
    params?: AnalyticsEventParams,
): Promise<void> => {
    await analytics().logEvent(name, sanitizeAnalyticsParams(params));
};

export const logLogin = async (method: string): Promise<void> => {
    await logEvent('user_login', { method });
};

export const setAnalyticsUserId = (id: string | number | null): Promise<void> =>
    analytics().setUserId(id == null ? null : String(id));

export const setAnalyticsEnabled = (on: boolean): Promise<void> =>
    analytics().setAnalyticsCollectionEnabled(on);

export const recordError = (error: unknown, name?: string): void => {
    crashlytics().recordError(toError(error), name);
};

export const setCrashlyticsUserId = (id?: string | number | null): Promise<void> =>
    crashlytics().setUserId(id == null ? '' : String(id));

export const logCrashlytics = (msg: string): void => {
    crashlytics().log(msg);
};

export const testCrash = (): void => {
    crashlytics().crash();
};

export const isGoogleSignInCancelled = (e: unknown): boolean =>
    (e as { code?: string })?.code === statusCodes.SIGN_IN_CANCELLED;

export const isPlayServicesUnavailable = (e: unknown): boolean =>
    (e as { code?: string })?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE;

export const bootstrapFirebase = (): void => {
    if (bootstrapped) {
        return;
    }

    configureGoogleSignIn();

    const errorUtils = (globalThis as any).ErrorUtils;
    const originalHandler = errorUtils?.getGlobalHandler?.();

    if (errorUtils?.setGlobalHandler) {
        errorUtils.setGlobalHandler((err: Error, isFatal?: boolean) => {
            crashlytics().recordError(err, isFatal ? 'FATAL' : 'NON_FATAL');
            if (originalHandler) {
                originalHandler(err, isFatal);
            }
        });
    }

    bootstrapped = true;
};
