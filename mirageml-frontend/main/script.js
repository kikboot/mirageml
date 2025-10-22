document.addEventListener('DOMContentLoaded', () => {
    // Элементы DOM
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const createProjectBtn = document.getElementById('create-project-btn');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');

    // Инициализация анимаций
    initAnimations();
    
    // Проверка авторизации при загрузке
    checkAuthStatus();

    // Открытие модальных окон с очисткой уведомлений
    if (loginBtn) loginBtn.addEventListener('click', () => {
        showModal(loginModal);
        hideNotification('login-notification');
    });
    
    if (registerBtn) registerBtn.addEventListener('click', () => {
        showModal(registerModal);
        hideNotification('register-notification');
    });
    
    if (createProjectBtn) {
        createProjectBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const token = localStorage.getItem('token');
            if (token) {
                redirectToEditor();
            } else {
                showModal(loginModal);
            }
        });
    }

    // Переключение между формами
    if (switchToRegister) {
        switchToRegister.addEventListener('click', () => {
            switchModals(loginModal, registerModal);
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', () => {
            switchModals(registerModal, loginModal);
        });
    }

    // Закрытие модалок
    setupModalCloseHandlers();

    // Обработка формы входа
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Обработка формы регистрации
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Загрузка отзывов
    if (document.getElementById('reviews-container')) {
        loadReviews();
    }

    // Инициализация параллакс эффектов
    initParallaxEffects();

    // Инициализация анимаций при скролле
    initScrollAnimations();
});

// Анимации и эффекты
function initAnimations() {
    // Анимация плавающих элементов в герое
    animateFloatingElements();
    
    // Анимация сетки на фоне
    animateBackgroundGrid();
    
    // Анимация статистики
    animateStats();
}

function animateFloatingElements() {
    const elements = document.querySelectorAll('.preview-element');
    if (!elements.length) return;

    elements.forEach((element, index) => {
        // Случайные параметры анимации для каждого элемента
        const duration = 15 + Math.random() * 10;
        const delay = index * 2;
        
        element.style.animation = `floatElement ${duration}s ease-in-out ${delay}s infinite alternate`;
    });
}

function animateBackgroundGrid() {
    const orbits = document.querySelectorAll('.grid-orbit');
    orbits.forEach((orbit, index) => {
        const speed = 60 + index * 15;
        orbit.style.animationDuration = `${speed}s`;
    });
}

function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    if (!stats.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stat = entry.target;
                const finalValue = parseInt(stat.textContent);
                animateCounter(stat, 0, finalValue, 2000);
                observer.unobserve(stat);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => observer.observe(stat));
}

function animateCounter(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        
        if (end === 99) {
            element.textContent = value + '%';
        } else if (end === 5) {
            element.textContent = value + 'x';
        } else {
            element.textContent = value.toLocaleString() + '+';
        }
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Параллакс эффекты
function initParallaxEffects() {
    const shapes = document.querySelectorAll('.shape');
    
    window.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        shapes.forEach((shape, index) => {
            const speed = 0.05 + (index * 0.02);
            const x = (mouseX - 0.5) * speed * 100;
            const y = (mouseY - 0.5) * speed * 100;
            
            shape.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
}

// Анимации при скролле
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.advantage-card-modern, .feature-card-modern, .donate-method-modern');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

// Управление модальными окнами
function showModal(modal) {
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(modal) {
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function switchModals(fromModal, toModal) {
    hideModal(fromModal);
    showModal(toModal);
}

function setupModalCloseHandlers() {
    // Закрытие по кнопке закрытия
    document.querySelectorAll('.close-btn, .btn-ghost').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target.id === 'cancel-login' || e.target.id === 'cancel-register' || e.target.classList.contains('close-btn')) {
                document.querySelectorAll('.modal').forEach(modal => {
                    hideModal(modal);
                });
            }
        });
    });

    // Закрытие по клику вне модального окна
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal);
            }
        });
    });

    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                hideModal(modal);
            });
        }
    });
}

function hideNotification(notificationId) {
    const notification = document.getElementById(notificationId);
    if (notification) {
        notification.style.display = 'none';
    }
}

function showNotification(notificationId, message, type = 'error') {
    const notification = document.getElementById(notificationId);
    if (notification) {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';
    }
}

