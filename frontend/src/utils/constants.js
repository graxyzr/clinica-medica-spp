export const COLORS = {
    primary: '#3498db',
    primaryDark: '#2980b9',
    secondary: '#2ecc71',
    danger: '#e74c3c',
    warning: '#f39c12',
    info: '#3498db',
    light: '#ecf0f1',
    dark: '#2c3e50',
    gray: '#95a5a6',
    white: '#ffffff',
    black: '#000000',
    background: '#f8f9fa',
    text: '#2c3e50',
    textLight: '#7f8c8d',
};

export const SIZES = {
    base: 8,
    small: 12,
    font: 14,
    medium: 16,
    large: 18,
    extraLarge: 24,
    title: 32,
};

export const FONTS = {
    regular: 'System',
    bold: 'System',
    light: 'System',
};

export const API_CONFIG = {
    baseURL: 'http://localhost:5000/api',
    timeout: 10000,
};

export const APPOINTMENT_STATUS = {
    scheduled: { label: 'Agendado', color: '#3498db' },
    confirmed: { label: 'Confirmado', color: '#2ecc71' },
    cancelled: { label: 'Cancelado', color: '#e74c3c' },
    completed: { label: 'Concluído', color: '#95a5a6' },
};

export const WORKING_HOURS = {
    start: '08:00',
    end: '18:00',
};