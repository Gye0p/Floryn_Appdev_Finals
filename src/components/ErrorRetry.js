import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import COLORS from '../theme/colors';

const ErrorRetry = ({ message = 'Something went wrong', onRetry }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.emoji}>😔</Text>
            <Text style={styles.message}>{message}</Text>
            {onRetry && (
                <TouchableOpacity style={styles.button} onPress={onRetry}>
                    <Text style={styles.buttonText}>Try Again</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: COLORS.background,
    },
    emoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    message: {
        fontSize: 16,
        color: COLORS.muted,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
    },
    button: {
        backgroundColor: COLORS.blue,
        paddingHorizontal: 28,
        paddingVertical: 12,
        borderRadius: 12,
    },
    buttonText: {
        color: COLORS.surface,
        fontSize: 15,
        fontWeight: '700',
    },
});

export default ErrorRetry;
