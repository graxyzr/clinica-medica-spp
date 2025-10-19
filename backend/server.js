require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/professionals', require('./routes/professionals'));
app.use('/api/appointments', require('./routes/appointments'));

app.get('/api/health', (req, res) => {
    res.json({
        message: 'API do Appointment App está funcionando!',
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.json({
        message: 'Bem-vindo à API do Appointment App',
        version: '1.0.0'
    });
});

app.use((error, req, res, next) => {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

app.use('*', (req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

const startServer = async () => {
    try {
        await db.initializeDatabase();

        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
            console.log(`🏥 API Base: http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('❌ Falha ao iniciar servidor:', error);
        process.exit(1);
    }
};

process.on('SIGINT', async () => {
    console.log('\n🛑 Encerrando servidor...');
    if (db.sequelize) {
        await db.sequelize.close();
    }
    process.exit(0);
});

startServer();