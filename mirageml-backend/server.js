const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const app = express();
const PORT = 3001;
const JWT_SECRET = '8ddfda05949bcc8057da59d2b7e62b4f3e12f00d6af892704d87530ae6731cab';

// Настройка EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware для парсинга cookies
app.use((req, res, next) => {
    const cookieHeader = req.headers.cookie;
    req.cookies = {};
    
    if (cookieHeader) {
        const cookies = cookieHeader.split(';');
        cookies.forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            req.cookies[name] = value;
        });
    }
    
    next();
});

// Инициализация сессии
app.use(session({
    secret: JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // В production установить true и настроить HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 часа
    }
}));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../mirageml-frontend')));

// Пути к файлам данных
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');

// Инициализация файлов данных
function initDataFiles() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

    const files = [
        { path: USERS_FILE, default: '[]' },
        { path: PROJECTS_FILE, default: '[]' },
        { path: SESSIONS_FILE, default: '[]' },
        { path: REVIEWS_FILE, default: '[]' }
    ];

    files.forEach(file => {
        if (!fs.existsSync(file.path)) {
            fs.writeFileSync(file.path, file.default);
        }
    });
}

// Функции работы с данными
function getUsers() {
    return JSON.parse(fs.readFileSync(USERS_FILE));
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function getProjects() {
    return JSON.parse(fs.readFileSync(PROJECTS_FILE));
}

function saveProjects(projects) {
    console.log('Сохранение проекта:', projects);
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
}

function getSessions() {
    return JSON.parse(fs.readFileSync(SESSIONS_FILE));
}

function saveSessions(sessions) {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
}

// Вспомогательные функции для работы с JSON
function readJSON(filePath) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '[]');
        return [];
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Функции для определения устройства и местоположения
const getDeviceInfo = (userAgent) => {
    const isMobile = /Mobile|Android|iPhone/i.test(userAgent);
    const isWindows = /Windows/i.test(userAgent);
    const isMac = /Macintosh|Mac OS X/i.test(userAgent);
    const isLinux = /Linux/i.test(userAgent);

    const browser =
        /Chrome/i.test(userAgent) ? 'Chrome' :
            /Firefox/i.test(userAgent) ? 'Firefox' :
                /Safari/i.test(userAgent) ? 'Safari' :
                    'Unknown';

    const os =
        isWindows ? 'Windows' :
            isMac ? 'MacOS' :
                isLinux ? 'Linux' :
                    isMobile ? 'Mobile' :
                        'Unknown';

    return `${browser}, ${os}`;
};

const getLocationByIP = (ip) => {
    if (ip === '127.0.0.1') return 'Локальный хост';
    return 'Москва, Россия';
};

// Middleware для проверки JWT
function authenticateToken(req, res, next) {
    // Проверяем токен в заголовке Authorization
    let token = null;
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        token = authHeader && authHeader.split(' ')[1];
    } else {
        // Если нет в заголовке, проверяем в cookie
        token = req.cookies['authToken'];
    }

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Инициализация файлов данных
initDataFiles();

// API: Регистрация
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }

    const users = getUsers();

    if (users.some(user => user.email === email)) {
        return res.status(400).json({ error: 'Email уже используется' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password: hashedPassword,
            theme: 'dark', // Устанавливаем тему по умолчанию
            createdAt: new Date().toISOString(),
            sessions: []
        };

        users.push(newUser);
        saveUsers(users);

        res.status(201).json({
            success: true,
            message: 'Аккаунт успешно создан'
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при регистрации' });
    }
});

// API: Вход
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.email === email);

    if (!user) return res.status(401).json({ error: 'Неверный email или пароль' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Неверный email или пароль' });

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role || 'user' }, JWT_SECRET, { expiresIn: '1h' });

    // Определяем устройство и местоположение
    const device = getDeviceInfo(req.headers['user-agent']);
    const ip = req.ip || req.connection.remoteAddress;
    const location = getLocationByIP(ip);

    const newSession = {
        id: Date.now().toString(),
        userId: user.id,
        token,
        device,
        ip,
        location,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
    };

    const sessions = getSessions();
    sessions.push(newSession);
    saveSessions(sessions);

    // Устанавливаем токен в cookie
    res.cookie('authToken', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 часа
        secure: process.env.NODE_ENV === 'production', // использовать HTTPS в продакшене
        sameSite: 'strict'
    });
    
    res.json({
        success: true,
        token, // по-прежнему возвращаем токен для клиентского кода
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || 'user', // Добавляем роль пользователя
            avatar: user.avatar || user.name.substring(0, 2).toUpperCase()
        }
    });
});

