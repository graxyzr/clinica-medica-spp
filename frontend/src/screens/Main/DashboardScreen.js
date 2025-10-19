import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Title, Card, Text, Avatar, ActivityIndicator, Button, Modal, Portal, Provider } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import CustomButton from '../../components/CustomButton';
import { COLORS } from '../../utils/constants';
import { appointments } from '../../services/api';

const DashboardScreen = ({ navigation }) => {
    const { userInfo, signOut } = useContext(AuthContext);
    const [appointmentsList, setAppointmentsList] = useState([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [pastAppointments, setPastAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('upcoming');
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [canceling, setCanceling] = useState(false);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            console.log('🔄 Buscando agendamentos...');

            const response = await appointments.myAppointments();
            console.log('✅ Agendamentos recebidos:', response);

            const allAppointments = Array.isArray(response) ? response : [];
            setAppointmentsList(allAppointments);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const upcoming = allAppointments.filter(apt => {
                if (!apt.date || !apt.time) return false;

                const appointmentDate = new Date(apt.date);
                appointmentDate.setHours(0, 0, 0, 0);
                const isUpcoming = appointmentDate >= today && apt.status === 'scheduled';

                console.log(`Agendamento ${apt.id}: ${apt.date} ${apt.time}, status: ${apt.status}, upcoming: ${isUpcoming}`);
                return isUpcoming;
            });

            const past = allAppointments.filter(apt => {
                if (!apt.date || !apt.time) return false;

                const appointmentDate = new Date(apt.date);
                appointmentDate.setHours(0, 0, 0, 0);
                const isPast = appointmentDate < today || apt.status !== 'scheduled';

                return isPast;
            });

            setUpcomingAppointments(upcoming);
            setPastAppointments(past);

            console.log(`📊 Resumo: ${upcoming.length} próximos, ${past.length} passados`);

        } catch (error) {
            console.error('❌ Erro ao buscar agendamentos:', error);
            console.log('Detalhes do erro:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            alert('Erro ao carregar agendamentos: ' + (error.response?.data?.error || error.message));
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
        if (!selectedAppointment) {
            console.log('❌ Nenhum agendamento selecionado para cancelar');
            return;
        }

        console.log('🔄 Iniciando cancelamento do agendamento:', selectedAppointment.id);
        console.log('Dados do agendamento:', selectedAppointment);

        setCanceling(true);
        try {
            console.log('📤 Enviando requisição DELETE para:', `/appointments/${selectedAppointment.id}`);

            const result = await appointments.cancel(selectedAppointment.id);
            console.log('✅ Resposta do cancelamento:', result);

            alert('Agendamento cancelado com sucesso!');
            setCancelModalVisible(false);
            setSelectedAppointment(null);

            await fetchAppointments();

        } catch (error) {
            console.error('❌ Erro detalhado ao cancelar agendamento:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: error.config
            });

            console.log('🔄 Tentando método alternativo...');
            try {
                const api = await import('../../services/api');
                const response = await api.default.delete(`/appointments/${selectedAppointment.id}`);
                console.log('✅ Cancelamento bem-sucedido (método alternativo):', response.data);

                alert('Agendamento cancelado com sucesso!');
                setCancelModalVisible(false);
                setSelectedAppointment(null);
                await fetchAppointments();

            } catch (fallbackError) {
                console.error('❌ Erro no método alternativo:', fallbackError);

                let errorMessage = 'Erro ao cancelar agendamento. ';

                if (fallbackError.response?.status === 404) {
                    errorMessage += 'Agendamento não encontrado.';
                } else if (fallbackError.response?.status === 400) {
                    errorMessage += 'Não é possível cancelar este agendamento.';
                } else if (fallbackError.response?.data?.error) {
                    errorMessage += fallbackError.response.data.error;
                } else {
                    errorMessage += 'Tente novamente.';
                }

                alert(errorMessage);
            }
        } finally {
            setCanceling(false);
        }
    };

    const openCancelModal = (appointment) => {
        console.log('📝 Abrindo modal de cancelamento para:', appointment);
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
                return appointmentsList;
            default:
                return upcomingAppointments;
        }
    };

    const formatAppointmentDate = (dateString, timeString) => {
        try {
            const date = new Date(dateString);
            const formattedDate = date.toLocaleDateString('pt-BR');
            return `${formattedDate} às ${timeString}`;
        } catch (error) {
            console.error('Erro ao formatar data:', error);
            return `${dateString} às ${timeString}`;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled':
                return COLORS.success;
            case 'completed':
                return COLORS.info;
            case 'cancelled':
                return COLORS.error;
            default:
                return COLORS.textTertiary;
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

    const canCancelAppointment = (appointment) => {
        if (appointment.status !== 'scheduled') {
            console.log(`❌ Agendamento ${appointment.id} não pode ser cancelado: status não é 'scheduled'`);
            return false;
        }

        try {
            const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
            const now = new Date();
            const canCancel = appointmentDateTime > now;

            console.log(`📅 Agendamento ${appointment.id}: ${appointmentDateTime} > ${now} = ${canCancel}`);
            return canCancel;
        } catch (error) {
            console.error('Erro ao verificar se pode cancelar:', error);
            return false;
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
                        Todos ({appointmentsList.length})
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
                                                Dr(a). {appointment.professional?.name || 'Profissional não encontrado'}
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

                                    {/* Ações - Mostrar apenas para agendamentos que podem ser cancelados */}
                                    {canCancelAppointment(appointment) && (
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
                                <Title style={styles.cardTitle}>Agendar Consulta</Title>
                                <Text style={styles.cardDescription}>Marque uma nova consulta</Text>
                            </View>
                        </Card.Content>
                    </Card>

                    <Card style={styles.card} onPress={() => navigation.navigate('Professionals')}>
                        <Card.Content style={styles.cardContent}>
                            <Avatar.Icon size={50} icon="doctor" style={styles.cardIcon} />
                            <View style={styles.cardText}>
                                <Title style={styles.cardTitle}>Profissionais</Title>
                                <Text style={styles.cardDescription}>Encontre especialistas</Text>
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

                {/* Botão de Debug (remover em produção) */}
                <CustomButton
                    mode="outlined"
                    onPress={() => {
                        console.log('=== DEBUG INFO ===');
                        console.log('Appointments List:', appointmentsList);
                        console.log('Upcoming:', upcomingAppointments);
                        console.log('Past:', pastAppointments);
                        console.log('User Info:', userInfo);
                    }}
                    style={styles.debugButton}
                    icon="bug"
                >
                    Debug Info
                </CustomButton>
            </ScrollView>

            {/* Modal de Confirmação de Cancelamento */}
            <Portal>
                <Modal
                    visible={cancelModalVisible}
                    onDismiss={() => {
                        setCancelModalVisible(false);
                        setSelectedAppointment(null);
                    }}
                    contentContainerStyle={styles.modalContainer}
                >
                    <Title style={styles.modalTitle}>Cancelar Agendamento</Title>
                    <Text style={styles.modalText}>
                        Tem certeza que deseja cancelar a consulta com {selectedAppointment?.professional?.name || 'o profissional'}?
                    </Text>
                    <Text style={styles.modalSubtext}>
                        Data: {selectedAppointment && formatAppointmentDate(selectedAppointment.date, selectedAppointment.time)}
                    </Text>
                    <Text style={styles.modalWarning}>
                        Esta ação não pode ser desfeita.
                    </Text>
                    <View style={styles.modalActions}>
                        <Button
                            mode="outlined"
                            onPress={() => {
                                setCancelModalVisible(false);
                                setSelectedAppointment(null);
                            }}
                            style={styles.modalButton}
                            disabled={canceling}
                        >
                            Manter
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleCancelAppointment}
                            style={styles.modalButton}
                            buttonColor={COLORS.error}
                            loading={canceling}
                            disabled={canceling}
                        >
                            {canceling ? 'Cancelando...' : 'Cancelar Consulta'}
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
        backgroundColor: COLORS.background,
    },
    contentContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    loadingText: {
        marginTop: 16,
        color: COLORS.textSecondary,
        fontSize: 16,
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
        color: COLORS.text,
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
        fontWeight: 'bold',
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
        fontSize: 16,
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
    cardTitle: {
        color: COLORS.text,
        fontSize: 16,
    },
    cardDescription: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    logoutButton: {
        margin: 16,
        borderColor: COLORS.primary,
    },
    debugButton: {
        margin: 16,
        marginTop: 8,
        borderColor: COLORS.warning,
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
        fontSize: 18,
    },
    modalText: {
        marginBottom: 8,
        fontSize: 16,
        color: COLORS.text,
        lineHeight: 22,
    },
    modalSubtext: {
        marginBottom: 8,
        fontSize: 14,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
    modalWarning: {
        marginBottom: 20,
        fontSize: 14,
        color: COLORS.error,
        fontWeight: 'bold',
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