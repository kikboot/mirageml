const USER_ROLES = {
    DEVELOPER: 'developer',
    MODERATOR: 'moderator',
    USER: 'user'
};

const ROLE_PERMISSIONS = {
    [USER_ROLES.DEVELOPER]: {
        users: { read: true, create: true, update: true, delete: true },
        projects: { read: true, create: true, update: true, delete: true },
        sessions: { read: true, create: true, update: true, delete: true },
        reviews: { read: true, create: true, update: true, delete: true, approve: true },
        dashboard: { read: true },
        profile: { read: true, update: true, changePassword: true }
    },
    [USER_ROLES.MODERATOR]: {
        users: { read: true, create: false, update: false, delete: false },
        projects: { read: true, create: true, update: 'own', delete: 'own' },
        sessions: { read: true, create: false, update: false, delete: 'own' },
        reviews: { read: true, create: false, update: false, delete: false, approve: true },
        dashboard: { read: true },
        profile: { read: true, update: true, changePassword: true }
    },
    [USER_ROLES.USER]: {
        users: { read: false, create: false, update: false, delete: false },
        projects: { read: 'own', create: true, update: 'own', delete: 'own' },
        sessions: { read: 'own', create: false, update: false, delete: 'own' },
        reviews: { read: true, create: true, update: false, delete: false },
        dashboard: { read: false },
        profile: { read: true, update: true, changePassword: true }
    }
};

function hasPermission(role, resource, action) {
    const permissions = ROLE_PERMISSIONS[role];
    if (!permissions) return false;
    
    const resourcePermissions = permissions[resource];
    if (!resourcePermissions) return false;
    
    const permission = resourcePermissions[action];
    
    if (permission === true) return true;
    
    if (permission === 'own') return 'own';
    
    return false;
}

function isOwner(userId, resourceOwnerId) {
    return userId === resourceOwnerId;
}

module.exports = {
    USER_ROLES,
    ROLE_PERMISSIONS,
    hasPermission,
    isOwner
};
