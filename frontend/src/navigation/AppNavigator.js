import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import { COLORS } from '../utils/constants';

/**
 * Navigator principal que decide qual stack mostrar
 * baseado no estado de autenticação do usuário
 */
const AppNavigator = () => {
    const { isLoading, userToken } = useContext(AuthContext);

    // Mostra um loading enquanto verifica o token
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {userToken ? <MainStack /> : <AuthStack />}
        </NavigationContainer>
    );
};

export default AppNavigator;