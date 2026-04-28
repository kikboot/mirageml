const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { USER_ROLES, ROLE_PERMISSIONS, hasPermission, isOwner } = require('./models/user-roles');
const db = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || '8ddfda05949bcc8057da59d2b7e62b4f3e12f00d6af892704d87530ae6731cab';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('view cache', false);

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

app.use(session({
    secret: process.env.SESSION_SECRET || JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

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
    if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') return 'Локальный хост';
    return 'Москва, Россия';
};

function authenticateToken(req, res, next) {
    let token = null;
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        token = authHeader && authHeader.split(' ')[1];
    } else {
        token = req.cookies['authToken'];
    }

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.get('/api/config/google-client-id', (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
        return res.status(503).json({
            error: 'Google OAuth не настроен. Укажите GOOGLE_CLIENT_ID в .env файле'
        });
    }

    res.json({ clientId });
});

app.post('/api/auth/google/check', async (req, res) => {
    try {
        const { OAuth2Client } = require('google-auth-library');
        const clientId = process.env.GOOGLE_CLIENT_ID;

        if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
            return res.status(503).json({ exists: false, error: 'Google OAuth не настроен' });
        }

        const client = new OAuth2Client(clientId);
        const ticket = await client.verifyIdToken({
            idToken: req.body.credential,
            audience: clientId
        });
        const payload = ticket.getPayload();

        const user = await db.getUserByEmail(payload.email);
        res.json({ exists: !!user, email: payload.email });
    } catch (error) {
        console.error('[Google Check] Ошибка:', error);
        res.json({ exists: false });
    }
});

app.post('/api/auth/google/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ exists: false, error: 'Email не указан' });

        const user = await db.getUserByEmail(email);
        res.json({ exists: !!user });
    } catch (error) {
        console.error('[Check Email] Ошибка:', error);
        res.json({ exists: false });
    }
});

app.post('/api/auth/google', async (req, res) => {
    try {
        const { OAuth2Client } = require('google-auth-library');

        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
            return res.status(503).json({
                error: 'Google OAuth не настроен. Обратитесь к администратору.'
            });
        }

        const client = new OAuth2Client(clientId);

        let payload;

        if (req.body.credential) {
            const ticket = await client.verifyIdToken({
                idToken: req.body.credential,
                audience: clientId
            });
            payload = ticket.getPayload();
        }
        else if (req.body.access_token) {
            const https = require('https');

            const userInfo = await new Promise((resolve, reject) => {
                https.get(
                    `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${req.body.access_token}`,
                    (response) => {
                        let data = '';
                        response.on('data', chunk => data += chunk);
                        response.on('end', () => {
                            try {
                                resolve(JSON.parse(data));
                            } catch (e) {
                                reject(new Error('Не удалось распарсить ответ Google'));
                            }
                        });
                    }
                ).on('error', reject);
            });

            payload = {
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture,
                email_verified: userInfo.email_verified
            };
        } else {
            return res.status(400).json({ error: 'Не указан credential или access_token' });
        }

        const { email, name, picture, email_verified } = payload;

        if (!email) {
            return res.status(400).json({ error: 'Не удалось получить email из Google аккаунта' });
        }

        let user = await db.getUserByEmail(email);

        if (!user) {
            const acceptTerms = req.body.acceptTerms === true;

            if (!acceptTerms) {
                return res.status(400).json({
                    error: 'Необходимо принять пользовательское соглашение',
                    termsRequired: true
                });
            }

            const newUser = {
                id: 'google_' + Date.now().toString(),
                name: name || email.split('@')[0],
                email: email,
                password: await bcrypt.hash(Math.random().toString(36) + Date.now().toString(), 10),
                role: 'user',
                theme: 'dark',
                country: 'ru',
                phone: '',
                avatar: picture || null,
                terms_accepted_at: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };

            await db.createUser(newUser);
            user = await db.getUserByEmail(email);

            console.log(`[Google OAuth] Создан новый пользователь: ${email}`);
        } else {
            console.log(`[Google OAuth] Вход существующего пользователя: ${email}`);
        }

        // Создаём JWT токен
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role || 'user' },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Записываем сессию
        const device = getDeviceInfo(req.headers['user-agent']);
        const ip = req.ip || req.connection.remoteAddress;
        const location = getLocationByIP(ip);

        const newSession = {
            id: Date.now().toString(),
            user_id: user.id,
            token,
            device,
            ip,
            location
        };

        await db.createSession(newSession);

        // Устанавливаем куки
        res.cookie('authToken', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        });

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role || 'user',
                avatar: user.avatar || user.name.substring(0, 2).toUpperCase()
            }
        });
    } catch (error) {
        console.error('[Google OAuth] Ошибка:', error);

        if (error.message && error.message.includes('Token used too late')) {
            return res.status(401).json({ error: 'Токен Google истёк. Обновите страницу.' });
        }

        if (error.message && error.message.includes('Wrong recipient')) {
            return res.status(401).json({ error: 'Неверный Google Client ID' });
        }

        res.status(500).json({ error: 'Ошибка авторизации через Google' });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, acceptTerms } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Все поля обязательны' });
        }

        if (!acceptTerms) {
            return res.status(400).json({ error: 'Необходимо принять пользовательское соглашение' });
        }

        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email уже используется' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password: hashedPassword,
            role: 'user',
            theme: 'dark',
            country: 'ru',
            terms_accepted_at: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        await db.createUser(newUser);

        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email, role: newUser.role || 'user' },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({
            success: true,
            message: 'Аккаунт успешно создан',
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role || 'user'
            }
        });
    } catch (error) {
        console.error('[Register] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка при регистрации' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db.getUserByEmail(email);

        if (!user) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role || 'user' },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        const device = getDeviceInfo(req.headers['user-agent']);
        const ip = req.ip || req.connection.remoteAddress;
        const location = getLocationByIP(ip);

        const newSession = {
            id: Date.now().toString(),
            user_id: user.id,
            token,
            device,
            ip,
            location
        };

        await db.createSession(newSession);

        res.cookie('authToken', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        });

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role || 'user',
                avatar: user.avatar || user.name.substring(0, 2).toUpperCase()
            }
        });
    } catch (error) {
        console.error('[Login] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка при входе' });
    }
});

