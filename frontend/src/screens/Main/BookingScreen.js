import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Title, Text, Card, Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { COLORS } from '../../utils/constants';
import api from '../../services/api';

const BookingScreen = () => {
    const [specialties, setSpecialties] = useState([]);
    const [professionals, setProfessionals] = useState([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState('');
    const [selectedProfessional, setSelectedProfessional] = useState('');
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [professionalLoading, setProfessionalLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Buscar especialidades disponíveis
    useEffect(() => {
        fetchSpecialties();
    }, []);

    // Buscar profissionais quando uma especialidade for selecionada
    useEffect(() => {
        if (selectedSpecialty) {
            fetchProfessionalsBySpecialty(selectedSpecialty);
        } else {
            setProfessionals([]);
            setSelectedProfessional('');
        }
    }, [selectedSpecialty]);

    const fetchSpecialties = async () => {
        try {
            const response = await api.get('/professionals/specialties');
            setSpecialties(response.data);
        } catch (error) {
            console.error('Erro ao buscar especialidades:', error);
            // Se o endpoint não existir, usar especialidades padrão
            setSpecialties([
                'Cardiologista',
                'Dermatologista',
                'Ortopedista',
                'Pediatra',
                'Neurologista',
                'Ginecologista',
                'Oftalmologista',
                'Psiquiatra'
            ]);
        }
    };

    const fetchProfessionalsBySpecialty = async (specialty) => {
        setProfessionalLoading(true);
        try {
            const response = await api.get('/professionals', {
                params: { specialty }
            });
            setProfessionals(response.data);
        } catch (error) {
            console.error('Erro ao buscar profissionais:', error);
            // Fallback: filtrar profissionais mockados pela especialidade
            const allProfessionals = await api.get('/professionals');
            const filtered = allProfessionals.data.filter(prof =>
                prof.specialty.toLowerCase().includes(specialty.toLowerCase())
            );
            setProfessionals(filtered);
        } finally {
            setProfessionalLoading(false);
        }
    };

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const onTimeChange = (event, selectedTime) => {
        setShowTimePicker(Platform.OS === 'ios');
        if (selectedTime) {
            setTime(selectedTime);
        }
    };

    const showDatepicker = () => {
        setShowDatePicker(true);
    };

    const showTimepicker = () => {
        setShowTimePicker(true);
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('pt-BR');
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const handleBooking = async () => {
        if (!selectedSpecialty || !selectedProfessional) {
            alert('Por favor, selecione a especialidade e o profissional');
            return;
        }

        // Verificar se a data não é no passado
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            alert('Por favor, selecione uma data futura');
            return;
        }

        setLoading(true);
        try {
            await api.post('/appointments', {
                specialty: selectedSpecialty,
                professionalId: selectedProfessional,
                date: date.toISOString().split('T')[0], // Formato YYYY-MM-DD
                time: formatTime(time),
            });

            alert('Consulta agendada com sucesso!');
            // Limpar formulário
            setSelectedSpecialty('');
            setSelectedProfessional('');
            setDate(new Date());
            setTime(new Date());
            setProfessionals([]);
        } catch (error) {
            console.error('Erro ao agendar consulta:', error);
            alert('Erro ao agendar consulta. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Title>Agendar Consulta</Title>
                <Text style={styles.subtitle}>Preencha os dados para agendar sua consulta</Text>
            </View>

            <Card style={styles.formCard}>
                <Card.Content>
                    {/* Select de Especialidade */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Especialidade *</Text>
                        <View style={styles.selectContainer}>
                            {specialties.map((specialty, index) => (
                                <CustomButton
                                    key={index}
                                    mode={selectedSpecialty === specialty ? 'contained' : 'outlined'}
                                    onPress={() => setSelectedSpecialty(specialty)}
                                    style={styles.specialtyButton}
                                    compact
                                >
                                    {specialty}
                                </CustomButton>
                            ))}
                        </View>
                    </View>

                    {/* Select de Profissional */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Profissional *</Text>
                        {professionalLoading ? (
                            <Text style={styles.loadingText}>Carregando profissionais...</Text>
                        ) : (
                            <View style={styles.selectContainer}>
                                {professionals.length === 0 ? (
                                    <Text style={styles.noProfessionalsText}>
                                        {selectedSpecialty ? 'Nenhum profissional disponível para esta especialidade' : 'Selecione uma especialidade primeiro'}
                                    </Text>
                                ) : (
                                    professionals.map((professional) => (
                                        <CustomButton
                                            key={professional.id}
                                            mode={selectedProfessional === professional.id ? 'contained' : 'outlined'}
                                            onPress={() => setSelectedProfessional(professional.id)}
                                            style={styles.professionalButton}
                                            compact
                                        >
                                            <View style={styles.professionalInfo}>
                                                <Text style={styles.professionalName}>{professional.name}</Text>
                                                <Text style={styles.professionalRating}>⭐ {professional.rating} ({professional.reviewCount} avaliações)</Text>
                                            </View>
                                        </CustomButton>
                                    ))
                                )}
                            </View>
                        )}
                    </View>

                    {/* Data */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Data *</Text>
                        <Button
                            mode="outlined"
                            onPress={showDatepicker}
                            style={styles.dateTimeButton}
                            icon="calendar"
                        >
                            {formatDate(date)}
                        </Button>
                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onDateChange}
                                minimumDate={new Date()}
                                locale="pt-BR"
                            />
                        )}
                    </View>

                    {/* Horário */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Horário *</Text>
                        <Button
                            mode="outlined"
                            onPress={showTimepicker}
                            style={styles.dateTimeButton}
                            icon="clock"
                        >
                            {formatTime(time)}
                        </Button>
                        {showTimePicker && (
                            <DateTimePicker
                                value={time}
                                mode="time"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onTimeChange}
                                locale="pt-BR"
                                is24Hour={true}
                            />
                        )}
                    </View>

                    {/* Resumo do Agendamento */}
                    {(selectedSpecialty || selectedProfessional) && (
                        <Card style={styles.summaryCard}>
                            <Card.Content>
                                <Title style={styles.summaryTitle}>Resumo do Agendamento</Title>
                                {selectedSpecialty && (
                                    <Text style={styles.summaryText}>
                                        <Text style={styles.summaryLabel}>Especialidade: </Text>
                                        {selectedSpecialty}
                                    </Text>
                                )}
                                {selectedProfessional && (
                                    <Text style={styles.summaryText}>
                                        <Text style={styles.summaryLabel}>Profissional: </Text>
                                        {professionals.find(p => p.id === selectedProfessional)?.name}
                                    </Text>
                                )}
                                <Text style={styles.summaryText}>
                                    <Text style={styles.summaryLabel}>Data: </Text>
                                    {formatDate(date)}
                                </Text>
                                <Text style={styles.summaryText}>
                                    <Text style={styles.summaryLabel}>Horário: </Text>
                                    {formatTime(time)}
                                </Text>
                            </Card.Content>
                        </Card>
                    )}

                    <CustomButton
                        mode="contained"
                        onPress={handleBooking}
                        style={styles.bookButton}
                        loading={loading}
                        disabled={loading || !selectedSpecialty || !selectedProfessional}
                        icon="calendar-check"
                    >
                        Agendar Consulta
                    </CustomButton>
                </Card.Content>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: 20,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
    },
    subtitle: {
        color: COLORS.textSecondary,
        marginTop: 8,
        textAlign: 'center',
    },
    formCard: {
        margin: 16,
        elevation: 2,
        backgroundColor: COLORS.surface,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: COLORS.text,
    },
    selectContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    specialtyButton: {
        margin: 2,
    },
    professionalButton: {
        margin: 2,
        width: '100%',
    },
    professionalInfo: {
        alignItems: 'flex-start',
    },
    professionalName: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    professionalRating: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    dateTimeButton: {
        borderColor: COLORS.inputBorder,
        backgroundColor: COLORS.inputBackground,
        paddingVertical: 8,
    },
    loadingText: {
        textAlign: 'center',
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        marginVertical: 10,
    },
    noProfessionalsText: {
        textAlign: 'center',
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        marginVertical: 10,
    },
    summaryCard: {
        marginTop: 16,
        backgroundColor: COLORS.inputBackground,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
    },
    summaryTitle: {
        fontSize: 16,
        marginBottom: 8,
    },
    summaryText: {
        marginBottom: 4,
    },
    summaryLabel: {
        fontWeight: 'bold',
        color: COLORS.text,
    },
    bookButton: {
        marginTop: 16,
    },
});

export default BookingScreen;