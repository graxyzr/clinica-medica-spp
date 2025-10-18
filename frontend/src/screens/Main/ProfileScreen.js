import React, { useContext, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Text, Card, Avatar, ActivityIndicator } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import { COLORS } from '../../utils/constants';
import { auth } from '../../services/api';

const ProfileScreen = () => {
    const { userInfo, signOut, updateUserInfo } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: userInfo?.name || '',
        email: userInfo?.email || '',
        phone: userInfo?.phone || '',
    });

    const handleEditToggle = () => {
        if (isEditing) {
            // Cancelar edição - reverter para dados originais
            setFormData({
                name: userInfo?.name || '',
                email: userInfo?.email || '',
                phone: userInfo?.phone || '',
            });
        }
        setIsEditing(!isEditing);
    };

    const handleSave = async () => {
        if (!formData.name.trim() || !formData.email.trim()) {
            alert('Nome e email são obrigatórios');
            return;
        }

        setLoading(true);
        try {
            const updatedUser = await auth.updateProfile(formData);
            updateUserInfo(updatedUser.user);
            setIsEditing(false);
            alert('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            alert('Erro ao atualizar perfil. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Avatar.Text
                    size={100}
                    label={userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
                    style={styles.avatar}
                />
                <Title style={styles.name}>
                    {isEditing ? (
                        <CustomInput
                            value={formData.name}
                            onChangeText={(value) => handleInputChange('name', value)}
                            style={styles.editInput}
                            mode="flat"
                        />
                    ) : (
                        userInfo?.name || 'Usuário'
                    )}
                </Title>
                <Text style={styles.email}>
                    {isEditing ? (
                        <CustomInput
                            value={formData.email}
                            onChangeText={(value) => handleInputChange('email', value)}
                            style={styles.editInput}
                            mode="flat"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    ) : (
                        userInfo?.email || 'email@exemplo.com'
                    )}
                </Text>
            </View>

            <Card style={styles.card}>
                <Card.Content>
                    <Title>Informações Pessoais</Title>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Nome:</Text>
                        {isEditing ? (
                            <CustomInput
                                value={formData.name}
                                onChangeText={(value) => handleInputChange('name', value)}
                                style={styles.editInput}
                                mode="outlined"
                            />
                        ) : (
                            <Text style={styles.infoValue}>{userInfo?.name || 'Não informado'}</Text>
                        )}
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Email:</Text>
                        {isEditing ? (
                            <CustomInput
                                value={formData.email}
                                onChangeText={(value) => handleInputChange('email', value)}
                                style={styles.editInput}
                                mode="outlined"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        ) : (
                            <Text style={styles.infoValue}>{userInfo?.email || 'Não informado'}</Text>
                        )}
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Telefone:</Text>
                        {isEditing ? (
                            <CustomInput
                                value={formData.phone}
                                onChangeText={(value) => handleInputChange('phone', value)}
                                style={styles.editInput}
                                mode="outlined"
                                keyboardType="phone-pad"
                                placeholder="(00) 00000-0000"
                            />
                        ) : (
                            <Text style={styles.infoValue}>{userInfo?.phone || 'Não informado'}</Text>
                        )}
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>ID:</Text>
                        <Text style={styles.infoValue}>{userInfo?.id || 'Não informado'}</Text>
                    </View>
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <Title>Ações da Conta</Title>

                    <View style={styles.actionsContainer}>
                        {isEditing ? (
                            <>
                                <CustomButton
                                    mode="contained"
                                    onPress={handleSave}
                                    style={styles.actionButton}
                                    loading={loading}
                                    disabled={loading}
                                    icon="content-save"
                                >
                                    Salvar Alterações
                                </CustomButton>
                                <CustomButton
                                    mode="outlined"
                                    onPress={handleEditToggle}
                                    style={styles.actionButton}
                                    disabled={loading}
                                    icon="close"
                                >
                                    Cancelar
                                </CustomButton>
                            </>
                        ) : (
                            <CustomButton
                                mode="contained"
                                onPress={handleEditToggle}
                                style={styles.actionButton}
                                icon="account-edit"
                            >
                                Editar Perfil
                            </CustomButton>
                        )}

                        <CustomButton
                            mode="outlined"
                            onPress={() => alert('Em desenvolvimento')}
                            style={styles.actionButton}
                            icon="cog"
                        >
                            Configurações
                        </CustomButton>
                    </View>
                </Card.Content>
            </Card>

            <CustomButton
                mode="contained"
                onPress={signOut}
                style={styles.logoutButton}
                icon="logout"
                buttonColor={COLORS.error}
            >
                Sair da Conta
            </CustomButton>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.surface,
    },
    avatar: {
        backgroundColor: COLORS.primary,
        marginBottom: 16,
    },
    name: {
        fontSize: 24,
        marginBottom: 8,
        textAlign: 'center',
    },
    email: {
        color: COLORS.textSecondary,
        fontSize: 16,
        textAlign: 'center',
    },
    card: {
        margin: 16,
        elevation: 2,
        backgroundColor: COLORS.surface,
    },
    infoItem: {
        marginBottom: 16,
    },
    infoLabel: {
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
        fontSize: 16,
    },
    infoValue: {
        color: COLORS.textSecondary,
        fontSize: 16,
    },
    editInput: {
        backgroundColor: COLORS.inputBackground,
        marginTop: 4,
    },
    actionsContainer: {
        gap: 12,
    },
    actionButton: {
        marginVertical: 4,
    },
    logoutButton: {
        margin: 16,
    },
});

export default ProfileScreen;