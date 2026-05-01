import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    Image,
    Alert,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { resetLogin } from '../../app/reducers/auth';
import {
    USER_LOGIN_COMPLETED,
    USER_LOGIN_ERROR,
    USER_LOGIN_REQUEST,
} from '../../app/actions';
import { checkApproval } from '../../app/api/authApi';
import COLORS from '../../theme/colors';
import {
    getApprovalDeniedMessage,
    getApprovalIdentifier,
    IMG,
    isApprovedByAdmin,
    ROUTES,
} from '../../utils';
import {
    GoogleSigninButton,
    isGoogleSignInCancelled,
    isPlayServicesUnavailable,
    logCrashlytics,
    logLogin,
    logScreenView,
    recordError,
    sendPasswordReset,
    setAnalyticsUserId,
    setCrashlyticsUserId,
    signInWithEmail,
    signInWithGoogle,
    signOut,
} from '../../utils/firebase';
import { logInteraction } from '../../utils/logger';

const LoginScreen = () => {
    const { isLoading, isError } = useSelector((state: any) => state.auth);
    const dispatch = useDispatch<any>();
    const navigation = useNavigation<any>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            void logScreenView('Login');
        }, []),
    );

    const mapFirebaseUserPayload = (user: any) => ({
        token: user?.uid || '',
        firebaseUid: user?.uid || '',
        user: {
            id: user?.uid || '',
            username: user?.displayName || user?.email?.split('@')?.[0] || 'user',
            fullName: user?.displayName || '',
            email: user?.email || '',
            roles: ['USER'],
        },
    });

    const handleEmailChange = text => {
        if (isError) { dispatch(resetLogin()); }
        setErrorMessage(null);
        setEmail(text);
    };
    const handlePasswordChange = text => {
        if (isError) { dispatch(resetLogin()); }
        setErrorMessage(null);
        setPassword(text);
    };

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            logInteraction('Login screen: blocked empty credentials');
            return;
        }

        dispatch({ type: USER_LOGIN_REQUEST });
        setErrorMessage(null);

        logInteraction('Login screen: submit', {
            email: email.trim(),
        });

        try {
            logCrashlytics('Login screen: email sign-in started');
            const credential = await signInWithEmail(email.trim(), password);

            const approvalUsername = getApprovalIdentifier({
                email: credential.user.email,
                displayName: credential.user.displayName,
                fallback: email.trim(),
            });
            const approvalResult = await checkApproval(approvalUsername);

            if (!isApprovedByAdmin(approvalResult)) {
                await signOut();
                const pendingMessage = getApprovalDeniedMessage(approvalResult);
                setErrorMessage(pendingMessage);
                dispatch({ type: USER_LOGIN_ERROR, payload: pendingMessage });
                navigation.navigate(ROUTES.APPROVAL_PENDING, {
                    message: pendingMessage,
                });
                return;
            }

            const authPayload = mapFirebaseUserPayload(credential.user);

            await setAnalyticsUserId(credential.user.uid);
            await setCrashlyticsUserId(credential.user.uid);
            await logLogin('email');

            dispatch({ type: USER_LOGIN_COMPLETED, payload: authPayload });
            logInteraction('Login screen: email sign-in success', {
                uid: credential.user.uid,
            });
        } catch (error) {
            const message =
                typeof error === 'object' && error !== null && 'message' in error
                    ? String((error as { message?: unknown }).message ?? 'Login failed. Please try again.')
                    : 'Login failed. Please try again.';
            setErrorMessage(message);
            dispatch({ type: USER_LOGIN_ERROR, payload: message });
            recordError(error, 'LoginScreen signInWithEmail failed');
        }
    };

    const handleGoogleLogin = async () => {
        dispatch({ type: USER_LOGIN_REQUEST });
        setErrorMessage(null);

        try {
            logCrashlytics('Login screen: Google sign-in started');
            const credential = await signInWithGoogle();

            const approvalUsername = getApprovalIdentifier({
                email: credential.user.email,
                displayName: credential.user.displayName,
            });
            const approvalResult = await checkApproval(approvalUsername);

            if (!isApprovedByAdmin(approvalResult)) {
                await signOut();
                const pendingMessage = getApprovalDeniedMessage(approvalResult);
                setErrorMessage(pendingMessage);
                dispatch({ type: USER_LOGIN_ERROR, payload: pendingMessage });
                navigation.navigate(ROUTES.APPROVAL_PENDING, {
                    message: pendingMessage,
                });
                return;
            }

            const authPayload = mapFirebaseUserPayload(credential.user);

            await setAnalyticsUserId(credential.user.uid);
            await setCrashlyticsUserId(credential.user.uid);
            await logLogin('google');

            dispatch({ type: USER_LOGIN_COMPLETED, payload: authPayload });
            logInteraction('Login screen: Google sign-in success', {
                uid: credential.user.uid,
            });
        } catch (error) {
            if (isGoogleSignInCancelled(error)) {
                dispatch(resetLogin());
                return;
            }

            if (isPlayServicesUnavailable(error)) {
                const playServicesMessage = 'Google Play Services is unavailable or outdated.';
                setErrorMessage(playServicesMessage);
                dispatch({ type: USER_LOGIN_ERROR, payload: playServicesMessage });
                return;
            }

            const message =
                typeof error === 'object' && error !== null && 'message' in error
                    ? String((error as { message?: unknown }).message ?? 'Google Sign-In failed. Please try again.')
                    : 'Google Sign-In failed. Please try again.';
            setErrorMessage(message);
            dispatch({ type: USER_LOGIN_ERROR, payload: message });
            recordError(error, 'LoginScreen signInWithGoogle failed');
        }
    };

    const handlePasswordReset = async () => {
        if (!email.trim()) {
            Alert.alert('Reset Password', 'Please enter your email first.');
            return;
        }

        try {
            await sendPasswordReset(email.trim());
            await logCrashlytics('Login screen: password reset email sent');
            Alert.alert('Reset Password', 'Password reset email sent. Please check your inbox.');
        } catch (error) {
            recordError(error, 'LoginScreen sendPasswordReset failed');
            const message =
                typeof error === 'object' && error !== null && 'message' in error
                    ? String((error as { message?: unknown }).message ?? 'Failed to send reset email.')
                    : 'Failed to send reset email.';
            Alert.alert('Reset Password', message);
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
                </View>

                <View style={styles.formContainer}>
                    {isError && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>
                                {errorMessage || 'Login failed. Please try again.'}
                            </Text>
                        </View>
                    )}

                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        placeholderTextColor={COLORS.muted}
                        value={email}
                        onChangeText={handleEmailChange}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                        editable={!isLoading}
                    />

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        placeholderTextColor={COLORS.muted}
                        value={password}
                        onChangeText={handlePasswordChange}
                        secureTextEntry
                        editable={!isLoading}
                    />

                    <TouchableOpacity
                        style={styles.forgotPasswordButton}
                        onPress={handlePasswordReset}
                        disabled={isLoading}
                        activeOpacity={0.8}>
                        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.loginButton, (isLoading || !email.trim() || !password.trim()) && styles.loginButtonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading || !email.trim() || !password.trim()}
                        activeOpacity={0.8}>
                        {isLoading ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.loginButtonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.googleButtonContainer}>
                        <GoogleSigninButton
                            style={styles.googleButton}
                            size={GoogleSigninButton.Size.Wide}
                            color={GoogleSigninButton.Color.Dark}
                            onPress={handleGoogleLogin}
                            disabled={isLoading}
                        />
                    </View>
                </View>

                <View style={styles.registerRow}>
                    <Text style={styles.registerHint}>Don&apos;t have an account? </Text>
                    <TouchableOpacity onPress={() => {
                        logInteraction('Login screen: navigate to register');
                        navigation.navigate(ROUTES.REGISTER);
                    }}>
                        <Text style={styles.registerLink}>Register</Text>
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
        justifyContent: 'center',
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
        marginBottom: 16,
    },
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        marginTop: -8,
        marginBottom: 16,
    },
    forgotPasswordText: {
        color: COLORS.blue,
        fontSize: 12,
        fontWeight: '500',
    },
    loginButton: {
        backgroundColor: COLORS.navy,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 4,
    },
    loginButtonDisabled: {
        opacity: 0.5,
    },
    loginButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '600',
    },
    googleButtonContainer: {
        marginTop: 12,
        alignItems: 'center',
    },
    googleButton: {
        width: 260,
        height: 48,
    },
    registerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    registerHint: {
        color: COLORS.muted,
        fontSize: 13,
    },
    registerLink: {
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

export default LoginScreen;
