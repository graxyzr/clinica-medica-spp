import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Title, Card, Text, Avatar, ActivityIndicator, Button, Modal, Portal, Provider } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import CustomButton from '../../components/CustomButton';
import { COLORS } from '../../utils/constants';
import api from '../../services/api';

/**
 * Tela principal/Dashboard do aplicativo
 * Mostra agendamentos do usuário e navegação rápida
 */
const DashboardScreen = ({ navigation }) => {
    const { userInfo, signOut } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [pastAppointments, setPastAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('upcoming'); // 'upcoming', 'past', 'all'
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            // Buscar todos os agendamentos do usuário
            const response = await api.get('/appointments/my-appointments');
            const allAppointments = response.data;

            setAppointments(allAppointments);

            // Filtrar agendamentos
            const today = new Date();
            const upcoming = allAppointments.filter(apt =>
                new Date(apt.date + ' ' + apt.time) >= today && apt.status === 'scheduled'
            );
            const past = allAppointments.filter(apt =>
                new Date(apt.date + ' ' + apt.time) < today || apt.status !== 'scheduled'
            );

            setUpcomingAppointments(upcoming);
            setPastAppointments(past);

        } catch (error) {
            console.error('Erro ao buscar agendamentos:', error);
            alert('Erro ao carregar agendamentos');
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

    const handleCancelAppointment = async () => {
        if (!selectedAppointment) return;

        try {
            await api.delete(`/appointments/${selectedAppointment.id}`);
            alert('Agendamento cancelado com sucesso!');
            setCancelModalVisible(false);
            setSelectedAppointment(null);
            fetchAppointments(); // Recarregar lista
        } catch (error) {
            console.error('Erro ao cancelar agendamento:', error);
            alert('Erro ao cancelar agendamento');
        }
    };

    const openCancelModal = (appointment) => {
        setSelectedAppointment(appointment);
        setCancelModalVisible(true);
    };

    const getAppointmentsToShow = () => {
        switch (filter) {
            case 'upcoming':
                return upcomingAppointments;
            case 'past':
                return pastAppointments;
            case 'all':
                return appointments;
            default:
                return upcomingAppointments;
        }
    };

    const formatAppointmentDate = (dateString, timeString) => {
        const date = new Date(dateString);
        const formattedDate = date.toLocaleDateString('pt-BR');
        return `${formattedDate} às ${timeString}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled':
                return '#4CAF50';
            case 'completed':
                return '#2196F3';
            case 'cancelled':
                return '#F44336';
            default:
                return COLORS.textSecondary;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'scheduled':
                return 'Agendado';
            case 'completed':
                return 'Concluído';
            case 'cancelled':
                return 'Cancelado';
            default:
                return status;
        }
    };

    const handleLogout = () => {
        signOut();
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Carregando agendamentos...</Text>
            </View>
        );
    }

    const appointmentsToShow = getAppointmentsToShow();

    return (
        <Provider>
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
                        Gerencie seus agendamentos
                    </Text>
                </View>

                {/* Filtros */}
                <View style={styles.filterContainer}>
                    <CustomButton
                        mode={filter === 'upcoming' ? 'contained' : 'outlined'}
                        onPress={() => setFilter('upcoming')}
                        style={styles.filterButton}
                        compact
                    >
                        Próximos ({upcomingAppointments.length})
                    </CustomButton>
                    <CustomButton
                        mode={filter === 'past' ? 'contained' : 'outlined'}
                        onPress={() => setFilter('past')}
                        style={styles.filterButton}
                        compact
                    >
                        Passados ({pastAppointments.length})
                    </CustomButton>
                    <CustomButton
                        mode={filter === 'all' ? 'contained' : 'outlined'}
                        onPress={() => setFilter('all')}
                        style={styles.filterButton}
                        compact
                    >
                        Todos ({appointments.length})
                    </CustomButton>
                </View>

                {/* Lista de Agendamentos */}
                <View style={styles.appointmentsSection}>
                    <Title style={styles.sectionTitle}>
                        {filter === 'upcoming' ? 'Próximas Consultas' :
                            filter === 'past' ? 'Consultas Passadas' : 'Todos os Agendamentos'}
                    </Title>

                    {appointmentsToShow.length === 0 ? (
                        <Card style={styles.emptyCard}>
                            <Card.Content style={styles.emptyContent}>
                                <Text style={styles.emptyText}>
                                    {filter === 'upcoming' ? 'Nenhuma consulta agendada' :
                                        filter === 'past' ? 'Nenhuma consulta passada' : 'Nenhum agendamento encontrado'}
                                </Text>
                                {filter === 'upcoming' && (
                                    <CustomButton
                                        mode="contained"
                                        onPress={() => navigation.navigate('Booking')}
                                        style={styles.scheduleButton}
                                        icon="calendar-plus"
                                    >
                                        Agendar Primeira Consulta
                                    </CustomButton>
                                )}
                            </Card.Content>
                        </Card>
                    ) : (
                        appointmentsToShow.map((appointment) => (
                            <Card key={appointment.id} style={styles.appointmentCard}>
                                <Card.Content>
                                    <View style={styles.appointmentHeader}>
                                        <View style={styles.appointmentInfo}>
                                            <Text style={styles.appointmentDoctor}>
                                                Dr(a). {appointment.professional?.name}
                                            </Text>
                                            <Text style={styles.appointmentSpecialty}>
                                                {appointment.specialty}
                                            </Text>
                                            <Text style={styles.appointmentDate}>
                                                {formatAppointmentDate(appointment.date, appointment.time)}
                                            </Text>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
                                            <Text style={styles.statusText}>
                                                {getStatusText(appointment.status)}
                                            </Text>
                                        </View>
                                    </View>

                                    {appointment.notes && (
                                        <Text style={styles.appointmentNotes}>
                                            Observações: {appointment.notes}
                                        </Text>
                                    )}

                                    {/* Ações */}
                                    {appointment.status === 'scheduled' && new Date(appointment.date + ' ' + appointment.time) > new Date() && (
                                        <View style={styles.actionsContainer}>
                                            <Button
                                                mode="outlined"
                                                onPress={() => openCancelModal(appointment)}
                                                style={styles.cancelButton}
                                                textColor={COLORS.error}
                                                icon="close"
                                            >
                                                Cancelar
                                            </Button>
                                        </View>
                                    )}
                                </Card.Content>
                            </Card>
                        ))
                    )}
                </View>

                {/* Cards de Navegação Rápida */}
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

            {/* Modal de Confirmação de Cancelamento */}
            <Portal>
                <Modal
                    visible={cancelModalVisible}
                    onDismiss={() => setCancelModalVisible(false)}
                    contentContainerStyle={styles.modalContainer}
                >
                    <Title style={styles.modalTitle}>Cancelar Agendamento</Title>
                    <Text style={styles.modalText}>
                        Tem certeza que deseja cancelar a consulta com {selectedAppointment?.professional?.name}?
                    </Text>
                    <Text style={styles.modalSubtext}>
                        Data: {selectedAppointment && formatAppointmentDate(selectedAppointment.date, selectedAppointment.time)}
                    </Text>
                    <View style={styles.modalActions}>
                        <Button
                            mode="outlined"
                            onPress={() => setCancelModalVisible(false)}
                            style={styles.modalButton}
                        >
                            Manter
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleCancelAppointment}
                            style={styles.modalButton}
                            buttonColor={COLORS.error}
                        >
                            Cancelar Consulta
                        </Button>
                    </View>
                </Modal>
            </Portal>
        </Provider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        color: COLORS.textSecondary,
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
        textAlign: 'center',
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 16,
        textAlign: 'center',
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 16,
        marginBottom: 20,
        gap: 8,
    },
    filterButton: {
        flex: 1,
    },
    appointmentsSection: {
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        marginBottom: 16,
        color: COLORS.text,
    },
    emptyCard: {
        marginBottom: 16,
        backgroundColor: COLORS.surface,
    },
    emptyContent: {
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 16,
    },
    scheduleButton: {
        marginTop: 8,
    },
    appointmentCard: {
        marginBottom: 12,
        backgroundColor: COLORS.surface,
        elevation: 2,
    },
    appointmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    appointmentInfo: {
        flex: 1,
    },
    appointmentDoctor: {
        fontWeight: 'bold',
        fontSize: 16,
        color: COLORS.text,
    },
    appointmentSpecialty: {
        color: COLORS.textSecondary,
        marginTop: 4,
        fontSize: 14,
    },
    appointmentDate: {
        color: COLORS.primary,
        marginTop: 4,
        fontWeight: 'bold',
        fontSize: 14,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    appointmentNotes: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        marginTop: 8,
        marginBottom: 12,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
    },
    cancelButton: {
        borderColor: COLORS.error,
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
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 8,
    },
    modalTitle: {
        marginBottom: 12,
        color: COLORS.text,
    },
    modalText: {
        marginBottom: 8,
        fontSize: 16,
        color: COLORS.text,
    },
    modalSubtext: {
        marginBottom: 20,
        fontSize: 14,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    modalButton: {
        minWidth: 100,
    },
});

export default DashboardScreen;