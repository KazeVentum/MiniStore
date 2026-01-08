const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
});

const promisePool = pool.promise();

// Test connection with retries
const connectWithRetry = async (retries = 5, delay = 5000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const connection = await promisePool.getConnection();
            console.log('Database connected successfully');
            connection.release();
            return;
        } catch (err) {
            console.error(`Attempt ${i + 1} - Error connecting to database:`, err.message);
            if (i < retries - 1) {
                console.log(`Retrying in ${delay / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error('Max retries reached. Could not connect to database.');
            }
        }
    }
};

connectWithRetry();

module.exports = promisePool;
