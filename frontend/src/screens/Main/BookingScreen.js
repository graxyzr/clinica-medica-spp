import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Title, Text, Card, ActivityIndicator } from 'react-native-paper';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { COLORS } from '../../utils/constants';
import { getProfessionals, getAppointments, appointments } from '../../services/api';

const BookingScreen = ({ route, navigation }) => {
    const { professional: routeProfessional } = route.params || {};

    const [specialties, setSpecialties] = useState([]);
    const [professionals, setProfessionals] = useState([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState('');
    const [selectedProfessional, setSelectedProfessional] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [professionalLoading, setProfessionalLoading] = useState(false);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [notes, setNotes] = useState('');

    // Buscar especialidades disponíveis
    useEffect(() => {
        fetchSpecialties();
    }, []);

    // Se veio profissional da navegação, pré-selecionar
    useEffect(() => {
        if (routeProfessional) {
            setSelectedProfessional(routeProfessional.id);
            setSelectedSpecialty(routeProfessional.specialty);
            // Buscar profissionais da mesma especialidade
            fetchProfessionalsBySpecialty(routeProfessional.specialty);
        }
    }, [routeProfessional]);

    // Buscar profissionais quando uma especialidade for selecionada
    useEffect(() => {
        if (selectedSpecialty) {
            fetchProfessionalsBySpecialty(selectedSpecialty);
        } else {
            setProfessionals([]);
            setSelectedProfessional('');
        }
    }, [selectedSpecialty]);

    // Buscar horários disponíveis quando profissional e data mudarem
    useEffect(() => {
        if (selectedProfessional && date) {
            fetchAvailableSlots(selectedProfessional, date);
        } else {
            setAvailableSlots([]);
            setTime('');
        }
    }, [selectedProfessional, date]);

    const fetchSpecialties = async () => {
        try {
            const specialtiesData = await getProfessionals.specialties();
            setSpecialties(specialtiesData);
        } catch (error) {
            console.error('Erro ao buscar especialidades:', error);
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
            const professionalsData = await getProfessionals.bySpecialty(specialty);
            setProfessionals(professionalsData);
        } catch (error) {
            console.error('Erro ao buscar profissionais:', error);
            alert('Erro ao carregar profissionais');
        } finally {
            setProfessionalLoading(false);
        }
    };

    const fetchAvailableSlots = async (professionalId, date) => {
        setSlotsLoading(true);
        try {
            const slots = await getAppointments.availableSlots(professionalId, date);
            setAvailableSlots(slots);
        } catch (error) {
            console.error('Erro ao buscar horários disponíveis:', error);
            setAvailableSlots([]);
        } finally {
            setSlotsLoading(false);
        }
    };

    // Função para obter data mínima (hoje)
    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    // Função para obter data máxima (1 ano a partir de hoje)
    const getMaxDate = () => {
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        return nextYear.toISOString().split('T')[0];
    };

    // Converter data do formato YYYY-MM-DD para DD/MM/AAAA para exibição
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    const handleBooking = async () => {
        if (!selectedSpecialty || !selectedProfessional || !date || !time) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        setLoading(true);
        try {
            await appointments.create({
                specialty: selectedSpecialty,
                professionalId: selectedProfessional,
                date: date,
                time: time,
                notes: notes || undefined,
            });

            alert('Consulta agendada com sucesso!');
            // Navegar de volta para o Dashboard
            navigation.navigate('Dashboard');
        } catch (error) {
            console.error('Erro ao agendar consulta:', error);
            if (error.response?.status === 409) {
                alert('Este horário já está ocupado. Por favor, escolha outro horário.');
            } else {
                alert('Erro ao agendar consulta. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    const getSelectedProfessionalName = () => {
        if (!selectedProfessional) return '';
        const professional = professionals.find(p => p.id === selectedProfessional);
        return professional?.name || '';
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
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialtiesScroll}>
                            <View style={styles.selectContainer}>
                                {specialties.map((specialty, index) => (
                                    <CustomButton
                                        key={index}
                                        mode={selectedSpecialty === specialty ? 'contained' : 'outlined'}
                                        onPress={() => setSelectedSpecialty(specialty)}
                                        style={styles.specialtyButton}
                                        compact
                                        disabled={!!routeProfessional} // Desabilitar se veio da navegação
                                    >
                                        {specialty}
                                    </CustomButton>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    {/* Select de Profissional */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Profissional *</Text>
                        {professionalLoading ? (
                            <ActivityIndicator size="small" color={COLORS.primary} />
                        ) : (
                            <ScrollView style={styles.professionalsScroll} showsVerticalScrollIndicator={false}>
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
                                                disabled={!!routeProfessional} // Desabilitar se veio da navegação
                                            >
                                                <View style={styles.professionalInfo}>
                                                    <Text style={styles.professionalName}>{professional.name}</Text>
                                                    <Text style={styles.professionalRating}>⭐ {professional.rating} ({professional.reviewCount} avaliações)</Text>
                                                </View>
                                            </CustomButton>
                                        ))
                                    )}
                                </View>
                            </ScrollView>
                        )}
                    </View>

                    {/* Input Date nativo */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Data *</Text>
                        <View style={styles.nativeInputContainer}>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={getMinDate()}
                                max={getMaxDate()}
                                style={styles.nativeInput}
                                required
                            />
                            {date && (
                                <Text style={styles.selectedDateText}>
                                    Data selecionada: {formatDateForDisplay(date)}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Horários Disponíveis */}
                    {date && selectedProfessional && (
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Horários Disponíveis *</Text>
                            {slotsLoading ? (
                                <ActivityIndicator size="small" color={COLORS.primary} />
                            ) : availableSlots.length === 0 ? (
                                <Text style={styles.noSlotsText}>
                                    Nenhum horário disponível para esta data
                                </Text>
                            ) : (
                                <View style={styles.timeSlotsContainer}>
                                    {availableSlots.map((slot, index) => (
                                        <CustomButton
                                            key={index}
                                            mode={time === slot ? 'contained' : 'outlined'}
                                            onPress={() => setTime(slot)}
                                            style={styles.timeSlotButton}
                                            compact
                                        >
                                            {slot}
                                        </CustomButton>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}

                    {/* Observações */}
                    <CustomInput
                        label="Observações (opcional)"
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Alguma observação sobre a consulta..."
                        left={<CustomInput.Icon icon="note" />}
                        multiline
                        numberOfLines={3}
                    />

                    {/* Resumo do Agendamento */}
                    {(selectedSpecialty || selectedProfessional || date || time) && (
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
                                        {getSelectedProfessionalName()}
                                    </Text>
                                )}
                                {date && (
                                    <Text style={styles.summaryText}>
                                        <Text style={styles.summaryLabel}>Data: </Text>
                                        {formatDateForDisplay(date)} ✅
                                    </Text>
                                )}
                                {time && (
                                    <Text style={styles.summaryText}>
                                        <Text style={styles.summaryLabel}>Horário: </Text>
                                        {time} ✅
                                    </Text>
                                )}
                                {notes && (
                                    <Text style={styles.summaryText}>
                                        <Text style={styles.summaryLabel}>Observações: </Text>
                                        {notes}
                                    </Text>
                                )}
                            </Card.Content>
                        </Card>
                    )}

                    <CustomButton
                        mode="contained"
                        onPress={handleBooking}
                        style={styles.bookButton}
                        loading={loading}
                        disabled={loading || !selectedSpecialty || !selectedProfessional || !date || !time}
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
    specialtiesScroll: {
        maxHeight: 100,
    },
    professionalsScroll: {
        maxHeight: 200,
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
        width: '100%',
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
    nativeInputContainer: {
        borderWidth: 1,
        borderColor: COLORS.inputBorder,
        borderRadius: 8,
        backgroundColor: COLORS.inputBackground,
        padding: 12,
        minHeight: 50,
        justifyContent: 'center',
    },
    nativeInput: {
        width: '100%',
        fontSize: 16,
        border: 'none',
        backgroundColor: 'transparent',
        outline: 'none',
        color: COLORS.text,
    },
    selectedDateText: {
        marginTop: 8,
        fontSize: 14,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
    timeSlotsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    timeSlotButton: {
        margin: 2,
    },
    noSlotsText: {
        textAlign: 'center',
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        padding: 10,
    },
    noProfessionalsText: {
        textAlign: 'center',
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        marginVertical: 10,
        padding: 10,
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
        fontSize: 14,
    },
    summaryLabel: {
        fontWeight: 'bold',
        color: COLORS.text,
    },
    bookButton: {
        marginTop: 16,
        paddingVertical: 8,
    },
});

export default BookingScreen;