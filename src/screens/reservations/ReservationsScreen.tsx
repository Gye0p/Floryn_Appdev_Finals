import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import { getMyReservations } from '../../app/api/customerApi';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorRetry from '../../components/ErrorRetry';
import COLORS from '../../theme/colors';
import EmptyState from '../../components/EmptyState';
import { formatCurrency } from '../../utils/formatCurrency';
import { logError, logInteraction } from '../../utils/logger';

const RESERVATION_STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

const ReservationsScreen = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('All');

    const refresh = useCallback(async () => {
        logInteraction('Reservations: refresh started');
        setLoading(true);
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
        }
    }, []);

    const handleStatusSelect = (status) => {
        logInteraction('Reservations: status filter selected', { status });
        setSelectedStatus(status);
    };

    useEffect(() => {
        refresh();
    }, [refresh]);

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
            {}
            <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                    <Text style={styles.reservationId}>#{item.id}</Text>
                    <Text style={styles.customerName}>
                        {item.items?.length
                            ? item.items.map((i) => i.flowerName).join(', ')
                            : 'No items'}
                    </Text>
                </View>
                <StatusBadge status={item.reservationStatus} />
            </View>

            {}
            <View style={styles.cardBody}>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>📅 Pickup</Text>
                    <Text style={styles.detailValue}>{item.pickupDate || 'N/A'}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>💰 Amount</Text>
                    <Text style={styles.detailValue}>
                        {formatCurrency(item.totalAmount)}
                    </Text>
                </View>
            </View>

            {}
            <View style={styles.cardFooter}>
                <StatusBadge status={item.paymentStatus} />
                <Text style={styles.dateReserved}>
                    Reserved: {item.dateReserved?.split(' ')[0] || 'N/A'}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {}
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

            {}
            <FlatList
                data={filteredReservations}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderReservation}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={refresh}
                        colors={[COLORS.blue]}
                        tintColor={COLORS.blue}
                    />
                }
                ListEmptyComponent={
                    <EmptyState
                        emoji="📋"
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
        backgroundColor: '#f9fafb',
    },
    filterContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginRight: 8,
    },
    filterChipActive: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    filterChipText: {
        fontSize: 13,
        color: '#6b7280',
        fontWeight: '600',
    },
    filterChipTextActive: {
        color: '#ffffff',
    },
    listContent: {
        paddingBottom: 24,
    },
    resultCount: {
        fontSize: 13,
        color: '#9ca3af',
        fontWeight: '500',
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginHorizontal: 16,
        marginVertical: 6,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
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
        fontSize: 12,
        color: '#9ca3af',
        fontWeight: '600',
        marginBottom: 2,
    },
    customerName: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1f2937',
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
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 2,
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 15,
        color: '#1f2937',
        fontWeight: '600',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: 12,
    },
    dateReserved: {
        fontSize: 11,
        color: '#9ca3af',
        fontWeight: '500',
    },
});

export default ReservationsScreen;
