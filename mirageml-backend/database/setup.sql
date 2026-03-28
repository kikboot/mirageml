\i 001_schema.sql
\i 002_initial_data.sql

SELECT 'Users count: ' || COUNT(*) FROM users;
SELECT 'Projects count: ' || COUNT(*) FROM projects;
SELECT 'Sessions count: ' || COUNT(*) FROM sessions;
SELECT 'Reviews count: ' || COUNT(*) FROM reviews;
