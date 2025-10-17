import React, { useContext } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Text, Card, Avatar } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import CustomButton from '../../components/CustomButton';
import { COLORS } from '../../utils/constants';

const ProfileScreen = () => {
    const { userInfo, signOut } = useContext(AuthContext);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Avatar.Text
                    size={100}
                    label={userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
                    style={styles.avatar}
                />
                <Title style={styles.name}>{userInfo?.name || 'Usuário'}</Title>
                <Text style={styles.email}>{userInfo?.email || 'email@exemplo.com'}</Text>
            </View>

            <Card style={styles.card}>
                <Card.Content>
                    <Title>Informações Pessoais</Title>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Nome:</Text>
                        <Text style={styles.infoValue}>{userInfo?.name || 'Não informado'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Email:</Text>
                        <Text style={styles.infoValue}>{userInfo?.email || 'Não informado'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>ID:</Text>
                        <Text style={styles.infoValue}>{userInfo?.id || 'Não informado'}</Text>
                    </View>
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <Title>Configurações</Title>
                    <CustomButton
                        mode="outlined"
                        onPress={() => alert('Em desenvolvimento')}
                        style={styles.settingsButton}
                        icon="cog"
                    >
                        Configurações da Conta
                    </CustomButton>

                    <CustomButton
                        mode="outlined"
                        onPress={() => alert('Em desenvolvimento')}
                        style={styles.settingsButton}
                        icon="bell"
                    >
                        Notificações
                    </CustomButton>
                </Card.Content>
            </Card>

            <CustomButton
                mode="contained"
                onPress={signOut}
                style={styles.logoutButton}
                icon="logout"
            >
                Sair
            </CustomButton>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.surface,
    },
    avatar: {
        backgroundColor: COLORS.primary,
        marginBottom: 16,
    },
    name: {
        fontSize: 24,
        marginBottom: 8,
    },
    email: {
        color: COLORS.disabled,
        fontSize: 16,
    },
    card: {
        margin: 16,
        elevation: 2,
    },
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    infoLabel: {
        fontWeight: 'bold',
        color: COLORS.text,
    },
    infoValue: {
        color: COLORS.disabled,
    },
    settingsButton: {
        marginVertical: 4,
        borderColor: COLORS.primary,
    },
    logoutButton: {
        margin: 16,
        backgroundColor: COLORS.error,
    },
});

export default ProfileScreen;