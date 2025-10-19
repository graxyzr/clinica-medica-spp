import React, { createContext, useState, useEffect } from 'react';
import * as authStorage from '../storage/authStorage';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);

    const fetchUserInfo = async (token) => {
        try {
            const response = await api.get('/auth/me');
            setUserInfo(response.data.user);
        } catch (error) {
            console.error('Erro ao buscar informações do usuário:', error);
            await signOut();
        }
    };

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
        updateUserInfo,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};