app.get('/api/sessions', authenticateToken, async (req, res) => {
    try {
        const sessions = await db.getSessionsByUserId(req.user.userId);
        const token = req.headers['authorization']?.split(' ')[1];
        
        const userSessions = sessions.map(s => ({
            ...s,
            isCurrent: s.token === token
        }));
        
        res.json(userSessions);
    } catch (error) {
        console.error('[Sessions] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка загрузки сессий' });
    }
});

app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const user = await db.getUserById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        const projectCount = (await db.getProjectsByUserId(req.user.userId)).length;
        const sessionCount = (await db.getSessionsByUserId(req.user.userId)).length;

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            country: user.country || 'ru',
            theme: user.theme || 'dark',
            avatar: user.avatar || user.name.substring(0, 2).toUpperCase(),
            createdAt: user.created_at,
            projectCount,
            sessionCount
        });
    } catch (error) {
        console.error('[Profile] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка загрузки профиля' });
    }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
    try {
        const { name, email, phone, country, theme } = req.body;
        const user = await db.getUserById(req.user.userId);

        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        if (email && email !== user.email) {
            const existingUser = await db.getUserByEmail(email);
            if (existingUser && existingUser.id !== req.user.userId) {
                return res.status(400).json({ error: 'Email уже используется' });
            }
        }

        await db.updateUser(req.user.userId, {
            name: name || user.name,
            email: email || user.email,
            phone: phone || user.phone,
            country: country || user.country,
            theme: theme || user.theme
        });

        res.json({
            success: true,
            message: 'Профиль успешно обновлен'
        });
    } catch (error) {
        console.error('[Update Profile] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка при обновлении профиля' });
    }
});

app.post('/api/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await db.getUserById(req.user.userId);

        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Текущий пароль неверный' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.updateUser(req.user.userId, { password: hashedPassword });

        res.json({ success: true, message: 'Пароль успешно изменен' });
    } catch (error) {
        console.error('[Change Password] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка при изменении пароля' });
    }
});

app.delete('/api/account', authenticateToken, async (req, res) => {
    try {
        const { password } = req.body;
        const user = await db.getUserById(req.user.userId);

        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        const protectedRoles = ['admin', 'developer', 'moderator'];
        if (protectedRoles.includes(user.role)) {
            console.error('[SECURITY] Попытка удаления аккаунта с ролью:', user.role);
            return res.status(403).json({
                error: 'Удаление аккаунта с ролью "' + (user.role_display || user.role) + '" запрещено.'
            });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Неверный пароль' });
        }

        await db.deleteUser(req.user.userId);

        res.json({ success: true, message: 'Аккаунт успешно удален' });
    } catch (error) {
        console.error('[Delete Account] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка при удалении аккаунта' });
    }
});

app.get('/api/projects', authenticateToken, async (req, res) => {
    try {
        const projects = await db.getProjectsByUserId(req.user.userId);
        res.json(projects);
    } catch (error) {
        console.error('[Get Projects] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка загрузки проектов' });
    }
});

