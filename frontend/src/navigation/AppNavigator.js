import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import { authService } from '../services/auth';
import Loading from '../components/common/Loading';

const Stack = createStackNavigator();

const AppNavigator = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuthentication();
    }, []);

    const checkAuthentication = async () => {
        try {
            const authStatus = await authService.checkAuth();
            setIsAuthenticated(authStatus.isAuthenticated);
        } catch (error) {
            console.log('Erro ao verificar autenticação:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    <Stack.Screen name="Main" component={MainTabNavigator} />
                ) : (
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;