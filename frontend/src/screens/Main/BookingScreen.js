import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Title, Text, Card } from 'react-native-paper';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { COLORS } from '../../utils/constants';
import api from '../../services/api';

const BookingScreen = () => {
    const [specialties, setSpecialties] = useState([]);
    const [professionals, setProfessionals] = useState([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState('');
    const [selectedProfessional, setSelectedProfessional] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [professionalLoading, setProfessionalLoading] = useState(false);

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
            const allProfessionals = await api.get('/professionals');
            const filtered = allProfessionals.data.filter(prof =>
                prof.specialty.toLowerCase().includes(specialty.toLowerCase())
            );
            setProfessionals(filtered);
        } finally {
            setProfessionalLoading(false);
        }
    };

    // Função para formatar data para o formato YYYY-MM-DD (input date)
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    // Função para obter data mínima (hoje)
    const getMinDate = () => {
        return getTodayDate();
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
            alert('Por favor, preencha todos os campos');
            return;
        }

        // Verificar se a data não é no passado
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            alert('Por favor, selecione uma data futura');
            return;
        }

        setLoading(true);
        try {
            await api.post('/appointments', {
                specialty: selectedSpecialty,
                professionalId: selectedProfessional,
                date: date, // Já está no formato YYYY-MM-DD
                time: time, // Já está no formato HH:MM
            });

            alert('Consulta agendada com sucesso!');
            // Limpar formulário
            setSelectedSpecialty('');
            setSelectedProfessional('');
            setDate('');
            setTime('');
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
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialtiesScroll}>
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
                        </ScrollView>
                    </View>

                    {/* Select de Profissional */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Profissional *</Text>
                        {professionalLoading ? (
                            <Text style={styles.loadingText}>Carregando profissionais...</Text>
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

                    {/* Input Time nativo */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Horário *</Text>
                        <View style={styles.nativeInputContainer}>
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                style={styles.nativeInput}
                                required
                            />
                            {time && (
                                <Text style={styles.selectedTimeText}>
                                    Horário selecionado: {time}
                                </Text>
                            )}
                        </View>
                    </View>

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
                                        {professionals.find(p => p.id === selectedProfessional)?.name}
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
    selectedTimeText: {
        marginTop: 8,
        fontSize: 14,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
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