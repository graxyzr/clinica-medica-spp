const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'clinic_appointment_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  reconnect: true,
  timezone: '+00:00'
});

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conectado ao MySQL com sucesso!');
    console.log(`📊 Database: ${process.env.DB_NAME}`);
    connection.release();
  } catch (error) {
    console.error('❌ Erro ao conectar com MySQL:', error.message);
    console.log('💡 Verifique se:');
    console.log('   1. O MySQL está rodando');
    console.log('   2. As credenciais no .env estão corretas');
    console.log('   3. O database existe');
    process.exit(1);
  }
};

// Initialize connection
testConnection();

module.exports = pool;