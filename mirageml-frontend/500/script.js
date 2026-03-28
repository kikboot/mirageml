document.addEventListener('DOMContentLoaded', () => {
    initAnimations();

    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
        retryBtn.addEventListener('click', handleRetry);
    }

    checkAuthStatus();
});

function initAnimations() {
    const elements = document.querySelectorAll('.error-code, .error-title, .error-subtitle, .error-status, .error-actions, .error-info, .error-contact');
    
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 150);
    });
}

async function handleRetry() {
    const retryBtn = document.getElementById('retry-btn');
    const originalContent = retryBtn.innerHTML;
    
    retryBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Проверка...</span>';
    retryBtn.disabled = true;

    try {
        const response = await fetch('../main/index.html', {
            method: 'HEAD',
            cache: 'no-cache'
        });

        if (response.ok) {
            retryBtn.innerHTML = '<i class="fas fa-check"></i><span>Сервер доступен!</span>';
            retryBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';

            setTimeout(() => {
                window.location.href = '../main/index.html';
            }, 1000);
        } else {
            retryBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>Проблемы сохраняются</span>';
            retryBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';

            setTimeout(() => {
                retryBtn.innerHTML = originalContent;
                retryBtn.disabled = false;
                retryBtn.style.background = '';
            }, 2000);
        }
    } catch (error) {
        retryBtn.innerHTML = '<i class="fas fa-times"></i><span>Нет соединения</span>';
        retryBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';

        setTimeout(() => {
            retryBtn.innerHTML = originalContent;
            retryBtn.disabled = false;
            retryBtn.style.background = '';
        }, 2000);
    }
}

document.addEventListener('mousemove', (e) => {
    const shapes = document.querySelectorAll('.shape');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    shapes.forEach((shape, index) => {
        const speed = 0.02 + (index * 0.01);
        const x = (mouseX - 0.5) * speed * 50;
        const y = (mouseY - 0.5) * speed * 50;

        shape.style.transform = `translate(${x}px, ${y}px)`;
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.location.href = '../main/index.html';
    }

    if (e.key === 'h' || e.key === 'H') {
        window.location.href = '../main/index.html';
    }

    if (e.key === 's' || e.key === 'S') {
        window.location.href = '../support/index.html';
    }

    if (e.key === 'r' || e.key === 'R') {
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn && !retryBtn.disabled) {
            retryBtn.click();
        }
    }
});

async function checkAuthStatus() {
    let token = localStorage.getItem('token');
    if (!token) {
        token = sessionStorage.getItem('token');
    }

    if (!token) {
        showProfileButton();
        return;
    }

    try {
        const response = await fetch('http://localhost:3001/api/profile', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const user = await response.json();
            updateAuthUI(user);
        } else {
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            showProfileButton();
        }
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        showProfileButton();
    }
}

function showProfileButton() {
    const authButtons = document.querySelector('.auth-buttons');

    if (authButtons) {
        authButtons.innerHTML = `
            <a href="../profile/index.html" class="btn btn-ghost">
                <i class="fas fa-user"></i>
                <span>Профиль</span>
            </a>
        `;
    }
}

function updateAuthUI(user) {
    const authButtons = document.querySelector('.auth-buttons');

    if (!authButtons) return;

    const userInitials = getInitials(user.name);

    authButtons.innerHTML = `
        <div class="user-menu">
            <button class="user-avatar" aria-label="Меню пользователя" aria-haspopup="true" aria-expanded="false">
                ${userInitials}
            </button>
            <div class="dropdown-content" role="menu">
                <div class="dropdown-header">
                    <div class="dropdown-avatar">${userInitials}</div>
                    <div class="dropdown-user-info">
                        <div class="dropdown-user-name">${user.name}</div>
                        <div class="dropdown-user-email">${user.email}</div>
                    </div>
                </div>
                <div class="dropdown-divider"></div>
                <a href="../main/index.html" class="dropdown-item" role="menuitem">
                    <i class="fas fa-home"></i> Главная
                </a>
                <a href="../profile/index.html" class="dropdown-item" role="menuitem">
                    <i class="fas fa-user"></i> Профиль
                </a>
                <a href="../main/index.html#reviews" class="dropdown-item" role="menuitem">
                    <i class="fas fa-comment"></i> Отзывы
                </a>
                <a href="../support/index.html" class="dropdown-item" role="menuitem">
                    <i class="fas fa-headset"></i> Поддержка
                </a>
                <div class="dropdown-divider"></div>
                <button id="logout-btn" class="dropdown-item" role="menuitem">
                    <i class="fas fa-sign-out-alt"></i> Выйти
                </button>
            </div>
        </div>
    `;

    initUserMenu();

    document.getElementById('logout-btn')?.addEventListener('click', logout);
}

function initUserMenu() {
    const userMenus = document.querySelectorAll('.user-menu');

    userMenus.forEach(userMenu => {
        const avatarBtn = userMenu.querySelector('.user-avatar');
        const dropdownContent = userMenu.querySelector('.dropdown-content');

        if (!avatarBtn || !dropdownContent) return;

        let closeTimeout;
        let isOpen = false;

        const openMenu = () => {
            clearTimeout(closeTimeout);
            dropdownContent.style.opacity = '1';
            dropdownContent.style.visibility = 'visible';
            dropdownContent.style.transform = 'translateY(0)';
            avatarBtn.setAttribute('aria-expanded', 'true');
            avatarBtn.classList.add('active');
            isOpen = true;
        };

        const closeMenu = () => {
            closeTimeout = setTimeout(() => {
                dropdownContent.style.opacity = '0';
                dropdownContent.style.visibility = 'hidden';
                dropdownContent.style.transform = 'translateY(-10px)';
                avatarBtn.setAttribute('aria-expanded', 'false');
                avatarBtn.classList.remove('active');
                isOpen = false;
            }, 300);
        };

        avatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        document.addEventListener('click', () => {
            if (isOpen) {
                closeMenu();
            }
        });

        dropdownContent.addEventListener('mouseenter', () => {
            clearTimeout(closeTimeout);
        });

        dropdownContent.addEventListener('mouseleave', () => {
            closeMenu();
        });
    });
}

async function logout() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        await fetch('http://localhost:3001/api/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Ошибка при выходе:', error);
    }

    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setTimeout(() => window.location.reload(), 1000);
}

function getInitials(name) {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}
