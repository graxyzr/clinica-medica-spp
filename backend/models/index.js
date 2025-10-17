const { Sequelize } = require('sequelize');
const config = require('../config/database.js')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
        host: config.host,
        port: config.port,
        dialect: config.dialect,
        logging: config.logging,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./User.js')(sequelize);
db.Professional = require('./Professional.js')(sequelize);
db.Appointment = require('./Appointment.js')(sequelize);

// Define associations
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

// Função para sincronizar e criar o banco
db.initializeDatabase = async () => {
    try {
        // Testar conexão
        await db.sequelize.authenticate();
        console.log('✅ Conexão com o banco de dados estabelecida.');

        // Sincronizar modelos (cria tabelas se não existirem)
        await db.sequelize.sync({ force: false, alter: true });
        console.log('✅ Modelos sincronizados com o banco de dados.');

        // Verificar se existem profissionais, se não, criar dados iniciais
        const professionalCount = await db.Professional.count();
        if (professionalCount === 0) {
            await db.Professional.bulkCreate([
                {
                    name: 'Dr. João Silva',
                    specialty: 'Cardiologista',
                    description: 'Especialista em cardiologia com 10 anos de experiência',
                    rating: 4.8,
                    reviewCount: 125
                },
                {
                    name: 'Dra. Maria Santos',
                    specialty: 'Dermatologista',
                    description: 'Dermatologista especializada em estética',
                    rating: 4.9,
                    reviewCount: 98
                },
                {
                    name: 'Dr. Pedro Oliveira',
                    specialty: 'Ortopedista',
                    description: 'Ortopedista traumatologista',
                    rating: 4.7,
                    reviewCount: 87
                },
                {
                    name: 'Dra. Ana Costa',
                    specialty: 'Pediatra',
                    description: 'Pediatra com especialização em neonatologia',
                    rating: 4.9,
                    reviewCount: 156
                },
                {
                    name: 'Dr. Carlos Lima',
                    specialty: 'Neurologista',
                    description: 'Neurologista especializado em distúrbios do sono',
                    rating: 4.6,
                    reviewCount: 73
                }
            ]);
            console.log('✅ Dados iniciais de profissionais criados.');
        }

    } catch (error) {
        console.error('❌ Erro ao inicializar banco de dados:', error);
        throw error;
    }
};

module.exports = db;