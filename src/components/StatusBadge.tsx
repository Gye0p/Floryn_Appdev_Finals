import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const STATUS_COLORS: Record<string, string> = {
    Fresh: '#22c55e',
    Good: '#3b82f6',
    'Last Sale': '#f97316',
    Expired: '#ef4444',
    Pending: '#f59e0b',
    Confirmed: '#3b82f6',
    Completed: '#22c55e',
    Cancelled: '#ef4444',
};

interface StatusBadgeProps {
    status: string;
    style?: object;
}

const StatusBadge = ({ status, style }: StatusBadgeProps) => {
    const color = STATUS_COLORS[status] || '#6b7280';

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
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    dot: {
        width: 5,
        height: 5,
        borderRadius: 3,
        marginRight: 5,
    },
    text: {
        fontSize: 11,
        fontWeight: '600',
    },
});

export default StatusBadge;
