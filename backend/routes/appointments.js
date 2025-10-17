const express = require('express');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const { validateAppointment } = require('../middleware/validation');
const router = express.Router();

// GET /api/appointments/me - Get user's appointments
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
      SELECT 
        a.id,
        a.date,
        a.start_time,
        a.end_time,
        a.status,
        a.notes,
        a.created_at,
        p.name as professional_name,
        p.specialty as professional_specialty,
        p.bio as professional_bio,
        s.name as service_name,
        s.description as service_description,
        s.duration_minutes
      FROM appointments a
      JOIN professionals p ON a.professional_id = p.id
      JOIN services s ON a.service_id = s.id
      WHERE a.user_id = ?
    `;

        const queryParams = [req.user.id];

        if (status && status !== 'all') {
            query += ' AND a.status = ?';
            queryParams.push(status);
        }

        query += ' ORDER BY a.date DESC, a.start_time DESC LIMIT ? OFFSET ?';
        queryParams.push(parseInt(limit), offset);

        const [appointments] = await db.execute(query, queryParams);

        // Get total count for pagination
        let countQuery = `
      SELECT COUNT(*) as total 
      FROM appointments a 
      WHERE a.user_id = ?
    `;
        const countParams = [req.user.id];

        if (status && status !== 'all') {
            countQuery += ' AND a.status = ?';
            countParams.push(status);
        }

        const [countResult] = await db.execute(countQuery, countParams);
        const total = countResult[0].total;

        res.json({
            appointments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({
            message: 'Erro interno do servidor ao buscar agendamentos.'
        });
    }
});

// POST /api/appointments - Create new appointment
router.post('/', authMiddleware, validateAppointment, async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const { professional_id, service_id, date, start_time, notes } = req.body;

        // Check if professional exists
        const [professionals] = await connection.execute(
            'SELECT name, start_work_time, end_work_time FROM professionals WHERE id = ?',
            [professional_id]
        );

        if (professionals.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                message: 'Profissional não encontrado.'
            });
        }

        // Get service duration
        const [services] = await connection.execute(
            'SELECT name, duration_minutes FROM services WHERE id = ?',
            [service_id]
        );

        if (services.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                message: 'Serviço não encontrado.'
            });
        }

        const professional = professionals[0];
        const service = services[0];
        const duration = service.duration_minutes;

        // Calculate end time
        const startTime = new Date(`1970-01-01T${start_time}`);
        const endTime = new Date(startTime.getTime() + duration * 60000);
        const end_time = endTime.toTimeString().slice(0, 8);

        // Check if appointment is within professional's working hours
        if (start_time < professional.start_work_time || end_time > professional.end_work_time) {
            await connection.rollback();
            return res.status(400).json({
                message: `Horário fora do expediente do profissional (${professional.start_work_time} - ${professional.end_work_time}).`
            });
        }

        // Check for scheduling conflicts
        const [conflicts] = await connection.execute(
            `SELECT id FROM appointments 
       WHERE professional_id = ? AND date = ? AND status != 'cancelled'
       AND ((start_time < ? AND end_time > ?) 
         OR (start_time < ? AND end_time > ?)
         OR (start_time >= ? AND start_time < ?))`,
            [professional_id, date, end_time, start_time, start_time, end_time, start_time, end_time]
        );

        if (conflicts.length > 0) {
            await connection.rollback();
            return res.status(409).json({
                message: 'Horário indisponível. Já existe um agendamento neste horário.'
            });
        }

        // Create appointment
        const [result] = await connection.execute(
            `INSERT INTO appointments 
       (user_id, professional_id, service_id, date, start_time, end_time, notes, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')`,
            [req.user.id, professional_id, service_id, date, start_time, end_time, notes]
        );

        // Get the created appointment with details
        const [appointments] = await connection.execute(`
      SELECT 
        a.id,
        a.date,
        a.start_time,
        a.end_time,
        a.status,
        a.notes,
        a.created_at,
        p.name as professional_name,
        p.specialty as professional_specialty,
        s.name as service_name,
        s.duration_minutes
      FROM appointments a
      JOIN professionals p ON a.professional_id = p.id
      JOIN services s ON a.service_id = s.id
      WHERE a.id = ?
    `, [result.insertId]);

        await connection.commit();

        res.status(201).json({
            message: 'Agendamento criado com sucesso!',
            appointment: appointments[0]
        });

    } catch (error) {
        await connection.rollback();
        console.error('Create appointment error:', error);
        res.status(500).json({
            message: 'Erro interno do servidor ao criar agendamento.'
        });
    } finally {
        connection.release();
    }
});

