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

    // Verifica se existe token ao inicializar o app
    useEffect(() => {
        const checkToken = async () => {
            try {
                const token = await authStorage.getToken();
                if (token) {
                    setUserToken(token);
                    // Aqui poderia buscar informações do usuário
                    // await fetchUserInfo(token);
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
            // Simulação de chamada para API de login
            // Substitua por sua API real
            console.log('Tentando login com:', email);

            // Simulando resposta da API
            setTimeout(async () => {
                const mockToken = 'mock-jwt-token-' + Date.now();
                const mockUser = {
                    id: 1,
                    name: 'João Silva',
                    email: email
                };

                await authStorage.storeToken(mockToken);
                setUserToken(mockToken);
                setUserInfo(mockUser);
                setIsLoading(false);
            }, 1500);

        } catch (error) {
            console.error('Erro no login:', error);
            setIsLoading(false);
            throw error;
        }
    };

    /**
     * Função para registro de novo usuário
     * @param {object} userData - Dados do usuário para registro
     */
    const signUp = async (userData) => {
        setIsLoading(true);
        try {
            // Simulação de chamada para API de registro
            console.log('Tentando registro com:', userData);

            // Simulando resposta da API
            setTimeout(async () => {
                const mockToken = 'mock-jwt-token-' + Date.now();
                const mockUser = {
                    id: 2,
                    name: userData.name,
                    email: userData.email
                };

                await authStorage.storeToken(mockToken);
                setUserToken(mockToken);
                setUserInfo(mockUser);
                setIsLoading(false);
            }, 1500);

        } catch (error) {
            console.error('Erro no registro:', error);
            setIsLoading(false);
            throw error;
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

    const value = {
        isLoading,
        userToken,
        userInfo,
        signIn,
        signOut,
        signUp,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};