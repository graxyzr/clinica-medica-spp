import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const Stack = createStackNavigator();

const AuthNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#3498db',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ title: 'Login' }}
            />
            <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{ title: 'Criar Conta' }}
            />
        </Stack.Navigator>
    );
};

export default AuthNavigator;