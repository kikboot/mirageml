# 🗄️ База данных MirageML

Документация по базе данных PostgreSQL для проекта MirageML.

## 📋 Содержание

- [Требования](#требования)
- [Установка](#установка)
- [Структура базы данных](#структура-базы-данных)
- [Конфигурация](#конфигурация)
- [Использование](#использование)

---

## 🔧 Требования

- **PostgreSQL** версии 12 или выше
- **Node.js** версии 16 или выше
- **npm** или **yarn**

---

## 📦 Установка

### 1. Установка зависимостей

```bash
cd mirageml-backend
npm install
```

### 2. Настройка конфигурации

Скопируйте файл `.env.example` в `.env` и настройте параметры подключения:

```bash
cp .env.example .env
```

Отредактируйте `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mirageml
DB_USER=postgres
DB_PASSWORD=ваш_пароль
```

### 3. Инициализация базы данных

```bash
npm run db:init
```

Эта команда:
1. Создаст базу данных `mirageml`
2. Создаст все необходимые таблицы
3. Загрузит начальные данные (пользователи developer, moderator, admin)

### 4. Миграция данных из JSON (при обновлении)

Если вы обновляетесь со старой версии с JSON файлами:

```bash
npm run db:migrate-data
```

После миграции удалите JSON файлы из папки `data/`.

---

## 🏗️ Структура базы данных

### Таблица `users` - Пользователи

| Поле | Тип | Описание |
|------|-----|----------|
| id | VARCHAR(50) | Уникальный идентификатор |
| name | VARCHAR(255) | Имя пользователя |
| email | VARCHAR(255) | Email (уникальный) |
| password | VARCHAR(255) | Хеш пароля (bcrypt) |
| role | VARCHAR(50) | Роль: developer, moderator, admin, user |
| role_display | VARCHAR(100) | Отображаемое имя роли |
| theme | VARCHAR(50) | Тема интерфейса: dark, light |
| country | VARCHAR(10) | Код страны |
| phone | VARCHAR(50) | Телефон |
| avatar | TEXT | URL аватара |
| created_at | TIMESTAMP | Дата создания |
| updated_at | TIMESTAMP | Дата обновления |

### Таблица `projects` - Проекты

| Поле | Тип | Описание |
|------|-----|----------|
| id | VARCHAR(50) | Уникальный идентификатор |
| user_id | VARCHAR(50) | Ссылка на пользователя |
| name | VARCHAR(255) | Название проекта |
| elements | JSONB | Структура элементов проекта |
| canvas_size | JSONB | Размер холста {width, height} |
| created_at | TIMESTAMP | Дата создания |
| updated_at | TIMESTAMP | Дата обновления |

### Таблица `sessions` - Сессии

| Поле | Тип | Описание |
|------|-----|----------|
| id | VARCHAR(50) | Уникальный идентификатор |
| user_id | VARCHAR(50) | Ссылка на пользователя |
| token | TEXT | JWT токен сессии |
| device | VARCHAR(255) | Информация об устройстве |
| ip | VARCHAR(100) | IP адрес |
| location | VARCHAR(255) | Местоположение |
| created_at | TIMESTAMP | Дата создания |
| last_active | TIMESTAMP | Последняя активность |

### Таблица `reviews` - Отзывы

| Поле | Тип | Описание |
|------|-----|----------|
| id | VARCHAR(50) | Уникальный идентификатор |
| name | VARCHAR(255) | Имя автора |
| email | VARCHAR(255) | Email автора |
| rating | INTEGER | Рейтинг (1-5) |
| comment | TEXT | Текст отзыва |
| approved | BOOLEAN | Статус модерации |
| created_at | TIMESTAMP | Дата создания |

---

## ⚙️ Конфигурация

### Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `DB_HOST` | Хост PostgreSQL | `localhost` |
| `DB_PORT` | Порт PostgreSQL | `5432` |
| `DB_NAME` | Имя базы данных | `mirageml` |
| `DB_USER` | Пользователь PostgreSQL | `postgres` |
| `DB_PASSWORD` | Пароль PostgreSQL | `postgres` |
| `PORT` | Порт сервера | `3001` |
| `JWT_SECRET` | Секретный ключ JWT | - |

---

## 🚀 Использование

### Запуск сервера

```bash
npm start
```

### Режим разработки (с авто-перезагрузкой)

```bash
npm run dev
```

### Скрипты базы данных

| Команда | Описание |
|---------|----------|
| `npm run db:init` | Инициализация базы данных |
| `npm run db:migrate` | Применение миграций |

---

## 🔐 Учетные данные по умолчанию

После инициализации создаются следующие пользователи:

| Роль | Email | Пароль |
|------|-------|--------|
| **Разработчик** | `developer@mirageml.com` | `mirage2026` |
| **Модератор** | `moderator@mirageml.com` | `moderator123` |
| **Администратор** | `admin@mirageml.com` | `admin123` |

---

## 📁 Файлы базы данных

```
database/
├── 001_schema.sql      # Схема базы данных
├── 002_initial_data.sql # Начальные данные
├── setup.sql           # Полный скрипт установки
├── init.js             # Скрипт инициализации
├── db.js               # Node.js модуль для работы с БД
└── README.md           # Эта документация
```

---

## 🔧 Модуль db.js

Модуль `db.js` предоставляет функции для работы с базой данных:

### Пример использования

```javascript
const db = require('./database/db');

// Получить всех пользователей
const users = await db.getAllUsers();

// Получить пользователя по email
const user = await db.getUserByEmail('test@example.com');

// Создать проект
const project = await db.createProject({
    id: '123',
    user_id: 'user-id',
    name: 'Мой проект',
    elements: {},
    canvas_size: { width: 1024, height: 768 }
});

// Получить статистику
const stats = await db.getStats();
```

### Доступные функции

**Пользователи:**
- `getAllUsers()`
- `getUserById(id)`
- `getUserByEmail(email)`
- `createUser(user)`
- `updateUser(id, data)`
- `deleteUser(id)`

**Проекты:**
- `getAllProjects()`
- `getProjectById(id)`
- `getProjectsByUserId(userId)`
- `createProject(project)`
- `updateProject(id, data)`
- `deleteProject(id)`

**Сессии:**
- `getAllSessions()`
- `getSessionByToken(token)`
- `createSession(session)`
- `deleteSession(id)`

**Отзывы:**
- `getAllReviews()`
- `getApprovedReviews()`
- `createReview(review)`
- `updateReview(id, data)`

---

## 📝 Миграции

Для применения миграций выполните:

```bash
npm run db:migrate
```

---

## 🆘 Решение проблем

### Ошибка подключения к базе данных

1. Убедитесь, что PostgreSQL запущен
2. Проверьте параметры в `.env`
3. Проверьте, что пользователь имеет доступ к БД

### Ошибка при инициализации

1. Удалите существующую базу данных: `DROP DATABASE mirageml;`
2. Запустите инициализацию заново: `npm run db:init`

---

## 📞 Контакты

По вопросам обращайтесь: contact@mirageml.dev