// API: Получение активных сессий
app.get('/api/sessions', authenticateToken, (req, res) => {
    const sessions = getSessions();
    const userSessions = sessions.filter(s => s.userId === req.user.userId)
        .map(s => ({
            ...s,
            isCurrent: s.token === req.headers['authorization'].split(' ')[1]
        }));
    res.json(userSessions);
});

// API: Получение профиля
app.get('/api/profile', authenticateToken, (req, res) => {
    const users = getUsers();
    const user = users.find(u => u.id === req.user.userId);
    const projects = getProjects();
    const sessions = getSessions();

    if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Подсчет проектов пользователя
    const userProjectCount = projects.filter(p => p.userId === req.user.userId).length;
    
    // Подсчет активных сессий пользователя
    const userSessionCount = sessions.filter(s => s.userId === req.user.userId).length;

    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        country: user.country || 'ru',
        theme: user.theme || 'dark', // Добавляем тему по умолчанию
        avatar: user.avatar || user.name.substring(0, 2).toUpperCase(),
        createdAt: user.createdAt,
        projectCount: userProjectCount,
        sessionCount: userSessionCount
    });
});

// API: Получение количества проектов пользователя
app.get('/api/projects/count', authenticateToken, (req, res) => {
    try {
        const projects = getProjects();
        const userProjectCount = projects.filter(p => p.userId === req.user.userId).length;
        
        res.json({
            count: userProjectCount
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка загрузки количества проектов' });
    }
});

// API: Получение количества сессий пользователя
app.get('/api/sessions/count', authenticateToken, (req, res) => {
    try {
        const sessions = getSessions();
        const userSessionCount = sessions.filter(s => s.userId === req.user.userId).length;
        
        res.json({
            count: userSessionCount
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка загрузки количества сессий' });
    }
});

// API: Обновление профиля
app.put('/api/profile', authenticateToken, async (req, res) => {
    try {
        const { name, email, phone, country, theme } = req.body;
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === req.user.userId);

        if (userIndex === -1) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        // Проверка email на уникальность
        if (email && email !== users[userIndex].email) {
            if (users.some(u => u.email === email && u.id !== req.user.userId)) {
                return res.status(400).json({ error: 'Email уже используется' });
            }
        }

        users[userIndex] = {
            ...users[userIndex],
            name: name || users[userIndex].name,
            email: email || users[userIndex].email,
            phone: phone || users[userIndex].phone,
            country: country || users[userIndex].country,
            theme: theme || users[userIndex].theme // Добавляем обновление темы
        };

        saveUsers(users);

        res.json({
            success: true,
            message: 'Профиль успешно обновлен',
            user: users[userIndex]
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при обновлении профиля' });
    }
});

// API: Смена пароля
app.post('/api/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const users = getUsers();
        const user = users.find(u => u.id === req.user.userId);

        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Текущий пароль неверный' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        saveUsers(users);

        res.json({ success: true, message: 'Пароль успешно изменен' });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при изменении пароля' });
    }
});

// API: Удаление аккаунта
app.delete('/api/account', authenticateToken, async (req, res) => {
    try {
        const { password } = req.body;
        const userId = req.user.userId;

        // Проверка пароля
        const users = getUsers();
        const user = users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Неверный пароль' });
        }

        // Удаление пользователя
        const updatedUsers = users.filter(u => u.id !== userId);
        saveUsers(updatedUsers);

        // Удаление проектов пользователя
        const projects = getProjects();
        const updatedProjects = projects.filter(p => p.userId !== userId);
        saveProjects(updatedProjects);

        // Удаление сессий пользователя
        const sessions = getSessions();
        const updatedSessions = sessions.filter(s => s.userId !== userId);
        saveSessions(updatedSessions);

        res.json({ success: true, message: 'Аккаунт успешно удален' });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при удалении аккаунта' });
    }
});

// API: Получение проектов пользователя
app.get('/api/projects', authenticateToken, (req, res) => {
    try {
        const projects = getProjects();
        const userProjects = projects.filter(p => p.userId === req.user.userId);
        res.json(userProjects);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка загрузки проектов' });
    }
});

// API: Получение конкретного проекта
app.get('/api/projects/:id', authenticateToken, (req, res) => {
    try {
        const { id } = req.params;
        const projects = getProjects();
        const project = projects.find(p => p.id === id && p.userId === req.user.userId);

        if (!project) {
            return res.status(404).json({ error: 'Проект не найден' });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка загрузки проекта' });
    }
});

// API: Создание проекта
app.post('/api/projects', authenticateToken, (req, res) => {
    try {
        const { name } = req.body;
        const projects = getProjects();

        const newProject = {
            id: Date.now().toString(),
            name: name || 'Новый проект',
            userId: req.user.userId,
            elements: {},
            canvasSize: { width: 800, height: 600 },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        projects.push(newProject);
        saveProjects(projects);

        res.status(201).json({
            success: true,
            project: newProject
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка создания проекта' });
    }
});

// API: Сохранение проекта
app.put('/api/projects/:id', authenticateToken, (req, res) => {
    try {
        const { id } = req.params;
        const { elements, canvasSize } = req.body;
        const projects = getProjects();

        console.log('Сохранение проекта:', id);
        console.log('Элементы для сохранения:', elements);

        const projectIndex = projects.findIndex(p => p.id === id && p.userId === req.user.userId);
        if (projectIndex === -1) {
            return res.status(404).json({ error: 'Проект не найден' });
        }

        projects[projectIndex] = {
            ...projects[projectIndex],
            elements: elements || {},
            canvasSize: canvasSize || { width: 800, height: 600 },
            updatedAt: new Date().toISOString()
        };

        saveProjects(projects);

        const responseData = {
            success: true,
            message: 'Проект сохранен',
            project: projects[projectIndex]
        };

        console.log('Ответ сервера:', responseData);

        res.json(responseData);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сохранения проекта' });
    }
});

// API: Удаление проекта
app.delete('/api/projects/:id', authenticateToken, (req, res) => {
    try {
        const { id } = req.params;
        let projects = getProjects();

        const initialLength = projects.length;
        projects = projects.filter(p => !(p.id === id && p.userId === req.user.userId));

        if (projects.length === initialLength) {
            return res.status(404).json({ error: 'Проект не найден' });
        }

        saveProjects(projects);
        res.json({ success: true, message: 'Проект удален' });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка удаления проекта' });
    }
});

// API: Завершение конкретной сессии
app.post('/api/sessions/terminate', authenticateToken, (req, res) => {
    try {
        const { sessionToken } = req.body;
        const token = req.headers['authorization'].split(' ')[1];
        const sessions = getSessions();
        
        // Проверяем, что пользователь пытается завершить свою сессию
        const sessionToTerminate = sessions.find(s => s.token === sessionToken);
        if (!sessionToTerminate || sessionToTerminate.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Нет доступа к этой сессии' });
        }
        
        // Не позволяем завершить текущую сессию через этот эндпоинт
        if (sessionToken === token) {
            return res.status(400).json({ error: 'Используйте /api/logout для завершения текущей сессии' });
        }
        
        const updatedSessions = sessions.filter(s => s.token !== sessionToken);
        saveSessions(updatedSessions);

        res.json({ success: true, message: 'Сессия завершена' });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при завершении сессии' });
    }
});

// API: Выход
app.post('/api/logout', authenticateToken, (req, res) => {
    try {
        const token = req.headers['authorization'].split(' ')[1];
        const sessions = getSessions();
        const updatedSessions = sessions.filter(s => s.token !== token);
        saveSessions(updatedSessions);

        res.json({ success: true, message: 'Вы успешно вышли' });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при выходе' });
    }
});

// Остальные маршруты
app.get('/api/reviews', (req, res) => {
    try {
        const reviews = JSON.parse(fs.readFileSync(REVIEWS_FILE));
        res.json(reviews.filter(r => r.approved));
    } catch (error) {
        res.status(500).json({ error: 'Ошибка загрузки отзывов' });
    }
});

app.post('/api/reviews', (req, res) => {
    try {
        const { name, email, rating, comment } = req.body;
        const reviews = JSON.parse(fs.readFileSync(REVIEWS_FILE));

        const newReview = {
            id: Date.now().toString(),
            name,
            email: email || null,
            rating: parseInt(rating),
            comment,
            approved: false,
            createdAt: new Date().toISOString()
        };

        reviews.push(newReview);
        fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2));

        res.json({
            success: true,
            message: 'Отзыв отправлен на модерацию'
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при отправке отзыва' });
    }
});

// Статические маршруты
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../mirageml-frontend/main/index.html'));
});

app.get('/editor', (req, res) => {
    res.sendFile(path.join(__dirname, '../mirageml-frontend/editor/index.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../mirageml-frontend/profile/index.html'));
});

app.get('/reviews', (req, res) => {
    res.sendFile(path.join(__dirname, '../mirageml-frontend/reviews/index.html'));
});

// ==========================================
// Админ-панель
// ==========================================

// Создаём админ-пользователя если не существует
async function ensureAdminUser() {
    const users = getUsers();
    const adminExists = users.some(u => u.email === 'admin@mirageml.com');
    
    if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const newAdmin = {
            id: Date.now().toString(),
            name: 'Администратор',
            email: 'admin@mirageml.com',
            password: hashedPassword,
            role: 'admin',
            roleDisplay: 'Администратор',
            theme: 'dark',
            country: 'ru',
            createdAt: new Date().toISOString(),
            sessions: []
        };
        users.push(newAdmin);
        saveUsers(users);
        console.log('Создан админ-пользователь: admin@mirageml.com / admin123');
    } else {
        console.log('Админ-пользователь уже существует');
    }
}
ensureAdminUser();

// Middleware для проверки авторизации администратора
function requireAdminAuth(req, res, next) {
    if (req.session && req.session.adminId && req.session.adminRole === 'admin') {
        return next();
    }
    res.redirect('/admin/login');
}

// Страница входа
app.get('/admin/login', (req, res) => {
    if (req.session && req.session.adminId) {
        return res.redirect('/admin');
    }
    res.render('admin-login', { error: null });
});

app.post('/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('[Admin Login] Попытка входа:', email);
        
        const users = getUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            console.log('[Admin Login] Пользователь не найден:', email);
            return res.render('admin-login', { error: 'Неверный email или пароль' });
        }

        console.log('[Admin Login] Пользователь найден, роль:', user.role);
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            console.log('[Admin Login] Неверный пароль');
            return res.render('admin-login', { error: 'Неверный email или пароль' });
        }

        if (user.role !== 'admin') {
            console.log('[Admin Login] Недостаточно прав, роль:', user.role);
            return res.render('admin-login', { error: 'Доступ только для администраторов' });
        }

        req.session.adminId = user.id;
        req.session.adminEmail = user.email;
        req.session.adminRole = user.role;
        req.session.adminName = user.name;
        
        console.log('[Admin Login] Успешный вход, session ID:', req.sessionID);

        res.redirect('/admin');
    } catch (error) {
        console.error('[Admin Login] Ошибка:', error);
        res.render('admin-login', { error: 'Ошибка при входе' });
    }
});

