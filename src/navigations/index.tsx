import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import AuthNav from './AuthNav';
import MainNav from './MainNav';
import { logInteraction } from '../utils/logger';

export default function AppNavigator() {
    const { data } = useSelector((state: any) => state.auth);
    let isLoggedIn = !!data;
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
