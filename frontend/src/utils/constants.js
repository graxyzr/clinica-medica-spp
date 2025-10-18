// Arquivo para constantes globais do aplicativo
export const COLORS = {
  primary: '#2563eb', // Azul mais escuro
  secondary: '#06b6d4', // Ciano
  background: '#f8fafc', // Cinza muito claro
  surface: '#ffffff', // Branco
  inputBackground: '#f1f5f9', // Cinza claro
  inputBorder: '#cbd5e1', // Cinza médio
  error: '#dc2626', // Vermelho
  text: '#1e293b', // Cinza muito escuro (quase preto) - MELHOR CONTRASTE
  textSecondary: '#475569', // Cinza escuro
  textTertiary: '#64748b', // Cinza médio
  disabled: '#94a3b8', // Cinza para desabilitado
  success: '#16a34a', // Verde
  warning: '#d97706', // Laranja
  info: '#2563eb', // Azul
};

export const API_CONFIG = {
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_INFO: 'user_info',
};