app.get('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const projects = await db.getProjectsByUserId(req.user.userId);
        const project = projects.find(p => p.id === id);

        if (!project) {
            return res.status(404).json({ error: 'Проект не найден' });
        }

        res.json(project);
    } catch (error) {
        console.error('[Get Project] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка загрузки проекта' });
    }
});

app.post('/api/projects', authenticateToken, async (req, res) => {
    try {
        const { name, elements, canvas_size } = req.body;
        const newProject = {
            id: Date.now().toString(),
            user_id: req.user.userId,
            name: name || 'Новый проект',
            elements: elements || {},
            canvas_size: canvas_size || { width: 800, height: 600 }
        };

        const project = await db.createProject(newProject);

        res.status(201).json({
            success: true,
            project
        });
    } catch (error) {
        console.error('[Create Project] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка создания проекта' });
    }
});

app.put('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { elements, canvas_size } = req.body;

        const projects = await db.getProjectsByUserId(req.user.userId);
        const project = projects.find(p => p.id === id);

        if (!project) {
            return res.status(404).json({ error: 'Проект не найден' });
        }

        const updatedProject = await db.updateProject(id, {
            elements: elements || {},
            canvas_size: canvas_size || { width: 800, height: 600 }
        });

        res.json({
            success: true,
            message: 'Проект сохранен',
            project: updatedProject
        });
    } catch (error) {
        console.error('[Update Project] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка сохранения проекта' });
    }
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const projects = await db.getProjectsByUserId(req.user.userId);
        const project = projects.find(p => p.id === id);

        if (!project) {
            return res.status(404).json({ error: 'Проект не найден' });
        }

        await db.deleteProject(id);

        res.json({ success: true, message: 'Проект удален' });
    } catch (error) {
        console.error('[Delete Project] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка удаления проекта' });
    }
});

app.post('/api/sessions/terminate', authenticateToken, async (req, res) => {
    try {
        const { sessionToken } = req.body;
        const token = req.headers['authorization'].split(' ')[1];
        const sessions = await db.getSessionsByUserId(req.user.userId);

        const sessionToTerminate = sessions.find(s => s.token === sessionToken);
        if (!sessionToTerminate) {
            return res.status(403).json({ error: 'Нет доступа к этой сессии' });
        }

        if (sessionToken === token) {
            return res.status(400).json({ error: 'Используйте /api/logout для завершения текущей сессии' });
        }

        await db.deleteSession(sessionToTerminate.id);

        res.json({ success: true, message: 'Сессия завершена' });
    } catch (error) {
        console.error('[Terminate Session] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка при завершении сессии' });
    }
});

app.post('/api/logout', authenticateToken, async (req, res) => {
    try {
        const token = req.headers['authorization'].split(' ')[1];
        await db.deleteSessionByToken(token);

        res.json({ success: true, message: 'Вы успешно вышли' });
    } catch (error) {
        console.error('[Logout] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка при выходе' });
    }
});

app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await db.getApprovedReviews();
        res.json(reviews);
    } catch (error) {
        console.error('[Get Reviews] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка загрузки отзывов' });
    }
});

app.post('/api/reviews', async (req, res) => {
    try {
        const { name, email, rating, comment } = req.body;
        const newReview = {
            id: Date.now().toString(),
            name,
            email: email || null,
            rating: parseInt(rating),
            comment,
            approved: false
        };

        await db.createReview(newReview);

        res.json({
            success: true,
            message: 'Отзыв отправлен на модерацию'
        });
    } catch (error) {
        console.error('[Create Review] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка при отправке отзыва' });
    }
});

app.get('/api/templates', async (req, res) => {
    try {
        const templates = await db.getPublicTemplates();
        res.json(templates);
    } catch (error) {
        console.error('[Get Templates] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка загрузки шаблонов' });
    }
});

app.get('/api/templates/all', authenticateToken, async (req, res) => {
    try {
        const templates = await db.getAllTemplates();
        res.json(templates);
    } catch (error) {
        console.error('[Get All Templates] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка загрузки шаблонов' });
    }
});

app.get('/api/templates/:id', async (req, res) => {
    try {
        const template = await db.getTemplateById(req.params.id);
        if (!template) return res.status(404).json({ error: 'Шаблон не найден' });
        res.json(template);
    } catch (error) {
        console.error('[Get Template] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка загрузки шаблона' });
    }
});

app.post('/api/templates', authenticateToken, async (req, res) => {
    try {
        const { name, description, preview_image, elements, canvas_size, category, is_public } = req.body;
        const newTemplate = {
            id: Date.now().toString(),
            name,
            description,
            preview_image,
            elements: elements || {},
            canvas_size,
            category,
            is_public: is_public || false,
            created_by: req.user.userId
        };

        const template = await db.createTemplate(newTemplate);
        res.status(201).json({ success: true, template });
    } catch (error) {
        console.error('[Create Template] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка создания шаблона' });
    }
});