// Обработка форм
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('token', data.token);
            updateAuthUI(data.user);
            document.querySelectorAll('.modal').forEach(m => hideModal(m));
            showSuccessMessage('Вход выполнен успешно!');
            setTimeout(() => window.location.reload(), 1000);
        } else {
            handleLoginError(response.status, data.error);
        }
    } catch (error) {
        showNotification('login-notification', 'Ошибка соединения с сервером');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    
    // Скрываем уведомление при новом вводе
    hideNotification('register-notification');

    if (password !== confirm) {
        showNotification('register-notification', 'Пароли не совпадают');
        return;
    }

    if (password.length < 6) {
        showNotification('register-notification', 'Пароль должен содержать минимум 6 символов');
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        
        if (data.success) {
            showNotification('register-notification', 'Регистрация успешна! Теперь войдите в систему.', 'success');
            registerForm.reset();
            
            setTimeout(() => {
                hideNotification('register-notification');
                switchModals(registerModal, loginModal);
            }, 2000);
        } else {
            handleRegisterError(response.status, data.error);
        }
    } catch (error) {
        showNotification('register-notification', 'Ошибка соединения с сервером');
    }
}

// Обработка ошибок
function handleLoginError(status, error) {
    const notification = document.getElementById('login-notification');
    if (status === 401) {
        showNotification('login-notification', error || 'Неверный email или пароль');
    } else if (status === 404) {
        showNotification('login-notification', 'Такого аккаунта не существует');
    } else if (status === 429) {
        showNotification('login-notification', 'Слишком много попыток входа. Попробуйте позже.');
    } else {
        showNotification('login-notification', error || 'Ошибка авторизации');
    }
}

function handleRegisterError(status, error) {
    if (status === 400 && error.includes('уже используется')) {
        showNotification('register-notification', 'Такая почта уже зарегистрирована');
    } else if (status === 400) {
        showNotification('register-notification', 'Некорректные данные для регистрации');
    } else if (status === 429) {
        showNotification('register-notification', 'Слишком много попыток регистрации. Попробуйте позже.');
    } else {
        showNotification('register-notification', error || 'Ошибка регистрации');
    }
}

// Управление авторизацией
async function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('/api/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const user = await response.json();
            updateAuthUI(user);
        } else {
            localStorage.removeItem('token');
        }
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        localStorage.removeItem('token');
    }
}

function updateAuthUI(user) {
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;

    const userInitials = getInitials(user.name);
    
    authButtons.innerHTML = `
        <div class="user-menu">
            <button class="user-avatar" aria-label="Меню пользователя">
                ${userInitials}
            </button>
            <div class="dropdown-content">
                <a href="/profile" class="dropdown-item">
                    <i class="fas fa-user"></i> Профиль
                </a>
                <div class="dropdown-divider"></div>
                <a href="#" id="logout-btn" class="dropdown-item">
                    <i class="fas fa-sign-out-alt"></i> Выйти
                </a>
            </div>
        </div>
    `;

    // Инициализация пользовательского меню
    initUserMenu();
    
    document.getElementById('logout-btn')?.addEventListener('click', logout);
}

function initUserMenu() {
    const userMenu = document.querySelector('.user-menu');
    const dropdownContent = document.querySelector('.dropdown-content');
    let closeTimeout;
    
    if (!userMenu || !dropdownContent) return;
    
    userMenu.addEventListener('mouseenter', function() {
        clearTimeout(closeTimeout);
        dropdownContent.style.opacity = '1';
        dropdownContent.style.visibility = 'visible';
        dropdownContent.style.transform = 'translateY(0)';
    });
    
    userMenu.addEventListener('mouseleave', function() {
        closeTimeout = setTimeout(function() {
            dropdownContent.style.opacity = '0';
            dropdownContent.style.visibility = 'hidden';
            dropdownContent.style.transform = 'translateY(-10px)';
        }, 300);
    });
    
    dropdownContent.addEventListener('mouseenter', function() {
        clearTimeout(closeTimeout);
    });
    
    dropdownContent.addEventListener('mouseleave', function() {
        closeTimeout = setTimeout(function() {
            dropdownContent.style.opacity = '0';
            dropdownContent.style.visibility = 'hidden';
            dropdownContent.style.transform = 'translateY(-10px)';
        }, 300);
    });

    // Закрытие меню при клике вне его
    document.addEventListener('click', (e) => {
        if (!userMenu.contains(e.target)) {
            dropdownContent.style.opacity = '0';
            dropdownContent.style.visibility = 'hidden';
            dropdownContent.style.transform = 'translateY(-10px)';
        }
    });
}

