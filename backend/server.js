const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Log de requisições
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'success',
        message: 'API da Clínica Médica S++ está funcionando!',
        timestamp: new Date().toISOString()
    });
});

// Rota principal
app.get('/', (req, res) => {
    res.json({
        message: 'Bem-vindo à API da Clínica Médica S++',
        version: '1.0.0',
        endpoints: {
            auth: {
                'POST /api/auth/register': 'Registrar usuário',
                'POST /api/auth/login': 'Login de usuário'
            },
            users: {
                'GET /api/users/me': 'Perfil do usuário (autenticado)'
            },
            professionals: {
                'GET /api/professionals': 'Listar profissionais',
                'GET /api/professionals/:id': 'Obter profissional',
                'GET /api/professionals/:id/availability': 'Horários disponíveis'
            },
            services: {
                'GET /api/services': 'Listar serviços'
            },
            appointments: {
                'GET /api/appointments/me': 'Meus agendamentos',
                'POST /api/appointments': 'Criar agendamento'
            }
        }
    });
});

// Carregar rotas
try {
    const authRoutes = require('./routes/auth');
    app.use('/api/auth', authRoutes);
    console.log('✅ Rotas de autenticação carregadas');
} catch (error) {
    console.log('❌ Erro ao carregar rotas de auth:', error.message);
}

try {
    const userRoutes = require('./routes/users');
    app.use('/api/users', userRoutes);
    console.log('✅ Rotas de usuários carregadas');
} catch (error) {
    console.log('❌ Erro ao carregar rotas de users:', error.message);
}

try {
    const professionalRoutes = require('./routes/professionals');
    app.use('/api/professionals', professionalRoutes);
    console.log('✅ Rotas de profissionais carregadas');
} catch (error) {
    console.log('❌ Erro ao carregar rotas de professionals:', error.message);
}

try {
    const serviceRoutes = require('./routes/services');
    app.use('/api/services', serviceRoutes);
    console.log('✅ Rotas de serviços carregadas');
} catch (error) {
    console.log('❌ Erro ao carregar rotas de services:', error.message);
}

try {
    const appointmentRoutes = require('./routes/appointments');
    app.use('/api/appointments', appointmentRoutes);
    console.log('✅ Rotas de agendamentos carregadas');
} catch (error) {
    console.log('❌ Erro ao carregar rotas de appointments:', error.message);
}

// Rota 404 - SEM '*' que causa o erro
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Rota não encontrada',
        path: req.originalUrl
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Erro:', error);
    res.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🚀 SERVIDOR INICIADO COM SUCESSO!');
    console.log('='.repeat(60));
    console.log(`📍 Porta: ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
    console.log('='.repeat(60));
});