app.put('/api/templates/:id', authenticateToken, async (req, res) => {
    try {
        const templates = await db.getAllTemplates();
        const template = templates.find(t => t.id === req.params.id);
        if (!template) return res.status(404).json({ error: 'Шаблон не найден' });

        const allowedRoles = ['admin', 'developer'];
        if (!allowedRoles.includes(req.user.role) && template.created_by !== req.user.userId) {
            return res.status(403).json({ error: 'Недостаточно прав' });
        }

        const updated = await db.updateTemplate(req.params.id, req.body);
        res.json({ success: true, template: updated });
    } catch (error) {
        console.error('[Update Template] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка обновления шаблона' });
    }
});

app.delete('/api/templates/:id', authenticateToken, async (req, res) => {
    try {
        const template = await db.getTemplateById(req.params.id);
        if (!template) return res.status(404).json({ error: 'Шаблон не найден' });

        const allowedRoles = ['admin', 'developer'];
        if (!allowedRoles.includes(req.user.role) && template.created_by !== req.user.userId) {
            return res.status(403).json({ error: 'Недостаточно прав' });
        }

        await db.deleteTemplate(req.params.id);
        res.json({ success: true, message: 'Шаблон удален' });
    } catch (error) {
        console.error('[Delete Template] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка удаления шаблона' });
    }
});

app.get('/api/settings', authenticateToken, async (req, res) => {
    try {
        let settings = await db.getUserSettings(req.user.userId);
        if (!settings) {
            settings = await db.createUserSettings({
                id: Date.now().toString(),
                user_id: req.user.userId
            });
        }
        res.json(settings);
    } catch (error) {
        console.error('[Get Settings] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка загрузки настроек' });
    }
});

app.put('/api/settings', authenticateToken, async (req, res) => {
    try {
        let settings = await db.getUserSettings(req.user.userId);
        if (!settings) {
            settings = await db.createUserSettings({
                id: Date.now().toString(),
                user_id: req.user.userId
            });
        }

        const updated = await db.updateUserSettings(req.user.userId, req.body);
        res.json({ success: true, settings: updated });
    } catch (error) {
        console.error('[Update Settings] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка обновления настроек' });
    }
});

app.get('/api/projects/:id/versions', authenticateToken, async (req, res) => {
    try {
        const projects = await db.getProjectsByUserId(req.user.userId);
        const project = projects.find(p => p.id === req.params.id);
        if (!project) return res.status(404).json({ error: 'Проект не найден' });

        const versions = await db.getProjectVersions(req.params.id);
        res.json(versions);
    } catch (error) {
        console.error('[Get Project Versions] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка загрузки версий проекта' });
    }
});

app.post('/api/projects/:id/versions', authenticateToken, async (req, res) => {
    try {
        const projects = await db.getProjectsByUserId(req.user.userId);
        const project = projects.find(p => p.id === req.params.id);
        if (!project) return res.status(404).json({ error: 'Проект не найден' });

        const latest = await db.getLatestProjectVersion(req.params.id);
        const nextVersion = latest ? latest.version + 1 : 1;

        const newVersion = {
            id: Date.now().toString(),
            project_id: req.params.id,
            version: nextVersion,
            elements: project.elements,
            comment: req.body.comment || `Версия ${nextVersion}`
        };

        const version = await db.createProjectVersion(newVersion);
        res.status(201).json({ success: true, version });
    } catch (error) {
        console.error('[Create Project Version] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка создания версии проекта' });
    }
});

app.get('/api/projects/:projectId/versions/:versionId', authenticateToken, async (req, res) => {
    try {
        const projects = await db.getProjectsByUserId(req.user.userId);
        const project = projects.find(p => p.id === req.params.projectId);
        if (!project) return res.status(404).json({ error: 'Проект не найден' });

        const version = await db.getProjectVersionById(req.params.versionId);
        if (!version) return res.status(404).json({ error: 'Версия не найдена' });

        if (version.project_id !== req.params.projectId) {
            return res.status(404).json({ error: 'Версия не принадлежит проекту' });
        }

        res.json(version);
    } catch (error) {
        console.error('[Get Project Version] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка загрузки версии проекта' });
    }
});

