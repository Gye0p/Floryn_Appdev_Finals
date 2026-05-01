import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { ROUTES } from '../utils';
import LoginScreen    from '../screens/auth/LoginScreen';
import ApprovalPendingScreen from '../screens/auth/ApprovalPendingScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const Stack = createNativeStackNavigator();

const AuthNav = () => {
    const { pendingApproval, errorMessage } = useSelector((state: any) => state.auth);

    return (
        <Stack.Navigator
            id="AuthStack"
            key={pendingApproval ? 'AuthStackPending' : 'AuthStackDefault'}
            initialRouteName={pendingApproval ? ROUTES.APPROVAL_PENDING : ROUTES.LOGIN}
            screenOptions={{ headerShown: false }}>
            <Stack.Screen name={ROUTES.LOGIN}    component={LoginScreen} />
            <Stack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />
            <Stack.Screen
                name={ROUTES.APPROVAL_PENDING}
                component={ApprovalPendingScreen}
                initialParams={{ message: errorMessage }}
            />
        </Stack.Navigator>
    );
};

export default AuthNav;
