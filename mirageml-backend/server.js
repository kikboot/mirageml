const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your-secret-key-here';

// Middleware
app.use(cors());
app.use(bodyParser.json());
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
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
}

function getSessions() {
    return JSON.parse(fs.readFileSync(SESSIONS_FILE));
}

function saveSessions(sessions) {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
}

// Middleware для проверки JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
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
    
    if (!user) {
        return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    
    try {
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }
        
        // Создаем JWT токен
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        // Сохраняем сессию
        const sessions = getSessions();
        const newSession = {
            id: Date.now().toString(),
            userId: user.id,
            token,
            device: req.headers['user-agent'],
            ip: req.ip,
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString()
        };
        
        sessions.push(newSession);
        saveSessions(sessions);
        
        // Обновляем сессии пользователя
        user.sessions.push(newSession.id);
        saveUsers(users);
        
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar || user.name.substring(0, 2).toUpperCase()
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при входе' });
    }
});

// API: Получение профиля
app.get('/api/profile', authenticateToken, (req, res) => {
    const users = getUsers();
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        country: user.country || 'ru',
        avatar: user.avatar || user.name.substring(0, 2).toUpperCase(),
        createdAt: user.createdAt
    });
});

// API: Обновление профиля
app.put('/api/profile', authenticateToken, async (req, res) => {
    try {
        const { name, email, phone, country } = req.body;
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
            country: country || users[userIndex].country
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
        const { elements } = req.body;
        const projects = getProjects();
        
        const projectIndex = projects.findIndex(p => p.id === id && p.userId === req.user.userId);
        if (projectIndex === -1) {
            return res.status(404).json({ error: 'Проект не найден' });
        }
        
        projects[projectIndex].elements = elements;
        projects[projectIndex].updatedAt = new Date().toISOString();
        saveProjects(projects);

        res.json({ 
            success: true,
            message: 'Проект сохранен'
        });
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

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});