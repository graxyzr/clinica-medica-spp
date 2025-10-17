import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/main/DashboardScreen';
import AppointmentScreen from '../screens/main/AppointmentScreen';
import MyAppointmentsScreen from '../screens/main/MyAppointmentsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import { COLORS } from '../utils/constants';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Agendar') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'Meus Agendamentos') {
                        iconName = focused ? 'list' : 'list-outline';
                    } else if (route.name === 'Perfil') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.gray,
                tabBarStyle: {
                    backgroundColor: COLORS.white,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.light,
                },
                headerStyle: {
                    backgroundColor: COLORS.primary,
                },
                headerTintColor: COLORS.white,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ title: 'Início' }}
            />
            <Tab.Screen
                name="Agendar"
                component={AppointmentScreen}
                options={{ title: 'Agendar Consulta' }}
            />
            <Tab.Screen
                name="Meus Agendamentos"
                component={MyAppointmentsScreen}
                options={{ title: 'Meus Agendamentos' }}
            />
            <Tab.Screen
                name="Perfil"
                component={ProfileScreen}
                options={{ title: 'Meu Perfil' }}
            />
        </Tab.Navigator>
    );
};

export default MainTabNavigator;