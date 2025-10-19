import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

const Stack = createStackNavigator();

const AuthStack = () => {
    return (
        <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: '#fff' },
            }}
        >
            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ title: 'Entrar' }}
            />
            <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{ title: 'Cadastrar' }}
            />
        </Stack.Navigator>
    );
};

export default AuthStack;