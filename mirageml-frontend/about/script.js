document.addEventListener('DOMContentLoaded', () => {
    const startProjectBtn = document.getElementById('start-project-btn');
    const learnMoreBtn = document.getElementById('learn-more-btn');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenuContainer = document.querySelector('.mobile-menu-container');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');

    checkAuthStatus();

    initMobileMenu();

    if (startProjectBtn) {
        startProjectBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const token = localStorage.getItem('token');
            if (token) {
                window.location.href = '../editor/index.html';
            } else {
                window.location.href = '../main/index.html#login';
            }
        });
    }

    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '#story-section';
        });
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', openMobileMenu);
    }

    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', closeMobileMenu);
    }

    document.querySelectorAll('.mobile-nav .nav-link').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    initAnimations();
});

function openMobileMenu() {
    const mobileMenuContainer = document.querySelector('.mobile-menu-container');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav .nav-link');
    const mobileAuthButtons = document.querySelectorAll('.mobile-auth-buttons .btn');

    if (!mobileMenuContainer || !mobileMenuBtn) return;

    mobileMenuContainer.classList.add('active');
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
        mobileNavLinks.forEach((link, index) => {
            link.style.setProperty('--i', index);
            link.classList.add('animate-in');
        });

        mobileAuthButtons.forEach(btn => {
            btn.classList.add('animate-in');
        });
    }, 100);
}

function closeMobileMenu() {
    const mobileMenuContainer = document.querySelector('.mobile-menu-container');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav .nav-link');
    const mobileAuthButtons = document.querySelectorAll('.mobile-auth-buttons .btn');

    if (!mobileMenuContainer || !mobileMenuBtn) return;

    mobileNavLinks.forEach(link => {
        link.classList.remove('animate-in');
        link.style.removeProperty('--i');
    });

    mobileAuthButtons.forEach(btn => {
        btn.classList.remove('animate-in');
    });

    mobileMenuContainer.classList.remove('active');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

function initMobileMenu() {
    updateMobileMenuVisibility();
}

function updateMobileMenuVisibility() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');
    const authButtons = document.querySelector('.auth-buttons');

    if (!mobileMenuBtn || !mainNav || !authButtons) return;

    if (window.innerWidth <= 1024) {
        mobileMenuBtn.style.display = 'flex';
        mainNav.style.display = 'none';
        authButtons.style.display = 'none';
    } else {
        mobileMenuBtn.style.display = 'none';
        mainNav.style.display = 'flex';
        authButtons.style.display = 'flex';
        closeMobileMenu();
    }
}

function initAnimations() {
    requestAnimationFrame(() => {
        animateBackgroundGrid();
        animateFloatingElements();
    });
}

function animateBackgroundGrid() {
    const orbits = document.querySelectorAll('.grid-orbit');
    orbits.forEach((orbit, index) => {
        const speed = 60 + index * 15;
        orbit.style.animationDuration = `${speed}s`;

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                orbit.style.animationPlayState = 'paused';
            } else {
                orbit.style.animationPlayState = 'running';
            }
        });
    });
}

function animateFloatingElements() {
    const shapes = document.querySelectorAll('.shape');
    if (!shapes.length) return;

    let ticking = false;

    window.addEventListener('mousemove', (e) => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const mouseX = e.clientX / window.innerWidth;
                const mouseY = e.clientY / window.innerHeight;

                shapes.forEach((shape, index) => {
                    const speed = 0.03 + (index * 0.01);
                    const x = (mouseX - 0.5) * speed * 100;
                    const y = (mouseY - 0.5) * speed * 100;

                    shape.style.transform = `translate(${x}px, ${y}px)`;
                });

                ticking = false;
            });

            ticking = true;
        }
    });
}

window.addEventListener('resize', () => {
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(() => {
        updateMobileMenuVisibility();
    }, 250);
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenuContainer && mobileMenuContainer.classList.contains('active')) {
        closeMobileMenu();
    }
});

if (mobileMenuContainer) {
    mobileMenuContainer.addEventListener('click', (e) => {
        if (e.target === mobileMenuContainer) {
            closeMobileMenu();
        }
    });
}


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
    const mobileAuthButtons = document.querySelector('.mobile-auth-buttons');

    if (authButtons) {
        authButtons.innerHTML = `
            <a href="../profile/index.html" class="btn btn-ghost">
                <i class="fas fa-user"></i>
                <span>Профиль</span>
            </a>
        `;
    }

    if (mobileAuthButtons) {
        mobileAuthButtons.innerHTML = `
            <a href="../profile/index.html" class="btn btn-ghost" style="width: 100%; justify-content: center;">
                <i class="fas fa-user"></i>
                <span>Профиль</span>
            </a>
        `;
    }
}

function updateAuthUI(user) {
    const authButtons = document.querySelector('.auth-buttons');
    const mobileAuthButtons = document.querySelector('.mobile-auth-buttons');

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

    if (mobileAuthButtons) {
        mobileAuthButtons.innerHTML = `
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
                    <button id="mobile-logout-btn" class="dropdown-item" role="menuitem">
                        <i class="fas fa-sign-out-alt"></i> Выйти
                    </button>
                </div>
            </div>
        `;

        const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', logout);
        }
    }

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

            const firstMenuItem = dropdownContent.querySelector('a, button');
            if (firstMenuItem) {
                setTimeout(() => firstMenuItem.focus(), 100);
            }
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

        avatarBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                avatarBtn.click();
            } else if (e.key === 'Escape' && isOpen) {
                closeMenu();
                avatarBtn.focus();
            }
        });

        dropdownContent.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeMenu();
                avatarBtn.focus();
            } else if (e.key === 'Tab') {
                const focusableElements = dropdownContent.querySelectorAll('a, button');
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
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