app.post('/api/projects/:projectId/versions/:versionId/restore', authenticateToken, async (req, res) => {
    try {
        const projects = await db.getProjectsByUserId(req.user.userId);
        const project = projects.find(p => p.id === req.params.projectId);
        if (!project) return res.status(404).json({ error: 'Проект не найден' });

        const version = await db.getProjectVersionById(req.params.versionId);
        if (!version) return res.status(404).json({ error: 'Версия не найдена' });

        if (version.project_id !== req.params.projectId) {
            return res.status(404).json({ error: 'Версия не принадлежит проекту' });
        }

        const updated = await db.updateProject(req.params.projectId, { elements: version.elements });
        res.json({ success: true, message: 'Версия восстановлена', project: updated });
    } catch (error) {
        console.error('[Restore Project Version] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка восстановления версии проекта' });
    }
});

app.delete('/api/projects/:projectId/versions/:versionId', authenticateToken, async (req, res) => {
    try {
        const projects = await db.getProjectsByUserId(req.user.userId);
        const project = projects.find(p => p.id === req.params.projectId);
        if (!project) return res.status(404).json({ error: 'Проект не найден' });

        const version = await db.getProjectVersionById(req.params.versionId);
        if (!version || version.project_id !== req.params.projectId) {
            return res.status(404).json({ error: 'Версия не найдена' });
        }

        await db.deleteProjectVersion(req.params.versionId);
        res.json({ success: true, message: 'Версия удалена' });
    } catch (error) {
        console.error('[Delete Project Version] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка удаления версии проекта' });
    }
});

app.get('/api/admin/reviews', requireAdminAuth, async (req, res) => {
    try {
        const reviews = await db.getAllReviews();
        res.json(reviews);
    } catch (error) {
        console.error('[Get All Reviews] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка загрузки отзывов' });
    }
});

app.post('/api/admin/reviews/:id/approve', requireAdminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        await db.updateReview(id, { approved: true });
        res.json({ success: true, message: 'Отзыв одобрен' });
    } catch (error) {
        console.error('[Approve Review] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка при одобрении отзыва' });
    }
});

app.delete('/api/admin/reviews/:id', requireAdminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        await db.deleteReview(id);
        res.json({ success: true, message: 'Отзыв удален' });
    } catch (error) {
        console.error('[Delete Review] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка при удалении отзыва' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/main/index.html'));
});

app.get('/editor', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/editor/index.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/profile/index.html'));
});

app.get('/reviews', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/reviews/index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/about/index.html'));
});

app.get('/support', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/support/index.html'));
});

app.get('/docs', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/docs/index.html'));
});

app.get('/conditions', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/conditions/index.html'));
});

app.get('/confidentiality', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/confidentiality/index.html'));
});

app.get('/404', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../frontend/404/index.html'));
});

app.get('/500', (req, res) => {
    res.status(500).sendFile(path.join(__dirname, '../frontend/500/index.html'));
});

function requireAdminAuth(req, res, next) {
    if (req.session && req.session.adminId) {
        return next();
    }
    res.redirect('/admin/login');
}

function requirePermission(resource, action) {
    return (req, res, next) => {
        const userRole = req.session.adminRole;
        const userId = req.session.adminId;

        if (!userRole) {
            return res.status(403).json({ error: 'Роль не определена' });
        }

        const permission = hasPermission(userRole, resource, action);

        if (permission === true) {
            return next();
        }

        if (permission === 'own') {
            const resourceId = req.params.id || req.body.ownerId || req.query.ownerId;
            if (resourceId && isOwner(userId, resourceId)) {
                return next();
            }
            return res.status(403).json({ error: 'Доступ только к своим ресурсам' });
        }

        return res.status(403).json({
            error: 'Недостаточно прав',
            required: `${resource}.${action}`,
            yourRole: userRole
        });
    };
}

function requireDeveloper(req, res, next) {
    if (req.session.adminRole === USER_ROLES.DEVELOPER) {
        return next();
    }
    res.status(403).json({ error: 'Доступно только разработчикам' });
}

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

        const user = await db.getUserByEmail(email);

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

        const allowedRoles = [USER_ROLES.DEVELOPER, USER_ROLES.MODERATOR, 'admin'];
        if (!allowedRoles.includes(user.role)) {
            console.log('[Admin Login] Недостаточно прав, роль:', user.role);
            return res.render('admin-login', { error: 'Доступ запрещён. Недостаточно прав.' });
        }

        req.session.adminId = user.id;
        req.session.adminEmail = user.email;
        req.session.adminRole = user.role;
        req.session.adminName = user.name;

        console.log('[Admin Login] Успешный вход, session ID:', req.sessionID, 'Роль:', user.role);

        res.redirect('/admin');
    } catch (error) {
        console.error('[Admin Login] Ошибка:', error);
        res.render('admin-login', { error: 'Ошибка при входе' });
    }
});

app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

