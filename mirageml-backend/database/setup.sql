-- =============================================
-- Скрипт для полной установки базы данных
-- Запускается один раз при первом развертывании
-- =============================================

-- Создание базы данных (выполняется отдельно от суперпользователя)
-- CREATE DATABASE mirageml;

-- Подключение к базе данных mirageml
-- \c mirageml

-- Запуск миграций
\i 001_schema.sql
\i 002_initial_data.sql

-- Проверка установки
SELECT 'Users count: ' || COUNT(*) FROM users;
SELECT 'Projects count: ' || COUNT(*) FROM projects;
SELECT 'Sessions count: ' || COUNT(*) FROM sessions;
SELECT 'Reviews count: ' || COUNT(*) FROM reviews;
