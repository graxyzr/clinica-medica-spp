const express = require('express');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const { calculateAvailableSlots } = require('../utils/availability');
const router = express.Router();

// GET /api/professionals - Get all professionals
router.get('/', async (req, res) => {
    try {
        const [professionals] = await db.execute(
            `SELECT id, name, specialty, bio, start_work_time, end_work_time, 
              created_at, updated_at 
       FROM professionals 
       ORDER BY name`
        );

        res.json({
            professionals,
            count: professionals.length
        });
    } catch (error) {
        console.error('Get professionals error:', error);
        res.status(500).json({
            message: 'Erro interno do servidor ao buscar profissionais.'
        });
    }
});

// GET /api/professionals/:id - Get specific professional
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [professionals] = await db.execute(
            `SELECT id, name, specialty, bio, start_work_time, end_work_time,
              created_at, updated_at 
       FROM professionals 
       WHERE id = ?`,
            [id]
        );

        if (professionals.length === 0) {
            return res.status(404).json({
                message: 'Profissional não encontrado.'
            });
        }

        res.json({ professional: professionals[0] });
    } catch (error) {
        console.error('Get professional error:', error);
        res.status(500).json({
            message: 'Erro interno do servidor ao buscar profissional.'
        });
    }
});

// GET /api/professionals/:id/availability - Get available slots
router.get('/:id/availability', async (req, res) => {
    try {
        const { id } = req.params;
        const { date, serviceId } = req.query;

        // Validation
        if (!date) {
            return res.status(400).json({
                message: 'Parâmetro "date" é obrigatório (YYYY-MM-DD).'
            });
        }

        if (!serviceId) {
            return res.status(400).json({
                message: 'Parâmetro "serviceId" é obrigatório.'
            });
        }

        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(400).json({
                message: 'Formato de data inválido. Use YYYY-MM-DD.'
            });
        }

        // Check if date is not in the past
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            return res.status(400).json({
                message: 'Não é possível agendar para datas passadas.'
            });
        }

        // Get professional info
        const [professionals] = await db.execute(
            'SELECT start_work_time, end_work_time FROM professionals WHERE id = ?',
            [id]
        );

        if (professionals.length === 0) {
            return res.status(404).json({
                message: 'Profissional não encontrado.'
            });
        }

        // Get service duration
        const [services] = await db.execute(
            'SELECT duration_minutes FROM services WHERE id = ?',
            [serviceId]
        );

        if (services.length === 0) {
            return res.status(404).json({
                message: 'Serviço não encontrado.'
            });
        }

        const professional = professionals[0];
        const duration = services[0].duration_minutes;

        // Get existing appointments for the date
        const [appointments] = await db.execute(
            `SELECT start_time, end_time 
       FROM appointments 
       WHERE professional_id = ? AND date = ? AND status != 'cancelled'
       ORDER BY start_time`,
            [id, date]
        );

        const availableSlots = calculateAvailableSlots(
            professional.start_work_time,
            professional.end_work_time,
            duration,
            appointments
        );

        res.json({
            professional_id: parseInt(id),
            date,
            service_id: parseInt(serviceId),
            available_slots: availableSlots,
            slot_count: availableSlots.length
        });

    } catch (error) {
        console.error('Get availability error:', error);
        res.status(500).json({
            message: 'Erro interno do servidor ao buscar disponibilidade.'
        });
    }
});

// POST /api/professionals - Create new professional (Admin only)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, specialty, bio, start_work_time, end_work_time } = req.body;

        if (!name || !specialty) {
            return res.status(400).json({
                message: 'Nome e especialidade são obrigatórios.'
            });
        }

        const [result] = await db.execute(
            `INSERT INTO professionals (name, specialty, bio, start_work_time, end_work_time) 
       VALUES (?, ?, ?, ?, ?)`,
            [name.trim(), specialty.trim(), bio, start_work_time || '09:00:00', end_work_time || '17:00:00']
        );

        const [professionals] = await db.execute(
            'SELECT * FROM professionals WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            message: 'Profissional criado com sucesso!',
            professional: professionals[0]
        });

    } catch (error) {
        console.error('Create professional error:', error);
        res.status(500).json({
            message: 'Erro interno do servidor ao criar profissional.'
        });
    }
});

module.exports = router;