// Выход
app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// Главная страница админ-панели
app.get('/admin', requireAdminAuth, (req, res) => {
    const users = getUsers();
    const projects = getProjects();
    const sessions = getSessions();
    const reviews = readJSON(REVIEWS_FILE);

    const stats = {
        totalUsers: users.length,
        totalProjects: projects.length,
        totalSessions: sessions.length,
        totalReviews: reviews.length,
        adminCount: users.filter(u => u.role === 'admin').length,
        userCount: users.filter(u => u.role === 'user').length,
        approvedReviews: reviews.filter(r => r.approved).length,
        pendingReviews: reviews.filter(r => !r.approved).length
    };

    const body = res.render('admin-dashboard', { stats, port: PORT }, { async: false });
    res.render('admin-layout', {
        title: 'Главная',
        currentPage: 'dashboard',
        body: body
    });
});

// Пользователи
app.get('/admin/users', requireAdminAuth, (req, res) => {
    const users = getUsers();
    const usersWithoutPassword = users.map(u => {
        const { password, ...rest } = u;
        return rest;
    });

    // Функция для отображения роли
    function getRoleDisplay(role, roleDisplay) {
        if (roleDisplay) return roleDisplay;
        if (role === 'admin') return 'Администратор';
        return 'Пользователь';
    }

    const body = `
        <div class="card">
            <h3><i class="fas fa-users"></i> Пользователи (${users.length})</h3>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Имя</th>
                        <th>Email</th>
                        <th>Роль</th>
                        <th>Дата регистрации</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${usersWithoutPassword.map(u => `
                        <tr>
                            <td>${u.id}</td>
                            <td>${u.name}</td>
                            <td>${u.email}</td>
                            <td><span class="badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}">${getRoleDisplay(u.role, u.roleDisplay)}</span></td>
                            <td>${new Date(u.createdAt).toLocaleDateString('ru-RU')}</td>
                            <td>
                                <a href="/admin/users/edit/${u.id}" class="btn btn-primary"><i class="fas fa-edit"></i></a>
                                <a href="/admin/users/delete/${u.id}" class="btn btn-danger" onclick="return confirm('Удалить пользователя?')"><i class="fas fa-trash"></i></a>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    res.render('admin-layout', {
        title: 'Пользователи',
        currentPage: 'users',
        body: body
    });
});

