import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../utils/constants';

const Loading = ({ message = 'Carregando...' }) => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.text}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    text: {
        marginTop: SIZES.base,
        fontSize: SIZES.medium,
        color: COLORS.textLight,
    },
});

export default Loading;