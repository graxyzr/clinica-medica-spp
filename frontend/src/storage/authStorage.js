import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Armazena o token JWT no AsyncStorage
 * @param {string} token - Token JWT a ser armazenado
 */
export const storeToken = async (token) => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
        console.error('Erro ao armazenar token:', error);
        throw error;
    }
};

/**
 * Recupera o token JWT do AsyncStorage
 * @returns {Promise<string|null>} Token JWT ou null se não existir
 */
export const getToken = async () => {
    try {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        return token;
    } catch (error) {
        console.error('Erro ao recuperar token:', error);
        return null;
    }
};

/**
 * Remove o token JWT do AsyncStorage
 */
export const removeToken = async () => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
        console.error('Erro ao remover token:', error);
        throw error;
    }
};