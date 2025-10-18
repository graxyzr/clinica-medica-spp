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

// Funções de API para Agendamentos
export const getAppointments = {
    // Buscar todos os agendamentos do usuário
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

// Funções de API para Profissionais
export const getProfessionals = {
    // Buscar todos os profissionais
    all: async () => {
        const response = await api.get('/professionals');
        return response.data;
    },

    // Buscar por especialidade
    bySpecialty: async (specialty) => {
        const response = await api.get('/professionals', {
            params: { specialty }
        });
        return response.data;
    },

    // Buscar especialidades disponíveis
    specialties: async () => {
        const response = await api.get('/professionals/specialties');
        return response.data;
    },
};

// Funções de API para Autenticação
export const auth = {
    // Atualizar perfil do usuário
    updateProfile: async (userData) => {
        const response = await api.put('/auth/profile', userData);
        return response.data;
    },

    // Buscar dados do usuário
    getProfile: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
};

// Funções de API para Agendamentos (CRUD)
export const appointments = {
    // Criar agendamento
    create: async (appointmentData) => {
        const response = await api.post('/appointments', appointmentData);
        return response.data;
    },

    // Cancelar agendamento
    cancel: async (appointmentId) => {
        const response = await api.delete(`/appointments/${appointmentId}`);
        return response.data;
    },

    // Atualizar agendamento
    update: async (appointmentId, updateData) => {
        const response = await api.put(`/appointments/${appointmentId}`, updateData);
        return response.data;
    },
};

export default api;