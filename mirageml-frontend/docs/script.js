// Script для страницы документации

document.addEventListener('DOMContentLoaded', function() {
    // Мобильное меню
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    const mobileMenuContainer = document.querySelector('.mobile-menu-container');
    const mobileMenuOverlay = document.createElement('div');
    mobileMenuOverlay.className = 'mobile-menu-overlay';
    document.body.appendChild(mobileMenuOverlay);

    mobileMenuBtn.addEventListener('click', function() {
        mobileMenuContainer.classList.add('active');
        mobileMenuOverlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });

    mobileMenuClose.addEventListener('click', function() {
        mobileMenuContainer.classList.remove('active');
        mobileMenuOverlay.style.display = 'none';
        document.body.style.overflow = '';
    });

    mobileMenuOverlay.addEventListener('click', function() {
        mobileMenuContainer.classList.remove('active');
        mobileMenuOverlay.style.display = 'none';
        document.body.style.overflow = '';
    });

    // FAQ аккордеон
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const isOpen = answer.classList.contains('expanded');

            // Закрываем все открытые ответы
            document.querySelectorAll('.faq-answer').forEach(ans => {
                ans.classList.remove('expanded');
            });

            // Открываем текущий ответ, если он был закрыт
            if (!isOpen) {
                answer.classList.add('expanded');
            }
        });
    });

    // Модальные окна
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const closeBtns = document.querySelectorAll('.close-btn');
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    const cancelLogin = document.getElementById('cancel-login');
    const cancelRegister = document.getElementById('cancel-register');
    const mobileLoginBtn = document.getElementById('mobile-login-btn');
    const mobileRegisterBtn = document.getElementById('mobile-register-btn');

    // Открытие модальных окон
    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    registerBtn.addEventListener('click', () => {
        registerModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    mobileLoginBtn && mobileLoginBtn.addEventListener('click', () => {
        loginModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    mobileRegisterBtn && mobileRegisterBtn.addEventListener('click', () => {
        registerModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    // Закрытие модальных окон
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
            document.body.style.overflow = '';
        });
    });

    // Закрытие модальных окон при клике вне их области
    window.addEventListener('click', function(event) {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
            document.body.style.overflow = '';
        }
        if (event.target === registerModal) {
            registerModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    // Переключение между формами
    switchToRegister && switchToRegister.addEventListener('click', function() {
        loginModal.style.display = 'none';
        registerModal.style.display = 'flex';
    });

    switchToLogin && switchToLogin.addEventListener('click', function() {
        registerModal.style.display = 'none';
        loginModal.style.display = 'flex';
    });

    cancelLogin && cancelLogin.addEventListener('click', function() {
        loginModal.style.display = 'none';
        document.body.style.overflow = '';
    });

    cancelRegister && cancelRegister.addEventListener('click', function() {
        registerModal.style.display = 'none';
        document.body.style.overflow = '';
    });

    // Обработка форм
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Плавный скролл для якорных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Активация текущей страницы в навигации
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'index.html' || currentPage === '') {
        const currentNavLinks = document.querySelectorAll('.nav-link[href*="docs"]');
        currentNavLinks.forEach(link => {
            link.classList.add('active');
        });
    }

    // Проверка авторизации при загрузке
    checkAuthStatus();

    // Инициализация пользовательского меню
    initUserMenu();
});

// Функция проверки авторизации
async function checkAuthStatus() {
    // Проверяем токен в localStorage и sessionStorage
    let token = localStorage.getItem('token');
    if (!token) {
        token = sessionStorage.getItem('token');
    }

    if (!token) {
        // Пользователь не авторизован
        showGuestUI();
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
            showUserUI(user);
        } else {
            // Токен недействителен
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            showGuestUI();
        }
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        showGuestUI();
    }
}

// Отображение UI для гостя
function showGuestUI() {
    document.getElementById('guest-buttons').style.display = 'flex';
    document.getElementById('user-menu').style.display = 'none';
    document.getElementById('mobile-guest-buttons').style.display = 'flex';
    document.getElementById('mobile-user-menu').style.display = 'none';
}

// Отображение UI для авторизованного пользователя
function showUserUI(user) {
    document.getElementById('guest-buttons').style.display = 'none';
    document.getElementById('user-menu').style.display = 'block';
    document.getElementById('mobile-guest-buttons').style.display = 'none';
    document.getElementById('mobile-user-menu').style.display = 'block';

    // Обновляем информацию о пользователе
    const userInitials = getInitials(user.name);
    document.getElementById('user-initials').textContent = userInitials;
    document.getElementById('dropdown-initials').textContent = userInitials;
    document.getElementById('dropdown-user-name').textContent = user.name;
    document.getElementById('dropdown-user-email').textContent = user.email;
    document.getElementById('mobile-user-initials').textContent = userInitials;
    document.getElementById('mobile-user-name').textContent = user.name;
    document.getElementById('mobile-user-email').textContent = user.email;
}

// Функция получения инициалов
function getInitials(name) {
    if (!name) return 'NN';
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length === 1) {
        return nameParts[0].substring(0, 2).toUpperCase();
    } else {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
}

