import axios from 'axios';
import { getToken } from '../storage/authStorage';
import { API_CONFIG } from '../utils/constants';

// Configuração base do Axios para comunicação com a API backend
const api = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar token automaticamente nas requisições
api.interceptors.request.use(
    async (config) => {
        const token = await getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para tratar respostas de erro
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado ou inválido - redirecionar para login
            // Esta lógica será implementada no AuthContext
            console.log('Token expirado ou inválido');
        }
        return Promise.reject(error);
    }
);

export default api;