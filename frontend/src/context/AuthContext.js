import React, { createContext, useState, useEffect } from 'react';
import * as authStorage from '../storage/authStorage';
import api from '../services/api';

// Criação do contexto de autenticação
export const AuthContext = createContext();

/**
 * Provider para gerenciar o estado de autenticação global
 */
export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);

    // Buscar informações do usuário com o token
    const fetchUserInfo = async (token) => {
        try {
            const response = await api.get('/auth/me');
            setUserInfo(response.data.user);
        } catch (error) {
            console.error('Erro ao buscar informações do usuário:', error);
            // Se não conseguir buscar info do usuário, faz logout
            await signOut();
        }
    };

    // Verifica se existe token ao inicializar o app
    useEffect(() => {
        const checkToken = async () => {
            try {
                const token = await authStorage.getToken();
                if (token) {
                    setUserToken(token);
                    await fetchUserInfo(token);
                }
            } catch (error) {
                console.error('Erro ao verificar token:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkToken();
    }, []);

    /**
     * Função para login do usuário
     * @param {string} email - Email do usuário
     * @param {string} password - Senha do usuário
     */
    const signIn = async (email, password) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', {
                email,
                password,
            });

            const { token, user } = response.data;

            // Armazena o token
            await authStorage.storeToken(token);
            setUserToken(token);
            setUserInfo(user);

        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Função para registro de novo usuário
     * @param {object} userData - Dados do usuário para registro
     */
    const signUp = async (userData) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/register', userData);

            const { token, user } = response.data;

            // Armazena o token
            await authStorage.storeToken(token);
            setUserToken(token);
            setUserInfo(user);

        } catch (error) {
            console.error('Erro no registro:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Função para logout do usuário
     */
    const signOut = async () => {
        setIsLoading(true);
        try {
            // Opcional: chamar API para invalidar token no backend
            // await api.post('/auth/logout');

            await authStorage.removeToken();
            setUserToken(null);
            setUserInfo(null);
        } catch (error) {
            console.error('Erro no logout:', error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Função para atualizar informações do usuário
     * @param {object} newUserInfo - Novos dados do usuário
     */
    const updateUserInfo = (newUserInfo) => {
        setUserInfo(prev => ({
            ...prev,
            ...newUserInfo
        }));
    };

    const value = {
        isLoading,
        userToken,
        userInfo,
        signIn,
        signOut,
        signUp,
        updateUserInfo, // Nova função exportada
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};