// Удаление пользователя
app.get('/admin/users/delete/:id', requireAdminAuth, (req, res) => {
    const userId = req.params.id;
    let users = getUsers();
    
    // Удаляем проекты пользователя
    let projects = getProjects();
    projects = projects.filter(p => p.userId !== userId);
    saveProjects(projects);
    
    // Удаляем сессии пользователя
    let sessions = getSessions();
    sessions = sessions.filter(s => s.userId !== userId);
    saveSessions(sessions);
    
    // Удаляем пользователя
    users = users.filter(u => u.id !== userId);
    saveUsers(users);
    
    res.redirect('/admin/users');
});

// Проекты
app.get('/admin/projects', requireAdminAuth, (req, res) => {
    const projects = getProjects();
    const users = getUsers();

    const body = `
        <div class="card">
            <h3><i class="fas fa-folder"></i> Проекты (${projects.length})</h3>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Название</th>
                        <th>Владелец</th>
                        <th>Дата создания</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${projects.map(p => {
                        const owner = users.find(u => u.id === p.userId);
                        return `
                            <tr>
                                <td>${p.id}</td>
                                <td>${p.name}</td>
                                <td>${owner ? owner.name : 'Неизвестно'}</td>
                                <td>${new Date(p.createdAt).toLocaleDateString('ru-RU')}</td>
                                <td>
                                    <a href="/admin/projects/delete/${p.id}" class="btn btn-danger" onclick="return confirm('Удалить проект?')"><i class="fas fa-trash"></i></a>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;

    res.render('admin-layout', {
        title: 'Проекты',
        currentPage: 'projects',
        body: body
    });
});

