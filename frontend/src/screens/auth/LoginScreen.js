import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authService } from '../../services/auth';
import { COLORS, SIZES } from '../../utils/constants';

const LoginScreen = () => {
    const navigation = useNavigation();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email é obrigatório';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (!formData.password) {
            newErrors.password = 'Senha é obrigatória';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            const result = await authService.login(formData.email, formData.password);

            if (result.success) {
                // Login bem-sucedido - o navigator irá redirecionar automaticamente
                Alert.alert('Sucesso', 'Login realizado com sucesso!');
            } else {
                Alert.alert('Erro', result.error);
            }
        } catch (error) {
            Alert.alert('Erro', 'Ocorreu um erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Limpar erro do campo quando usuário começar a digitar
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>Clínica Médica S++</Text>
                    <Text style={styles.subtitle}>Faça login na sua conta</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Email"
                        value={formData.email}
                        onChangeText={(value) => handleChange('email', value)}
                        placeholder="seu@email.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={errors.email}
                    />

                    <Input
                        label="Senha"
                        value={formData.password}
                        onChangeText={(value) => handleChange('password', value)}
                        placeholder="Sua senha"
                        secureTextEntry
                        error={errors.password}
                    />

                    <Button
                        title="Entrar"
                        onPress={handleLogin}
                        loading={loading}
                        disabled={loading}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Não tem uma conta?</Text>
                        <Button
                            title="Cadastre-se"
                            variant="outline"
                            onPress={() => navigation.navigate('Register')}
                            style={styles.registerButton}
                        />
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: SIZES.base * 3,
    },
    header: {
        alignItems: 'center',
        marginBottom: SIZES.base * 6,
    },
    title: {
        fontSize: SIZES.extraLarge,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SIZES.base,
    },
    subtitle: {
        fontSize: SIZES.medium,
        color: COLORS.textLight,
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    footer: {
        marginTop: SIZES.base * 4,
        alignItems: 'center',
    },
    footerText: {
        fontSize: SIZES.medium,
        color: COLORS.textLight,
        marginBottom: SIZES.base,
    },
    registerButton: {
        width: '100%',
    },
});

export default LoginScreen;