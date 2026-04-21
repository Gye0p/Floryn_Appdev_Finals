import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ALL_COLORS = {
    Fresh: '#22c55e',
    Good: '#3b82f6',
    'Last Sale': '#f97316',
    Expired: '#ef4444',
    Pending: '#f59e0b',
    Confirmed: '#3b82f6',
    Completed: '#22c55e',
    Cancelled: '#ef4444',
};

const StatusBadge = ({ status, style }: { status: string; style?: any }) => {
    const color = ALL_COLORS[status] || '#6b7280';

    return (
        <View style={[styles.badge, { backgroundColor: `${color}18` }, style]}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={[styles.text, { color }]}>{status}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    text: {
        fontSize: 12,
        fontWeight: '600',
    },
});

export default StatusBadge;
