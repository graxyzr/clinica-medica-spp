import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Text, Card } from 'react-native-paper';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { COLORS } from '../../utils/constants';
import api from '../../services/api';

const BookingScreen = () => {
    const [specialty, setSpecialty] = useState('');
    const [professionalId, setProfessionalId] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [professionals, setProfessionals] = useState([]);

    useEffect(() => {
        // Buscar profissionais disponíveis
        fetchProfessionals();
    }, []);

    const fetchProfessionals = async () => {
        try {
            const response = await api.get('/professionals');
            setProfessionals(response.data);
        } catch (error) {
            console.error('Erro ao buscar profissionais:', error);
        }
    };

    const handleBooking = async () => {
        if (!specialty || !professionalId || !date || !time) {
            alert('Por favor, preencha todos os campos');
            return;
        }

        setLoading(true);
        try {
            await api.post('/appointments', {
                specialty,
                professionalId,
                date,
                time,
            });

            alert('Consulta agendada com sucesso!');
            // Limpar formulário
            setSpecialty('');
            setProfessionalId('');
            setDate('');
            setTime('');
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
                    <CustomInput
                        label="Especialidade"
                        value={specialty}
                        onChangeText={setSpecialty}
                        left={<CustomInput.Icon icon="stethoscope" />}
                    />

                    <CustomInput
                        label="Profissional"
                        value={professionalId}
                        onChangeText={setProfessionalId}
                        left={<CustomInput.Icon icon="doctor" />}
                    />

                    <CustomInput
                        label="Data"
                        value={date}
                        onChangeText={setDate}
                        placeholder="DD/MM/AAAA"
                        left={<CustomInput.Icon icon="calendar" />}
                    />

                    <CustomInput
                        label="Horário"
                        value={time}
                        onChangeText={setTime}
                        placeholder="HH:MM"
                        left={<CustomInput.Icon icon="clock" />}
                    />

                    <CustomButton
                        mode="contained"
                        onPress={handleBooking}
                        style={styles.bookButton}
                        loading={loading}
                        disabled={loading}
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
    bookButton: {
        marginTop: 16,
    },
});

export default BookingScreen;