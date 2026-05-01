import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../theme/colors';

interface EmptyStateProps {
    message?: string;
}

const EmptyState = ({ message = 'Nothing here yet' }: EmptyStateProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.divider} />
            <Text style={styles.message}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    divider: {
        width: 32,
        height: 2,
        backgroundColor: COLORS.border,
        marginBottom: 16,
    },
    message: {
        fontSize: 14,
        color: COLORS.muted,
        textAlign: 'center',
        lineHeight: 22,
    },
});

export default EmptyState;
