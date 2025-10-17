import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../utils/constants';

const Input = ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    error = '',
    keyboardType = 'default',
    autoCapitalize = 'none',
    style,
    ...props
}) => {
    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    error ? styles.inputError : null,
                ]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={COLORS.gray}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                {...props}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SIZES.base * 2,
    },
    label: {
        fontSize: SIZES.font,
        fontWeight: '600',
        marginBottom: SIZES.base,
        color: COLORS.text,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.gray,
        borderRadius: 8,
        paddingVertical: SIZES.base * 1.5,
        paddingHorizontal: SIZES.base * 2,
        fontSize: SIZES.medium,
        backgroundColor: COLORS.white,
        color: COLORS.text,
    },
    inputError: {
        borderColor: COLORS.danger,
    },
    errorText: {
        color: COLORS.danger,
        fontSize: SIZES.small,
        marginTop: SIZES.base / 2,
    },
});

export default Input;