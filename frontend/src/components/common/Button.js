import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SIZES } from '../../utils/constants';

const Button = ({
    title,
    onPress,
    variant = 'primary',
    disabled = false,
    loading = false,
    style,
    textStyle
}) => {
    const getButtonStyle = () => {
        switch (variant) {
            case 'secondary':
                return [styles.button, styles.secondaryButton];
            case 'danger':
                return [styles.button, styles.dangerButton];
            case 'outline':
                return [styles.button, styles.outlineButton];
            default:
                return [styles.button, styles.primaryButton];
        }
    };

    const getTextStyle = () => {
        switch (variant) {
            case 'outline':
                return [styles.text, styles.outlineText];
            default:
                return [styles.text, styles.primaryText];
        }
    };

    return (
        <TouchableOpacity
            style={[
                getButtonStyle(),
                disabled && styles.disabledButton,
                style
            ]}
            onPress={onPress}
            disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.white} />
            ) : (
                <Text style={[getTextStyle(), textStyle]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: SIZES.base * 2,
        paddingHorizontal: SIZES.base * 3,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
    },
    secondaryButton: {
        backgroundColor: COLORS.secondary,
    },
    dangerButton: {
        backgroundColor: COLORS.danger,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    disabledButton: {
        backgroundColor: COLORS.gray,
        opacity: 0.6,
    },
    text: {
        fontSize: SIZES.medium,
        fontWeight: '600',
    },
    primaryText: {
        color: COLORS.white,
    },
    outlineText: {
        color: COLORS.primary,
    },
});

export default Button;