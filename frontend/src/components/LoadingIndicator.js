import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';


const LoadingIndicator = ({ size = 'large', color = COLORS.primary }) => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size={size} color={color} />
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
});

export default LoadingIndicator;