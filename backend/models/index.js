const { Sequelize } = require('sequelize');
const config = require('../config/database.js');
const mysql = require('mysql2/promise');

const db = {};

const createDatabaseIfNotExists = async () => {
    let connection;
    try {
        console.log('🔄 Tentando conectar ao MySQL...');

        connection = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.username,
            password: config.password || null,
            connectTimeout: 10000,
            acquireTimeout: 10000,
            timeout: 10000
        });

        console.log('✅ Conectado ao servidor MySQL.');

        const [rows] = await connection.execute(`SHOW DATABASES LIKE '${config.database}'`);

        if (rows.length === 0) {
            console.log(`📁 Criando banco de dados '${config.database}'...`);
            await connection.execute(`CREATE DATABASE \`${config.database}\``);
            console.log(`✅ Banco de dados '${config.database}' criado com sucesso.`);
        } else {
            console.log(`✅ Banco de dados '${config.database}' já existe.`);
        }

        await connection.end();
    } catch (error) {
        if (connection) await connection.end();
        console.error('❌ Erro ao conectar/criar banco de dados:', error.message);

        if (error.code === 'ECONNREFUSED') {
            console.error('💡 Dica: Verifique se o MySQL está rodando na porta 3306');
            console.error('💡 Comando: net start mysql');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('💡 Dica: Verifique usuário e senha no arquivo .env');
        }

        throw error;
    }
};

db.initializeDatabase = async () => {
    try {
        await createDatabaseIfNotExists();

        console.log('🔄 Conectando ao banco de dados...');

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
                },
                retry: {
                    max: 3,
                    timeout: 60000
                }
            }
        );

        db.Sequelize = Sequelize;
        db.sequelize = sequelize;

        await db.sequelize.authenticate();
        console.log('✅ Conexão com o banco de dados estabelecida.');

        db.User = require('./User.js')(sequelize);
        db.Professional = require('./Professional.js')(sequelize);
        db.Appointment = require('./Appointment.js')(sequelize);

        Object.keys(db).forEach(modelName => {
            if (db[modelName].associate) {
                db[modelName].associate(db);
            }
        });

        console.log('🔄 Sincronizando modelos...');
        await db.sequelize.sync({ force: false, alter: true });
        console.log('✅ Modelos sincronizados com o banco de dados.');

        const professionalCount = await db.Professional.count();
        if (professionalCount === 0) {
            console.log('🔄 Criando dados iniciais...');
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
                },
                {
                    name: 'Dra. Juliana Pereira',
                    specialty: 'Ginecologista',
                    description: 'Ginecologista e obstetra',
                    rating: 4.8,
                    reviewCount: 142
                },
                {
                    name: 'Dr. Roberto Almeida',
                    specialty: 'Oftalmologista',
                    description: 'Especialista em cirurgia refrativa',
                    rating: 4.7,
                    reviewCount: 89
                },
                {
                    name: 'Dra. Fernanda Rodrigues',
                    specialty: 'Psiquiatra',
                    description: 'Psiquiatra com abordagem cognitivo-comportamental',
                    rating: 4.9,
                    reviewCount: 67
                }
            ]);
            console.log('✅ Dados iniciais de profissionais criados.');
        }

        console.log('🎉 Banco de dados inicializado com sucesso!');

    } catch (error) {
        console.error('❌ Erro ao inicializar banco de dados:', error.message);
        throw error;
    }
};

module.exports = db;