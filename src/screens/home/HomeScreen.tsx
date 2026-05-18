import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { getCustomerFlowers, getMyReservations } from '../../app/api/customerApi';
import { ROUTES } from '../../utils';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorRetry from '../../components/ErrorRetry';
import AdMobBanner from '../../components/AdMobBanner';
import COLORS from '../../theme/colors';
import { logScreenView } from '../../utils/firebase';
import { logError, logInteraction } from '../../utils/logger';

const HomeScreen = () => {
    const navigation = useNavigation<any>();
    const { data: authData } = useSelector((state: any) => state.auth);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const loadData = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
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
            setStats({ ...nextStats });
            logInteraction('Home screen: refresh success', nextStats);
        } catch (err) {
            setError(err.message || 'Failed to load data');
            logError('Home screen: refresh failed', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const refresh = useCallback(() => {
        logInteraction('Home screen: refresh started');
        loadData(true);
    }, [loadData]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useFocusEffect(
        useCallback(() => {
            void logScreenView('Home');
        }, []),
    );

    if (loading && !stats) {
        return <LoadingSpinner message="Loading..." />;
    }

    if (error && !stats) {
        return <ErrorRetry message={error} onRetry={refresh} />;
    }

    const onSale = stats?.onSale ?? 0;
    const displayName = authData?.user?.fullName || authData?.user?.username || 'there';

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={refresh}
                    colors={[COLORS.navy]}
                    tintColor={COLORS.navy}
                />
            }>

            <View style={styles.hero}>
                <Text style={styles.heroGreeting}>Hello, {displayName}</Text>
                <Text style={styles.heroTitle}>Floryn Garden</Text>
            </View>

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
                            <Text style={[styles.statChipValue, styles.saleValue]}>{onSale}</Text>
                            <Text style={styles.statChipLabel}>On Sale</Text>
                        </View>
                    </>
                )}
            </View>

            <Text style={styles.sectionTitle}>Quick actions</Text>
            <View style={styles.actionsGrid}>
                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => {
                        logInteraction('Home screen: tap Browse Flowers');
                        navigation.navigate(ROUTES.FLOWERS);
                    }}
                    activeOpacity={0.75}>
                    <Text style={styles.actionTitle}>Browse Flowers</Text>
                    <Text style={styles.actionDesc}>Explore the catalog</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => {
                        logInteraction('Home screen: tap My Reservations');
                        navigation.navigate(ROUTES.RESERVATIONS);
                    }}
                    activeOpacity={0.75}>
                    <Text style={styles.actionTitle}>My Reservations</Text>
                    <Text style={styles.actionDesc}>View and track orders</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => {
                        logInteraction('Home screen: tap My Profile');
                        navigation.navigate(ROUTES.PROFILE);
                    }}
                    activeOpacity={0.75}>
                    <Text style={styles.actionTitle}>My Profile</Text>
                    <Text style={styles.actionDesc}>Account details</Text>
                </TouchableOpacity>
            </View>

            {onSale > 0 && (
                <TouchableOpacity
                    style={styles.saleBanner}
                    onPress={() => {
                        logInteraction('Home screen: tap Sale Alert');
                        navigation.navigate(ROUTES.FLOWERS);
                    }}
                    activeOpacity={0.85}>
                    <View style={styles.saleBannerLeft}>
                        <Text style={styles.saleBannerLabel}>Sale</Text>
                        <Text style={styles.saleBannerDesc}>
                            {onSale} item{onSale > 1 ? 's' : ''} currently discounted
                        </Text>
                    </View>
                    <Text style={styles.saleBannerArrow}>›</Text>
                </TouchableOpacity>
            )}

            <AdMobBanner />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    contentContainer: {
        paddingBottom: 32,
    },
    hero: {
        backgroundColor: COLORS.navy,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 40,
    },
    heroGreeting: {
        fontSize: 13,
        color: COLORS.mint,
        fontWeight: '400',
        marginBottom: 4,
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: -0.3,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        marginHorizontal: 16,
        marginTop: -20,
        paddingVertical: 14,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    statChip: {
        alignItems: 'center',
        flex: 1,
    },
    statChipValue: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
    },
    saleValue: {
        color: COLORS.warning,
    },
    statChipLabel: {
        fontSize: 10,
        color: COLORS.muted,
        fontWeight: '600',
        marginTop: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statChipDivider: {
        width: 1,
        height: 28,
        backgroundColor: COLORS.border,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginHorizontal: 16,
        marginTop: 28,
        marginBottom: 12,
    },
    actionsGrid: {
        paddingHorizontal: 16,
        gap: 8,
    },
    actionCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    actionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 2,
    },
    actionDesc: {
        fontSize: 12,
        color: COLORS.muted,
    },
    saleBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        marginHorizontal: 16,
        marginTop: 16,
        padding: 14,
    },
    saleBannerLeft: {
        flex: 1,
    },
    saleBannerLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.warning,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    saleBannerDesc: {
        fontSize: 13,
        color: COLORS.text,
    },
    saleBannerArrow: {
        fontSize: 20,
        color: COLORS.muted,
    },
});

export default HomeScreen;