app.get('/admin', requireAdminAuth, async (req, res) => {
    try {
        const stats = await db.getStats();

        const currentAdmin = {
            id: req.session.adminId,
            name: req.session.adminName,
            email: req.session.adminEmail,
            role: req.session.adminRole,
            roleDisplay: req.session.adminRole === USER_ROLES.DEVELOPER ? 'Разработчик' :
                req.session.adminRole === USER_ROLES.MODERATOR ? 'Модератор' : 'Администратор'
        };

        res.render('admin-layout', {
            title: 'Главная',
            currentPage: 'dashboard',
            stats: stats,
            port: PORT,
            currentAdmin: currentAdmin
        });
    } catch (error) {
        console.error('[Admin Dashboard] Ошибка:', error);
        res.status(500).send('Ошибка сервера');
    }
});

app.get('/admin/users', requireAdminAuth, async (req, res) => {
    try {
        const users = await db.getAllUsers();
        const usersWithoutPassword = users.map(u => {
            const { password, ...rest } = u;
            return rest;
        });

        function getRoleDisplay(role, roleDisplay) {
            if (roleDisplay) return roleDisplay;
            if (role === USER_ROLES.DEVELOPER) return 'Разработчик';
            if (role === USER_ROLES.MODERATOR) return 'Модератор';
            if (role === 'admin') return 'Администратор';
            return 'Пользователь';
        }

        const canManageUsers = req.session.adminRole === USER_ROLES.DEVELOPER;
        const currentUserId = req.session.adminId;

        const body = `
            <div class="card">
                <div class="card-header-flex">
                    <h3><i class="fas fa-users"></i> Пользователи (${users.length})</h3>
                    ${canManageUsers ? `
                        <a href="/admin/users/create" class="btn btn-primary">
                            <i class="fas fa-user-plus"></i> Добавить пользователя
                        </a>
                    ` : ''}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Имя</th>
                            <th>Email</th>
                            <th>Роль</th>
                            <th>Дата регистрации</th>
                            ${canManageUsers ? '<th>Действия</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${usersWithoutPassword.map(u => {
                            const isCurrentUser = u.id === currentUserId;
                            return `
                            <tr>
                                <td>${u.id}</td>
                                <td>${u.name}</td>
                                <td>${u.email}</td>
                                <td><span class="badge badge-${u.role || 'user'}">${getRoleDisplay(u.role, u.role_display)}</span></td>
                                <td>${new Date(u.created_at).toLocaleDateString('ru-RU')}</td>
                                ${canManageUsers ? `
                                    <td>
                                        ${isCurrentUser ? `
                                            <span class="badge badge-warning" style="cursor: default;">
                                                <i class="fas fa-lock"></i> Ваш аккаунт
                                            </span>
                                        ` : `
                                            <a href="/admin/users/edit/${u.id}" class="btn btn-primary"><i class="fas fa-edit"></i></a>
                                            <form method="POST" action="/admin/users/delete/${u.id}" style="display: inline;" onsubmit="return confirm('Удалить пользователя ${u.name}?')">
                                                <button type="submit" class="btn btn-danger"><i class="fas fa-trash"></i></button>
                                            </form>
                                        `}
                                    </td>
                                ` : ''}
                            </tr>
                        `}).join('')}
                    </tbody>
                </table>
            </div>
        `;

        const currentAdmin = {
            id: req.session.adminId,
            name: req.session.adminName,
            email: req.session.adminEmail,
            role: req.session.adminRole,
            roleDisplay: req.session.adminRole === USER_ROLES.DEVELOPER ? 'Разработчик' :
                req.session.adminRole === USER_ROLES.MODERATOR ? 'Модератор' : 'Администратор'
        };

        res.render('admin-layout', {
            title: 'Пользователи',
            currentPage: 'users',
            body: body,
            currentAdmin: currentAdmin
        });
    } catch (error) {
        console.error('[Admin Users] Ошибка:', error);
        res.status(500).send('Ошибка сервера');
    }
});

app.post('/admin/users/delete/:id', requireAdminAuth, requireDeveloper, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await db.getUserById(id);

        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        if (id === req.session.adminId) {
            return res.status(403).json({ error: 'Нельзя удалить свой аккаунт' });
        }

        if (user.role === 'developer') {
            return res.status(403).json({ error: 'Нельзя удалить аккаунт разработчика' });
        }

        await db.deleteUser(id);

        console.log(`[Admin] Пользователь удалён: ${user.email} (${id})`);

        res.redirect('/admin/users');
    } catch (error) {
        console.error('[Delete User] Ошибка:', error);
        res.status(500).send('Ошибка при удалении пользователя');
    }
});

