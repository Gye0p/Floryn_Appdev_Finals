import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMyReservations } from '../../app/api/customerApi';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorRetry from '../../components/ErrorRetry';
import COLORS from '../../theme/colors';
import EmptyState from '../../components/EmptyState';
import { formatCurrency } from '../../utils/formatCurrency';
import { logScreenView } from '../../utils/firebase';
import { logError, logInteraction } from '../../utils/logger';
import { websocketService } from '../../services/websocketService';

const RESERVATION_STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

const ReservationsScreen = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [wsConnected, setWsConnected] = useState(websocketService.isConnected());

    const loadData = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);
        try {
            const data = await getMyReservations();
            setReservations(data);
            logInteraction('Reservations: refresh success', { count: data.length });
        } catch (err) {
            setError(err.message || 'Failed to load reservations');
            logError('Reservations: refresh failed', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const refresh = useCallback(() => {
        logInteraction('Reservations: refresh started');
        loadData(true);
    }, [loadData]);

    const handleStatusSelect = (status) => {
        logInteraction('Reservations: status filter selected', { status });
        setSelectedStatus(status);
    };

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Subscribe to real-time polling updates
    useEffect(() => {
        const unsubscribeUpdate = websocketService.onUpdate(() => {
            loadData(true);
        });

        const unsubscribeStatus = websocketService.onStatusChange((active) => {
            setWsConnected(active);
        });

        return () => {
            unsubscribeUpdate();
            unsubscribeStatus();
        };
    }, [loadData]);

    // Start/stop Mercure connection based on screen focus
    useFocusEffect(
        useCallback(() => {
            void logScreenView('Reservations');
            void websocketService.connect();

            return () => {
                websocketService.disconnect();
            };
        }, []),
    );

    const statuses = useMemo(() => ['All', ...RESERVATION_STATUSES], []);

    const filteredReservations = useMemo(() => {
        if (selectedStatus === 'All') return reservations;
        return reservations.filter((r) => r.reservationStatus === selectedStatus);
    }, [reservations, selectedStatus]);

    if (loading && reservations.length === 0) {
        return <LoadingSpinner message="Loading reservations..." />;
    }

    if (error && reservations.length === 0) {
        return <ErrorRetry message={error} onRetry={refresh} />;
    }

    const renderReservation = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                    <Text style={styles.reservationId}>#{item.id}</Text>
                    <Text style={styles.itemNames}>
                        {item.items?.length
                            ? item.items.map((i) => i.flowerName).join(', ')
                            : 'No items'}
                    </Text>
                </View>
                <StatusBadge status={item.reservationStatus} />
            </View>

            <View style={styles.cardBody}>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Pickup</Text>
                    <Text style={styles.detailValue}>{item.pickupDate || 'N/A'}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Amount</Text>
                    <Text style={styles.detailValue}>
                        {formatCurrency(item.totalAmount)}
                    </Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <StatusBadge status={item.paymentStatus} />
                <Text style={styles.dateReserved}>
                    Reserved {item.dateReserved?.split(' ')[0] || 'N/A'}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Live indicator bar */}
            {wsConnected && (
                <View style={styles.liveBar}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>Live — connected</Text>
                </View>
            )}

            <FlatList
                horizontal
                data={statuses}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.filterChip,
                            selectedStatus === item && styles.filterChipActive,
                        ]}
                        onPress={() => handleStatusSelect(item)}>
                        <Text
                            style={[
                                styles.filterChipText,
                                selectedStatus === item && styles.filterChipTextActive,
                            ]}>
                            {item}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            <FlatList
                data={filteredReservations}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderReservation}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={refresh}
                        colors={[COLORS.navy]}
                        tintColor={COLORS.navy}
                    />
                }
                ListEmptyComponent={
                    <EmptyState
                        message={
                            selectedStatus !== 'All'
                                ? `No ${selectedStatus.toLowerCase()} reservations`
                                : 'No reservations yet'
                        }
                    />
                }
                ListHeaderComponent={
                    <Text style={styles.resultCount}>
                        {filteredReservations.length} reservation
                        {filteredReservations.length !== 1 ? 's' : ''}
                    </Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    filterContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 6,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: 8,
    },
    filterChipActive: {
        backgroundColor: COLORS.navy,
        borderColor: COLORS.navy,
    },
    filterChipText: {
        fontSize: 13,
        color: COLORS.muted,
        fontWeight: '500',
    },
    filterChipTextActive: {
        color: '#ffffff',
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: 24,
    },
    resultCount: {
        fontSize: 12,
        color: COLORS.muted,
        fontWeight: '400',
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    liveBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 6,
        backgroundColor: '#f0fdf4',
        borderBottomWidth: 1,
        borderBottomColor: '#bbf7d0',
    },
    liveDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#16a34a',
    },
    liveText: {
        fontSize: 11,
        color: '#16a34a',
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        marginHorizontal: 16,
        marginVertical: 4,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardHeaderLeft: {
        flex: 1,
        marginRight: 8,
    },
    reservationId: {
        fontSize: 11,
        color: COLORS.muted,
        fontWeight: '500',
        marginBottom: 2,
    },
    itemNames: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    cardBody: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 11,
        color: COLORS.muted,
        marginBottom: 2,
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    detailValue: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '600',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: 12,
    },
    dateReserved: {
        fontSize: 11,
        color: COLORS.muted,
        fontWeight: '400',
    },
});

export default ReservationsScreen;
