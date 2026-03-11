import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EmptyState = ({ emoji = '🌸', message = 'Nothing here yet' }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.emoji}>{emoji}</Text>
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
    emoji: {
        fontSize: 56,
        marginBottom: 12,
    },
    message: {
        fontSize: 16,
        color: '#9ca3af',
        textAlign: 'center',
        lineHeight: 22,
    },
});

export default EmptyState;
