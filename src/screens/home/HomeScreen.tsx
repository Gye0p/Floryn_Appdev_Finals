import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { getCustomerFlowers, getMyReservations } from '../../app/api/customerApi';
import { ROUTES } from '../../utils';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorRetry from '../../components/ErrorRetry';
import COLORS from '../../theme/colors';
import { logError, logInteraction } from '../../utils/logger';

const HomeScreen = () => {
    const navigation = useNavigation<any>();
    const { data: authData } = useSelector((state: any) => state.auth);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refresh = useCallback(async () => {
        logInteraction('Home screen: refresh started');
        setLoading(true);
        setError(null);
        try {
            const [flowers, reservations] = await Promise.all([
                getCustomerFlowers(),
                getMyReservations(),
            ]);
            const nextStats = {
                totalFlowers: flowers.length,
                totalReservations: reservations.length,
                onSale: flowers.filter(f => f.discountPrice != null).length,
            };
            setStats({
                ...nextStats,
            });
            logInteraction('Home screen: refresh success', nextStats);
        } catch (err) {
            setError(err.message || 'Failed to load data');
            logError('Home screen: refresh failed', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    if (loading && !stats) {
        return <LoadingSpinner message="Loading..." />;
    }

    if (error && !stats) {
        return <ErrorRetry message={error} onRetry={refresh} />;
    }

    const onSale = stats?.onSale ?? 0;

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
                <RefreshControl
                    refreshing={loading}
                    onRefresh={refresh}
                    colors={[COLORS.blue]}
                    tintColor={COLORS.blue}
                />
            }>
            {}
            <View style={styles.hero}>
                <Text style={styles.heroGreeting}>
                    Hello, {authData?.user?.fullName || authData?.user?.username || 'welcome'}! 👋
                </Text>
                <Text style={styles.heroTitle}>Floryn Garden</Text>
                <Text style={styles.heroSubtitle}>
                    Fresh flowers, delivered with care 🌸
                </Text>
            </View>

            {}
            <View style={styles.statsRow}>
                <View style={styles.statChip}>
                    <Text style={styles.statChipValue}>{stats?.totalFlowers ?? '—'}</Text>
                    <Text style={styles.statChipLabel}>Available</Text>
                </View>
                <View style={styles.statChipDivider} />
                <View style={styles.statChip}>
                    <Text style={styles.statChipValue}>{stats?.totalReservations ?? '—'}</Text>
                    <Text style={styles.statChipLabel}>My Orders</Text>
                </View>
                {onSale > 0 && (
                    <>
                        <View style={styles.statChipDivider} />
                        <View style={styles.statChip}>
                            <Text style={[styles.statChipValue, styles.warningText]}>{onSale}</Text>
                            <Text style={styles.statChipLabel}>On Sale</Text>
                        </View>
                    </>
                )}
            </View>

            {}
            <Text style={styles.sectionTitle}>What would you like to do?</Text>
            <View style={styles.actionsGrid}>
                <TouchableOpacity
                    style={[styles.actionCard, { backgroundColor: COLORS.mintLight }]}
                    onPress={() => {
                        logInteraction('Home screen: tap Browse Flowers');
                        navigation.navigate(ROUTES.FLOWERS);
                    }}
                    activeOpacity={0.8}>
                    <Text style={styles.actionIcon}>🌸</Text>
                    <Text style={styles.actionTitle}>Browse Flowers</Text>
                    <Text style={styles.actionDesc}>Explore our catalog of fresh flowers</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionCard, { backgroundColor: '#f0fdf4' }]}
                    onPress={() => {
                        logInteraction('Home screen: tap My Reservations');
                        navigation.navigate(ROUTES.RESERVATIONS);
                    }}
                    activeOpacity={0.8}>
                    <Text style={styles.actionIcon}>📋</Text>
                    <Text style={styles.actionTitle}>My Reservations</Text>
                    <Text style={styles.actionDesc}>View and track your orders</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionCard, { backgroundColor: '#eff6ff' }]}
                    onPress={() => {
                        logInteraction('Home screen: tap My Profile');
                        navigation.navigate(ROUTES.PROFILE);
                    }}
                    activeOpacity={0.8}>
                    <Text style={styles.actionIcon}>👤</Text>
                    <Text style={styles.actionTitle}>My Profile</Text>
                    <Text style={styles.actionDesc}>View your account details</Text>
                </TouchableOpacity>
            </View>

            {}
            {onSale > 0 && (
                <TouchableOpacity
                    style={styles.alertBanner}
                    onPress={() => {
                        logInteraction('Home screen: tap Sale Alert');
                        navigation.navigate(ROUTES.FLOWERS);
                    }}
                    activeOpacity={0.85}>
                    <Text style={styles.alertIcon}>🏷️</Text>
                    <View style={styles.alertTextContainer}>
                        <Text style={styles.alertTitle}>Sale Alert</Text>
                        <Text style={styles.alertDesc}>
                            {onSale} flower{onSale > 1 ? 's are' : ' is'} on sale — grab them before they expire!
                        </Text>
                    </View>
                    <Text style={styles.alertArrow}>›</Text>
                </TouchableOpacity>
            )}

            {}
            <Text style={styles.footerNote}>
                Floryn Garden © 2026 — Fresh flowers, always.
            </Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    contentContainer: {
        paddingBottom: 32,
    },

    hero: {
        backgroundColor: COLORS.navy,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 40,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    heroGreeting: {
        fontSize: 14,
        color: COLORS.mint,
        fontWeight: '500',
        marginBottom: 4,
    },
    heroTitle: {
        fontSize: 30,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: -0.5,
    },
    heroSubtitle: {
        fontSize: 14,
        color: COLORS.mint,
        marginTop: 6,
    },

    statsRow: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginHorizontal: 16,
        marginTop: -20,
        paddingVertical: 14,
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    statChip: {
        alignItems: 'center',
        flex: 1,
    },
    statChipValue: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1f2937',
    },
    statChipLabel: {
        fontSize: 11,
        color: '#9ca3af',
        fontWeight: '600',
        marginTop: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statChipDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#f3f4f6',
    },

    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1f2937',
        marginHorizontal: 16,
        marginTop: 28,
        marginBottom: 12,
    },

    actionsGrid: {
        paddingHorizontal: 12,
        gap: 10,
    },
    actionCard: {
        borderRadius: 16,
        paddingHorizontal: 18,
        paddingVertical: 16,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    actionIcon: {
        fontSize: 28,
        marginBottom: 8,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 4,
    },
    actionDesc: {
        fontSize: 13,
        color: '#6b7280',
        fontWeight: '400',
    },

    alertBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff7ed',
        borderWidth: 1,
        borderColor: '#fed7aa',
        borderRadius: 14,
        marginHorizontal: 16,
        marginTop: 20,
        padding: 14,
    },
    alertIcon: {
        fontSize: 22,
        marginRight: 12,
    },
    alertTextContainer: {
        flex: 1,
    },
    alertTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#c2410c',
    },
    alertDesc: {
        fontSize: 12,
        color: '#9a3412',
        marginTop: 2,
    },
    alertArrow: {
        fontSize: 22,
        color: '#fb923c',
        fontWeight: '700',
    },
    warningText: {
        color: '#f59e0b',
    },
    footerNote: {
        textAlign: 'center',
        color: '#d1d5db',
        fontSize: 11,
        marginTop: 32,
    },
});

export default HomeScreen;
