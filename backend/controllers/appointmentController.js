const db = require('../models');

exports.createAppointment = async (req, res) => {
    try {
        const { professionalId, specialty, date, time, notes } = req.body;
        const userId = req.userId;

        // Verificar se o profissional existe
        const professional = await db.Professional.findByPk(professionalId);
        if (!professional) {
            return res.status(404).json({ error: 'Profissional não encontrado' });
        }

        // Criar agendamento
        const appointment = await db.Appointment.create({
            userId,
            professionalId,
            specialty,
            date,
            time,
            notes
        });

        // Buscar agendamento com dados do profissional
        const appointmentWithProfessional = await db.Appointment.findByPk(appointment.id, {
            include: [{
                model: db.Professional,
                as: 'professional',
                attributes: ['id', 'name', 'specialty']
            }]
        });

        res.status(201).json({
            message: 'Consulta agendada com sucesso',
            appointment: appointmentWithProfessional
        });
    } catch (error) {
        console.error('Erro ao agendar consulta:', error);
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