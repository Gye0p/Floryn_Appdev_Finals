import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency } from '../utils/formatCurrency';
import COLORS from '../theme/colors';

interface PriceBadgeProps {
    price: number;
    discountPrice?: number | null;
}

const PriceBadge = ({ price, discountPrice }: PriceBadgeProps) => {
    const showDiscount = discountPrice != null && discountPrice < price;

    return (
        <View style={styles.container}>
            {showDiscount ? (
                <>
                    <Text style={styles.originalPrice}>{formatCurrency(price)}</Text>
                    <Text style={styles.discountPrice}>
                        {formatCurrency(discountPrice)}
                    </Text>
                </>
            ) : (
                <Text style={styles.price}>{formatCurrency(price)}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    price: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.text,
    },
    originalPrice: {
        fontSize: 13,
        fontWeight: '400',
        color: COLORS.muted,
        textDecorationLine: 'line-through',
    },
    discountPrice: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.danger,
    },
});

export default PriceBadge;
