const express = require('express');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// GET /api/services - Get all services
router.get('/', async (req, res) => {
    try {
        const [services] = await db.execute(
            `SELECT id, name, description, duration_minutes, created_at, updated_at 
       FROM services 
       ORDER BY name`
        );

        res.json({
            services,
            count: services.length
        });
    } catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({
            message: 'Erro interno do servidor ao buscar serviços.'
        });
    }
});

// GET /api/services/:id - Get specific service
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [services] = await db.execute(
            `SELECT id, name, description, duration_minutes, created_at, updated_at 
       FROM services 
       WHERE id = ?`,
            [id]
        );

        if (services.length === 0) {
            return res.status(404).json({
                message: 'Serviço não encontrado.'
            });
        }

        res.json({ service: services[0] });
    } catch (error) {
        console.error('Get service error:', error);
        res.status(500).json({
            message: 'Erro interno do servidor ao buscar serviço.'
        });
    }
});

// POST /api/services - Create new service (Admin only)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, description, duration_minutes } = req.body;

        if (!name) {
            return res.status(400).json({
                message: 'Nome do serviço é obrigatório.'
            });
        }

        if (!duration_minutes || duration_minutes < 1) {
            return res.status(400).json({
                message: 'Duração em minutos é obrigatória e deve ser maior que zero.'
            });
        }

        const [result] = await db.execute(
            `INSERT INTO services (name, description, duration_minutes) 
       VALUES (?, ?, ?)`,
            [name.trim(), description, duration_minutes]
        );

        const [services] = await db.execute(
            'SELECT * FROM services WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            message: 'Serviço criado com sucesso!',
            service: services[0]
        });

    } catch (error) {
        console.error('Create service error:', error);
        res.status(500).json({
            message: 'Erro interno do servidor ao criar serviço.'
        });
    }
});

// PUT /api/services/:id - Update service (Admin only)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, duration_minutes } = req.body;

        const updates = [];
        const params = [];

        if (name) {
            updates.push('name = ?');
            params.push(name.trim());
        }

        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }

        if (duration_minutes) {
            if (duration_minutes < 1) {
                return res.status(400).json({
                    message: 'Duração em minutos deve ser maior que zero.'
                });
            }
            updates.push('duration_minutes = ?');
            params.push(duration_minutes);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                message: 'Nenhum campo válido para atualização fornecido.'
            });
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);

        const query = `UPDATE services SET ${updates.join(', ')} WHERE id = ?`;

        const [result] = await db.execute(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Serviço não encontrado.'
            });
        }

        const [services] = await db.execute(
            'SELECT * FROM services WHERE id = ?',
            [id]
        );

        res.json({
            message: 'Serviço atualizado com sucesso!',
            service: services[0]
        });

    } catch (error) {
        console.error('Update service error:', error);
        res.status(500).json({
            message: 'Erro interno do servidor ao atualizar serviço.'
        });
    }
});

module.exports = router;