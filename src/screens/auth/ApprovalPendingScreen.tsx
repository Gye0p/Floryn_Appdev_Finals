import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ROUTES } from '../../utils';
import COLORS from '../../theme/colors';

const DEFAULT_MESSAGE = 'Your account is pending admin approval. Please wait for confirmation.';

const ApprovalPendingScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const message = route?.params?.message || DEFAULT_MESSAGE;

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Approval Pending</Text>
                <Text style={styles.message}>{message}</Text>
                <Text style={styles.hint}>
                    You can sign in again after an admin approves your account.
                </Text>
                <TouchableOpacity
                    style={styles.button}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate(ROUTES.LOGIN)}>
                    <Text style={styles.buttonText}>Back to Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        paddingHorizontal: 24,
        paddingVertical: 28,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 12,
    },
    message: {
        fontSize: 14,
        color: COLORS.text,
        lineHeight: 22,
        marginBottom: 8,
    },
    hint: {
        fontSize: 13,
        color: COLORS.muted,
        lineHeight: 20,
    },
    button: {
        marginTop: 24,
        backgroundColor: COLORS.navy,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default ApprovalPendingScreen;
