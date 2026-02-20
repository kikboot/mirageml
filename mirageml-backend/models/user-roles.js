// Роли пользователей в системе
const USER_ROLES = {
    DEVELOPER: 'developer',
    MODERATOR: 'moderator',
    USER: 'user'
};

// Права доступа для каждой роли
const ROLE_PERMISSIONS = {
    [USER_ROLES.DEVELOPER]: {
        // Полный доступ ко всем ресурсам
        users: { read: true, create: true, update: true, delete: true },
        projects: { read: true, create: true, update: true, delete: true },
        sessions: { read: true, create: true, update: true, delete: true },
        reviews: { read: true, create: true, update: true, delete: true, approve: true },
        dashboard: { read: true },
        profile: { read: true, update: true, changePassword: true }
    },
    [USER_ROLES.MODERATOR]: {
        // Ограниченный доступ
        users: { read: true, create: false, update: false, delete: false },
        projects: { read: true, create: true, update: 'own', delete: 'own' },
        sessions: { read: true, create: false, update: false, delete: 'own' },
        reviews: { read: true, create: false, update: false, delete: false, approve: true },
        dashboard: { read: true },
        profile: { read: true, update: true, changePassword: true }
    },
    [USER_ROLES.USER]: {
        // Базовый доступ пользователя
        users: { read: false, create: false, update: false, delete: false },
        projects: { read: 'own', create: true, update: 'own', delete: 'own' },
        sessions: { read: 'own', create: false, update: false, delete: 'own' },
        reviews: { read: true, create: true, update: false, delete: false },
        dashboard: { read: false },
        profile: { read: true, update: true, changePassword: true }
    }
};

// Проверка прав доступа
function hasPermission(role, resource, action) {
    const permissions = ROLE_PERMISSIONS[role];
    if (!permissions) return false;
    
    const resourcePermissions = permissions[resource];
    if (!resourcePermissions) return false;
    
    const permission = resourcePermissions[action];
    
    // Если true - разрешено всегда
    if (permission === true) return true;
    
    // Если 'own' - нужно проверять владение
    if (permission === 'own') return 'own';
    
    // Если false - запрещено
    return false;
}

// Проверка владения ресурсом
function isOwner(userId, resourceOwnerId) {
    return userId === resourceOwnerId;
}

module.exports = {
    USER_ROLES,
    ROLE_PERMISSIONS,
    hasPermission,
    isOwner
};