// Обработка входа
async function handleLogin(e) {
    e.preventDefault();

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    try {
        const response = await fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        let data = {};
        if (response.headers.get('content-type') && response.headers.get('content-type').includes('application/json')) {
            data = await response.json();
        } else {
            data = { success: response.ok };
        }

        if (response.ok && data.success) {
            // Сохраняем токен в зависимости от настроек
            const rememberMe = document.getElementById('remember-me').checked;

            if (rememberMe) {
                localStorage.setItem('token', data.token);
            } else {
                sessionStorage.setItem('token', data.token);
            }

            // Обновляем UI
            showUserUI(data.user);
            
            // Закрываем модальное окно
            document.getElementById('login-modal').style.display = 'none';
            document.body.style.overflow = '';
        } else {
            // Показываем ошибку
            const notification = document.getElementById('login-notification');
            notification.textContent = data.error || 'Неверный email или пароль';
            notification.style.display = 'block';
        }
    } catch (error) {
        console.error('Ошибка при входе:', error);
        const notification = document.getElementById('login-notification');
        notification.textContent = 'Ошибка соединения с сервером';
        notification.style.display = 'block';
    }
}

// Обработка регистрации
async function handleRegister(e) {
    e.preventDefault();

    const nameInput = document.getElementById('register-name');
    const emailInput = document.getElementById('register-email');
    const passwordInput = document.getElementById('register-password');
    const confirmInput = document.getElementById('register-confirm');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirm = confirmInput.value;

    if (password !== confirm) {
        const notification = document.getElementById('register-notification');
        notification.textContent = 'Пароли не совпадают';
        notification.style.display = 'block';
        return;
    }

    try {
        const response = await fetch('http://localhost:3001/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        let data = {};
        if (response.headers.get('content-type') && response.headers.get('content-type').includes('application/json')) {
            data = await response.json();
        } else {
            data = { success: response.ok };
        }

        if (response.ok && data.success) {
            // Открываем модальное окно входа
            document.getElementById('register-modal').style.display = 'none';
            document.getElementById('login-modal').style.display = 'flex';
            
            // Заполняем поля
            document.getElementById('login-email').value = email;
            document.getElementById('login-password').value = password;
            
            // Показываем сообщение
            const notification = document.getElementById('login-notification');
            notification.textContent = 'Аккаунт успешно создан. Войдите в систему.';
            notification.className = 'notification success';
            notification.style.display = 'block';
        } else {
            const notification = document.getElementById('register-notification');
            notification.textContent = data.error || 'Ошибка регистрации';
            notification.style.display = 'block';
        }
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        const notification = document.getElementById('register-notification');
        notification.textContent = 'Ошибка соединения с сервером';
        notification.style.display = 'block';
    }
}

// Функция выхода
async function logout() {
    // Удаляем токен
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    // Обновляем UI
    showGuestUI();
    
    // Закрываем мобильное меню, если открыто
    document.querySelector('.mobile-menu-container').classList.remove('active');
    document.querySelector('.mobile-menu-overlay').style.display = 'none';
    document.body.style.overflow = '';
}

// Инициализация пользовательского меню
function initUserMenu() {
    const userAvatarBtn = document.getElementById('user-avatar-btn');
    const userDropdown = document.getElementById('user-dropdown');

    if (!userAvatarBtn || !userDropdown) return;

    let closeTimeout;
    let isOpen = false;

    const openMenu = () => {
        clearTimeout(closeTimeout);
        userDropdown.style.opacity = '1';
        userDropdown.style.visibility = 'visible';
        userDropdown.style.transform = 'translateY(0)';
        userAvatarBtn.setAttribute('aria-expanded', 'true');
        userAvatarBtn.classList.add('active');
        isOpen = true;
    };

    const closeMenu = () => {
        userDropdown.style.opacity = '0';
        userDropdown.style.visibility = 'hidden';
        userDropdown.style.transform = 'translateY(-10px)';
        userAvatarBtn.setAttribute('aria-expanded', 'false');
        userAvatarBtn.classList.remove('active');
        isOpen = false;
    };

    // Обработчики для десктопного меню
    userAvatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Закрытие меню при клике вне его области
    document.addEventListener('click', (e) => {
        if (!userAvatarBtn.contains(e.target) && !userDropdown.contains(e.target)) {
            closeMenu();
        }
    });

    // Обработчики для мобильного меню
    document.addEventListener('click', (e) => {
        const mobileMenu = document.querySelector('.mobile-menu-container');
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            const isInsideUserMenu = document.getElementById('mobile-user-menu').contains(e.target);
            const isUserMenuTrigger = e.target.closest('#mobile-user-menu') || e.target.closest('#mobile-user-initials');
            
            if (!isInsideUserMenu && !isUserMenuTrigger) {
                // Закрываем мобильное меню, если клик не по пользовательскому меню
            }
        }
    });

    // Обработчики для кнопок выхода
    document.getElementById('logout-btn-header')?.addEventListener('click', logout);
    document.getElementById('mobile-logout-btn')?.addEventListener('click', logout);
}