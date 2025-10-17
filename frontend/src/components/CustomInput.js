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
                    backgroundColor: '#fff',
                },
                style
            ]}
            outlineColor="#e0e0e0"
            activeOutlineColor={COLORS.primary}
            {...props}
        />
    );
};

export default CustomInput;