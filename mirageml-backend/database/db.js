const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'mirageml',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

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
    const { id, name, email, password, role, role_display, theme, country, phone, avatar } = user;
    const result = await pool.query(
        `INSERT INTO users (id, name, email, password, role, role_display, theme, country, phone, avatar, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
         RETURNING *`,
        [id, name, email, password, role || 'user', role_display, theme || 'dark', country || 'ru', phone, avatar]
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
    const result = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
    return result.rows;
}

async function getApprovedReviews() {
    const result = await pool.query('SELECT * FROM reviews WHERE approved = true ORDER BY created_at DESC');
    return result.rows;
}

async function getReviewById(id) {
    const result = await pool.query('SELECT * FROM reviews WHERE id = $1', [id]);
    return result.rows[0] || null;
}

async function createReview(review) {
    const { id, name, email, rating, comment, approved } = review;
    const result = await pool.query(
        `INSERT INTO reviews (id, name, email, rating, comment, approved, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
         RETURNING *`,
        [id, name, email, rating, comment || null, approved || false]
    );
    return result.rows[0];
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

async function getStats() {
    const [
        totalUsers,
        totalProjects,
        totalSessions,
        totalReviews,
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
    getStats
};
