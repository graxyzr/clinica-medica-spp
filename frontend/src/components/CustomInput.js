import React from 'react';
import { TextInput } from 'react-native-paper';
import { COLORS } from '../utils/constants';


const CustomInput = ({
    label,
    mode = 'outlined',
    style,
    error = false,
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
                    primary: error ? COLORS.error : COLORS.primary,
                    background: COLORS.inputBackground,
                    placeholder: COLORS.textTertiary,
                    text: COLORS.text,
                    error: COLORS.error,
                    onSurface: COLORS.text,
                },
                roundness: 8,
            }}
            outlineColor={error ? COLORS.error : COLORS.inputBorder}
            activeOutlineColor={error ? COLORS.error : COLORS.primary}
            selectionColor={error ? COLORS.error : COLORS.primary}
            error={error}
            {...props}
        />
    );
};

export default CustomInput;