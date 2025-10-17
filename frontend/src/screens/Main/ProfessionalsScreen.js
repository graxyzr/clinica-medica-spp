import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Card, Text, Avatar } from 'react-native-paper';
import { COLORS } from '../../utils/constants';

const ProfessionalsScreen = () => {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Title>Profissionais</Title>
                <Text style={styles.subtitle}>Encontre o especialista ideal</Text>
            </View>

            <View style={styles.cardsContainer}>
                <Card style={styles.card}>
                    <Card.Content style={styles.cardContent}>
                        <Avatar.Icon size={60} icon="doctor" style={styles.avatar} />
                        <View style={styles.cardText}>
                            <Title>Dr. João Silva</Title>
                            <Text>Cardiologista</Text>
                            <Text style={styles.rating}>⭐ 4.8 (125 avaliações)</Text>
                        </View>
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Content style={styles.cardContent}>
                        <Avatar.Icon size={60} icon="doctor" style={styles.avatar} />
                        <View style={styles.cardText}>
                            <Title>Dra. Maria Santos</Title>
                            <Text>Dermatologista</Text>
                            <Text style={styles.rating}>⭐ 4.9 (98 avaliações)</Text>
                        </View>
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Content style={styles.cardContent}>
                        <Avatar.Icon size={60} icon="doctor" style={styles.avatar} />
                        <View style={styles.cardText}>
                            <Title>Dr. Pedro Oliveira</Title>
                            <Text>Ortopedista</Text>
                            <Text style={styles.rating}>⭐ 4.7 (87 avaliações)</Text>
                        </View>
                    </Card.Content>
                </Card>
            </View>
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
    },
    cardsContainer: {
        padding: 16,
    },
    card: {
        marginBottom: 16,
        elevation: 2,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    avatar: {
        backgroundColor: COLORS.primary,
        marginRight: 16,
    },
    cardText: {
        flex: 1,
    },
    rating: {
        color: COLORS.disabled,
        marginTop: 4,
    },
});

export default ProfessionalsScreen;