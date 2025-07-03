const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Настройка статических файлов
app.use(express.static(path.join(__dirname, '../mirageml-frontend')));

// Пути к файлам
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const PROJECTS_FILE = path.join(__dirname, 'data', 'projects.json');

// Инициализация файлов
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, '[]');
}
if (!fs.existsSync(PROJECTS_FILE)) {
    fs.writeFileSync(PROJECTS_FILE, '[]');
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

// Маршруты для страниц
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../mirageml-frontend/main/index.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../mirageml-frontend/profile/index.html'));
});

app.get('/editor', (req, res) => {
    res.sendFile(path.join(__dirname, '../mirageml-frontend/editor/index.html'));
});

// API маршруты
app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;
    const users = getUsers();

    if (users.some(user => user.email === email)) {
        return res.status(400).json({ error: 'Email уже используется' });
    }

    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        phone: '',
        country: 'ru',
        avatar: name.substring(0, 2).toUpperCase()
    };

    users.push(newUser);
    saveUsers(users);

    res.json({ 
        success: true, 
        redirect: '/editor',
        user: { 
            id: newUser.id, 
            name: newUser.name,
            email: newUser.email,
            avatar: newUser.avatar
        }
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const users = getUsers();

    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    res.json({ 
        success: true,
        redirect: '/editor',
        user: { 
            id: user.id, 
            name: user.name,
            email: user.email,
            phone: user.phone,
            country: user.country,
            avatar: user.avatar || user.name.substring(0, 2).toUpperCase()
        }
    });
});

app.get('/api/profile', (req, res) => {
    const users = getUsers();
    if (users.length === 0) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    const user = users[0];
    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        country: user.country || 'ru',
        avatar: user.avatar || user.name.substring(0, 2).toUpperCase()
    });
});

app.post('/api/profile', (req, res) => {
    const { name, email, phone, country } = req.body;
    const users = getUsers();
    
    if (users.length === 0) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    const user = users[0];
    user.name = name;
    user.email = email;
    user.phone = phone;
    user.country = country;
    
    saveUsers(users);
    
    res.json({ 
        success: true,
        message: 'Профиль успешно обновлен',
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            country: user.country,
            avatar: user.avatar || user.name.substring(0, 2).toUpperCase()
        }
    });
});

app.post('/api/change-password', (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const users = getUsers();
    
    if (users.length === 0) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    const user = users[0];
    
    if (user.password !== currentPassword) {
        return res.status(400).json({ error: 'Текущий пароль неверный' });
    }
    
    user.password = newPassword;
    saveUsers(users);
    
    res.json({ 
        success: true,
        message: 'Пароль успешно изменен'
    });
});

app.get('/api/projects', (req, res) => {
    try {
        const projects = getProjects();
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка загрузки проектов' });
    }
});

app.post('/api/projects', (req, res) => {
    try {
        const { name } = req.body;
        const projects = getProjects();
        
        const newProject = {
            id: Date.now().toString(),
            name: name || 'Новый проект',
            userId: 'demo-user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        projects.push(newProject);
        saveProjects(projects);

        res.json({ 
            success: true,
            project: newProject
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка создания проекта' });
    }
});

app.delete('/api/projects/:id', (req, res) => {
    try {
        const { id } = req.params;
        let projects = getProjects();
        
        projects = projects.filter(project => project.id !== id);
        saveProjects(projects);

        res.json({ 
            success: true,
            message: 'Проект успешно удален'
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка удаления проекта' });
    }
});

app.post('/api/logout', (req, res) => {
    res.json({ success: true, message: 'Вы успешно вышли из системы' });
});

// Обработка 404
app.use((req, res) => {
    res.status(404).send('Страница не найдена');
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});