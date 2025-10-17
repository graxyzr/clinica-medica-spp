const express = require('express');
const db = require('../config/database');
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
            status: 'success',
            data: {
                services,
                count: services.length
            }
        });
    } catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({
            status: 'error',
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
                status: 'error',
                message: 'Serviço não encontrado.'
            });
        }

        res.json({
            status: 'success',
            data: {
                service: services[0]
            }
        });
    } catch (error) {
        console.error('Get service error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro interno do servidor ao buscar serviço.'
        });
    }
});

module.exports = router;