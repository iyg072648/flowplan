import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'flowplan',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 테이블 자동 생성 (users 테이블 초기화)
export const initDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database connected successfully.');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        provider VARCHAR(50) NOT NULL,
        provider_id VARCHAR(255) NOT NULL,
        nickname VARCHAR(50) NOT NULL,
        target_exam VARCHAR(100) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_provider (provider, provider_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    connection.release();
    console.log('✅ Users table initialized.');
  } catch (error) {
    console.warn('⚠️ DB Connection warning (running in offline/mock mode if DB not running):', (error as Error).message);
  }
};
