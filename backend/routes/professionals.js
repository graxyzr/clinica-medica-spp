const express = require('express');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const { calculateAvailableSlots } = require('../utils/availability');
const router = express.Router();

// GET /api/professionals
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT id, name, specialty, bio, start_work_time, end_work_time FROM professionals ORDER BY name'
        );

        res.json(rows);
    } catch (error) {
        console.error('Get professionals error:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// GET /api/professionals/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.execute(
            'SELECT id, name, specialty, bio, start_work_time, end_work_time FROM professionals WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Profissional não encontrado' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Get professional error:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// GET /api/professionals/:id/availability
router.get('/:id/availability', async (req, res) => {
    try {
        const { id } = req.params;
        const { date, serviceId } = req.query;

        if (!date || !serviceId) {
            return res.status(400).json({ message: 'Data e serviço são obrigatórios' });
        }

        // Get professional info
        const [professionalRows] = await db.execute(
            'SELECT start_work_time, end_work_time FROM professionals WHERE id = ?',
            [id]
        );

        if (professionalRows.length === 0) {
            return res.status(404).json({ message: 'Profissional não encontrado' });
        }

        // Get service duration
        const [serviceRows] = await db.execute(
            'SELECT duration_minutes FROM services WHERE id = ?',
            [serviceId]
        );

        if (serviceRows.length === 0) {
            return res.status(404).json({ message: 'Serviço não encontrado' });
        }

        const professional = professionalRows[0];
        const duration = serviceRows[0].duration_minutes;

        // Get existing appointments for the date
        const [appointmentRows] = await db.execute(
            'SELECT start_time, end_time FROM appointments WHERE professional_id = ? AND date = ? AND status != ?',
            [id, date, 'cancelled']
        );

        const availableSlots = calculateAvailableSlots(
            professional.start_work_time,
            professional.end_work_time,
            duration,
            appointmentRows
        );

        res.json(availableSlots);
    } catch (error) {
        console.error('Get availability error:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

module.exports = router;