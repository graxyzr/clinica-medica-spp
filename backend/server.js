const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const professionalRoutes = require('./routes/professionals');
const serviceRoutes = require('./routes/services');
const appointmentRoutes = require('./routes/appointments');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Log de requisições
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'success',
        message: 'API da Clínica Médica S++ está funcionando!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Bem-vindo à API da Clínica Médica S++',
        version: '1.0.0',
        endpoints: {
            auth: {
                'POST /api/auth/register': 'Registrar novo usuário',
                'POST /api/auth/login': 'Login de usuário'
            },
            users: {
                'GET /api/users/me': 'Obter perfil do usuário logado',
                'PUT /api/users/me': 'Atualizar perfil do usuário'
            },
            professionals: {
                'GET /api/professionals': 'Listar todos os profissionais',
                'GET /api/professionals/:id': 'Obter profissional específico',
                'GET /api/professionals/:id/availability': 'Obter horários disponíveis'
            },
            services: {
                'GET /api/services': 'Listar todos os serviços',
                'GET /api/services/:id': 'Obter serviço específico'
            },
            appointments: {
                'GET /api/appointments/me': 'Listar agendamentos do usuário',
                'POST /api/appointments': 'Criar novo agendamento',
                'PUT /api/appointments/:id': 'Atualizar agendamento',
                'DELETE /api/appointments/:id': 'Cancelar agendamento'
            }
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Rota não encontrada',
        path: req.originalUrl
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err.stack);

    res.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor',
        ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 Servidor da Clínica Médica S++');
    console.log('='.repeat(50));
    console.log(`📡 Porta: ${PORT}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
    console.log('='.repeat(50));
});