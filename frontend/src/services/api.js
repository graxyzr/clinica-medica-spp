import axios from 'axios';
import { getToken } from '../storage/authStorage';
import { API_CONFIG } from '../utils/constants';

const api = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    headers: {
        'Content-Type': 'application/json',
    },
});

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

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await removeToken();
            console.log('Token expirado, redirecionando para login...');
        }

        if (error.response?.status >= 500) {
            console.error('Erro do servidor:', error.response.data);
        }

        return Promise.reject(error);
    }
);

export const appointments = {
    create: async (appointmentData) => {
        const response = await api.post('/appointments', appointmentData);
        return response.data;
    },

    cancel: async (appointmentId) => {
        const response = await api.delete(`/appointments/${appointmentId}`);
        return response.data;
    },

    myAppointments: async () => {
        const response = await api.get('/appointments/my-appointments');
        return response.data;
    },

    upcoming: async () => {
        const response = await api.get('/appointments/upcoming');
        return response.data;
    },

    availableSlots: async (professionalId, date) => {
        const response = await api.get('/appointments/available-slots', {
            params: { professionalId, date }
        });
        return response.data;
    },
};

export const professionals = {
    all: async () => {
        try {
            const response = await api.get('/professionals');
            console.log('✅ Profissionais carregados:', response.data?.length || 0);
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao buscar profissionais:', error);
            throw new Error(
                error.response?.data?.error ||
                'Falha ao carregar lista de profissionais'
            );
        }
    },

    specialties: async () => {
        try {
            const response = await api.get('/professionals/specialties');
            console.log('✅ Especialidades carregadas:', response.data?.length || 0);
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao buscar especialidades:', error);
            throw new Error(
                error.response?.data?.error ||
                'Falha ao carregar especialidades'
            );
        }
    },

    getById: async (id) => {
        try {
            const response = await api.get(`/professionals/${id}`);
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao buscar profissional:', error);
            throw new Error(
                error.response?.data?.error ||
                'Falha ao carregar dados do profissional'
            );
        }
    }
};

export default api;