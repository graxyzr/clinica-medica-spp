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
    async (error) => {
        if (error.response?.status === 401) {
            // Token expirado ou inválido - limpar storage e redirecionar para login
            await removeToken();
            console.log('Token expirado, redirecionando para login...');
        }

        // Tratamento de outros erros
        if (error.response?.status >= 500) {
            console.error('Erro do servidor:', error.response.data);
        }

        return Promise.reject(error);
    }
);

// Funções de API para Agendamentos (CRUD)
export const appointments = {
    // Criar agendamento
    create: async (appointmentData) => {
        const response = await api.post('/appointments', appointmentData);
        return response.data;
    },

    // Cancelar agendamento - VERIFIQUE SE O ENDPOINT ESTÁ CORRETO
    cancel: async (appointmentId) => {
        const response = await api.delete(`/appointments/${appointmentId}`);
        return response.data;
    },

    // Buscar agendamentos do usuário
    myAppointments: async () => {
        const response = await api.get('/appointments/my-appointments');
        return response.data;
    },

    // Buscar agendamentos futuros
    upcoming: async () => {
        const response = await api.get('/appointments/upcoming');
        return response.data;
    },

    // Buscar horários disponíveis
    availableSlots: async (professionalId, date) => {
        const response = await api.get('/appointments/available-slots', {
            params: { professionalId, date }
        });
        return response.data;
    },
};

export default api;