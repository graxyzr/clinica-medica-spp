import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import api from '../../services/api';
import { COLORS, SIZES } from '../../utils/constants';

const DashboardScreen = () => {
    const navigation = useNavigation();
    const [user, setUser] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadUserData();
        loadAppointments();
    }, []);

    const loadUserData = async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        } catch (error) {
            console.log('Erro ao carregar dados do usuário:', error);
        }
    };

    const loadAppointments = async () => {
        try {
            const response = await api.get('/appointments/me?limit=3');
            setAppointments(response.data.data.appointments);
        } catch (error) {
            console.log('Erro ao carregar agendamentos:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadAppointments();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };

    const formatTime = (timeString) => {
        return timeString.substring(0, 5);
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.header}>
                <Text style={styles.welcome}>
                    Olá, {user?.name || 'Usuário'}! 👋
                </Text>
                <Text style={styles.subtitle}>
                    Bem-vindo à Clínica Médica S++
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Próximos Agendamentos</Text>

                {appointments.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>
                            Nenhum agendamento encontrado
                        </Text>
                        <Button
                            title="Agendar Consulta"
                            onPress={() => navigation.navigate('Agendar')}
                            style={styles.emptyStateButton}
                        />
                    </View>
                ) : (
                    appointments.map((appointment) => (
                        <View key={appointment.id} style={styles.appointmentCard}>
                            <View style={styles.appointmentHeader}>
                                <Text style={styles.appointmentTitle}>
                                    {appointment.service_name}
                                </Text>
                                <Text style={[
                                    styles.appointmentStatus,
                                    { color: getStatusColor(appointment.status) }
                                ]}>
                                    {appointment.status}
                                </Text>
                            </View>

                            <Text style={styles.appointmentProfessional}>
                                Dr(a). {appointment.professional_name}
                            </Text>

                            <View style={styles.appointmentDateTime}>
                                <Text style={styles.appointmentDate}>
                                    📅 {formatDate(appointment.date)}
                                </Text>
                                <Text style={styles.appointmentTime}>
                                    ⏰ {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                                </Text>
                            </View>
                        </View>
                    ))
                )}
            </View>

            <View style={styles.actions}>
                <Button
                    title="📅 Agendar Nova Consulta"
                    onPress={() => navigation.navigate('Agendar')}
                    style={styles.actionButton}
                />

                <Button
                    title="📋 Ver Todos os Agendamentos"
                    variant="outline"
                    onPress={() => navigation.navigate('Meus Agendamentos')}
                    style={styles.actionButton}
                />
            </View>
        </ScrollView>
    );
};

const getStatusColor = (status) => {
    switch (status) {
        case 'scheduled':
            return COLORS.primary;
        case 'confirmed':
            return COLORS.secondary;
        case 'cancelled':
            return COLORS.danger;
        case 'completed':
            return COLORS.gray;
        default:
            return COLORS.text;
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: SIZES.base * 3,
        backgroundColor: COLORS.primary,
    },
    welcome: {
        fontSize: SIZES.extraLarge,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: SIZES.base,
    },
    subtitle: {
        fontSize: SIZES.medium,
        color: COLORS.white,
        opacity: 0.9,
    },
    section: {
        padding: SIZES.base * 3,
    },
    sectionTitle: {
        fontSize: SIZES.large,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SIZES.base * 2,
    },
    appointmentCard: {
        backgroundColor: COLORS.white,
        padding: SIZES.base * 2,
        borderRadius: 8,
        marginBottom: SIZES.base * 2,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    appointmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.base,
    },
    appointmentTitle: {
        fontSize: SIZES.medium,
        fontWeight: 'bold',
        color: COLORS.text,
        flex: 1,
    },
    appointmentStatus: {
        fontSize: SIZES.small,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    appointmentProfessional: {
        fontSize: SIZES.font,
        color: COLORS.textLight,
        marginBottom: SIZES.base,
    },
    appointmentDateTime: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    appointmentDate: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
    },
    appointmentTime: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
    },
    emptyState: {
        alignItems: 'center',
        padding: SIZES.base * 4,
    },
    emptyStateText: {
        fontSize: SIZES.medium,
        color: COLORS.textLight,
        marginBottom: SIZES.base * 2,
        textAlign: 'center',
    },
    emptyStateButton: {
        width: '80%',
    },
    actions: {
        padding: SIZES.base * 3,
    },
    actionButton: {
        marginBottom: SIZES.base * 2,
    },
});

export default DashboardScreen;