async function logout() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        await fetch('/api/logout', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    } catch (error) {
        console.error('Ошибка при выходе:', error);
    }

    localStorage.removeItem('token');
    showSuccessMessage('Вы успешно вышли из системы');
    setTimeout(() => window.location.reload(), 1000);
}

// Загрузка отзывов
async function loadReviews() {
    const container = document.getElementById('reviews-container');
    if (!container) return;

    try {
        // Показываем скелетон загрузки
        container.innerHTML = `
            <div class="review-skeleton"></div>
            <div class="review-skeleton"></div>
            <div class="review-skeleton"></div>
        `;

        const response = await fetch('/api/reviews');
        const reviews = await response.json();
        
        if (reviews.length === 0) {
            container.innerHTML = '<div class="no-reviews">Пока нет отзывов. Будьте первым!</div>';
            return;
        }
        
        // Отображаем только первые 3 отзыва
        const limitedReviews = reviews.slice(0, 3);
        container.innerHTML = limitedReviews.map(review => `
            <div class="review-card-modern">
                <div class="review-header-modern">
                    <div class="user-avatar-modern">${getInitials(review.name)}</div>
                    <div class="user-info">
                        <div class="user-name">${review.name}</div>
                        <div class="review-date">${formatDate(review.createdAt)}</div>
                    </div>
                </div>
                <div class="review-text">${review.comment}</div>
                <div class="review-rating">${renderStars(review.rating)}</div>
                <div class="review-decoration"></div>
            </div>
        `).join('');

        // Анимация появления отзывов
        animateReviews();
    } catch (error) {
        container.innerHTML = '<div class="error-loading">Не удалось загрузить отзывы</div>';
    }
}

function animateReviews() {
    const reviewCards = document.querySelectorAll('.review-card-modern');
    reviewCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateX(-30px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateX(0)';
        }, index * 200);
    });
}

// Вспомогательные функции
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
}

function renderStars(rating) {
    const fullStars = '★'.repeat(rating);
    const emptyStars = '☆'.repeat(5 - rating);
    return `<span class="stars-full">${fullStars}</span><span class="stars-empty">${emptyStars}</span>`;
}

function redirectToEditor() {
    window.location.href = '/editor';
}

function showSuccessMessage(message) {
    // Создаем временное уведомление об успехе
    const successNotification = document.createElement('div');
    successNotification.className = 'success-message';
    successNotification.textContent = message;
    successNotification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success);
        color: white;
        padding: 12px 20px;
        border-radius: var(--border-radius);
        z-index: 10000;
        box-shadow: var(--shadow-md);
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(successNotification);
    
    setTimeout(() => {
        successNotification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(successNotification);
        }, 300);
    }, 3000);
}

// CSS для анимаций (добавляем динамически)
const dynamicStyles = `
@keyframes floatElement {
    0%, 100% {
        transform: translateY(0) rotate(0deg);
        opacity: 0.7;
    }
    50% {
        transform: translateY(-20px) rotate(5deg);
        opacity: 1;
    }
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOutRight {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

.review-skeleton {
    background: var(--glass-bg);
    border-radius: var(--border-radius-lg);
    padding: 30px;
    height: 200px;
    position: relative;
    overflow: hidden;
}

.review-skeleton::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    animation: loading 1.5s infinite;
}

@keyframes loading {
    0% { left: -100%; }
    100% { left: 100%; }
}

.stars-full {
    color: #ffd700;
}

.stars-empty {
    color: var(--gray-light);
}

.user-avatar-modern {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
    flex-shrink: 0;
}

.dropdown-divider {
    height: 1px;
    background: var(--glass-border);
    margin: 8px 0;
}
`;

// Добавляем динамические стили
const styleSheet = document.createElement('style');
styleSheet.textContent = dynamicStyles;
document.head.appendChild(styleSheet);

// Обработка ошибок загрузки изображений
document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
        e.target.style.display = 'none';
        console.warn('Изображение не загружено:', e.target.src);
    }
}, true);

// Оптимизация производительности при скролле
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
            scrollTimeout = null;
            // Обновление позиций параллакс элементов
            const shapes = document.querySelectorAll('.shape');
            shapes.forEach(shape => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.5;
                shape.style.transform = `translateY(${rate}px)`;
            });
        }, 10);
    }
});

// Предзагрузка критичных ресурсов
function preloadCriticalResources() {
    const criticalImages = [
        '../logo/logo3.svg',
        '../img/qr-код.jpg'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Инициализация предзагрузки после загрузки страницы
window.addEventListener('load', preloadCriticalResources);