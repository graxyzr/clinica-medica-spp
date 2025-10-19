import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Title, Card, Text, Avatar, ActivityIndicator, Button } from 'react-native-paper';
import { COLORS } from '../../utils/constants';
import { professionals } from '../../services/api';

const ProfessionalsScreen = ({ navigation }) => {
    const [professionalsList, setProfessionalsList] = useState([]);
    const [filteredProfessionals, setFilteredProfessionals] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchProfessionals = async () => {
        setError(null);

        if (!professionals || typeof professionals.all !== 'function') {
            const errorMsg = 'Serviço de profissionais não disponível. Verifique a importação.';
            console.error('❌', errorMsg);
            setError(errorMsg);
            setLoading(false);
            setRefreshing(false);
            return;
        }

        try {
            setLoading(true);

            console.log('🔄 Iniciando carregamento de profissionais...');

            let professionalsData = [];
            let specialtiesData = [];

            try {
                professionalsData = await professionals.all();
                console.log('✅ Profissionais carregados:', professionalsData.length);
            } catch (profError) {
                console.error('❌ Erro específico ao buscar profissionais:', profError);
                throw new Error(`Falha ao carregar lista de profissionais: ${profError.message}`);
            }

            try {
                specialtiesData = await professionals.specialties();
                console.log('✅ Especialidades carregadas:', specialtiesData.length);
            } catch (specError) {
                console.error('⚠️ Erro ao buscar especialidades (continuando...):', specError);
                specialtiesData = [];
            }

            setProfessionalsList(professionalsData);
            setFilteredProfessionals(professionalsData);
            setSpecialties(['all', ...specialtiesData]);

            console.log('✅ Dados carregados com sucesso!');

        } catch (error) {
            console.error('❌ Erro geral ao buscar profissionais:', error);
            setError(error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchProfessionals();
    };

    useEffect(() => {
        fetchProfessionals();
    }, []);

    const filterBySpecialty = (specialty) => {
        if (specialty === 'all') {
            setFilteredProfessionals(professionalsList);
        } else {
            const filtered = professionalsList.filter(prof =>
                prof.specialty === specialty
            );
            setFilteredProfessionals(filtered);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Carregando profissionais...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Erro ao carregar profissionais</Text>
                <Text style={styles.errorDetail}>{error}</Text>
                <Button
                    mode="contained"
                    onPress={fetchProfessionals}
                    style={styles.retryButton}
                >
                    Tentar Novamente
                </Button>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                    />
                }
                showsVerticalScrollIndicator={true}
            >
                {/* Filtros de Especialidade */}
                <View style={styles.filterContainer}>
                    <Text style={styles.filterTitle}>Filtrar por especialidade:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.filterButtons}>
                            {specialties.map(specialty => (
                                <Button
                                    key={specialty}
                                    mode="outlined"
                                    onPress={() => filterBySpecialty(specialty)}
                                    style={styles.filterButton}
                                    contentStyle={styles.filterButtonContent}
                                >
                                    {specialty === 'all' ? 'Todos' : specialty}
                                </Button>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Lista de profissionais */}
                <View style={styles.professionalsList}>
                    {filteredProfessionals.length > 0 ? (
                        filteredProfessionals.map(professional => (
                            <Card key={professional.id} style={styles.professionalCard}>
                                <Card.Content>
                                    <View style={styles.professionalInfo}>
                                        <Avatar.Image
                                            size={60}
                                            source={{
                                                uri: professional.image_url || 'https://via.placeholder.com/60'
                                            }}
                                            style={styles.avatar}
                                        />
                                        <View style={styles.professionalDetails}>
                                            <Title style={styles.professionalName}>
                                                {professional.name}
                                            </Title>
                                            <Text style={styles.professionalSpecialty}>
                                                {professional.specialty}
                                            </Text>
                                            <Text style={styles.professionalRating}>
                                                ⭐ {professional.rating || '5.0'}
                                            </Text>
                                        </View>
                                    </View>
                                </Card.Content>
                            </Card>
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                Nenhum profissional encontrado
                            </Text>
                        </View>
                    )}
                </View>
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
    contentContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    loadingText: {
        marginTop: 10,
        color: COLORS.text,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.background,
    },
    errorText: {
        fontSize: 18,
        color: COLORS.error,
        textAlign: 'center',
        marginBottom: 10,
    },
    errorDetail: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        marginTop: 10,
    },
    filterContainer: {
        padding: 16,
        backgroundColor: COLORS.white,
        marginBottom: 8,
    },
    filterTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        color: COLORS.text,
    },
    filterButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    filterButton: {
        marginRight: 8,
        borderRadius: 20,
    },
    filterButtonContent: {
        height: 36,
    },
    professionalsList: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    professionalCard: {
        marginBottom: 12,
        elevation: 2,
    },
    professionalInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        backgroundColor: COLORS.primaryLight,
    },
    professionalDetails: {
        marginLeft: 12,
        flex: 1,
    },
    professionalName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    professionalSpecialty: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    professionalRating: {
        fontSize: 14,
        color: COLORS.primary,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 16,
        textAlign: 'center',
    },
});

export default ProfessionalsScreen;