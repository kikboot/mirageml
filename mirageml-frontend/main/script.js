document.addEventListener('DOMContentLoaded', () => {
    // Элементы DOM для модальных окон
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const createProjectBtn = document.getElementById('create-project-btn');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Открытие модальных окон
    if (loginBtn) loginBtn.addEventListener('click', () => loginModal.style.display = 'flex');
    if (registerBtn) registerBtn.addEventListener('click', () => registerModal.style.display = 'flex');
    
    if (createProjectBtn) {
        createProjectBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.style.display = 'flex';
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
                    window.location.href = data.redirect;
                } else {
                    alert(data.error || 'Ошибка авторизации');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Ошибка соединения с сервером');
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
                alert('Пароли не совпадают');
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
                    window.location.href = data.redirect;
                } else {
                    alert(data.error || 'Ошибка регистрации');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Ошибка соединения с сервером');
            }
        });
    }

    // Закрытие по клику вне модалки
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Загрузка отзывов для главной страницы
    if (document.getElementById('reviews-container')) {
        loadHomepageReviews();
    }
});

// Функция загрузки отзывов на главную страницу
async function loadHomepageReviews() {
    const container = document.getElementById('reviews-container');
    if (!container) return;

    try {
        // Показываем индикатор загрузки
        container.innerHTML = '<div class="loading-reviews">Загрузка отзывов...</div>';

        const response = await fetch('/api/reviews');
        if (!response.ok) throw new Error('Ошибка загрузки');
        
        const reviews = await response.json();
        
        // Показываем только 3 последних одобренных отзыва
        const approvedReviews = reviews.filter(review => review.approved);
        const recentReviews = approvedReviews.slice(0, 3);
        
        if (recentReviews.length === 0) {
            container.innerHTML = `
                <div class="no-reviews" style="grid-column: 1 / -1; text-align: center;">
                    Пока нет отзывов. Будьте первым!
                </div>
            `;
            return;
        }
        
        container.innerHTML = recentReviews.map(review => `
            <div class="review-card">
                <div class="review-header">
                    <div class="user-avatar">${getInitials(review.name)}</div>
                    <div>
                        <div class="user-name">${review.name}</div>
                        <div class="review-date">${formatDate(review.date)}</div>
                    </div>
                </div>
                <div class="review-text">${review.comment}</div>
                <div class="review-rating">${renderStars(review.rating)}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
        container.innerHTML = `
            <div class="error-loading" style="grid-column: 1 / -1; text-align: center;">
                Не удалось загрузить отзывы. Попробуйте позже.
            </div>
        `;
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