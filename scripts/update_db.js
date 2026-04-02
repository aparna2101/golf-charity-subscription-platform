import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function run() {
  try {
    console.log('Adding OTP columns to users table...');
    await pool.execute('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code VARCHAR(6)');
    await pool.execute('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMP NULL');
    await pool.execute('ALTER TABLE users MODIFY COLUMN status ENUM("Active", "Inactive", "Pending") DEFAULT "Pending"');
    console.log('Success!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

run();
