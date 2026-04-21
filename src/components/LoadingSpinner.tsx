import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import COLORS from '../theme/colors';

const LoadingSpinner = ({ message = 'Loading...' }) => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={COLORS.blue} />
            <Text style={styles.text}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.background,
    },
    text: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.muted,
        fontWeight: '500',
    },
});

export default LoadingSpinner;
