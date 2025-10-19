import React, { useState, useContext } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, Title, Surface } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { COLORS } from '../../utils/constants';

const RegisterScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const { signUp, isLoading } = useContext(AuthContext);

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            alert('Por favor, preencha todos os campos');
            return;
        }

        if (password !== confirmPassword) {
            alert('As senhas não coincidem');
            return;
        }

        if (password.length < 6) {
            alert('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        try {
            await signUp({ name, email, password });
        } catch (error) {
            alert('Erro no cadastro. Tente novamente.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Surface style={styles.surface}>
                    <Title style={styles.title}>Criar Conta</Title>
                    <Text style={styles.subtitle}>Preencha seus dados para se cadastrar</Text>

                    <CustomInput
                        label="Nome Completo"
                        value={name}
                        onChangeText={setName}
                        left={<CustomInput.Icon icon="account" />}
                    />

                    <CustomInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        left={<CustomInput.Icon icon="email" />}
                    />

                    <CustomInput
                        label="Senha"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        left={<CustomInput.Icon icon="lock" />}
                        right={
                            <CustomInput.Icon
                                icon={showPassword ? "eye-off" : "eye"}
                                onPress={() => setShowPassword(!showPassword)}
                            />
                        }
                    />

                    <CustomInput
                        label="Confirmar Senha"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showPassword}
                        left={<CustomInput.Icon icon="lock-check" />}
                    />

                    <CustomButton
                        mode="contained"
                        onPress={handleRegister}
                        loading={isLoading}
                        disabled={isLoading}
                    >
                        Cadastrar
                    </CustomButton>

                    <CustomButton
                        mode="text"
                        onPress={() => navigation.navigate('Login')}
                    >
                        Já tem uma conta? Faça login
                    </CustomButton>
                </Surface>
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
        padding: 20,
    },
    surface: {
        padding: 20,
        borderRadius: 12,
        elevation: 4,
        backgroundColor: COLORS.surface,
    },
    title: {
        textAlign: 'center',
        fontSize: 24,
        marginBottom: 8,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 30,
        color: COLORS.textSecondary,
        fontSize: 16,
    },
});

export default RegisterScreen;