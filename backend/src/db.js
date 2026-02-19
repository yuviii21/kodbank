import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Creates and returns a fresh database connection.
 * Essential for serverless functions to avoid connection pooling issues and crashes.
 */
export async function getConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT),
    ssl: {
      rejectUnauthorized: false
    }
  });
}
