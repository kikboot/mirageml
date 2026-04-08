const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

let poolConfig;

if (process.env.DATABASE_URL) {
    poolConfig = {
        connectionString: process.env.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    };
} else {
    poolConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || 'mirageml',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    };
}

const pool = new Pool(poolConfig);

async function initDatabase() {
    try {
        const schema = fs.readFileSync(path.join(__dirname, '001_schema.sql'), 'utf8');
        await pool.query(schema);
        console.log('✅ Таблицы созданы');
        
        const additionalMigrations = [
            '002_initial_data.sql',
            '003_add_terms_accepted_at.sql',
            '004_add_new_tables.sql',
            '005_add_reviews_user_id.sql'
        ];
        
        for (const file of additionalMigrations) {
            const filePath = path.join(__dirname, file);
            if (fs.existsSync(filePath)) {
                const migration = fs.readFileSync(filePath, 'utf8');
                await pool.query(migration);
                console.log(`✅ ${file} выполнен`);
            }
        }
        
        return true;
    } catch (error) {
        console.error('Ошибка инициализации БД:', error.message);
        return false;
    }
}

async function testConnection() {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        console.log('PostgreSQL подключен:', result.rows[0].now);
        client.release();
        return true;
    } catch (error) {
        console.error('Ошибка подключения к PostgreSQL:', error.message);
        return false;
    }
}

async function getAllUsers() {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows;
}

async function getUserById(id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
}

async function getUserByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
}

async function createUser(user) {
    const { id, name, email, password, role, role_display, theme, country, phone, avatar, terms_accepted_at } = user;
    const result = await pool.query(
        `INSERT INTO users (id, name, email, password, role, role_display, theme, country, phone, avatar, terms_accepted_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
         RETURNING *`,
        [id, name, email, password, role || 'user', role_display, theme || 'dark', country || 'ru', phone, avatar, terms_accepted_at || null]
    );
    return result.rows[0];
}

async function updateUser(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(data)) {
        if (['name', 'email', 'password', 'role', 'role_display', 'theme', 'country', 'phone', 'avatar'].includes(key)) {
            fields.push(`${key} = $${paramIndex}`);
            values.push(value);
            paramIndex++;
        }
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
}

async function deleteUser(id) {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
}

async function getUsersByRole(role) {
    const result = await pool.query('SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC', [role]);
    return result.rows;
}

async function getUserCount() {
    const result = await pool.query('SELECT COUNT(*) FROM users');
    return parseInt(result.rows[0].count);
}

async function getAllProjects() {
    const result = await pool.query('SELECT * FROM projects ORDER BY updated_at DESC');
    return result.rows;
}

async function getAllProjectsAdmin() {
    const result = await pool.query(
        `SELECT id, user_id, name, created_at, updated_at
         FROM projects
         ORDER BY updated_at DESC`
    );
    return result.rows;
}

async function getProjectById(id) {
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    return result.rows[0] || null;
}

async function getProjectsByUserId(userId) {
    const result = await pool.query('SELECT * FROM projects WHERE user_id = $1 ORDER BY updated_at DESC', [userId]);
    return result.rows;
}

