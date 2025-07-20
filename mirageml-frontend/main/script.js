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

    // Проверка авторизации при загрузке
    checkAuthStatus();

    // Открытие модальных окон с очисткой уведомлений
    if (loginBtn) loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'flex';
        document.getElementById('login-notification').style.display = 'none';
    });
    
    if (registerBtn) registerBtn.addEventListener('click', () => {
        registerModal.style.display = 'flex';
        document.getElementById('register-notification').style.display = 'none';
    });
    
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
            const notification = document.getElementById('login-notification');

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
                    // Показываем конкретное сообщение об ошибке
                    if (response.status === 401) {
                        notification.textContent = data.error || 'Неверный email или пароль';
                    } else if (response.status === 404) {
                        notification.textContent = 'Такого аккаунта не существует';
                    } else {
                        notification.textContent = data.error || 'Ошибка авторизации';
                    }
                    notification.style.display = 'block';
                }
            } catch (error) {
                notification.textContent = 'Ошибка соединения с сервером';
                notification.style.display = 'block';
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
            const notification = document.getElementById('register-notification');

            // Скрываем уведомление при новом вводе
            notification.style.display = 'none';

            if (password !== confirm) {
                notification.textContent = 'Пароли не совпадают';
                notification.style.display = 'block';
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
                    notification.textContent = 'Регистрация успешна! Теперь войдите в систему.';
                    notification.className = 'notification success';
                    notification.style.display = 'block';
                    
                    // Очищаем форму
                    registerForm.reset();
                    
                    // Переключаем на форму входа через 2 секунды
                    setTimeout(() => {
                        notification.style.display = 'none';
                        registerModal.style.display = 'none';
                        loginModal.style.display = 'flex';
                        notification.className = 'notification error';
                    }, 2000);
                } else {
                    if (response.status === 400 && data.error.includes('уже используется')) {
                        notification.textContent = 'Такая почта уже зарегистрирована';
                    } else {
                        notification.textContent = data.error || 'Ошибка регистрации';
                    }
                    notification.style.display = 'block';
                }
            } catch (error) {
                notification.textContent = 'Ошибка соединения с сервером';
                notification.style.display = 'block';
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