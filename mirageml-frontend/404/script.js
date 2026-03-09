document.addEventListener('DOMContentLoaded', () => {
    // Анимация появления элементов
    initAnimations();

    // Добавляем интерактивность для плавающих элементов
    initFloatingElements();

    // Проверка авторизации
    checkAuthStatus();
});

function initAnimations() {
    const elements = document.querySelectorAll('.error-code, .error-title, .error-subtitle, .error-actions, .error-suggestions');
    
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

function initFloatingElements() {
    const floatElements = document.querySelectorAll('.float-element');
    
    floatElements.forEach((element, index) => {
        const duration = 3 + Math.random() * 2;
        const delay = Math.random() * 2;
        
        element.style.animationDuration = `${duration}s`;
        element.style.animationDelay = `${delay}s`;
    });
}

// Добавляем эффект параллакса при движении мыши
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

// Обработка клавиатуры для быстрой навигации
document.addEventListener('keydown', (e) => {
    // Escape - вернуться на главную
    if (e.key === 'Escape') {
        window.location.href = '../main/index.html';
    }
    
    // H - главная
    if (e.key === 'h' || e.key === 'H') {
        window.location.href = '../main/index.html';
    }
    
    // S - поддержка
    if (e.key === 's' || e.key === 'S') {
        window.location.href = '../support/index.html';
    }
});

// ==========================================
// Управление авторизацией (из главной страницы)
// ==========================================

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
