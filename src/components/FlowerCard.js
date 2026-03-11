import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import StatusBadge from './StatusBadge';
import PriceBadge from './PriceBadge';
import COLORS from '../theme/colors';

const isLowStock = (flower) => flower.stockQuantity > 0 && flower.stockQuantity < 5;

const FlowerCard = ({ flower, onPress }) => {
    const lowStock = isLowStock(flower);

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onPress?.(flower)}
            activeOpacity={0.7}>
            {}
            <View style={styles.accent} />

            <View style={styles.content}>
                {}
                <View style={styles.headerRow}>
                    <Text style={styles.name} numberOfLines={1}>
                        {flower.name}
                    </Text>
                    <StatusBadge status={flower.freshnessStatus} />
                </View>

                {}
                <Text style={styles.category}>{flower.category}</Text>

                {}
                <View style={styles.priceRow}>
                    <PriceBadge
                        price={flower.price}
                        discountPrice={flower.discountPrice}
                    />
                </View>

                {}
                <View style={styles.footerRow}>
                    <View style={styles.stockContainer}>
                        <Text style={[styles.stock, lowStock && styles.lowStock]}>
                            {lowStock ? '⚠ Low Stock' : `${flower.stockQuantity} in stock`}
                        </Text>
                    </View>
                    {flower.supplier && (
                        <Text style={styles.supplier} numberOfLines={1}>
                            {flower.supplier}
                        </Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginHorizontal: 16,
        marginVertical: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        overflow: 'hidden',
    },
    accent: {
        height: 4,
        backgroundColor: COLORS.navy,
    },
    content: {
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1f2937',
        flex: 1,
        marginRight: 8,
    },
    category: {
        fontSize: 13,
        color: '#6b7280',
        marginBottom: 10,
    },
    priceRow: {
        marginBottom: 10,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stockContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stock: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '500',
    },
    lowStock: {
        color: '#f59e0b',
        fontWeight: '700',
    },
    supplier: {
        fontSize: 12,
        color: '#9ca3af',
        maxWidth: 120,
    },
});

export default FlowerCard;
