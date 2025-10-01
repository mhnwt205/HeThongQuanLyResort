require('dotenv').config();
const sql = require('mssql');

console.log('🔌 Using driver: mssql (tedious)');

// Simple working configuration
const sqlConfig = {
    server: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'ResortManagement',
    port: Number(process.env.DB_PORT) || 1433,
    user: process.env.DB_USER || 'testuser',
    password: process.env.DB_PASSWORD || '123456',
    options: {
        trustServerCertificate: true,
        encrypt: false,
        enableArithAbort: true,
        connectTimeout: 30000,
        requestTimeout: 30000,
        useUTC: false
    }
};

let poolPromise;

const getPool = async () => {
    if (!poolPromise) {
        console.log('🔧 Database config:', {
            server: sqlConfig.server,
            database: sqlConfig.database,
            port: sqlConfig.port,
            user: sqlConfig.user,
            password: '***',
            options: sqlConfig.options
        });
        
        poolPromise = sql.connect(sqlConfig).then(pool => {
            console.log('✅ SQL Server connected successfully');
            return pool;
        }).catch(err => {
            console.error('❌ SQL Server connection failed:', err.message);
            console.error('❌ Full error:', err);
            poolPromise = undefined;
            throw err;
        });
    }
    return poolPromise;
};

const query = async (text, params = []) => {
    const pool = await getPool();
    const request = pool.request();
    params.forEach((p, i) => request.input(`p${i+1}`, p));
    const parsed = text.replace(/@p(\d+)/g, (_, idx) => `@p${idx}`);
    const result = await request.query(parsed);
    return result.recordset;
};

// Test database connection
const testConnection = async () => {
    try {
        const pool = await getPool();
        console.log('✅ SQL Server connected successfully');
        return true;
    } catch (error) {
        console.error('❌ SQL Server connection failed:', error.message);
        return false;
    }
};

module.exports = { sql, getPool, query, testConnection };