app.get('/admin/projects/delete/:id', requireAdminAuth, (req, res) => {
    const projectId = req.params.id;
    let projects = getProjects();
    projects = projects.filter(p => p.id !== projectId);
    saveProjects(projects);
    res.redirect('/admin/projects');
});

// Сессии
app.get('/admin/sessions', requireAdminAuth, (req, res) => {
    const sessions = getSessions();
    const users = getUsers();

    const body = `
        <div class="card">
            <h3><i class="fas fa-clock"></i> Сессии (${sessions.length})</h3>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Пользователь</th>
                        <th>Устройство</th>
                        <th>IP</th>
                        <th>Локация</th>
                        <th>Дата входа</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${sessions.map(s => {
                        const user = users.find(u => u.id === s.userId);
                        return `
                            <tr>
                                <td>${s.id}</td>
                                <td>${user ? user.name : 'Неизвестно'}</td>
                                <td>${s.device}</td>
                                <td>${s.ip}</td>
                                <td>${s.location}</td>
                                <td>${new Date(s.createdAt).toLocaleDateString('ru-RU')}</td>
                                <td>
                                    <a href="/admin/sessions/delete/${s.id}" class="btn btn-danger" onclick="return confirm('Завершить сессию?')"><i class="fas fa-stop"></i></a>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;

    res.render('admin-layout', {
        title: 'Сессии',
        currentPage: 'sessions',
        body: body
    });
});

