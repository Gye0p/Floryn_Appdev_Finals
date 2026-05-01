import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import COLORS from '../theme/colors';

interface ErrorRetryProps {
    message?: string;
    onRetry?: () => void;
}

const ErrorRetry = ({ message = 'Something went wrong', onRetry }: ErrorRetryProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.divider} />
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
        marginBottom: 20,
        lineHeight: 22,
    },
    button: {
        borderWidth: 1,
        borderColor: COLORS.navy,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
    },
    buttonText: {
        color: COLORS.navy,
        fontSize: 14,
        fontWeight: '600',
    },
});

export default ErrorRetry;
