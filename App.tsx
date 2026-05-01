import React, { useEffect, useRef } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';

import AppNavigator from './src/navigations';
import {
    USER_LOGIN_COMPLETED,
    USER_LOGIN_ERROR,
    USER_LOGIN_REQUEST,
    USER_LOGIN_RESET,
} from './src/app/actions';
import { checkApproval } from './src/app/api/authApi';
import rootSaga from './src/app/sagas';
import configureStore from './src/app/reducers';
import LoadingSpinner from './src/components/LoadingSpinner';
import {
    bootstrapFirebase,
    onAuthStateChanged,
    signOut,
} from './src/utils/firebase';
import {
    getApprovalDeniedMessage,
    getApprovalIdentifier,
    isApprovedByAdmin,
} from './src/utils';
import { logError } from './src/utils/logger';

const { store, persistor, runSaga } = configureStore();
runSaga(rootSaga);

const App = () => {
    const isDarkMode = useColorScheme() === 'dark';
    const skipNextNullResetRef = useRef(false);

    const mapFirebaseUserPayload = (user: any) => ({
        token: user?.uid || '',
        firebaseUid: user?.uid || '',
        user: {
            id: user?.uid || '',
            username: user?.displayName || user?.email?.split('@')?.[0] || 'user',
            fullName: user?.displayName || '',
            email: user?.email || '',
            roles: ['USER'],
        },
    });

    useEffect(() => {
        bootstrapFirebase();

        const unsubscribeAuth = onAuthStateChanged((firebaseUser) => {
            const syncAuthState = async () => {
                if (firebaseUser) {
                    store.dispatch({ type: USER_LOGIN_REQUEST });

                    try {
                        const approvalUsername = getApprovalIdentifier({
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName,
                        });
                        const approvalResult = await checkApproval(approvalUsername);

                        if (!isApprovedByAdmin(approvalResult)) {
                            const pendingMessage = getApprovalDeniedMessage(approvalResult);
                            store.dispatch({
                                type: USER_LOGIN_ERROR,
                                payload: pendingMessage,
                            });
                            skipNextNullResetRef.current = true;
                            await signOut();
                            return;
                        }

                        store.dispatch({
                            type: USER_LOGIN_COMPLETED,
                            payload: mapFirebaseUserPayload(firebaseUser),
                        });
                    } catch (error) {
                        await signOut();
                        store.dispatch({ type: USER_LOGIN_RESET });
                        logError('Approval check failed during auth sync', error);
                    }
                    return;
                }

                if (skipNextNullResetRef.current) {
                    skipNextNullResetRef.current = false;
                    return;
                }

                store.dispatch({ type: USER_LOGIN_RESET });
            };

            void syncAuthState();
        });

        const initializeAds = async () => {
            try {
                await mobileAds().setRequestConfiguration({
                    maxAdContentRating: MaxAdContentRating.PG,
                    tagForChildDirectedTreatment: false,
                    tagForUnderAgeOfConsent: false,
                });

                await mobileAds().initialize();
            } catch (error) {
                logError('AdMob initialization failed', error);
            }
        };

        void initializeAds();

        return () => {
            unsubscribeAuth();
        };
    }, []);

    return (
        <Provider store={store}>
            <PersistGate loading={<LoadingSpinner message="Starting Floryn Garden..." />} persistor={persistor}>
                <SafeAreaProvider>
                    <NavigationContainer>
                        <StatusBar
                            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                            backgroundColor="#ffffff"
                        />
                        <AppNavigator />
                    </NavigationContainer>
                </SafeAreaProvider>
            </PersistGate>
        </Provider>
    );
};

export default App;
