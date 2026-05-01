import React, { useEffect, useRef } from 'react';
import AuthNav from './AuthNav';
import MainNav from './MainNav';
import { useAuth } from '../hooks/useAuth';
import { logInteraction } from '../utils/logger';

export default function AppNavigator() {
    const { isLoggedIn } = useAuth();
    const previousAuthState = useRef(isLoggedIn);

    useEffect(() => {
        if (previousAuthState.current !== isLoggedIn) {
            logInteraction('Navigation: auth state changed', {
                isLoggedIn,
                stack: isLoggedIn ? 'MainNav' : 'AuthNav',
            });
            previousAuthState.current = isLoggedIn;
        }
    }, [isLoggedIn]);

    return isLoggedIn ? <MainNav /> : <AuthNav />;
}
