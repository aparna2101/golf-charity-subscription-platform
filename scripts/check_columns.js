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
    const [rows] = await pool.execute('DESCRIBE users');
    console.log('Columns in users:', rows.map(r => r.Field));
    
    if (!rows.find(r => r.Field === 'otp_code')) {
      console.log('Adding otp_code...');
      await pool.execute('ALTER TABLE users ADD COLUMN otp_code VARCHAR(6)');
    }
    if (!rows.find(r => r.Field === 'otp_expiry')) {
      console.log('Adding otp_expiry...');
      await pool.execute('ALTER TABLE users ADD COLUMN otp_expiry TIMESTAMP NULL');
    }
    console.log('Done!');
  } catch (err) {
    console.error('Database Error:', err.message);
  } finally {
    await pool.end();
  }
}

run();
