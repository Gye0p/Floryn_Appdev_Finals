import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import StatusBadge from './StatusBadge';
import PriceBadge from './PriceBadge';
import COLORS from '../theme/colors';
import { UPLOADS_URL } from '../app/api/config';

const isLowStock = (flower) => flower.stockQuantity > 0 && flower.stockQuantity < 5;

const FlowerCard = ({ flower, onPress }) => {
    const lowStock = isLowStock(flower);
    const imageUri = flower.imageFilename
        ? `${UPLOADS_URL}/${flower.imageFilename}`
        : null;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onPress?.(flower)}
            activeOpacity={0.7}>

            {imageUri ? (
                <Image
                    source={{ uri: imageUri }}
                    style={styles.image}
                    resizeMode="cover"
                />
            ) : (
                <View style={styles.imagePlaceholder}>
                    <Text style={styles.placeholderLabel}>{flower.category}</Text>
                </View>
            )}

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
    image: {
        width: '100%',
        height: 140,
    },
    imagePlaceholder: {
        width: '100%',
        height: 100,
        backgroundColor: COLORS.background,
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    placeholderLabel: {
        fontSize: 11,
        color: COLORS.muted,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
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
