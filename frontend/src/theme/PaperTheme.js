import { DefaultTheme } from 'react-native-paper';
import { COLORS } from '../utils/constants';

export const paperTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: COLORS.primary,
        accent: COLORS.secondary,
        background: COLORS.background,
        surface: COLORS.surface,
        error: COLORS.error,
        text: COLORS.text,
        disabled: COLORS.disabled,
        placeholder: COLORS.textSecondary,
        backdrop: COLORS.background,
    },
    roundness: 8,
};