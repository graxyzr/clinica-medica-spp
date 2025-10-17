import React, { useContext } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Card, Text, Avatar } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import CustomButton from '../../components/CustomButton';
import { COLORS } from '../../utils/constants';

/**
 * Tela principal/Dashboard do aplicativo
 * Mostra informações resumidas e navegação rápida
 */
const DashboardScreen = ({ navigation }) => {
    const { userInfo, signOut } = useContext(AuthContext);

    const handleLogout = () => {
        signOut();
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Avatar.Text
                    size={80}
                    label={userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
                    style={styles.avatar}
                />
                <Title style={styles.welcome}>
                    Bem-vindo, {userInfo?.name || 'Usuário'}!
                </Title>
                <Text style={styles.subtitle}>
                    O que você gostaria de fazer hoje?
                </Text>
            </View>

            <View style={styles.cardsContainer}>
                <Card style={styles.card} onPress={() => navigation.navigate('Booking')}>
                    <Card.Content style={styles.cardContent}>
                        <Avatar.Icon size={50} icon="calendar-plus" style={styles.cardIcon} />
                        <View style={styles.cardText}>
                            <Title>Agendar Consulta</Title>
                            <Text>Marque uma nova consulta</Text>
                        </View>
                    </Card.Content>
                </Card>

                <Card style={styles.card} onPress={() => navigation.navigate('Professionals')}>
                    <Card.Content style={styles.cardContent}>
                        <Avatar.Icon size={50} icon="doctor" style={styles.cardIcon} />
                        <View style={styles.cardText}>
                            <Title>Profissionais</Title>
                            <Text>Encontre especialistas</Text>
                        </View>
                    </Card.Content>
                </Card>

                <Card style={styles.card} onPress={() => navigation.navigate('Profile')}>
                    <Card.Content style={styles.cardContent}>
                        <Avatar.Icon size={50} icon="account" style={styles.cardIcon} />
                        <View style={styles.cardText}>
                            <Title>Meu Perfil</Title>
                            <Text>Gerencie sua conta</Text>
                        </View>
                    </Card.Content>
                </Card>
            </View>

            <CustomButton
                mode="outlined"
                onPress={handleLogout}
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
        marginBottom: 20,
    },
    avatar: {
        backgroundColor: COLORS.primary,
        marginBottom: 16,
    },
    welcome: {
        fontSize: 20,
        marginBottom: 8,
    },
    subtitle: {
        color: COLORS.disabled,
        fontSize: 16,
    },
    cardsContainer: {
        padding: 16,
    },
    card: {
        marginBottom: 16,
        elevation: 2,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    cardIcon: {
        backgroundColor: COLORS.primary,
        marginRight: 16,
    },
    cardText: {
        flex: 1,
    },
    logoutButton: {
        margin: 16,
        borderColor: COLORS.primary,
    },
});

export default DashboardScreen;