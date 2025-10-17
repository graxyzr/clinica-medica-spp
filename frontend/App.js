import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { paperTheme } from './src/theme/PaperTheme'; // Importar o tema

/**
 * Componente principal do aplicativo
 * Envolve toda a aplicação com os providers necessários
 */
export default function App() {
  return (
    <PaperProvider theme={paperTheme}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </PaperProvider>
  );
}