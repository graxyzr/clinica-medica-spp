import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Title, Card, Text, Avatar, ActivityIndicator } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import CustomButton from '../../components/CustomButton';
import { COLORS } from '../../utils/constants';
import api from '../../services/api';

/**
 * Tela principal/Dashboard do aplicativo
 * Mostra informações resumidas e navegação rápida
 */
const DashboardScreen = ({ navigation }) => {
    const { userInfo, signOut } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAppointments = async () => {
        try {
            const response = await api.get('/appointments/upcoming');
            setAppointments(response.data);
        } catch (error) {
            console.error('Erro ao buscar consultas:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAppointments();
    };

    const handleLogout = () => {
        signOut();
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
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

            {/* Próximas Consultas */}
            <View style={styles.section}>
                <Title style={styles.sectionTitle}>Próximas Consultas</Title>
                {loading ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                ) : appointments.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Card.Content>
                            <Text style={styles.emptyText}>
                                Nenhuma consulta agendada
                            </Text>
                        </Card.Content>
                    </Card>
                ) : (
                    appointments.slice(0, 2).map((appointment) => (
                        <Card key={appointment.id} style={styles.appointmentCard}>
                            <Card.Content>
                                <Text style={styles.appointmentDoctor}>
                                    Dr(a). {appointment.professionalName}
                                </Text>
                                <Text style={styles.appointmentSpecialty}>
                                    {appointment.specialty}
                                </Text>
                                <Text style={styles.appointmentDate}>
                                    {appointment.date} às {appointment.time}
                                </Text>
                            </Card.Content>
                        </Card>
                    ))
                )}
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
        color: COLORS.textSecondary,
        fontSize: 16,
    },
    section: {
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        marginBottom: 12,
    },
    appointmentCard: {
        marginBottom: 8,
        backgroundColor: COLORS.surface,
    },
    appointmentDoctor: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    appointmentSpecialty: {
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    appointmentDate: {
        color: COLORS.primary,
        marginTop: 4,
        fontWeight: 'bold',
    },
    emptyCard: {
        alignItems: 'center',
        padding: 16,
        backgroundColor: COLORS.surface,
    },
    emptyText: {
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    cardsContainer: {
        padding: 16,
    },
    card: {
        marginBottom: 16,
        elevation: 2,
        backgroundColor: COLORS.surface,
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