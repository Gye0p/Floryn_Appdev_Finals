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

            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={styles.name} numberOfLines={1}>
                        {flower.name}
                    </Text>
                    <StatusBadge status={flower.freshnessStatus} />
                </View>

                <Text style={styles.category}>{flower.category}</Text>

                <View style={styles.priceRow}>
                    <PriceBadge
                        price={flower.price}
                        discountPrice={flower.discountPrice}
                    />
                </View>

                <View style={styles.footerRow}>
                    <Text style={[styles.stock, lowStock && styles.lowStock]}>
                        {lowStock ? 'Low stock' : `${flower.stockQuantity} in stock`}
                    </Text>
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
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        marginHorizontal: 16,
        marginVertical: 4,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
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
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        flex: 1,
        marginRight: 8,
    },
    category: {
        fontSize: 12,
        color: COLORS.muted,
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
    stock: {
        fontSize: 12,
        color: COLORS.muted,
        fontWeight: '500',
    },
    lowStock: {
        color: COLORS.warning,
        fontWeight: '600',
    },
    supplier: {
        fontSize: 12,
        color: COLORS.muted,
        maxWidth: 120,
    },
});

export default FlowerCard;