async function createProject(project) {
    const { id, user_id, name, elements, canvas_size } = project;
    const result = await pool.query(
        `INSERT INTO projects (id, user_id, name, elements, canvas_size, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [id, user_id, name, elements || {}, canvas_size || { width: 800, height: 600 }]
    );
    return result.rows[0];
}

async function updateProject(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(data)) {
        if (['name', 'elements', 'canvas_size'].includes(key)) {
            fields.push(`${key} = $${paramIndex}`);
            values.push(value);
            paramIndex++;
        }
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const query = `UPDATE projects SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
}

async function deleteProject(id) {
    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
}

async function getProjectCount() {
    const result = await pool.query('SELECT COUNT(*) FROM projects');
    return parseInt(result.rows[0].count);
}

async function getAllSessions() {
    const result = await pool.query('SELECT * FROM sessions ORDER BY last_active DESC');
    return result.rows;
}

async function getSessionById(id) {
    const result = await pool.query('SELECT * FROM sessions WHERE id = $1', [id]);
    return result.rows[0] || null;
}

async function getSessionByToken(token) {
    const result = await pool.query('SELECT * FROM sessions WHERE token = $1', [token]);
    return result.rows[0] || null;
}

async function getSessionsByUserId(userId) {
    const result = await pool.query('SELECT * FROM sessions WHERE user_id = $1 ORDER BY last_active DESC', [userId]);
    return result.rows;
}

async function createSession(session) {
    const { id, user_id, token, device, ip, location } = session;
    const result = await pool.query(
        `INSERT INTO sessions (id, user_id, token, device, ip, location, created_at, last_active)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [id, user_id, token, device, ip, location]
    );
    return result.rows[0];
}

async function updateSessionLastActive(id) {
    const result = await pool.query(
        'UPDATE sessions SET last_active = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
        [id]
    );
    return result.rows[0] || null;
}

async function deleteSession(id) {
    const result = await pool.query('DELETE FROM sessions WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
}

async function deleteSessionByToken(token) {
    const result = await pool.query('DELETE FROM sessions WHERE token = $1 RETURNING *', [token]);
    return result.rows[0] || null;
}

async function deleteSessionsByUserId(userId) {
    const result = await pool.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
    return result.rowCount;
}

async function getSessionCount() {
    const result = await pool.query('SELECT COUNT(*) FROM sessions');
    return parseInt(result.rows[0].count);
}

async function getAllReviews() {
    const result = await pool.query(`
        SELECT r.*, u.name as user_name, u.email as user_email
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
    `);
    return result.rows.map(row => ({
        ...row,
        createdAt: row.created_at
    }));
}

async function getApprovedReviews() {
    const result = await pool.query(`
        SELECT r.*, u.name as user_name, u.email as user_email
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.approved = true
        ORDER BY r.created_at DESC
    `);
    return result.rows.map(row => ({
        ...row,
        createdAt: row.created_at
    }));
}

async function getReviewById(id) {
    const result = await pool.query(`
        SELECT r.*, u.name as user_name, u.email as user_email
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.id = $1
    `, [id]);
    return result.rows[0] || null;
}

async function createReview(review) {
    const { id, name, email, rating, comment, approved, user_id } = review;
    const result = await pool.query(
        `INSERT INTO reviews (id, name, email, rating, comment, approved, user_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
         RETURNING *`,
        [id, name, email, rating, comment || null, approved || false, user_id || null]
    );
    const row = result.rows[0];
    return { ...row, createdAt: row.created_at };
}

async function updateReview(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(data)) {
        if (['name', 'email', 'rating', 'comment', 'approved'].includes(key)) {
            fields.push(`${key} = $${paramIndex}`);
            values.push(value);
            paramIndex++;
        }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `UPDATE reviews SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
}

async function deleteReview(id) {
    const result = await pool.query('DELETE FROM reviews WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
}

async function getReviewCount() {
    const result = await pool.query('SELECT COUNT(*) FROM reviews');
    return parseInt(result.rows[0].count);
}

async function getApprovedReviewCount() {
    const result = await pool.query('SELECT COUNT(*) FROM reviews WHERE approved = true');
    return parseInt(result.rows[0].count);
}

async function getPendingReviewCount() {
    const result = await pool.query('SELECT COUNT(*) FROM reviews WHERE approved = false');
    return parseInt(result.rows[0].count);
}

async function getUserRoleStats() {
    const result = await pool.query(`
        SELECT 
            role,
            COUNT(*) as count
        FROM users
        GROUP BY role
    `);
    
    const stats = {
        developer: 0,
        moderator: 0,
        admin: 0,
        user: 0
    };
    
    result.rows.forEach(row => {
        const role = row.role || 'user';
        stats[role] = parseInt(row.count);
    });
    
    return stats;
}

async function touchSession(sessionId) {
    const result = await pool.query(
        'UPDATE sessions SET last_active = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
        [sessionId]
    );
    return result.rows[0] || null;
}

async function getAllSessionsWithUsers() {
    const result = await pool.query(`
        SELECT 
            s.*,
            u.name as user_name,
            u.email as user_email
        FROM sessions s
        LEFT JOIN users u ON s.user_id = u.id
        ORDER BY s.last_active DESC
    `);
    return result.rows;
}

async function getAllTemplates() {
    const result = await pool.query('SELECT * FROM templates ORDER BY created_at DESC');
    return result.rows;
}

async function getPublicTemplates() {
    const result = await pool.query('SELECT * FROM templates WHERE is_public = true ORDER BY created_at DESC');
    return result.rows;
}

async function getTemplateById(id) {
    const result = await pool.query('SELECT * FROM templates WHERE id = $1', [id]);
    return result.rows[0] || null;
}

async function getTemplatesByCategory(category) {
    const result = await pool.query('SELECT * FROM templates WHERE category = $1 ORDER BY created_at DESC', [category]);
    return result.rows;
}

async function getTemplatesByUserId(userId) {
    const result = await pool.query('SELECT * FROM templates WHERE created_by = $1 ORDER BY created_at DESC', [userId]);
    return result.rows;
}

async function createTemplate(template) {
    const { id, name, description, preview_image, elements, canvas_size, category, is_public, created_by } = template;
    const result = await pool.query(
        `INSERT INTO templates (id, name, description, preview_image, elements, canvas_size, category, is_public, created_by, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
         RETURNING *`,
        [id, name, description || null, preview_image || null, elements || {}, canvas_size || { width: 800, height: 600 }, category || null, is_public || false, created_by || null]
    );
    return result.rows[0];
}

async function updateTemplate(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(data)) {
        if (['name', 'description', 'preview_image', 'elements', 'canvas_size', 'category', 'is_public'].includes(key)) {
            fields.push(`${key} = $${paramIndex}`);
            values.push(value);
            paramIndex++;
        }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `UPDATE templates SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
}

async function deleteTemplate(id) {
    const result = await pool.query('DELETE FROM templates WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
}

async function getTemplateCount() {
    const result = await pool.query('SELECT COUNT(*) FROM templates');
    return parseInt(result.rows[0].count);
}

async function getUserSettings(userId) {
    const result = await pool.query('SELECT * FROM user_settings WHERE user_id = $1', [userId]);
    return result.rows[0] || null;
}

async function createUserSettings(settings) {
    const { id, user_id, editor_grid_visible, editor_grid_size, auto_save, auto_save_interval, notifications_enabled, default_canvas_size, language } = settings;
    const result = await pool.query(
        `INSERT INTO user_settings (id, user_id, editor_grid_visible, editor_grid_size, auto_save, auto_save_interval, notifications_enabled, default_canvas_size, language, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
         RETURNING *`,
        [id, user_id, editor_grid_visible || false, editor_grid_size || 10, auto_save !== undefined ? auto_save : true, auto_save_interval || 60, notifications_enabled !== undefined ? notifications_enabled : true, default_canvas_size || { width: 800, height: 600 }, language || 'ru']
    );
    return result.rows[0];
}

async function updateUserSettings(userId, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(data)) {
        if (['editor_grid_visible', 'editor_grid_size', 'auto_save', 'auto_save_interval', 'notifications_enabled', 'default_canvas_size', 'language'].includes(key)) {
            fields.push(`${key} = $${paramIndex}`);
            values.push(value);
            paramIndex++;
        }
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `UPDATE user_settings SET ${fields.join(', ')} WHERE user_id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
}

async function deleteUserSettings(userId) {
    const result = await pool.query('DELETE FROM user_settings WHERE user_id = $1 RETURNING *', [userId]);
    return result.rows[0] || null;
}

async function getProjectVersions(projectId) {
    const result = await pool.query('SELECT * FROM project_versions WHERE project_id = $1 ORDER BY version DESC', [projectId]);
    return result.rows;
}

async function getProjectVersionById(id) {
    const result = await pool.query('SELECT * FROM project_versions WHERE id = $1', [id]);
    return result.rows[0] || null;
}

async function getLatestProjectVersion(projectId) {
    const result = await pool.query('SELECT * FROM project_versions WHERE project_id = $1 ORDER BY version DESC LIMIT 1', [projectId]);
    return result.rows[0] || null;
}

async function createProjectVersion(version) {
    const { id, project_id, version: ver, elements, comment } = version;
    const result = await pool.query(
        `INSERT INTO project_versions (id, project_id, version, elements, comment, created_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
         RETURNING *`,
        [id, project_id, ver, elements, comment || null]
    );
    return result.rows[0];
}

async function deleteProjectVersion(id) {
    const result = await pool.query('DELETE FROM project_versions WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
}

async function deleteProjectVersionsByProjectId(projectId) {
    const result = await pool.query('DELETE FROM project_versions WHERE project_id = $1', [projectId]);
    return result.rowCount;
}

async function getProjectVersionCount() {
    const result = await pool.query('SELECT COUNT(*) FROM project_versions');
    return parseInt(result.rows[0].count);
}

async function getUserSettingsCount() {
    const result = await pool.query('SELECT COUNT(*) FROM user_settings');
    return parseInt(result.rows[0].count);
}

async function getStats() {
    const [
        totalUsers,
        totalProjects,
        totalSessions,
        totalReviews,
        totalTemplates,
        totalVersions,
        developerCount,
        moderatorCount,
        adminCount,
        userCount,
        approvedReviews,
        pendingReviews
    ] = await Promise.all([
        getUserCount(),
        getProjectCount(),
        pool.query("SELECT COUNT(*) FROM sessions WHERE last_active > NOW() - INTERVAL '24 hours'")
            .then(r => parseInt(r.rows[0].count)),
        getReviewCount(),
        getTemplateCount(),
        getProjectVersionCount(),
        getUsersByRole('developer').then(users => users.length),
        getUsersByRole('moderator').then(users => users.length),
        getUsersByRole('admin').then(users => users.length),
        pool.query("SELECT COUNT(*) FROM users WHERE role IS NULL OR role = 'user'").then(r => parseInt(r.rows[0].count)),
        getApprovedReviewCount(),
        getPendingReviewCount()
    ]);

    return {
        totalUsers,
        totalProjects,
        totalSessions,
        totalReviews,
        totalTemplates,
        totalVersions,
        developerCount,
        moderatorCount,
        adminCount,
        userCount,
        approvedReviews,
        pendingReviews
    };
}

module.exports = {
    pool,
    initDatabase,
    testConnection,
    getAllUsers,
    getUserById,
    getUserByEmail,
    createUser,
    updateUser,
    deleteUser,
    getUsersByRole,
    getUserCount,
    getUserRoleStats,
    getAllProjects,
    getAllProjectsAdmin,
    getProjectById,
    getProjectsByUserId,
    createProject,
    updateProject,
    deleteProject,
    getProjectCount,
    getAllSessions,
    getSessionById,
    getSessionByToken,
    getSessionsByUserId,
    createSession,
    updateSessionLastActive,
    deleteSession,
    deleteSessionByToken,
    deleteSessionsByUserId,
    getSessionCount,
    getAllSessionsWithUsers,
    touchSession,
    getAllReviews,
    getApprovedReviews,
    getReviewById,
    createReview,
    updateReview,
    deleteReview,
    getReviewCount,
    getApprovedReviewCount,
    getPendingReviewCount,
    getAllTemplates,
    getPublicTemplates,
    getTemplateById,
    getTemplatesByCategory,
    getTemplatesByUserId,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateCount,
    getUserSettings,
    createUserSettings,
    updateUserSettings,
    deleteUserSettings,
    getProjectVersions,
    getProjectVersionById,
    getLatestProjectVersion,
    createProjectVersion,
    deleteProjectVersion,
    deleteProjectVersionsByProjectId,
    getProjectVersionCount,
    getUserSettingsCount,
    getStats
};
