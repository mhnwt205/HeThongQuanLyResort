const sql = require('mssql');
require('dotenv').config();

const useIntegratedAuth = String(process.env.DB_INTEGRATED_AUTH || 'false').toLowerCase() === 'true';

const baseConfig = {
    database: process.env.DB_NAME || 'ResortManagement',
    server: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

const sqlConfig = useIntegratedAuth
    ? {
        ...baseConfig,
        // Use Windows Authentication (Integrated Security)
        options: {
            ...baseConfig.options,
            trustedConnection: true
        }
    }
    : {
        ...baseConfig,
        user: process.env.DB_USER || 'sa',
        password: process.env.DB_PASSWORD || 'yourStrong(!)Password'
    };

let poolPromise;

const getPool = async () => {
    if (!poolPromise) {
        poolPromise = sql.connect(sqlConfig).then(pool => {
            console.log('✅ SQL Server connected');
            return pool;
        }).catch(err => {
            console.error('❌ SQL Server connection error:', err.message);
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
