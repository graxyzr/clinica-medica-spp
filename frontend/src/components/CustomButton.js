import React from 'react';
import { Button } from 'react-native-paper';
import { COLORS } from '../utils/constants';

/**
 * Componente de botão customizado com estilo consistente
 */
const CustomButton = ({
    mode = 'contained',
    children,
    style,
    ...props
}) => {
    return (
        <Button
            mode={mode}
            style={[
                {
                    borderRadius: 8,
                    marginVertical: 8,
                },
                style
            ]}
            labelStyle={{
                fontSize: 16,
                fontWeight: 'bold',
            }}
            theme={{
                colors: {
                    primary: COLORS.primary,
                },
                roundness: 8,
            }}
            {...props}
        >
            {children}
        </Button>
    );
};

export default CustomButton;