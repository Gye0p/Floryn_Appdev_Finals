import React, { useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import StatusBadge from '../../components/StatusBadge';
import PriceBadge from '../../components/PriceBadge';
import { formatCurrency } from '../../utils/formatCurrency';
import COLORS from '../../theme/colors';
import { UPLOADS_URL } from '../../app/api/config';
import { logScreenView } from '../../utils/firebase';
import { logInteraction } from '../../utils/logger';

const isLowStock = (flower) => flower.stockQuantity > 0 && flower.stockQuantity < 5;

const FlowerDetailScreen = ({ route }) => {
    const { flower } = route.params;
    const lowStock = isLowStock(flower);
    const imageUri = flower.imageFilename
        ? `${UPLOADS_URL}/${flower.imageFilename}`
        : null;

    useEffect(() => {
        logInteraction('Flower detail: viewed', {
            flowerId: flower?.id,
            name: flower?.name,
        });
    }, [flower]);

    useFocusEffect(
        useCallback(() => {
            void logScreenView('FlowerDetail');
        }, []),
    );

    return (
        <ScrollView style={styles.container}>
            {imageUri ? (
                <Image
                    source={{ uri: imageUri }}
                    style={styles.heroImage}
                    resizeMode="cover"
                />
            ) : null}
            <View style={styles.hero}>
                <Text style={styles.heroName}>{flower.name}</Text>
                <Text style={styles.heroCategory}>{flower.category}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Price</Text>
                <PriceBadge
                    price={flower.price}
                    discountPrice={flower.discountPrice}
                />
                {flower.discountPrice != null && flower.discountPrice < flower.price && (
                    <Text style={styles.savingsText}>
                        Save {formatCurrency(flower.price - flower.discountPrice)}
                    </Text>
                )}
            </View>

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

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Stock</Text>
                <View style={styles.stockRow}>
                    <Text style={[styles.stockValue, lowStock && styles.lowStockValue]}>
                        {flower.stockQuantity}
                    </Text>
                    <Text style={styles.stockUnit}>units available</Text>
                </View>
                {lowStock && (
                    <Text style={styles.lowStockText}>Low stock — order soon</Text>
                )}
            </View>

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
        backgroundColor: COLORS.background,
    },
    heroImage: {
        width: '100%',
        height: 220,
    },
    hero: {
        backgroundColor: COLORS.navy,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 32,
    },
    heroName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: -0.2,
        marginBottom: 4,
    },
    heroCategory: {
        fontSize: 14,
        color: COLORS.mint,
        fontWeight: '400',
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        marginHorizontal: 16,
        marginTop: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    lastCard: {
        marginBottom: 32,
    },
    cardTitle: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 12,
    },
    savingsText: {
        marginTop: 8,
        fontSize: 13,
        color: COLORS.muted,
        fontWeight: '500',
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
        color: COLORS.muted,
        marginBottom: 6,
        fontWeight: '400',
    },
    stockRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
    },
    stockValue: {
        fontSize: 28,
        fontWeight: '700',
        color: COLORS.text,
    },
    stockUnit: {
        fontSize: 14,
        color: COLORS.muted,
        fontWeight: '400',
    },
    lowStockValue: {
        color: COLORS.warning,
    },
    lowStockText: {
        marginTop: 8,
        fontSize: 13,
        color: COLORS.warning,
        fontWeight: '500',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    detailLabel: {
        fontSize: 14,
        color: COLORS.muted,
        fontWeight: '400',
    },
    detailValue: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '600',
    },
});

export default FlowerDetailScreen;
