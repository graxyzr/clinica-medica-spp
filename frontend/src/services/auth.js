import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export const authService = {
    // Login do usuário
    async login(email, password) {
        try {
            const response = await api.post('/auth/login', {
                email,
                password,
            });

            const { token, user } = response.data.data;

            // Salvar token e dados do usuário
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userData', JSON.stringify(user));

            return { success: true, data: response.data.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erro ao fazer login'
            };
        }
    },

    // Registrar usuário
    async register(userData) {
        try {
            const response = await api.post('/auth/register', userData);
            const { token, user } = response.data.data;

            // Salvar token e dados do usuário
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userData', JSON.stringify(user));

            return { success: true, data: response.data.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erro ao criar conta'
            };
        }
    },

    // Logout
    async logout() {
        try {
            await AsyncStorage.multiRemove(['userToken', 'userData']);
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Erro ao fazer logout' };
        }
    },

    // Verificar se usuário está autenticado
    async checkAuth() {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const userData = await AsyncStorage.getItem('userData');

            if (token && userData) {
                return {
                    isAuthenticated: true,
                    user: JSON.parse(userData),
                    token
                };
            }

            return { isAuthenticated: false };
        } catch (error) {
            return { isAuthenticated: false, error: 'Erro ao verificar autenticação' };
        }
    },

    // Atualizar perfil do usuário
    async updateProfile(profileData) {
        try {
            const response = await api.put('/users/me', profileData);

            // Atualizar dados do usuário no storage
            if (response.data.data.user) {
                await AsyncStorage.setItem('userData', JSON.stringify(response.data.data.user));
            }

            return { success: true, data: response.data.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erro ao atualizar perfil'
            };
        }
    }
};