const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'clinic_appointment_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Testar conexão
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conectado ao MySQL com sucesso!');
    connection.release();
  } catch (error) {
    console.log('⚠️  Aviso: Não foi possível conectar ao MySQL');
    console.log('💡 Dica: Execute o script SQL para criar o banco');
  }
};

testConnection();

module.exports = pool;