const express = require('express');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// GET /api/appointments/me - Get user's appointments
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const [appointments] = await db.execute(`
      SELECT 
        a.id,
        a.date,
        a.start_time,
        a.end_time,
        a.status,
        a.notes,
        p.name as professional_name,
        p.specialty,
        s.name as service_name,
        s.duration_minutes
      FROM appointments a
      JOIN professionals p ON a.professional_id = p.id
      JOIN services s ON a.service_id = s.id
      WHERE a.user_id = ?
      ORDER BY a.date DESC, a.start_time DESC
    `, [req.user.id]);

        res.json(appointments);
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// POST /api/appointments - Create new appointment
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { professional_id, service_id, date, start_time } = req.body;

        if (!professional_id || !service_id || !date || !start_time) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
        }

        // Get service duration
        const [services] = await db.execute(
            'SELECT duration_minutes FROM services WHERE id = ?',
            [service_id]
        );

        if (services.length === 0) {
            return res.status(404).json({ message: 'Serviço não encontrado' });
        }

        const duration = services[0].duration_minutes;

        // Calculate end time
        const startTime = new Date(`1970-01-01T${start_time}`);
        const endTime = new Date(startTime.getTime() + duration * 60000);
        const end_time = endTime.toTimeString().slice(0, 8);

        // Check for scheduling conflicts
        const [conflicts] = await db.execute(
            `SELECT id FROM appointments 
       WHERE professional_id = ? AND date = ? AND status != 'cancelled'
       AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))`,
            [professional_id, date, start_time, start_time, end_time, end_time]
        );

        if (conflicts.length > 0) {
            return res.status(409).json({ message: 'Horário já ocupado' });
        }

        // Create appointment
        const [result] = await db.execute(
            `INSERT INTO appointments 
       (user_id, professional_id, service_id, date, start_time, end_time, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'scheduled')`,
            [req.user.id, professional_id, service_id, date, start_time, end_time]
        );

        // Get the created appointment with details
        const [appointments] = await db.execute(`
      SELECT 
        a.id,
        a.date,
        a.start_time,
        a.end_time,
        a.status,
        p.name as professional_name,
        p.specialty,
        s.name as service_name
      FROM appointments a
      JOIN professionals p ON a.professional_id = p.id
      JOIN services s ON a.service_id = s.id
      WHERE a.id = ?
    `, [result.insertId]);

        res.status(201).json({
            message: 'Agendamento criado com sucesso',
            appointment: appointments[0]
        });
    } catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// PUT /api/appointments/:id - Update appointment status
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['scheduled', 'confirmed', 'cancelled', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Status inválido' });
        }

        // Check if appointment belongs to user
        const [appointments] = await db.execute(
            'SELECT id FROM appointments WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );

        if (appointments.length === 0) {
            return res.status(404).json({ message: 'Agendamento não encontrado' });
        }

        // Update appointment
        await db.execute(
            'UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, id]
        );

        res.json({ message: 'Agendamento atualizado com sucesso' });
    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

module.exports = router;