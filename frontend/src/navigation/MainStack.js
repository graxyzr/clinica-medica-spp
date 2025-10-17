import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DashboardScreen from '../screens/Main/DashboardScreen';
import ProfessionalsScreen from '../screens/Main/ProfessionalsScreen';
import BookingScreen from '../screens/Main/BookingScreen';
import ProfileScreen from '../screens/Main/ProfileScreen';
import { COLORS } from '../utils/constants';

const Stack = createStackNavigator();

/**
 * Stack Navigator para telas principais do aplicativo
 * Após o usuário estar autenticado
 */
const MainStack = () => {
    return (
        <Stack.Navigator
            initialRouteName="Dashboard"
            screenOptions={{
                headerStyle: {
                    backgroundColor: COLORS.primary,
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Stack.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ title: 'Início' }}
            />
            <Stack.Screen
                name="Professionals"
                component={ProfessionalsScreen}
                options={{ title: 'Profissionais' }}
            />
            <Stack.Screen
                name="Booking"
                component={BookingScreen}
                options={{ title: 'Agendar Consulta' }}
            />
            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'Meu Perfil' }}
            />
        </Stack.Navigator>
    );
};

export default MainStack;