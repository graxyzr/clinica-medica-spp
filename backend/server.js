require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./src/models');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/professionals', require('./src/routes/professionals'));
app.use('/api/appointments', require('./src/routes/appointments'));

// Rota de saúde
app.get('/api/health', (req, res) => {
    res.json({
        message: 'API do Appointment App está funcionando!',
        timestamp: new Date().toISOString()
    });
});

// Rota padrão
app.get('/', (req, res) => {
    res.json({
        message: 'Bem-vindo à API do Appointment App',
        version: '1.0.0'
    });
});

// Inicializar servidor
const startServer = async () => {
    try {
        // Inicializar banco de dados (cria tabelas e dados iniciais)
        await db.initializeDatabase();

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`📊 Ambiente: ${process.env.NODE_ENV}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('❌ Falha ao iniciar servidor:', error);
        process.exit(1);
    }
};

// Manipular encerramento gracioso
process.on('SIGINT', async () => {
    console.log('\n🛑 Encerrando servidor...');
    await db.sequelize.close();
    process.exit(0);
});

startServer();