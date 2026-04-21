import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency } from '../utils/formatCurrency';

const PriceBadge = ({ price, discountPrice }) => {
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
        fontSize: 18,
        fontWeight: '800',
        color: '#1f2937',
    },
    originalPrice: {
        fontSize: 14,
        fontWeight: '500',
        color: '#9ca3af',
        textDecorationLine: 'line-through',
    },
    discountPrice: {
        fontSize: 18,
        fontWeight: '800',
        color: '#ef4444',
    },
});

export default PriceBadge;