app.get('/admin/sessions/delete/:id', requireAdminAuth, (req, res) => {
    const sessionId = req.params.id;
    let sessions = getSessions();
    sessions = sessions.filter(s => s.id !== sessionId);
    saveSessions(sessions);
    res.redirect('/admin/sessions');
});

// Отзывы
app.get('/admin/reviews', requireAdminAuth, (req, res) => {
    const reviews = readJSON(REVIEWS_FILE);

    const body = `
        <div class="card">
            <h3><i class="fas fa-comments"></i> Отзывы (${reviews.length})</h3>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Имя</th>
                        <th>Рейтинг</th>
                        <th>Комментарий</th>
                        <th>Статус</th>
                        <th>Дата</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${reviews.map(r => `
                        <tr>
                            <td>${r.id}</td>
                            <td>${r.name}</td>
                            <td>${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</td>
                            <td>${r.comment}</td>
                            <td><span class="badge ${r.approved ? 'badge-success' : 'badge-warning'}">${r.approved ? 'Одобрен' : 'На модерации'}</span></td>
                            <td>${new Date(r.createdAt).toLocaleDateString('ru-RU')}</td>
                            <td>
                                ${r.approved 
                                    ? `<a href="/admin/reviews/unapprove/${r.id}" class="btn btn-warning"><i class="fas fa-undo"></i></a>`
                                    : `<a href="/admin/reviews/approve/${r.id}" class="btn btn-success"><i class="fas fa-check"></i></a>`
                                }
                                <a href="/admin/reviews/delete/${r.id}" class="btn btn-danger" onclick="return confirm('Удалить отзыв?')"><i class="fas fa-trash"></i></a>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    res.render('admin-layout', {
        title: 'Отзывы',
        currentPage: 'reviews',
        body: body
    });
});

app.get('/admin/reviews/approve/:id', requireAdminAuth, (req, res) => {
    const reviews = readJSON(REVIEWS_FILE);
    const review = reviews.find(r => r.id === req.params.id);
    if (review) {
        review.approved = true;
        writeJSON(REVIEWS_FILE, reviews);
    }
    res.redirect('/admin/reviews');
});

app.get('/admin/reviews/unapprove/:id', requireAdminAuth, (req, res) => {
    const reviews = readJSON(REVIEWS_FILE);
    const review = reviews.find(r => r.id === req.params.id);
    if (review) {
        review.approved = false;
        writeJSON(REVIEWS_FILE, reviews);
    }
    res.redirect('/admin/reviews');
});

app.get('/admin/reviews/delete/:id', requireAdminAuth, (req, res) => {
    let reviews = readJSON(REVIEWS_FILE);
    reviews = reviews.filter(r => r.id !== req.params.id);
    writeJSON(REVIEWS_FILE, reviews);
    res.redirect('/admin/reviews');
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    console.log(`Админ-панель доступна по адресу http://localhost:${PORT}/admin/login`);
    console.log(`Логин: admin@mirageml.com | Пароль: admin123`);
});