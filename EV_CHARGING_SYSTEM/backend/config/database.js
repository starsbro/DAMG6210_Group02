const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: false, // Set to true if using Azure
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool;

const connectDB = async () => {
  try {
    pool = await sql.connect(config);
    console.log(' Connected to SQL Server successfully!');
    return pool;
  } catch (err) {
    console.error(' Database connection failed:', err.message);
    process.exit(1);
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return pool;
};

module.exports = { connectDB, getPool, sql };
