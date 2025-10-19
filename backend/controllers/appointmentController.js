const db = require('../models');

exports.createAppointment = async (req, res) => {
    try {
        const { professionalId, specialty, date, time, notes } = req.body;
        const userId = req.userId;

        console.log('📥 Dados recebidos para agendamento:', {
            professionalId,
            specialty,
            date,
            time,
            notes,
            userId
        });

        // VERIFICAR SE O PROFISSIONAL EXISTE
        const professional = await db.Professional.findByPk(professionalId);
        console.log('🔍 Profissional encontrado:', professional);

        if (!professional) {
            console.log('❌ Profissional não encontrado com ID:', professionalId);
            // Listar todos os profissionais disponíveis para debug
            const allProfessionals = await db.Professional.findAll();
            console.log('📋 Profissionais disponíveis:', allProfessionals.map(p => ({ id: p.id, name: p.name })));

            return res.status(404).json({ error: `Profissional não encontrado. ID: ${professionalId}` });
        }

        // Verificar se já existe agendamento no mesmo horário
        const existingAppointment = await db.Appointment.findOne({
            where: {
                professionalId,
                date,
                time,
                status: 'scheduled'
            }
        });

        if (existingAppointment) {
            return res.status(409).json({ error: 'Este horário já está ocupado' });
        }

        // Criar o agendamento
        const appointment = await db.Appointment.create({
            userId,
            professionalId,
            specialty,
            date,
            time,
            notes: notes || null,
            status: 'scheduled'
        });

        // Buscar dados completos para resposta
        const appointmentWithDetails = await db.Appointment.findByPk(appointment.id, {
            include: [{
                model: db.Professional,
                as: 'professional',
                attributes: ['id', 'name', 'specialty']
            }]
        });

        console.log('✅ Agendamento criado com sucesso:', appointmentWithDetails);

        res.status(201).json({
            message: 'Consulta agendada com sucesso',
            appointment: appointmentWithDetails
        });

    } catch (error) {
        console.error('❌ Erro ao criar agendamento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

exports.getUserAppointments = async (req, res) => {
    try {
        const userId = req.userId;

        const appointments = await db.Appointment.findAll({
            where: { userId },
            include: [{
                model: db.Professional,
                as: 'professional',
                attributes: ['id', 'name', 'specialty']
            }],
            order: [['date', 'ASC'], ['time', 'ASC']]
        });

        res.json(appointments);
    } catch (error) {
        console.error('Erro ao buscar consultas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

exports.getUpcomingAppointments = async (req, res) => {
    try {
        const userId = req.userId;
        const today = new Date().toISOString().split('T')[0];

        const appointments = await db.Appointment.findAll({
            where: {
                userId,
                date: { [db.Sequelize.Op.gte]: today },
                status: 'scheduled'
            },
            include: [{
                model: db.Professional,
                as: 'professional',
                attributes: ['id', 'name', 'specialty']
            }],
            order: [['date', 'ASC'], ['time', 'ASC']],
            limit: 5
        });

        res.json(appointments);
    } catch (error) {
        console.error('Erro ao buscar próximas consultas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

exports.cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        // Buscar o agendamento
        const appointment = await db.Appointment.findByPk(id, {
            include: [{
                model: db.User,
                as: 'user',
                attributes: ['id']
            }]
        });

        if (!appointment) {
            return res.status(404).json({ error: 'Agendamento não encontrado' });
        }

        // Verificar se o agendamento pertence ao usuário
        if (appointment.userId !== userId) {
            return res.status(403).json({ error: 'Você não tem permissão para cancelar este agendamento' });
        }

        // Verificar se já não está cancelado
        if (appointment.status === 'cancelled') {
            return res.status(400).json({ error: 'Este agendamento já está cancelado' });
        }

        // Verificar se não é um agendamento passado
        const appointmentDateTime = new Date(`${appointment.date} ${appointment.time}`);
        if (appointmentDateTime < new Date()) {
            return res.status(400).json({ error: 'Não é possível cancelar agendamentos passados' });
        }

        // Atualizar status para cancelled
        await appointment.update({
            status: 'cancelled',
            cancelledAt: new Date()
        });

        res.json({
            message: 'Agendamento cancelado com sucesso',
            appointment
        });
    } catch (error) {
        console.error('Erro ao cancelar agendamento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};