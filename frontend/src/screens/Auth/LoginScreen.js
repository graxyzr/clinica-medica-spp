import React, { useState, useContext } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, Title, Surface } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { COLORS } from '../../utils/constants';

/**
 * Tela de Login
 * Permite que usuários façam login com email e senha
 */
const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const { signIn, isLoading } = useContext(AuthContext);

    const handleLogin = async () => {
        if (!email || !password) {
            alert('Por favor, preencha todos os campos');
            return;
        }

        try {
            await signIn(email, password);
            // Navegação automática para MainStack acontece via AuthContext
        } catch (error) {
            alert('Erro no login. Verifique suas credenciais.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Surface style={styles.surface}>
                    <Title style={styles.title}>Agenda Consulta</Title>
                    <Text style={styles.subtitle}>Faça login em sua conta</Text>

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

                    <CustomButton
                        mode="contained"
                        onPress={handleLogin}
                        loading={isLoading}
                        disabled={isLoading}
                    >
                        Entrar
                    </CustomButton>

                    <CustomButton
                        mode="text"
                        onPress={() => navigation.navigate('Register')}
                    >
                        Não tem uma conta? Cadastre-se
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
        borderRadius: 10,
        elevation: 4,
    },
    title: {
        textAlign: 'center',
        fontSize: 24,
        marginBottom: 8,
        color: COLORS.primary,
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 30,
        color: COLORS.disabled,
        fontSize: 16,
    },
});

export default LoginScreen;