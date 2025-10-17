import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000/api';

// Criar instância do axios
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Interceptor para adicionar token às requisições
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.log('Erro ao recuperar token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para tratar respostas
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        console.log('Erro na API:', error.response?.data || error.message);

        if (error.response?.status === 401) {
            // Token expirado ou inválido
            await AsyncStorage.multiRemove(['userToken', 'userData']);
            // Você pode redirecionar para login aqui se necessário
        }

        return Promise.reject(error);
    }
);

export default api;