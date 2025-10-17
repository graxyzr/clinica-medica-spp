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

const RegisterScreen = () => {
    const navigation = useNavigation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name) {
            newErrors.name = 'Nome é obrigatório';
        } else if (formData.name.length < 2) {
            newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
        }

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

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirme sua senha';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Senhas não conferem';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            const { confirmPassword, ...userData } = formData;
            const result = await authService.register(userData);

            if (result.success) {
                Alert.alert('Sucesso', 'Conta criada com sucesso!');
                // O navigator irá redirecionar automaticamente para a tela principal
            } else {
                Alert.alert('Erro', result.error);
            }
        } catch (error) {
            Alert.alert('Erro', 'Ocorreu um erro ao criar a conta');
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
                    <Text style={styles.title}>Criar Conta</Text>
                    <Text style={styles.subtitle}>Preencha os dados para se cadastrar</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Nome Completo"
                        value={formData.name}
                        onChangeText={(value) => handleChange('name', value)}
                        placeholder="Seu nome completo"
                        autoCapitalize="words"
                        error={errors.name}
                    />

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
                        label="Telefone (Opcional)"
                        value={formData.phone}
                        onChangeText={(value) => handleChange('phone', value)}
                        placeholder="(11) 99999-9999"
                        keyboardType="phone-pad"
                        error={errors.phone}
                    />

                    <Input
                        label="Senha"
                        value={formData.password}
                        onChangeText={(value) => handleChange('password', value)}
                        placeholder="Sua senha"
                        secureTextEntry
                        error={errors.password}
                    />

                    <Input
                        label="Confirmar Senha"
                        value={formData.confirmPassword}
                        onChangeText={(value) => handleChange('confirmPassword', value)}
                        placeholder="Confirme sua senha"
                        secureTextEntry
                        error={errors.confirmPassword}
                    />

                    <Button
                        title="Criar Conta"
                        onPress={handleRegister}
                        loading={loading}
                        disabled={loading}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Já tem uma conta?</Text>
                        <Button
                            title="Fazer Login"
                            variant="outline"
                            onPress={() => navigation.navigate('Login')}
                            style={styles.loginButton}
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
        marginBottom: SIZES.base * 4,
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
    loginButton: {
        width: '100%',
    },
});

export default RegisterScreen;