app.post('/api/admin/users', requireAdminAuth, requireDeveloper, async (req, res) => {
    try {
        const { name, email, password, role, country } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'Все обязательные поля должны быть заполнены' });
        }

        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email уже используется' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password: hashedPassword,
            role: role || 'user',
            role_display: role === 'developer' ? 'Разработчик' :
                role === 'moderator' ? 'Модератор' :
                    role === 'admin' ? 'Администратор' : 'Пользователь',
            theme: 'dark',
            country: country || 'ru'
        };

        await db.createUser(newUser);

        res.status(201).json({
            success: true,
            message: 'Пользователь успешно создан',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('[Create User] Ошибка:', error);
        res.status(500).json({ error: 'Ошибка при создании пользователя' });
    }
});

app.get('/admin/profile', requireAdminAuth, async (req, res) => {
    try {
        const admin = await db.getUserById(req.session.adminId);

        if (!admin) {
            return res.redirect('/admin/login');
        }

        const adminData = {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role || 'admin',
            roleDisplay: admin.role_display || (
                admin.role === USER_ROLES.DEVELOPER ? 'Разработчик' :
                    admin.role === USER_ROLES.MODERATOR ? 'Модератор' :
                        'Администратор'
            ),
            theme: admin.theme || 'dark',
            country: admin.country || 'ru',
            createdAt: admin.created_at
        };

        const currentAdmin = {
            id: req.session.adminId,
            name: req.session.adminName,
            email: req.session.adminEmail,
            role: req.session.adminRole,
            roleDisplay: adminData.roleDisplay
        };

        res.render('admin-layout', {
            title: 'Профиль',
            currentPage: 'profile',
            adminData: adminData,
            currentAdmin: currentAdmin
        });
    } catch (error) {
        console.error('[Admin Profile] Ошибка:', error);
        res.status(500).send('Ошибка сервера');
    }
});

