import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Text, Card } from 'react-native-paper';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { COLORS } from '../../utils/constants';

const BookingScreen = () => {
    const [specialty, setSpecialty] = useState('');
    const [doctor, setDoctor] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    const handleBooking = () => {
        alert('Consulta agendada com sucesso!');
        // Aqui você implementaria a lógica real de agendamento
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
                        value={doctor}
                        onChangeText={setDoctor}
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
        color: COLORS.disabled,
        marginTop: 8,
        textAlign: 'center',
    },
    formCard: {
        margin: 16,
        elevation: 2,
    },
    bookButton: {
        marginTop: 16,
    },
});

export default BookingScreen;