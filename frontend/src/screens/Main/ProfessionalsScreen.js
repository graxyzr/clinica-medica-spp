import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Title, Card, Text, Avatar, ActivityIndicator } from 'react-native-paper';
import { COLORS } from '../../utils/constants';
import { getProfessionals } from '../../services/api';
import CustomButton from '../../components/CustomButton';

const ProfessionalsScreen = ({ navigation }) => {
    const [professionals, setProfessionals] = useState([]);
    const [filteredProfessionals, setFilteredProfessionals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedSpecialty, setSelectedSpecialty] = useState('all');
    const [specialties, setSpecialties] = useState([]);

    const fetchProfessionals = async () => {
        try {
            const [professionalsData, specialtiesData] = await Promise.all([
                getProfessionals.all(),
                getProfessionals.specialties()
            ]);

            setProfessionals(professionalsData);
            setFilteredProfessionals(professionalsData);
            setSpecialties(['all', ...specialtiesData]);
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

    useEffect(() => {
        if (selectedSpecialty === 'all') {
            setFilteredProfessionals(professionals);
        } else {
            const filtered = professionals.filter(prof =>
                prof.specialty === selectedSpecialty
            );
            setFilteredProfessionals(filtered);
        }
    }, [selectedSpecialty, professionals]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProfessionals();
    };

    const handleProfessionalSelect = (professional) => {
        // Navegar para BookingScreen passando o profissional como parâmetro
        navigation.navigate('Booking', {
            professional: professional
        });
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

            {/* Filtro por Especialidade */}
            <Card style={styles.filterCard}>
                <Card.Content>
                    <Text style={styles.filterLabel}>Filtrar por especialidade:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialtiesScroll}>
                        <View style={styles.specialtiesContainer}>
                            {specialties.map((specialty, index) => (
                                <CustomButton
                                    key={index}
                                    mode={selectedSpecialty === specialty ? 'contained' : 'outlined'}
                                    onPress={() => setSelectedSpecialty(specialty)}
                                    style={styles.specialtyButton}
                                    compact
                                >
                                    {specialty === 'all' ? 'Todas' : specialty}
                                </CustomButton>
                            ))}
                        </View>
                    </ScrollView>
                </Card.Content>
            </Card>

            {/* Lista de Profissionais */}
            <View style={styles.professionalsContainer}>
                {filteredProfessionals.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Card.Content>
                            <Text style={styles.emptyText}>
                                Nenhum profissional encontrado {selectedSpecialty !== 'all' ? `para ${selectedSpecialty}` : ''}
                            </Text>
                        </Card.Content>
                    </Card>
                ) : (
                    filteredProfessionals.map((professional) => (
                        <Card key={professional.id} style={styles.professionalCard}>
                            <Card.Content>
                                <View style={styles.professionalHeader}>
                                    <Avatar.Icon size={60} icon="doctor" style={styles.avatar} />
                                    <View style={styles.professionalInfo}>
                                        <Title style={styles.professionalName}>{professional.name}</Title>
                                        <Text style={styles.professionalSpecialty}>{professional.specialty}</Text>
                                        <Text style={styles.professionalRating}>
                                            ⭐ {professional.rating} ({professional.reviewCount} avaliações)
                                        </Text>
                                        {professional.description && (
                                            <Text style={styles.professionalDescription}>
                                                {professional.description}
                                            </Text>
                                        )}
                                    </View>
                                </View>

                                <CustomButton
                                    mode="contained"
                                    onPress={() => handleProfessionalSelect(professional)}
                                    style={styles.bookButton}
                                    icon="calendar-plus"
                                >
                                    Agendar Consulta
                                </CustomButton>
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
    filterCard: {
        margin: 16,
        backgroundColor: COLORS.surface,
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        color: COLORS.text,
    },
    specialtiesScroll: {
        maxHeight: 60,
    },
    specialtiesContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    specialtyButton: {
        margin: 2,
    },
    professionalsContainer: {
        padding: 16,
    },
    emptyCard: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.surface,
    },
    emptyText: {
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    professionalCard: {
        marginBottom: 16,
        backgroundColor: COLORS.surface,
        elevation: 2,
    },
    professionalHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    avatar: {
        backgroundColor: COLORS.primary,
        marginRight: 16,
    },
    professionalInfo: {
        flex: 1,
    },
    professionalName: {
        fontSize: 18,
        marginBottom: 4,
    },
    professionalSpecialty: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    professionalRating: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    professionalDescription: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
    bookButton: {
        marginTop: 8,
    },
});

export default ProfessionalsScreen;