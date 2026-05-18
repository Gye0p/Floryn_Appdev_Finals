import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { resetLogin } from '../../app/reducers/auth';
import { clearToken } from '../../utils/tokenStorage';
import COLORS from '../../theme/colors';
import { getMyProfile } from '../../app/api/customerApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import { logScreenView, signOut, testCrash } from '../../utils/firebase';
import { logError, logInteraction } from '../../utils/logger';

const ProfileScreen = () => {
    const { data } = useSelector((state: any) => state.auth);
    const dispatch = useDispatch();
    const [profile, setProfile] = useState(data?.user || null);
    const [loading, setLoading] = useState(!data?.user);

    useEffect(() => {
        if (data?.user) {
            // User is already in Redux state — no need to fetch
            setProfile(data.user);
            setLoading(false);
        } else if (data?.token) {
            logInteraction('Profile: fetch profile started');
            getMyProfile()
                .then((nextProfile) => {
                    setProfile(nextProfile);
                    logInteraction('Profile: fetch profile success');
                })
                .catch((error) => {
                    logError('Profile: fetch profile failed', error);
                })
                .finally(() => setLoading(false));
        } else {
            // No token at all — nothing to fetch
            setLoading(false);
        }
    }, [data]);

    useFocusEffect(
        useCallback(() => {
            void logScreenView('Profile');
        }, []),
    );

    const handleLogout = () => {
        logInteraction('Profile: logout requested');
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => logInteraction('Profile: logout cancelled'),
                },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        logInteraction('Profile: logout confirmed');
                        await signOut();
                        await clearToken();
                        dispatch(resetLogin());
                    },
                },
            ],
        );
    };

    if (loading) {
        return <LoadingSpinner message="Loading profile..." />;
    }

    const displayUser = profile || data?.user;
    const initial = displayUser?.username?.charAt(0)?.toUpperCase() || '?';

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{initial}</Text>
                </View>
                <Text style={styles.username}>{displayUser?.username || 'User'}</Text>
                <View style={styles.rolesContainer}>
                    {displayUser?.roles?.map((role) => (
                        <View key={role} style={styles.roleBadge}>
                            <Text style={styles.roleText}>
                                {role.replace('ROLE_', '')}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Account</Text>
                <InfoRow label="Full Name" value={displayUser?.fullName || 'N/A'} />
                <InfoRow label="Username" value={displayUser?.username || 'N/A'} />
                <InfoRow label="Email" value={displayUser?.email || 'N/A'} />
                <InfoRow label="Phone" value={displayUser?.phone || 'N/A'} />
                <InfoRow label="Address" value={displayUser?.address || 'N/A'} />
                <InfoRow label="Member Since" value={displayUser?.memberSince || 'N/A'} />
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Application</Text>
                <InfoRow label="App" value="Floryn Garden" />
                <InfoRow label="Version" value="1.0.0" />
                <InfoRow label="Type" value="Customer" />
            </View>

            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.8}>
                <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>

            {__DEV__ && (
                <TouchableOpacity
                    style={styles.testCrashButton}
                    onPress={testCrash}
                    activeOpacity={0.8}>
                    <Text style={styles.testCrashText}>Test Crash (Dev Only)</Text>
                </TouchableOpacity>
            )}

            <Text style={styles.footer}>Floryn Garden{'\n'}© 2026</Text>
        </ScrollView>
    );
};

const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.navy,
        paddingTop: 32,
        paddingBottom: 32,
        paddingHorizontal: 24,
        alignItems: 'flex-start',
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 22,
        fontWeight: '700',
        color: '#ffffff',
    },
    username: {
        fontSize: 20,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 8,
    },
    rolesContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    roleBadge: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 4,
    },
    roleText: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    infoCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        marginHorizontal: 16,
        marginTop: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    infoTitle: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    infoLabel: {
        fontSize: 14,
        color: COLORS.muted,
        fontWeight: '400',
    },
    infoValue: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '600',
    },
    logoutButton: {
        marginHorizontal: 16,
        marginTop: 20,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.danger,
    },
    logoutText: {
        color: COLORS.danger,
        fontSize: 14,
        fontWeight: '600',
    },
    testCrashButton: {
        marginHorizontal: 16,
        marginTop: 8,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    testCrashText: {
        color: COLORS.muted,
        fontSize: 13,
        fontWeight: '500',
    },
    footer: {
        textAlign: 'center',
        color: COLORS.muted,
        fontSize: 11,
        marginTop: 24,
        marginBottom: 32,
        lineHeight: 18,
    },
});

export default ProfileScreen;