// GET /api/appointments/:id - Get specific appointment
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const [appointments] = await db.execute(`
      SELECT 
        a.id,
        a.date,
        a.start_time,
        a.end_time,
        a.status,
        a.notes,
        a.created_at,
        a.updated_at,
        p.name as professional_name,
        p.specialty as professional_specialty,
        p.bio as professional_bio,
        p.start_work_time,
        p.end_work_time,
        s.name as service_name,
        s.description as service_description,
        s.duration_minutes
      FROM appointments a
      JOIN professionals p ON a.professional_id = p.id
      JOIN services s ON a.service_id = s.id
      WHERE a.id = ? AND a.user_id = ?
    `, [id, req.user.id]);

        if (appointments.length === 0) {
            return res.status(404).json({
                message: 'Agendamento não encontrado.'
            });
        }

        res.json({ appointment: appointments[0] });
    } catch (error) {
        console.error('Get appointment error:', error);
        res.status(500).json({
            message: 'Erro interno do servidor ao buscar agendamento.'
        });
    }
});

// PUT /api/appointments/:id - Update appointment status
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        // Validate status
        const validStatuses = ['scheduled', 'confirmed', 'cancelled', 'completed'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                message: `Status inválido. Use: ${validStatuses.join(', ')}`
            });
        }

        // Check if appointment belongs to user
        const [appointments] = await db.execute(
            'SELECT id, date, start_time FROM appointments WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );

        if (appointments.length === 0) {
            return res.status(404).json({
                message: 'Agendamento não encontrado.'
            });
        }

        const appointment = appointments[0];

        // Prevent cancelling appointments that are too close
        if (status === 'cancelled') {
            const appointmentDateTime = new Date(`${appointment.date}T${appointment.start_time}`);
            const now = new Date();
            const timeDiff = appointmentDateTime.getTime() - now.getTime();
            const hoursDiff = timeDiff / (1000 * 60 * 60);

            if (hoursDiff < 24) {
                return res.status(400).json({
                    message: 'Agendamentos só podem ser cancelados com até 24 horas de antecedência.'
                });
            }
        }

        // Build update query
        const updates = [];
        const params = [];

        if (status) {
            updates.push('status = ?');
            params.push(status);
        }

        if (notes !== undefined) {
            updates.push('notes = ?');
            params.push(notes);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                message: 'Nenhum campo válido para atualização fornecido.'
            });
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id, req.user.id);

        const query = `UPDATE appointments SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`;

        const [result] = await db.execute(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Agendamento não encontrado.'
            });
        }

        // Get updated appointment
        const [updatedAppointments] = await db.execute(`
      SELECT 
        a.id,
        a.date,
        a.start_time,
        a.end_time,
        a.status,
        a.notes,
        a.updated_at,
        p.name as professional_name,
        p.specialty as professional_specialty,
        s.name as service_name
      FROM appointments a
      JOIN professionals p ON a.professional_id = p.id
      JOIN services s ON a.service_id = s.id
      WHERE a.id = ?
    `, [id]);

        res.json({
            message: 'Agendamento atualizado com sucesso!',
            appointment: updatedAppointments[0]
        });

    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({
            message: 'Erro interno do servidor ao atualizar agendamento.'
        });
    }
});

// DELETE /api/appointments/:id - Cancel appointment
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if appointment belongs to user
        const [appointments] = await db.execute(
            'SELECT id, date, start_time FROM appointments WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );

        if (appointments.length === 0) {
            return res.status(404).json({
                message: 'Agendamento não encontrado.'
            });
        }

        const appointment = appointments[0];

        // Check if appointment can be cancelled (24h in advance)
        const appointmentDateTime = new Date(`${appointment.date}T${appointment.start_time}`);
        const now = new Date();
        const timeDiff = appointmentDateTime.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        if (hoursDiff < 24) {
            return res.status(400).json({
                message: 'Agendamentos só podem ser cancelados com até 24 horas de antecedência.'
            });
        }

        // Update status to cancelled (soft delete)
        const [result] = await db.execute(
            `UPDATE appointments 
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
       WHERE id = ? AND user_id = ?`,
            [id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Agendamento não encontrado.'
            });
        }

        res.json({
            message: 'Agendamento cancelado com sucesso.'
        });

    } catch (error) {
        console.error('Cancel appointment error:', error);
        res.status(500).json({
            message: 'Erro interno do servidor ao cancelar agendamento.'
        });
    }
});

module.exports = router;