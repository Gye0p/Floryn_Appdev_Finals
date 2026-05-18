/**
 * Notification service for Firebase Cloud Messaging (FCM) push notifications.
 * Handles: permission requests, token registration with backend, foreground
 * notification display, and background notification tap navigation.
 */

import messaging from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';
import { registerFcmToken } from '../app/api/customerApi';
import { logError } from '../utils/logger';

type NavigationRef = {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
};

class NotificationService {
    private navigationRef: NavigationRef | null = null;

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Set a navigation reference so we can navigate on notification tap.
     * Call this from App.tsx after NavigationContainer is ready.
     */
    setNavigationRef(ref: NavigationRef): void {
        this.navigationRef = ref;
    }

    /**
     * Initialize FCM: request permission, get token, register with backend,
     * and set up foreground + background handlers.
     * Call this from App.tsx on mount.
     */
    async init(): Promise<void> {
        try {
            const granted = await this._requestPermission();
            if (!granted) {
                console.log('[FCM] Permission not granted — push notifications disabled');
                return;
            }

            const token = await messaging().getToken();
            if (token) {
                await this._registerToken(token);
            }

            // Handle foreground messages (app is open)
            messaging().onMessage(async (remoteMessage) => {
                const title = remoteMessage.notification?.title ?? 'Floryn Garden';
                const body  = remoteMessage.notification?.body ?? '';

                console.log('[FCM] Foreground message:', title);

                // Show an in-app alert for foreground notifications
                Alert.alert(title, body, [
                    { text: 'View', onPress: () => this._handleNotificationTap(remoteMessage.data) },
                    { text: 'Dismiss', style: 'cancel' },
                ]);
            });

            // Handle token refresh
            messaging().onTokenRefresh(async (newToken) => {
                console.log('[FCM] Token refreshed');
                await this._registerToken(newToken);
            });

            // Handle notification tap when app was in background/quit
            messaging().onNotificationOpenedApp((remoteMessage) => {
                console.log('[FCM] Notification opened from background');
                this._handleNotificationTap(remoteMessage.data);
            });

            // Check if the app was opened by a notification (from quit state)
            const initialNotification = await messaging().getInitialNotification();
            if (initialNotification) {
                console.log('[FCM] App opened from quit state via notification');
                // Slight delay to let navigation be ready
                setTimeout(() => {
                    this._handleNotificationTap(initialNotification.data);
                }, 1000);
            }

            console.log('[FCM] Notification service initialized ✓');
        } catch (error) {
            logError('FCM: initialization failed', error);
        }
    }

    // ── Internal ──────────────────────────────────────────────────────────────

    private async _requestPermission(): Promise<boolean> {
        if (Platform.OS === 'ios') {
            const authStatus = await messaging().requestPermission();
            return (
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL
            );
        }

        // Android 13+ requires runtime permission (handled by the library automatically)
        const authStatus = await messaging().requestPermission();
        return authStatus === messaging.AuthorizationStatus.AUTHORIZED;
    }

    private async _registerToken(token: string): Promise<void> {
        try {
            await registerFcmToken(token);
            console.log('[FCM] Token registered with backend ✓');
        } catch (error) {
            logError('FCM: failed to register token with backend', error);
        }
    }

    private _handleNotificationTap(data?: Record<string, string | undefined>): void {
        if (!data) return;

        const type = data.type;

        if (type === 'reservation_update' || type === 'payment_update') {
            // Navigate to Reservations tab
            this.navigationRef?.navigate('Reservations');
        }
    }
}

// Export as singleton and also set up the background handler at module scope
export const notificationService = new NotificationService();

/**
 * IMPORTANT: This must be called at the module scope (outside any component)
 * to handle FCM messages when the app is in the background/quit state.
 */
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('[FCM] Background message received:', remoteMessage.notification?.title);
    // Background messages are automatically shown as system notifications by the OS.
    // No additional handling needed here.
});
