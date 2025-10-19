import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
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
    const [selectedProfessional, setSelectedProfessional] = useState(null);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [professionalLoading, setProfessionalLoading] = useState(false);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchSpecialties();
    }, []);

    useEffect(() => {
        if (routeProfessional) {
            console.log('🎯 Profissional recebido da navegação:', routeProfessional);
            setSelectedProfessional(routeProfessional);
            setSelectedSpecialty(routeProfessional.specialty);
        }
    }, [routeProfessional]);

    useEffect(() => {
        if (selectedSpecialty && selectedSpecialty !== 'all') {
            fetchProfessionalsBySpecialty(selectedSpecialty);
        } else {
            setProfessionals([]);
            setSelectedProfessional(null);
        }
    }, [selectedSpecialty]);

    useEffect(() => {
        if (selectedProfessional && selectedProfessional.id && date) {
            fetchAvailableSlots(selectedProfessional.id, date);
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
            const defaultSpecialties = [
                'Cardiologista',
                'Dermatologista',
                'Ortopedista',
                'Pediatra',
                'Neurologista',
                'Ginecologista',
                'Oftalmologista',
                'Psiquiatra'
            ];
            setSpecialties(defaultSpecialties);
        }
    };

    const fetchProfessionalsBySpecialty = async (specialty) => {
        setProfessionalLoading(true);
        try {
            let professionalsData;
            try {
                professionalsData = await getProfessionals.bySpecialty(specialty);
            } catch (filterError) {
                const allProfessionals = await getProfessionals.all();
                professionalsData = allProfessionals.filter(prof =>
                    prof.specialty && prof.specialty.toLowerCase().includes(specialty.toLowerCase())
                );
            }
            setProfessionals(professionalsData);
        } catch (error) {
            console.error('Erro ao buscar profissionais:', error);
            const mockProfessionals = getMockProfessionalsBySpecialty(specialty);
            setProfessionals(mockProfessionals);
        } finally {
            setProfessionalLoading(false);
        }
    };

    const getMockProfessionalsBySpecialty = (specialty) => {
        const mockProfessionals = {
            'Cardiologista': [
                { id: 1, name: 'Dr. João Silva', specialty: 'Cardiologista', rating: 4.8, reviewCount: 125, description: 'Especialista em cardiologia com 10 anos de experiência' },
                { id: 2, name: 'Dra. Maria Santos', specialty: 'Cardiologista', rating: 4.9, reviewCount: 98, description: 'Cardiologista especializada em arritmias' }
            ],
            'Dermatologista': [
                { id: 3, name: 'Dr. Pedro Oliveira', specialty: 'Dermatologista', rating: 4.7, reviewCount: 87, description: 'Dermatologista especializado em estética' },
                { id: 4, name: 'Dra. Ana Costa', specialty: 'Dermatologista', rating: 4.9, reviewCount: 156, description: 'Especialista em dermatologia clínica' }
            ],
            'Ortopedista': [
                { id: 5, name: 'Dr. Carlos Lima', specialty: 'Ortopedista', rating: 4.6, reviewCount: 73, description: 'Ortopedista traumatologista' }
            ],
            'Pediatra': [
                { id: 6, name: 'Dra. Juliana Pereira', specialty: 'Pediatra', rating: 4.8, reviewCount: 142, description: 'Pediatra com especialização em neonatologia' }
            ],
            'Neurologista': [
                { id: 7, name: 'Dr. Roberto Almeida', specialty: 'Neurologista', rating: 4.7, reviewCount: 89, description: 'Especialista em neurologia clínica' }
            ],
            'Ginecologista': [
                { id: 8, name: 'Dra. Fernanda Rodrigues', specialty: 'Ginecologista', rating: 4.9, reviewCount: 67, description: 'Ginecologista e obstetra' }
            ],
            'Oftalmologista': [
                { id: 9, name: 'Dr. Marcelo Souza', specialty: 'Oftalmologista', rating: 4.8, reviewCount: 112, description: 'Especialista em cirurgia refrativa' }
            ],
            'Psiquiatra': [
                { id: 10, name: 'Dra. Patricia Lima', specialty: 'Psiquiatra', rating: 4.9, reviewCount: 78, description: 'Psiquiatra com abordagem cognitivo-comportamental' }
            ]
        };

        return mockProfessionals[specialty] || [];
    };

    const fetchAvailableSlots = async (professionalId, date) => {
        setSlotsLoading(true);
        try {
            const slots = await getAppointments.availableSlots(professionalId, date);
            setAvailableSlots(slots);
        } catch (error) {
            console.error('Erro ao buscar horários disponíveis:', error);
            setAvailableSlots(generateDefaultTimeSlots());
        } finally {
            setSlotsLoading(false);
        }
    };

    const generateDefaultTimeSlots = () => {
        const slots = [];
        for (let hour = 8; hour <= 17; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
            if (hour < 17) {
                slots.push(`${hour.toString().padStart(2, '0')}:30`);
            }
        }
        return slots;
    };

    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const getMaxDate = () => {
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        return nextYear.toISOString().split('T')[0];
    };

    const handleBooking = async () => {
        console.log('🎯 Dados do agendamento:', {
            selectedSpecialty,
            selectedProfessional,
            professionalId: selectedProfessional?.id,
            date,
            time,
            notes
        });

        if (!selectedSpecialty || !selectedProfessional || !date || !time) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        if (!selectedProfessional.id) {
            alert('Erro: Profissional não selecionado corretamente');
            return;
        }

        setLoading(true);
        try {
            console.log('📤 Enviando agendamento para API...');

            const appointmentData = {
                specialty: selectedSpecialty,
                professionalId: selectedProfessional.id,
                date: date,
                time: time,
                notes: notes || undefined,
            };

            console.log('📦 Dados enviados:', appointmentData);

            const result = await appointments.create(appointmentData);

            console.log('✅ Agendamento criado com sucesso:', result);
            alert('Consulta agendada com sucesso!');

            navigation.navigate('Dashboard');

        } catch (error) {
            console.error('❌ Erro completo ao agendar:', error);
            console.log('📊 Detalhes do erro:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            let errorMessage = 'Erro ao agendar consulta. ';

            if (error.response?.status === 409) {
                errorMessage = 'Este horário já está ocupado. Escolha outro horário.';
            } else if (error.response?.status === 400) {
                errorMessage = 'Dados inválidos. Verifique as informações.';
            } else if (error.response?.status === 404) {
                errorMessage = 'Profissional não encontrado no sistema.';
            } else if (error.response?.data?.error) {
                errorMessage += error.response.data.error;
            } else {
                errorMessage += 'Tente novamente.';
            }

            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Title style={styles.title}>Agendar Consulta</Title>
                    <Text style={styles.subtitle}>Preencha os dados para agendar sua consulta</Text>
                </View>

                {/* Formulário */}
                <View style={styles.form}>

                    {/* Especialidade */}
                    <Text style={styles.label}>Especialidade *</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={true}
                        style={styles.horizontalScroll}
                    >
                        <View style={styles.specialtiesContainer}>
                            {specialties.map((specialty, index) => (
                                <CustomButton
                                    key={index}
                                    mode={selectedSpecialty === specialty ? 'contained' : 'outlined'}
                                    onPress={() => setSelectedSpecialty(specialty)}
                                    style={styles.specialtyButton}
                                >
                                    {specialty}
                                </CustomButton>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Profissionais */}
                    <Text style={styles.label}>Profissional *</Text>
                    {professionalLoading ? (
                        <View style={styles.loadingBox}>
                            <ActivityIndicator size="small" color={COLORS.primary} />
                            <Text style={styles.loadingText}>Carregando profissionais...</Text>
                        </View>
                    ) : (
                        <View style={styles.professionalsBox}>
                            {professionals.length === 0 ? (
                                <Text style={styles.emptyText}>
                                    {selectedSpecialty ? 'Nenhum profissional disponível' : 'Selecione uma especialidade'}
                                </Text>
                            ) : (
                                professionals.map((professional) => (
                                    <CustomButton
                                        key={professional.id}
                                        mode={selectedProfessional?.id === professional.id ? 'contained' : 'outlined'}
                                        onPress={() => {
                                            console.log('🎯 Profissional selecionado:', professional);
                                            setSelectedProfessional(professional);
                                        }}
                                        style={styles.professionalButton}
                                    >
                                        <View style={styles.professionalInfo}>
                                            <Text style={styles.professionalName}>{professional.name}</Text>
                                            <Text style={styles.professionalDetails}>{professional.specialty} • ⭐ {professional.rating}</Text>
                                            {professional.description && (
                                                <Text style={styles.professionalDescription}>{professional.description}</Text>
                                            )}
                                        </View>
                                    </CustomButton>
                                ))
                            )}
                        </View>
                    )}

                    {/* Data */}
                    <Text style={styles.label}>Data *</Text>
                    <View style={styles.dateContainer}>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={getMinDate()}
                            max={getMaxDate()}
                            style={styles.dateInput}
                            required
                        />
                    </View>

                    {/* Horários */}
                    {date && selectedProfessional && (
                        <>
                            <Text style={styles.label}>Horários Disponíveis *</Text>
                            {slotsLoading ? (
                                <View style={styles.loadingBox}>
                                    <ActivityIndicator size="small" color={COLORS.primary} />
                                    <Text style={styles.loadingText}>Carregando horários...</Text>
                                </View>
                            ) : availableSlots.length === 0 ? (
                                <Text style={styles.emptyText}>Nenhum horário disponível</Text>
                            ) : (
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={true}
                                    style={styles.horizontalScroll}
                                >
                                    <View style={styles.timeSlotsContainer}>
                                        {availableSlots.map((slot, index) => (
                                            <CustomButton
                                                key={index}
                                                mode={time === slot ? 'contained' : 'outlined'}
                                                onPress={() => setTime(slot)}
                                                style={styles.timeButton}
                                            >
                                                {slot}
                                            </CustomButton>
                                        ))}
                                    </View>
                                </ScrollView>
                            )}
                        </>
                    )}

                    {/* Observações */}
                    <Text style={styles.label}>Observações (opcional)</Text>
                    <CustomInput
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Alguma observação sobre a consulta..."
                        multiline
                        numberOfLines={3}
                        style={styles.notesInput}
                    />

                    {/* Resumo */}
                    {selectedProfessional && date && time && (
                        <View style={styles.summary}>
                            <Text style={styles.summaryTitle}>Resumo do Agendamento</Text>
                            <Text style={styles.summaryText}><Text style={styles.summaryLabel}>Profissional:</Text> {selectedProfessional.name}</Text>
                            <Text style={styles.summaryText}><Text style={styles.summaryLabel}>Especialidade:</Text> {selectedSpecialty}</Text>
                            <Text style={styles.summaryText}><Text style={styles.summaryLabel}>Data:</Text> {date}</Text>
                            <Text style={styles.summaryText}><Text style={styles.summaryLabel}>Horário:</Text> {time}</Text>
                            {notes && <Text style={styles.summaryText}><Text style={styles.summaryLabel}>Observações:</Text> {notes}</Text>}
                        </View>
                    )}
                </View>

                {/* Botão de Agendar - SEMPRE VISÍVEL */}
                <View style={styles.footer}>
                    <CustomButton
                        mode="contained"
                        onPress={handleBooking}
                        loading={loading}
                        disabled={loading || !selectedSpecialty || !selectedProfessional || !date || !time}
                        style={styles.bookButton}
                        icon="calendar-check"
                    >
                        Agendar Consulta
                    </CustomButton>
                </View>

                {/* Debug */}
                <CustomButton
                    mode="outlined"
                    onPress={() => {
                        console.log('=== DEBUG ===');
                        console.log('Profissional selecionado:', selectedProfessional);
                        console.log('Profissional ID:', selectedProfessional?.id);
                        console.log('Especialidade:', selectedSpecialty);
                        console.log('Data:', date);
                        console.log('Horário:', time);
                    }}
                    style={styles.debugButton}
                >
                    Debug
                </CustomButton>

                {/* Espaço extra para garantir rolagem */}
                <View style={styles.spacer} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 120,
    },
    header: {
        backgroundColor: COLORS.surface,
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        color: COLORS.text,
        marginBottom: 8,
    },
    subtitle: {
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    form: {
        padding: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
        marginTop: 16,
    },
    horizontalScroll: {
        marginHorizontal: -16,
        paddingHorizontal: 16,
    },
    specialtiesContainer: {
        flexDirection: 'row',
        gap: 8,
        paddingBottom: 8,
    },
    specialtyButton: {
        marginRight: 8,
    },
    professionalsBox: {
        gap: 8,
    },
    professionalButton: {
        width: '100%',
    },
    professionalInfo: {
        alignItems: 'flex-start',
        width: '100%',
    },
    professionalName: {
        fontWeight: 'bold',
        fontSize: 14,
        color: COLORS.text,
    },
    professionalDetails: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    professionalDescription: {
        fontSize: 11,
        color: COLORS.textTertiary,
        fontStyle: 'italic',
        marginTop: 4,
    },
    dateContainer: {
        borderWidth: 1,
        borderColor: COLORS.inputBorder,
        borderRadius: 8,
        backgroundColor: COLORS.inputBackground,
        padding: 12,
    },
    dateInput: {
        width: '100%',
        fontSize: 16,
        border: 'none',
        backgroundColor: 'transparent',
        outline: 'none',
        color: COLORS.text,
    },
    timeSlotsContainer: {
        flexDirection: 'row',
        gap: 8,
        paddingBottom: 8,
    },
    timeButton: {
        marginRight: 8,
        minWidth: 80,
    },
    notesInput: {
        minHeight: 80,
    },
    loadingBox: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.surface,
        borderRadius: 8,
    },
    loadingText: {
        marginTop: 8,
        color: COLORS.textSecondary,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        padding: 20,
        backgroundColor: COLORS.surface,
        borderRadius: 8,
    },
    summary: {
        backgroundColor: COLORS.inputBackground,
        padding: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
        marginTop: 16,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    summaryText: {
        fontSize: 14,
        color: COLORS.text,
        marginBottom: 4,
    },
    summaryLabel: {
        fontWeight: 'bold',
    },
    footer: {
        position: 'relative',
        padding: 16,
        backgroundColor: COLORS.background,
        borderTopWidth: 1,
        borderTopColor: COLORS.inputBorder,
    },
    bookButton: {
        width: '100%',
    },
    debugButton: {
        margin: 16,
        marginTop: 0,
        borderColor: COLORS.warning,
    },
    spacer: {
        height: 40,
    },
});

export default BookingScreen;