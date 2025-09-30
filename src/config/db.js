const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

const useIntegratedAuth = String(process.env.DB_INTEGRATED_AUTH || 'false').toLowerCase() === 'true';

const baseConfig = {
    database: process.env.DB_NAME || 'ResortManagement',
    server: process.env.DB_HOST || 'localhost',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        trustedConnection: true,
        driver: 'msnodesqlv8'
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Only add port if specified and not using named instance
if (process.env.DB_PORT && !process.env.DB_HOST.includes('\\')) {
    baseConfig.port = Number(process.env.DB_PORT);
}

const sqlConfig = useIntegratedAuth
    ? {
        ...baseConfig
    }
    : {
        ...baseConfig,
        user: process.env.DB_USER || 'sa',
        password: process.env.DB_PASSWORD || 'yourStrong(!)Password'
    };

let poolPromise;

function buildConfigFromEnv() {
    const connectionString = process.env.DB_CONNECTION_STRING;
    if (connectionString) {
        return {
            connectionString,
            options: {
                encrypt: false,
                trustServerCertificate: true,
                driver: 'msnodesqlv8'
            }
        };
    }
    return sqlConfig;
}

const getPool = async () => {
    if (!poolPromise) {
        const effectiveConfig = buildConfigFromEnv();
        poolPromise = sql.connect(effectiveConfig).then(pool => {
            console.log('✅ SQL Server connected');
            return pool;
        }).catch(err => {
            console.error('❌ SQL Server connection error:', err.message || err);
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
