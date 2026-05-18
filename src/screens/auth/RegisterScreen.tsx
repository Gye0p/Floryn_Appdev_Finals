import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { checkApproval, register as symfonyRegister } from '../../app/api/authApi';
import COLORS from '../../theme/colors';
import {
    getApprovalDeniedMessage,
    getApprovalIdentifier,
    IMG,
    isApprovedByAdmin,
    ROUTES,
} from '../../utils';
import {
    logCrashlytics,
    logEvent,
    logScreenView,
    recordError,
    setAnalyticsUserId,
    setCrashlyticsUserId,
    signUpWithEmail,
    signOut,
} from '../../utils/firebase';
import {
    USER_LOGIN_COMPLETED,
    USER_LOGIN_ERROR,
    USER_LOGIN_REQUEST,
} from '../../app/actions';
import { logError, logInteraction } from '../../utils/logger';

const RegisterScreen = () => {
    const navigation = useNavigation<any>();
    const dispatch = useDispatch<any>();

    useFocusEffect(
        useCallback(() => {
            void logScreenView('Register');
        }, []),
    );

    const [form, setForm] = useState({
        name:     '',
        email:    '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);

    const set = field => value => setForm(prev => ({ ...prev, [field]: value }));

    const handleRegister = async () => {
        const { name, email, password } = form;
        if (!name.trim() || !email.trim() || !password.trim()) {
            logInteraction('Register screen: blocked missing required fields');
            setError('Please fill in all required fields.');
            return;
        }

        dispatch({ type: USER_LOGIN_REQUEST });

        logInteraction('Register screen: submit', {
            email: email.trim(),
        });
        setLoading(true);
        setError(null);

        try {
            logCrashlytics('Register screen: email sign-up started');

            const credential = await signUpWithEmail(email.trim(), password);
            await credential.user.updateProfile({ displayName: name.trim() });

            // ── Also register in Symfony so the user exists in the backend DB ──
            const derivedUsername = getApprovalIdentifier({
                email: credential.user.email,
                displayName: name.trim(),
                fallback: email.trim(),
            });
            try {
                await symfonyRegister({
                    username: derivedUsername,
                    password,
                    email:    email.trim(),
                    fullName: name.trim(),
                });
            } catch {
                // Account may already exist in Symfony — continue to approval check
            }

            const approvalUsername = derivedUsername;
            const approvalResult = await checkApproval(approvalUsername);

            if (!isApprovedByAdmin(approvalResult)) {
                await signOut();
                const pendingMessage = getApprovalDeniedMessage(approvalResult);
                setError(pendingMessage);
                dispatch({ type: USER_LOGIN_ERROR, payload: pendingMessage });
                logInteraction('Register screen: waiting for admin approval', {
                    email: email.trim(),
                });
                navigation.navigate(ROUTES.APPROVAL_PENDING, {
                    message: pendingMessage,
                });
                return;
            }

            await setAnalyticsUserId(credential.user.uid);
            await setCrashlyticsUserId(credential.user.uid);
            await logEvent('user_sign_up', { method: 'email' });

            dispatch({
                type: USER_LOGIN_COMPLETED,
                payload: {
                    token: credential.user.uid,
                    firebaseUid: credential.user.uid,
                    user: {
                        id: credential.user.uid,
                        username: credential.user.email?.split('@')?.[0] || 'user',
                        fullName: name.trim(),
                        email: credential.user.email || email.trim(),
                        roles: ['USER'],
                    },
                },
            });

            logInteraction('Register screen: success', { email: email.trim() });
        } catch (err) {
            const msg =
                typeof err === 'object' && err !== null && 'message' in err
                    ? String((err as { message?: unknown }).message ?? 'Registration failed. Please try again.')
                    : 'Registration failed. Please try again.';
            setError(msg);
            dispatch({ type: USER_LOGIN_ERROR, payload: msg });
            recordError(err, 'RegisterScreen signUpWithEmail failed');
            logError('Register screen: failed', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled">

                <View style={styles.brandContainer}>
                    <Image source={IMG.LOGO} style={styles.logo} resizeMode="contain" />
                    <Text style={styles.subtitle}>Create your account</Text>
                </View>

                <View style={styles.formContainer}>
                    {error && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    {[
                        { label: 'Full Name', field: 'name', placeholder: 'Your full name', secure: false },
                        { label: 'Email', field: 'email', placeholder: 'your@email.com', secure: false },
                        { label: 'Password', field: 'password', placeholder: 'Create a password', secure: true },
                    ].map(({ label, field, placeholder, secure }) => (
                        <View key={field}>
                            <Text style={styles.label}>{label}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={placeholder}
                                placeholderTextColor={COLORS.muted}
                                value={form[field]}
                                onChangeText={set(field)}
                                secureTextEntry={secure}
                                autoCapitalize={field === 'name' ? 'words' : 'none'}
                                autoCorrect={false}
                                editable={!loading}
                                keyboardType={field === 'email' ? 'email-address' : 'default'}
                            />
                        </View>
                    ))}

                    <TouchableOpacity
                        style={[styles.registerButton, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                        activeOpacity={0.8}>
                        {loading ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.registerButtonText}>Create Account</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.loginRow}>
                    <Text style={styles.loginHint}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => {
                        logInteraction('Register screen: navigate to login');
                        navigation.goBack();
                    }}>
                        <Text style={styles.loginLink}>Sign In</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.footer}>Floryn Garden</Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    brandContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logo: {
        width: 240,
        height: 96,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 13,
        color: COLORS.muted,
        fontWeight: '400',
    },
    formContainer: {
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        padding: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    errorBox: {
        backgroundColor: COLORS.background,
        borderRadius: 6,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.danger,
    },
    errorText: {
        color: COLORS.danger,
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 6,
    },
    input: {
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 6,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: COLORS.text,
        marginBottom: 14,
    },
    registerButton: {
        backgroundColor: COLORS.navy,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 4,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    registerButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '600',
    },
    loginRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    loginHint: {
        color: COLORS.muted,
        fontSize: 13,
    },
    loginLink: {
        color: COLORS.blue,
        fontSize: 13,
        fontWeight: '600',
    },
    footer: {
        textAlign: 'center',
        color: COLORS.muted,
        fontSize: 11,
        marginTop: 16,
    },
});

export default RegisterScreen;
