import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { resetLogin } from '../../app/reducers/auth';
import { clearToken } from '../../utils/tokenStorage';
import COLORS from '../../theme/colors';
import { getMyProfile } from '../../app/api/customerApi';
import LoadingSpinner from '../../components/LoadingSpinner';

const ProfileScreen = () => {
    const { data } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const [profile, setProfile] = useState(data?.user || null);
    const [loading, setLoading] = useState(!data?.user);

    useEffect(() => {
        if (!data?.user && data?.token) {
            getMyProfile()
                .then(setProfile)
                .catch(() => { })
                .finally(() => setLoading(false));
        }
    }, [data]);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
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

    return (
        <ScrollView style={styles.container}>
            {}
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                        {displayUser?.username?.charAt(0)?.toUpperCase() || '?'}
                    </Text>
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

            {}
            <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Account Information</Text>
                <InfoRow label="Full Name" value={displayUser?.fullName || 'N/A'} />
                <InfoRow label="Username" value={displayUser?.username || 'N/A'} />
                <InfoRow label="Email" value={displayUser?.email || 'N/A'} />
                <InfoRow label="Phone" value={displayUser?.phone || 'N/A'} />
                <InfoRow label="Address" value={displayUser?.address || 'N/A'} />
                <InfoRow label="Member Since" value={displayUser?.memberSince || 'N/A'} />
            </View>

            {}
            <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Application</Text>
                <InfoRow label="App Name" value="Floryn Garden" />
                <InfoRow label="Version" value="1.0.0" />
                <InfoRow label="Type" value="Customer App" />
            </View>

            {}
            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.8}>
                <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>

            <Text style={styles.footer}>
                Floryn Garden — Customer App{'\n'}© 2026
            </Text>
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
        backgroundColor: '#f9fafb',
    },
    header: {
        backgroundColor: COLORS.navy,
        paddingTop: 32,
        paddingBottom: 40,
        alignItems: 'center',
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '800',
        color: '#ffffff',
    },
    username: {
        fontSize: 24,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: -0.3,
    },
    rolesContainer: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 8,
    },
    roleBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 14,
        paddingVertical: 4,
        borderRadius: 20,
    },
    roleText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '700',
    },
    infoCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginHorizontal: 16,
        marginTop: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    infoTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#9ca3af',
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
        borderBottomColor: '#f3f4f6',
    },
    infoLabel: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: '#1f2937',
        fontWeight: '600',
    },
    logoutButton: {
        backgroundColor: '#fee2e2',
        marginHorizontal: 16,
        marginTop: 24,
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    logoutText: {
        color: '#dc2626',
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: 12,
        marginTop: 24,
        marginBottom: 32,
        lineHeight: 18,
    },
});

export default ProfileScreen;
