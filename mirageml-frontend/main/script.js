document.addEventListener('DOMContentLoaded', () => {
    // Элементы DOM
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const createProjectBtn = document.getElementById('create-project-btn');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Проверка авторизации при загрузке
    checkAuthStatus();

    // Открытие модальных окон
    if (loginBtn) loginBtn.addEventListener('click', () => loginModal.style.display = 'flex');
    if (registerBtn) registerBtn.addEventListener('click', () => registerModal.style.display = 'flex');
    
    if (createProjectBtn) {
        createProjectBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const token = localStorage.getItem('token');
            if (token) {
                window.location.href = '/editor';
            } else {
                loginModal.style.display = 'flex';
            }
        });
    }

    // Переключение между формами
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    
    if (switchToRegister) {
        switchToRegister.addEventListener('click', () => {
            loginModal.style.display = 'none';
            registerModal.style.display = 'flex';
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', () => {
            registerModal.style.display = 'none';
            loginModal.style.display = 'flex';
        });
    }

    // Закрытие модалок
    document.querySelectorAll('.close-btn, .btn-outline').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });

    // Обработка формы входа
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
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
                    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
                    window.location.reload();
                } else {
                    showAlert(data.error || 'Ошибка авторизации', 'error');
                }
            } catch (error) {
                showAlert('Ошибка соединения с сервером', 'error');
            }
        });
    }

    // Обработка формы регистрации
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirm = document.getElementById('register-confirm').value;

            if (password !== confirm) {
                showAlert('Пароли не совпадают', 'error');
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
                    showAlert('Регистрация успешна! Теперь войдите в систему.', 'success');
                    registerModal.style.display = 'none';
                    loginModal.style.display = 'flex';
                } else {
                    showAlert(data.error || 'Ошибка регистрации', 'error');
                }
            } catch (error) {
                showAlert('Ошибка соединения с сервером', 'error');
            }
        });
    }

    // Загрузка отзывов
    if (document.getElementById('reviews-container')) {
        loadReviews();
    }
});

// Проверка статуса авторизации
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
    }
}

function updateAuthUI(user) {
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;

    authButtons.innerHTML = `
        <div class="user-menu">
            <button class="user-avatar" aria-label="Меню пользователя">
                ${user.avatar}
            </button>
            <div class="dropdown-content">
                <a href="/profile" class="dropdown-item">
                    <i class="fas fa-user"></i> Профиль
                </a>
                <a href="#" id="logout-btn" class="dropdown-item">
                    <i class="fas fa-sign-out-alt"></i> Выйти
                </a>
            </div>
        </div>
    `;

    document.getElementById('logout-btn')?.addEventListener('click', logout);
}

// Выход из системы
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
    window.location.reload();
}

// Загрузка отзывов
async function loadReviews() {
    const container = document.getElementById('reviews-container');
    if (!container) return;

    try {
        const response = await fetch('/api/reviews');
        const reviews = await response.json();
        
        if (reviews.length === 0) {
            container.innerHTML = '<div class="no-reviews">Пока нет отзывов. Будьте первым!</div>';
            return;
        }
        
        container.innerHTML = reviews.slice(0, 3).map(review => `
            <div class="review-card">
                <div class="review-header">
                    <div class="user-avatar">${getInitials(review.name)}</div>
                    <div>
                        <div class="user-name">${review.name}</div>
                        <div class="review-date">${formatDate(review.createdAt)}</div>
                    </div>
                </div>
                <div class="review-text">${review.comment}</div>
                <div class="review-rating">${renderStars(review.rating)}</div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<div class="error-loading">Не удалось загрузить отзывы</div>';
    }
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
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    document.body.appendChild(alert);
    
    setTimeout(() => alert.remove(), 3000);
}