import React from 'react';
import { TextInput } from 'react-native-paper';
import { COLORS } from '../utils/constants';

/**
 * Componente de input customizado com estilo consistente
 */
const CustomInput = ({
    label,
    mode = 'outlined',
    style,
    ...props
}) => {
    return (
        <TextInput
            label={label}
            mode={mode}
            style={[
                {
                    marginBottom: 16,
                    backgroundColor: COLORS.inputBackground,
                },
                style
            ]}
            theme={{
                colors: {
                    primary: COLORS.primary,
                    background: COLORS.inputBackground,
                    placeholder: COLORS.textSecondary,
                    text: COLORS.text,
                },
                roundness: 8,
            }}
            outlineColor={COLORS.inputBorder}
            activeOutlineColor={COLORS.primary}
            selectionColor={COLORS.primary}
            {...props}
        />
    );
};

export default CustomInput;