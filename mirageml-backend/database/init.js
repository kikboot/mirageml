const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
};

async function initDatabase() {
    console.log('🚀 Инициализация базы данных MirageML...\n');

    const pool = new Pool(config);

    try {
        const dbExists = await checkDatabaseExists(pool, process.env.DB_NAME || 'mirageml');

        if (!dbExists) {
            await createDatabase(pool, process.env.DB_NAME || 'mirageml');
        }

        await pool.end();

        const appPool = new Pool({
            ...config,
            database: process.env.DB_NAME || 'mirageml'
        });

        await runMigrations(appPool);

        await loadInitialData(appPool);

        await appPool.end();

        console.log('\n Инициализация базы данных завершена успешно!');

    } catch (error) {
        console.error('\n Ошибка инициализации:', error.message);
        process.exit(1);
    }
}

async function checkDatabaseExists(pool, dbName) {
    const result = await pool.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [dbName]
    );
    return result.rows.length > 0;
}

async function createDatabase(pool, dbName) {
    await pool.query(`CREATE DATABASE "${dbName}"`);
}

async function runMigrations(pool) {
    const schemaPath = path.join(__dirname, '001_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    await pool.query(schema);
}

async function loadInitialData(pool) {
    const dataPath = path.join(__dirname, '002_initial_data.sql');
    const data = fs.readFileSync(dataPath, 'utf-8');
    await pool.query(data);
}

initDatabase();
