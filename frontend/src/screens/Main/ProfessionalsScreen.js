import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Title, Card, Text, Avatar, ActivityIndicator } from 'react-native-paper';
import { COLORS } from '../../utils/constants';
import api from '../../services/api';

const ProfessionalsScreen = () => {
    const [professionals, setProfessionals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchProfessionals = async () => {
        try {
            const response = await api.get('/professionals');
            setProfessionals(response.data);
        } catch (error) {
            console.error('Erro ao buscar profissionais:', error);
            alert('Erro ao carregar profissionais');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProfessionals();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProfessionals();
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Carregando profissionais...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.header}>
                <Title>Profissionais</Title>
                <Text style={styles.subtitle}>Encontre o especialista ideal</Text>
            </View>

            <View style={styles.cardsContainer}>
                {professionals.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Card.Content>
                            <Text style={styles.emptyText}>
                                Nenhum profissional disponível no momento
                            </Text>
                        </Card.Content>
                    </Card>
                ) : (
                    professionals.map((professional) => (
                        <Card key={professional.id} style={styles.card}>
                            <Card.Content style={styles.cardContent}>
                                <Avatar.Icon size={60} icon="doctor" style={styles.avatar} />
                                <View style={styles.cardText}>
                                    <Title>{professional.name}</Title>
                                    <Text>{professional.specialty}</Text>
                                    <Text style={styles.rating}>
                                        ⭐ {professional.rating} ({professional.reviewCount} avaliações)
                                    </Text>
                                </View>
                            </Card.Content>
                        </Card>
                    ))
                )}
            </View>
        </ScrollView>
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
        padding: 20,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
    },
    subtitle: {
        color: COLORS.textSecondary,
        marginTop: 8,
    },
    cardsContainer: {
        padding: 16,
    },
    card: {
        marginBottom: 16,
        elevation: 2,
    },
    emptyCard: {
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        color: COLORS.textSecondary,
        textAlign: 'center',
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
        color: COLORS.textSecondary,
        marginTop: 4,
    },
});

export default ProfessionalsScreen;