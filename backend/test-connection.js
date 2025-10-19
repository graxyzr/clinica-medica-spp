require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
    try {
        console.log('🧪 Testando conexão com MySQL...');

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            connectTimeout: 10000
        });

        console.log('✅ Conexão com MySQL bem-sucedida!');

        const [databases] = await connection.execute('SHOW DATABASES');
        console.log('📊 Bancos de dados disponíveis:');
        databases.forEach(db => {
            console.log(`   - ${db.Database}`);
        });

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Falha na conexão com MySQL:', error.message);
        console.log('\n💡 Soluções possíveis:');
        console.log('1. Verifique se o MySQL está rodando: net start mysql');
        console.log('2. Verifique usuário e senha no arquivo .env');
        console.log('3. Verifique se a porta 3306 está liberada');
        process.exit(1);
    }
}

testConnection();