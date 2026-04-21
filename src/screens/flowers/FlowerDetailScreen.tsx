import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import StatusBadge from '../../components/StatusBadge';
import PriceBadge from '../../components/PriceBadge';
import { formatCurrency } from '../../utils/formatCurrency';
import COLORS from '../../theme/colors';
import { logInteraction } from '../../utils/logger';

const isLowStock = (flower) => flower.stockQuantity > 0 && flower.stockQuantity < 5;

const FlowerDetailScreen = ({ route }) => {
    const { flower } = route.params;
    const lowStock = isLowStock(flower);

    useEffect(() => {
        logInteraction('Flower detail: viewed', {
            flowerId: flower?.id,
            name: flower?.name,
        });
    }, [flower]);

    return (
        <ScrollView style={styles.container}>
            {}
            <View style={styles.hero}>
                <Text style={styles.heroEmoji}>🌺</Text>
                <Text style={styles.heroName}>{flower.name}</Text>
                <Text style={styles.heroCategory}>{flower.category}</Text>
            </View>

            {}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Price</Text>
                <PriceBadge
                    price={flower.price}
                    discountPrice={flower.discountPrice}
                />
                {flower.discountPrice != null && flower.discountPrice < flower.price && (
                    <View style={styles.savingsContainer}>
                        <Text style={styles.savingsText}>
                            Save {formatCurrency(flower.price - flower.discountPrice)}!
                        </Text>
                    </View>
                )}
            </View>

            {}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Status</Text>
                <View style={styles.statusRow}>
                    <View style={styles.statusItem}>
                        <Text style={styles.statusLabel}>Freshness</Text>
                        <StatusBadge status={flower.freshnessStatus} />
                    </View>
                    <View style={styles.statusItem}>
                        <Text style={styles.statusLabel}>Availability</Text>
                        <StatusBadge status={flower.status} />
                    </View>
                </View>
            </View>

            {}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Stock</Text>
                <View style={styles.stockRow}>
                    <Text
                        style={[
                            styles.stockValue,
                            lowStock && styles.lowStockValue,
                        ]}>
                        {flower.stockQuantity}
                    </Text>
                    <Text style={styles.stockUnit}>units available</Text>
                </View>
                {lowStock && (
                    <View style={styles.lowStockBanner}>
                        <Text style={styles.lowStockText}>⚠️ Low Stock — Order soon!</Text>
                    </View>
                )}
            </View>

            {}
            <View style={[styles.card, styles.lastCard]}>
                <Text style={styles.cardTitle}>Details</Text>
                <DetailRow label="Supplier" value={flower.supplier || 'N/A'} />
                <DetailRow label="Date Received" value={flower.dateReceived || 'N/A'} />
                <DetailRow label="Expiry Date" value={flower.expiryDate || 'N/A'} />
            </View>
        </ScrollView>
    );
};

const DetailRow = ({ label, value }) => (
    <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    hero: {
        backgroundColor: COLORS.navy,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 36,
        alignItems: 'center',
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    heroEmoji: {
        fontSize: 56,
        marginBottom: 12,
    },
    heroName: {
        fontSize: 26,
        fontWeight: '800',
        color: '#ffffff',
        textAlign: 'center',
        letterSpacing: -0.3,
    },
    heroCategory: {
        fontSize: 15,
        color: COLORS.mint,
        marginTop: 4,
        fontWeight: '500',
    },
    card: {
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
    lastCard: {
        marginBottom: 32,
    },
    cardTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 12,
    },
    savingsContainer: {
        backgroundColor: '#fef2f2',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginTop: 10,
        alignSelf: 'flex-start',
    },
    savingsText: {
        color: '#ef4444',
        fontSize: 13,
        fontWeight: '700',
    },
    statusRow: {
        flexDirection: 'row',
        gap: 20,
    },
    statusItem: {
        flex: 1,
    },
    statusLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 6,
        fontWeight: '500',
    },
    stockRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
    },
    stockValue: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1f2937',
    },
    stockUnit: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    lowStockValue: {
        color: '#f59e0b',
    },
    lowStockBanner: {
        backgroundColor: '#fef3c7',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginTop: 12,
    },
    lowStockText: {
        color: '#92400e',
        fontSize: 13,
        fontWeight: '600',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    detailLabel: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 14,
        color: '#1f2937',
        fontWeight: '600',
    },
});

export default FlowerDetailScreen;
