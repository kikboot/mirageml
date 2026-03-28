INSERT INTO users (id, name, email, password, role, role_display, theme, country, created_at)
VALUES (
    'dev_' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::VARCHAR,
    'Главный разработчик',
    'developer@mirageml.com',
    '$2b$10$m0TZ8XlVbLuzPvj1h5VjFOWUKWeKq5yXI35TNim/JcFkeY4ESx2Sa',
    'developer',
    'Разработчик',
    'dark',
    'ru',
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, name, email, password, role, role_display, theme, country, created_at)
VALUES (
    'mod_' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::VARCHAR,
    'Модератор',
    'moderator@mirageml.com',
    '$2b$10$CN6ZW5SWSIBQZm/FNomHeuiMYvr1DaMZNQ.Pu5ZpLB50gUnJFN.8m',
    'moderator',
    'Модератор',
    'dark',
    'ru',
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, name, email, password, role, role_display, theme, country, created_at)
VALUES (
    'adm_' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::VARCHAR,
    'Администратор',
    'admin@mirageml.com',
    '$2b$10$VTYqAy1yrDeCqDm9BuPHyul3Mj6fGTv5SAms88IQSGpdFcIWOqAuS',
    'admin',
    'Администратор',
    'dark',
    'ru',
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO reviews (id, name, email, rating, comment, approved, created_at)
VALUES 
    ('1769529283080', 'Главный разработчик - Вербило Кирилл', '4@mail.ru', 5, 
     'Тестирую данную страницу на наличие багов и недочетов', true, '2026-01-27T15:54:43.080Z'),
    ('1769529509951', 'Елена Тыквенко', '5@mail.ru', 4, 
     'Сайт собран хорошо и удобен для использования. Разработчику-одиночке желаю успехов в новых начинаниях и продвижении проекта', true, '2026-01-27T15:58:29.951Z'),
    ('1771435678158', 'Тест Админ-панели', '7@mail.ru', 5, 
     'Привет, это проверка админ-панели. Я админ панели должна появиться запись, где можно одобрить отзыв пользователя. Это проверка работы', true, '2026-02-18T17:27:58.158Z'),
    ('1771485822513', 'атв', '1@mirageml.com', 2, 
     'Ytgkj[j', true, '2026-02-19T07:23:42.513Z')
ON CONFLICT (id) DO NOTHING;