import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';
import { ROUTES } from '../utils';
import { logInteraction } from '../utils/logger';

import HomeScreen from '../screens/home/HomeScreen';
import FlowerCatalogScreen from '../screens/flowers/FlowerCatalogScreen';
import FlowerDetailScreen from '../screens/flowers/FlowerDetailScreen';
import ReservationsScreen from '../screens/reservations/ReservationsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const FlowerStack = createNativeStackNavigator();

const FlowerStackScreen = () => {
    return (
        <FlowerStack.Navigator id="FlowerStack">
            <FlowerStack.Screen
                name={ROUTES.FLOWER_CATALOG}
                component={FlowerCatalogScreen}
                options={{ title: 'Flowers', headerShown: false }}
            />
            <FlowerStack.Screen
                name={ROUTES.FLOWER_DETAIL}
                component={FlowerDetailScreen}
                options={({ route }: any) => ({
                    title: route.params?.flower?.name || 'Flower Details',
                    headerStyle: { backgroundColor: '#ffffff' },
                    headerTintColor: '#1f2937',
                    headerShadowVisible: false,
                })}
            />
        </FlowerStack.Navigator>
    );
};

const TAB_ICONS = {
    [ROUTES.HOME]: '🏠',
    [ROUTES.FLOWERS]: '🌸',
    [ROUTES.RESERVATIONS]: '📋',
    [ROUTES.PROFILE]: '👤',
};

const MainNav = () => {
    return (
        <Tab.Navigator
            id="MainTab"
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused }) => (
                    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>
                        {TAB_ICONS[route.name]}
                    </Text>
                ),
                tabBarActiveTintColor: '#4265d6',
                tabBarInactiveTintColor: '#9ca3af',
                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.tabLabel,
                headerStyle: styles.header,
                headerTitleStyle: styles.headerTitle,
                headerShadowVisible: false,
            })}>
            <Tab.Screen
                name={ROUTES.HOME}
                component={HomeScreen}
                options={{ title: 'Home', headerShown: false }}
                listeners={{
                    tabPress: () => logInteraction('Tab pressed: Home'),
                }}
            />
            <Tab.Screen
                name={ROUTES.FLOWERS}
                component={FlowerStackScreen}
                options={{ title: 'Flowers', headerShown: false }}
                listeners={{
                    tabPress: () => logInteraction('Tab pressed: Flowers'),
                }}
            />
            <Tab.Screen
                name={ROUTES.RESERVATIONS}
                component={ReservationsScreen}
                options={{ title: 'Reservations' }}
                listeners={{
                    tabPress: () => logInteraction('Tab pressed: Reservations'),
                }}
            />
            <Tab.Screen
                name={ROUTES.PROFILE}
                component={ProfileScreen}
                options={{ title: 'Profile', headerShown: false }}
                listeners={{
                    tabPress: () => logInteraction('Tab pressed: Profile'),
                }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: 4,
        paddingBottom: 8,
        height: 60,
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: '600',
    },
    header: {
        backgroundColor: '#ffffff',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
    },
});

export default MainNav;
