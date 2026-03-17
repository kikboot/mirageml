/**
 * Database Initialization Script
 * Скрипт для инициализации базы данных PostgreSQL
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Конфигурация подключения
const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // Подключаемся к default базе для создания новой
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
};

async function initDatabase() {
    console.log('🚀 Инициализация базы данных MirageML...\n');
    
    const pool = new Pool(config);
    
    try {
        // 1. Создаем базу данных если не существует
        console.log('📁 Проверка базы данных...');
        const dbExists = await checkDatabaseExists(pool, process.env.DB_NAME || 'mirageml');
        
        if (!dbExists) {
            console.log('   Создание базы данных...');
            await createDatabase(pool, process.env.DB_NAME || 'mirageml');
            console.log('   ✅ База данных создана');
        } else {
            console.log('   ✅ База данных существует');
        }
        
        await pool.end();
        
        // 2. Подключаемся к новой базе и создаем таблицы
        const appPool = new Pool({
            ...config,
            database: process.env.DB_NAME || 'mirageml'
        });
        
        console.log('\n📊 Создание таблиц...');
        await runMigrations(appPool);
        console.log('   ✅ Таблицы созданы');
        
        console.log('\n📝 Загрузка начальных данных...');
        await loadInitialData(appPool);
        console.log('   ✅ Начальные данные загружены');
        
        await appPool.end();
        
        console.log('\n✅ Инициализация базы данных завершена успешно!');
        console.log('\n📋 Учетные данные для входа:');
        console.log('   ┌─────────────────────────────────────────────────────┐');
        console.log('   │ Разработчик:                                        │');
        console.log('   │   Email: developer@mirageml.com                     │');
        console.log('   │   Пароль: mirage2026                                │');
        console.log('   ├─────────────────────────────────────────────────────┤');
        console.log('   │ Модератор:                                          │');
        console.log('   │   Email: moderator@mirageml.com                     │');
        console.log('   │   Пароль: moderator123                              │');
        console.log('   ├─────────────────────────────────────────────────────┤');
        console.log('   │ Администратор:                                      │');
        console.log('   │   Email: admin@mirageml.com                         │');
        console.log('   │   Пароль: admin123                                  │');
        console.log('   └─────────────────────────────────────────────────────┘');
        
    } catch (error) {
        console.error('\n❌ Ошибка инициализации:', error.message);
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
    // В PostgreSQL нельзя создать БД в подготовленном statement
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

// Запуск
initDatabase();
