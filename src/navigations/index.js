import React from 'react';
import { useSelector } from 'react-redux';
import AuthNav from './AuthNav';
import MainNav from './MainNav';

export default function AppNavigator() {
    const { data } = useSelector(state => state.auth);
    let isLoggedIn = !!data;

    return isLoggedIn ? <MainNav /> : <AuthNav />;
}
