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
import COLORS from '../../theme/colors';
import { IMG } from '../../utils';
import { register } from '../../app/api/authApi';
import { logError, logInteraction } from '../../utils/logger';

const RegisterScreen = () => {
    const navigation = useNavigation<any>();

    const [form, setForm] = useState({
        name:     '',
        email:    '',
        phone:    '+63',
        username: '',
        password: '',
        address:  '',
    });
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);
    const [success, setSuccess] = useState(false);

    const set = field => value => setForm(prev => ({ ...prev, [field]: value }));

    const handlePhoneChange = value => {
        if (!value.startsWith('+63')) {
            value = '+63' + value.replace(/^\+?6?3?/, '');
        }
        setForm(prev => ({ ...prev, phone: value }));
    };

    const handleRegister = async () => {
        const { name, email, phone, username, password } = form;
        if (!name.trim() || !email.trim() || !username.trim() || !password.trim()) {
            logInteraction('Register screen: blocked missing required fields');
            setError('Please fill in all required fields.');
            return;
        }

        logInteraction('Register screen: submit', {
            username: username.trim(),
            hasPhone: phone.trim().length > 3,
        });
        setLoading(true);
        setError(null);

        try {
            const phoneVal = phone.trim();
            await register({
                username:  username.trim(),
                password,
                email:     email.trim(),
                full_name: name.trim(),
                phone:     phoneVal === '+63' ? '' : phoneVal,
                address:   form.address.trim(),
            });
            setSuccess(true);
            logInteraction('Register screen: success', { username: username.trim() });
        } catch (err) {
            const msg =
                err?.response?.data?.error ??
                err?.response?.data?.message ??
                'Registration failed. Please try again.';
            setError(msg);
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

                {}
                <View style={styles.brandContainer}>
                    <Image source={IMG.LOGO} style={styles.logo} resizeMode="contain" />
                    <Text style={styles.subtitle}>Create your account</Text>
                </View>

                {success ? (

                    <View style={styles.successBox}>
                        <Text style={styles.successTitle}>Request Received! 🌸</Text>
                        <Text style={styles.successText}>
                            Your account has been created and is pending approval.{'\n'}
                            An admin or staff will activate it — then you can log in.
                        </Text>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => {
                                logInteraction('Register screen: back to login');
                                navigation.goBack();
                            }}>
                            <Text style={styles.backButtonText}>Back to Login</Text>
                        </TouchableOpacity>
                    </View>
                ) : (

                    <View style={styles.formContainer}>
                        {error && (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        {[
                            { label: 'Full Name *',        field: 'name',     placeholder: 'Your full name',    secure: false },
                            { label: 'Email *',            field: 'email',    placeholder: 'your@email.com',    secure: false },
                            { label: 'Phone (optional)',   field: 'phone',    placeholder: '9XX XXX XXXX',      secure: false },
                            { label: 'Address (optional)', field: 'address',  placeholder: 'Your address',      secure: false },
                            { label: 'Username *',         field: 'username', placeholder: 'Choose a username', secure: false },
                            { label: 'Password *',         field: 'password', placeholder: 'Create a password', secure: true  },
                        ].map(({ label, field, placeholder, secure }) => (
                            <View key={field}>
                                <Text style={styles.label}>{label}</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder={placeholder}
                                    placeholderTextColor={COLORS.muted}
                                    value={form[field]}
                                    onChangeText={field === 'phone' ? handlePhoneChange : set(field)}
                                    secureTextEntry={secure}
                                    autoCapitalize={field === 'email' || field === 'username' ? 'none' : 'words'}
                                    autoCorrect={false}
                                    editable={!loading}
                                    keyboardType={
                                        field === 'email' ? 'email-address' :
                                        field === 'phone' ? 'phone-pad' : 'default'
                                    }
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
                )}

                {}
                {!success && (
                    <View style={styles.loginRow}>
                        <Text style={styles.loginHint}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => {
                            logInteraction('Register screen: navigate to login');
                            navigation.goBack();
                        }}>
                            <Text style={styles.loginLink}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <Text style={styles.footer}>Floryn Garden — Customer App</Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex:            1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow:        1,
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    brandContainer: {
        alignItems:   'center',
        marginBottom: 32,
    },
    logo: {
        width:        280,
        height:       110,
        marginBottom: 12,
    },
    subtitle: {
        fontSize:   14,
        color:      COLORS.muted,
        fontWeight: '500',
    },

    formContainer: {
        backgroundColor:  '#ffffff',
        borderRadius:     20,
        padding:          24,
        shadowColor:      '#000',
        shadowOffset:     { width: 0, height: 4 },
        shadowOpacity:    0.08,
        shadowRadius:     20,
        elevation:        4,
    },
    errorBox: {
        backgroundColor: '#fef2f2',
        borderRadius:    12,
        padding:         12,
        marginBottom:    16,
        borderWidth:     1,
        borderColor:     '#fecaca',
    },
    errorText: {
        color:      '#dc2626',
        fontSize:   13,
        fontWeight: '500',
        textAlign:  'center',
    },
    label: {
        fontSize:     14,
        fontWeight:   '600',
        color:        COLORS.text,
        marginBottom: 6,
    },
    input: {
        backgroundColor: COLORS.background,
        borderWidth:     1,
        borderColor:     COLORS.border,
        borderRadius:    12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize:        15,
        color:           COLORS.text,
        marginBottom:    14,
    },
    registerButton: {
        backgroundColor: COLORS.navy,
        borderRadius:    12,
        paddingVertical: 16,
        alignItems:      'center',
        marginTop:       8,
        shadowColor:     COLORS.navy,
        shadowOffset:    { width: 0, height: 4 },
        shadowOpacity:   0.25,
        shadowRadius:    8,
        elevation:       4,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    registerButtonText: {
        color:      '#ffffff',
        fontSize:   16,
        fontWeight: '700',
    },

    successBox: {
        backgroundColor: COLORS.mintLight,
        borderRadius:    20,
        padding:         28,
        alignItems:      'center',
        borderWidth:     1,
        borderColor:     COLORS.mint,
    },
    successTitle: {
        fontSize:     22,
        fontWeight:   '800',
        color:        COLORS.navy,
        marginBottom: 12,
    },
    successText: {
        fontSize:   14,
        color:      COLORS.text,
        textAlign:  'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    backButton: {
        backgroundColor: COLORS.blue,
        borderRadius:    12,
        paddingHorizontal: 32,
        paddingVertical: 14,
    },
    backButtonText: {
        color:      '#ffffff',
        fontWeight: '700',
        fontSize:   15,
    },

    loginRow: {
        flexDirection:  'row',
        justifyContent: 'center',
        alignItems:     'center',
        marginTop:      20,
    },
    loginHint: {
        color:    COLORS.muted,
        fontSize: 13,
    },
    loginLink: {
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

export default RegisterScreen;
