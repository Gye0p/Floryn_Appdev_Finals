import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { userLogin, resetLogin } from '../../app/reducers/auth';
import COLORS from '../../theme/colors';
import { IMG, ROUTES } from '../../utils';
import { logInteraction } from '../../utils/logger';

const LoginScreen = () => {
    const { isLoading, isError } = useSelector((state: any) => state.auth);
    const dispatch = useDispatch();
    const navigation = useNavigation<any>();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleUsernameChange = text => {
        if (isError) { dispatch(resetLogin()); }
        setUsername(text);
    };
    const handlePasswordChange = text => {
        if (isError) { dispatch(resetLogin()); }
        setPassword(text);
    };

    const handleLogin = () => {
        if (!username.trim() || !password.trim()) {
            logInteraction('Login screen: blocked empty credentials');
            return;
        }

        logInteraction('Login screen: submit', {
            username: username.trim(),
        });
        dispatch(userLogin({ username: username.trim(), password }));
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled">

                {}
                <View style={styles.brandContainer}>
                    <Image source={IMG.LOGO} style={styles.logo} resizeMode="contain" />
                    <Text style={styles.subtitle}>Browse & Order Flowers</Text>
                </View>

                {}
                <View style={styles.formContainer}>
                    {isError && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>
                                Login failed. Please try again.
                            </Text>
                        </View>
                    )}

                    <Text style={styles.label}>Username</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your username"
                        placeholderTextColor={COLORS.muted}
                        value={username}
                        onChangeText={handleUsernameChange}
                        autoCapitalize="none"
                        autoCorrect={false}
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
                        style={[styles.loginButton, (isLoading || !username.trim() || !password.trim()) && styles.loginButtonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading || !username.trim() || !password.trim()}
                        activeOpacity={0.8}>
                        {isLoading ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.loginButtonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {}
                <View style={styles.registerRow}>
                    <Text style={styles.registerHint}>Don&apos;t have an account? </Text>
                    <TouchableOpacity onPress={() => {
                        logInteraction('Login screen: navigate to register');
                        navigation.navigate(ROUTES.REGISTER);
                    }}>
                        <Text style={styles.registerLink}>Register</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.footer}>Floryn Garden — Customer App</Text>
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
        marginBottom: 40,
    },
    logo: {
        width:        280,
        height:       110,
        marginBottom: 12,
    },
    subtitle: {
        fontSize:   14,
        color:      COLORS.muted,
        marginTop:  4,
        fontWeight: '500',
    },
    formContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 4,
    },
    errorBox: {
        backgroundColor: '#fef2f2',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    errorText: {
        color: '#dc2626',
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#1f2937',
        marginBottom: 16,
    },
    loginButton: {
        backgroundColor: COLORS.blue,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: COLORS.blue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color:      '#ffffff',
        fontSize:   16,
        fontWeight: '700',
    },
    registerRow: {
        flexDirection:  'row',
        justifyContent: 'center',
        alignItems:     'center',
        marginTop:      20,
    },
    registerHint: {
        color:    COLORS.muted,
        fontSize: 13,
    },
    registerLink: {
        color:      COLORS.blue,
        fontSize:   13,
        fontWeight: '700',
    },
    footer: {
        textAlign: 'center',
        color:     COLORS.muted,
        fontSize:  12,
        marginTop: 16,
    },
});

export default LoginScreen;