app.get('/admin/projects', requireAdminAuth, async (req, res) => {
    try {
        const projects = await db.getAllProjectsAdmin();
        const users = await db.getAllUsers();

        const projectsWithUsers = projects.map(project => {
            const user = users.find(u => u.id === project.user_id);
            return {
                ...project,
                user_name: user ? user.name : 'Неизвестно',
                user_email: user ? user.email : 'Неизвестно'
            };
        });

        const body = `
            <div class="card">
                <div class="card-header-flex">
                    <h3><i class="fas fa-folder"></i> Проекты (${projects.length})</h3>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название</th>
                            <th>Владелец</th>
                            <th>Email</th>
                            <th>Дата создания</th>
                            <th>Обновлен</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${projectsWithUsers.map(p => `
                            <tr>
                                <td>${p.id}</td>
                                <td>${p.name}</td>
                                <td>${p.user_name}</td>
                                <td>${p.user_email}</td>
                                <td>${new Date(p.created_at).toLocaleDateString('ru-RU')}</td>
                                <td>${new Date(p.updated_at).toLocaleDateString('ru-RU')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        const currentAdmin = {
            id: req.session.adminId,
            name: req.session.adminName,
            email: req.session.adminEmail,
            role: req.session.adminRole,
            roleDisplay: req.session.adminRole === USER_ROLES.DEVELOPER ? 'Разработчик' :
                req.session.adminRole === USER_ROLES.MODERATOR ? 'Модератор' : 'Администратор'
        };

        res.render('admin-layout', {
            title: 'Проекты',
            currentPage: 'projects',
            body: body,
            currentAdmin: currentAdmin
        });
    } catch (error) {
        console.error('[Admin Projects] Ошибка:', error);
        res.status(500).send('Ошибка сервера');
    }
});

app.get('/admin/sessions', requireAdminAuth, async (req, res) => {
    try {
        const sessions = await db.getAllSessionsWithUsers();

        const body = `
            <div class="card">
                <div class="card-header-flex">
                    <h3><i class="fas fa-clock"></i> Активные сессии (${sessions.length})</h3>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Пользователь</th>
                            <th>Устройство</th>
                            <th>IP</th>
                            <th>Местоположение</th>
                            <th>Создана</th>
                            <th>Активна</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sessions.map(s => `
                            <tr>
                                <td>${s.id.substring(0, 8)}...</td>
                                <td>${s.user_name || 'Неизвестно'} (${s.user_email || 'N/A'})</td>
                                <td>${s.device || 'N/A'}</td>
                                <td>${s.ip || 'N/A'}</td>
                                <td>${s.location || 'N/A'}</td>
                                <td>${new Date(s.created_at).toLocaleString('ru-RU')}</td>
                                <td>${new Date(s.last_active).toLocaleString('ru-RU')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        const currentAdmin = {
            id: req.session.adminId,
            name: req.session.adminName,
            email: req.session.adminEmail,
            role: req.session.adminRole,
            roleDisplay: req.session.adminRole === USER_ROLES.DEVELOPER ? 'Разработчик' :
                req.session.adminRole === USER_ROLES.MODERATOR ? 'Модератор' : 'Администратор'
        };

        res.render('admin-layout', {
            title: 'Сессии',
            currentPage: 'sessions',
            body: body,
            currentAdmin: currentAdmin
        });
    } catch (error) {
        console.error('[Admin Sessions] Ошибка:', error);
        res.status(500).send('Ошибка сервера');
    }
});

app.get('/admin/reviews', requireAdminAuth, async (req, res) => {
    try {
        const reviews = await db.getAllReviews();
        const canModerate = req.session.adminRole === USER_ROLES.DEVELOPER || 
                           req.session.adminRole === USER_ROLES.MODERATOR;

        const body = `
            <div class="card">
                <div class="card-header-flex">
                    <h3><i class="fas fa-comments"></i> Отзывы (${reviews.length})</h3>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Имя</th>
                            <th>Email</th>
                            <th>Рейтинг</th>
                            <th>Комментарий</th>
                            <th>Статус</th>
                            <th>Дата</th>
                            ${canModerate ? '<th>Действия</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${reviews.map(r => `
                            <tr>
                                <td>${r.id}</td>
                                <td>${r.name}</td>
                                <td>${r.email || 'N/A'}</td>
                                <td>${'⭐'.repeat(r.rating)}</td>
                                <td>${r.comment || 'N/A'}</td>
                                <td>
                                    ${r.approved 
                                        ? '<span class="badge badge-success"><i class="fas fa-check"></i> Одобрено</span>' 
                                        : '<span class="badge badge-warning"><i class="fas fa-clock"></i> На модерации</span>'}
                                </td>
                                <td>${new Date(r.created_at).toLocaleString('ru-RU')}</td>
                                ${canModerate ? `
                                    <td>
                                        ${!r.approved ? `
                                            <button class="btn btn-success btn-sm" onclick="approveReview('${r.id}')">
                                                <i class="fas fa-check"></i>
                                            </button>
                                        ` : ''}
                                        <button class="btn btn-danger btn-sm" onclick="deleteReview('${r.id}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                ` : ''}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            ${canModerate ? `
            <script>
                async function approveReview(id) {
                    try {
                        const response = await fetch('/api/admin/reviews/' + id + '/approve', {
                            method: 'POST'
                        });
                        if (response.ok) {
                            location.reload();
                        }
                    } catch (error) {
                        alert('Ошибка при одобрении отзыва');
                    }
                }
                
                async function deleteReview(id) {
                    if (!confirm('Удалить этот отзыв?')) return;
                    
                    try {
                        const response = await fetch('/api/admin/reviews/' + id, {
                            method: 'DELETE'
                        });
                        if (response.ok) {
                            location.reload();
                        }
                    } catch (error) {
                        alert('Ошибка при удалении отзыва');
                    }
                }
            </script>
            ` : ''}
        `;

        const currentAdmin = {
            id: req.session.adminId,
            name: req.session.adminName,
            email: req.session.adminEmail,
            role: req.session.adminRole,
            roleDisplay: req.session.adminRole === USER_ROLES.DEVELOPER ? 'Разработчик' :
                req.session.adminRole === USER_ROLES.MODERATOR ? 'Модератор' : 'Администратор'
        };

        res.render('admin-layout', {
            title: 'Отзывы',
            currentPage: 'reviews',
            body: body,
            currentAdmin: currentAdmin
        });
    } catch (error) {
        console.error('[Admin Reviews] Ошибка:', error);
        res.status(500).send('Ошибка сервера');
    }
});

app.get('/api/health', async (req, res) => {
    try {
        const dbConnected = await db.testConnection();
        res.json({
            status: 'ok',
            timestamp: Date.now(),
            database: dbConnected ? 'connected' : 'disconnected'
        });
    } catch (error) {
        res.json({
            status: 'ok',
            timestamp: Date.now(),
            database: 'unknown'
        });
    }
});

async function startServer() {
    try {
        const dbConnected = await db.testConnection();
        
        if (dbConnected) {
            console.log('Создание таблиц...');
            await db.initDatabase();
        } else {
            console.log('\n PostgreSQL не подключен. Запуск без базы данных...\n');
        }

        app.listen(PORT, () => {
            console.log('MiruFlow Server запущен!');
            console.log(`Локальный URL:  http://localhost:${PORT}`);
            console.log('Админ-панель:   http://localhost:' + PORT + '/admin');
            console.log('База данных:    ' + (dbConnected ? 'PostgreSQL ✅' : 'Не подключена ') + ' ');
            console.log('');
        });
    } catch (error) {
        console.error('Ошибка запуска сервера:', error);
        process.exit(1);
    }
}

startServer();
