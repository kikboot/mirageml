// Функция для получения инициалов имени
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

// Проверка статуса авторизации при загрузке
async function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (!token) {
        updateAuthUI(null);
        return;
    }

    try {
        const response = await fetch('/api/profile', {
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
            updateAuthUI(null);
        }
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        localStorage.removeItem('token');
        updateAuthUI(null);
    }
}

// Обновление интерфейса авторизации
function updateAuthUI(user) {
    const authButtons = document.querySelector('.auth-buttons');
    const mainNavLink = document.querySelector('.main-link');
    
    if (!authButtons) return;

    if (user) {
        // Пользователь авторизован
        const userInitials = getInitials(user.name);
        
        authButtons.innerHTML = `
            <div class="user-menu">
                <button class="user-avatar" aria-label="Меню пользователя" aria-haspopup="true" aria-expanded="false">
                    ${userInitials}
                    <i class="fas fa-chevron-down dropdown-arrow"></i>
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
                    <a href="../profile/index.html" class="dropdown-item" role="menuitem">
                        <i class="fas fa-user"></i> Профиль
                    </a>
                    <a href="../main/index.html" class="dropdown-item" role="menuitem">
                        <i class="fas fa-home"></i> Главная
                    </a>
                    <div class="dropdown-divider"></div>
                    <button id="logout-btn" class="dropdown-item" role="menuitem">
                        <i class="fas fa-sign-out-alt"></i> Выйти
                    </button>
                </div>
            </div>
        `;
        
        // Скрываем ссылку "Главная" для авторизованных пользователей
        if (mainNavLink) {
            mainNavLink.style.display = 'none';
        }
        
        // Добавляем обработчик для кнопки выхода
        document.getElementById('logout-btn')?.addEventListener('click', logout);
        
        // Инициализируем пользовательское меню
        initUserMenu();
        
        // Обновляем форму отзыва для авторизованных пользователей
        updateReviewFormForAuthorizedUser(user);
    } else {
        // Пользователь не авторизован
        authButtons.innerHTML = `
            <button class="btn btn-ghost" id="login-btn">
                <i class="fas fa-sign-in-alt"></i>
                <span>Войти</span>
            </button>
            <button class="btn btn-primary" id="register-btn">
                <i class="fas fa-user-plus"></i>
                <span>Регистрация</span>
            </button>
        `;
        
        // Показываем ссылку "Главная" для неавторизованных пользователей
        if (mainNavLink) {
            mainNavLink.style.display = 'flex';
        }
        
        // Добавляем обработчики для кнопок авторизации
        document.getElementById('login-btn')?.addEventListener('click', () => {
            showModal(document.getElementById('login-modal'));
            hideNotification('login-notification');
        });
        
        document.getElementById('register-btn')?.addEventListener('click', () => {
            showModal(document.getElementById('register-modal'));
            hideNotification('register-notification');
        });
        
        // Обновляем форму отзыва для неавторизованных пользователей
        updateReviewFormForUnauthorizedUser();
    }
}

// Инициализация пользовательского меню
function initUserMenu() {
    const userMenus = document.querySelectorAll('.user-menu');
    
    userMenus.forEach(menu => {
        const button = menu.querySelector('.user-avatar');
        const dropdown = menu.querySelector('.dropdown-content');
        
        if (!button || !dropdown) return;
        
        // Переключение видимости меню
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', !isExpanded);
            dropdown.style.display = isExpanded ? 'none' : 'block';
        });
        
        // Закрытие меню при клике вне его
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target)) {
                button.setAttribute('aria-expanded', 'false');
                dropdown.style.display = 'none';
            }
        });
    });
}

// Функция выхода
function logout() {
    localStorage.removeItem('token');
    updateAuthUI(null);
    
    // Закрываем все открытые модальные окна
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Функция показа модального окна
function showModal(modal) {
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Фокусируем на первом поле ввода
        const firstInput = modal.querySelector('input');
        if (firstInput) {
            setTimeout(() => {
                firstInput.focus();
                firstInput.select();
            }, 100);
        }
    }
}

// Функция скрытия модального окна
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        
        // Сбрасываем форму
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

// Функция скрытия уведомлений
function hideNotification(notificationId) {
    const notification = document.getElementById(notificationId);
    if (notification) {
        notification.style.display = 'none';
        notification.textContent = '';
    }
}

// Обработчик входа
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const notification = document.getElementById('login-notification');
    
    if (!email || !password) {
        notification.style.display = 'block';
        notification.textContent = 'Пожалуйста, заполните все поля';
        return;
    }
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('token', data.token);
            hideModal('login-modal');
            updateAuthUI(data.user);
            notification.style.display = 'none';
        } else {
            notification.style.display = 'block';
            notification.textContent = data.error || 'Неверный email или пароль';
        }
    } catch (error) {
        notification.style.display = 'block';
        notification.textContent = 'Ошибка подключения к серверу';
    }
}

// Обработчик регистрации
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    const notification = document.getElementById('register-notification');
    
    if (!name || !email || !password || !confirmPassword) {
        notification.style.display = 'block';
        notification.textContent = 'Пожалуйста, заполните все поля';
        return;
    }
    
    if (password !== confirmPassword) {
        notification.style.display = 'block';
        notification.textContent = 'Пароли не совпадают';
        return;
    }
    
    if (password.length < 6) {
        notification.style.display = 'block';
        notification.textContent = 'Пароль должен содержать не менее 6 символов';
        return;
    }
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Автоматический вход после регистрации
            const loginResponse = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const loginData = await loginResponse.json();
            
            if (loginData.success) {
                localStorage.setItem('token', loginData.token);
                hideModal('register-modal');
                updateAuthUI(loginData.user);
                notification.style.display = 'none';
            } else {
                notification.style.display = 'block';
                notification.textContent = 'Ошибка входа после регистрации';
            }
        } else {
            notification.style.display = 'block';
            notification.textContent = data.error || 'Ошибка регистрации';
        }
    } catch (error) {
        notification.style.display = 'block';
        notification.textContent = 'Ошибка подключения к серверу';
    }
}

// Функция переключения между модальными окнами
function switchModals(fromModal, toModal) {
    if (fromModal) fromModal.style.display = 'none';
    if (toModal) {
        toModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Фокусируем на первом поле ввода
        const firstInput = toModal.querySelector('input');
        if (firstInput) {
            setTimeout(() => {
                firstInput.focus();
                firstInput.select();
            }, 100);
        }
    }
}

// Функция обновления формы для авторизованных пользователей
function updateReviewFormForAuthorizedUser(user) {
    const formContainer = document.querySelector('.form-container');
    
    if (!formContainer) return;
    
    // Восстанавливаем оригинальную форму или создаем заново
    formContainer.innerHTML = `
        <div class="form-header">
            <h2><i class="fas fa-edit"></i> Оставить отзыв</h2>
            <p>Поделитесь вашим опытом работы с MirageML</p>
        </div>
        
        <form id="reviewForm" class="modern-form">
            <div class="form-group">
                <label>
                    <i class="fas fa-star"></i>
                    Ваша оценка*
                </label>
                <div class="rating-stars-modern">
                    <input type="radio" id="star1" name="rating" value="1">
                    <label for="star1" class="star-label">
                        <i class="fas fa-star"></i>
                        <span>Ужасно</span>
                    </label>
                    
                    <input type="radio" id="star2" name="rating" value="2">
                    <label for="star2" class="star-label">
                        <i class="fas fa-star"></i>
                        <span>Плохо</span>
                    </label>
                    
                    <input type="radio" id="star3" name="rating" value="3">
                    <label for="star3" class="star-label">
                        <i class="fas fa-star"></i>
                        <span>Нормально</span>
                    </label>
                    
                    <input type="radio" id="star4" name="rating" value="4">
                    <label for="star4" class="star-label">
                        <i class="fas fa-star"></i>
                        <span>Хорошо</span>
                    </label>
                    
                    <input type="radio" id="star5" name="rating" value="5" required>
                    <label for="star5" class="star-label">
                        <i class="fas fa-star"></i>
                        <span>Отлично</span>
                    </label>
                </div>
            </div>
            
            <div class="form-group">
                <label for="comment">
                    <i class="fas fa-comment"></i>
                    Ваш отзыв*
                </label>
                <textarea id="comment" name="comment" required placeholder="Расскажите о вашем опыте использования MirageML..."></textarea>
                <div class="char-counter">0/500</div>
            </div>
            
            <button type="submit" class="cta-button primary submit-btn">
                <i class="fas fa-paper-plane"></i>
                Опубликовать отзыв
                <div class="btn-shine"></div>
            </button>
        </form>
    `;
    
    // Добавляем скрытые поля с информацией пользователя
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        const hiddenNameInput = document.createElement('input');
        hiddenNameInput.type = 'hidden';
        hiddenNameInput.id = 'name';
        hiddenNameInput.name = 'name';
        hiddenNameInput.value = user.name;
        reviewForm.appendChild(hiddenNameInput);
        
        const hiddenEmailInput = document.createElement('input');
        hiddenEmailInput.type = 'hidden';
        hiddenEmailInput.id = 'email';
        hiddenEmailInput.name = 'email';
        hiddenEmailInput.value = user.email;
        reviewForm.appendChild(hiddenEmailInput);
        
        // Обработчик для новой формы
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(reviewForm);
            const reviewData = {
                name: formData.get('name'),
                email: formData.get('email'),
                rating: formData.get('rating'),
                comment: formData.get('comment')
            };
            
            submitReview(reviewData);
        });
        
        // Обработчик счетчика символов
        const commentTextarea = document.getElementById('comment');
        const charCounter = document.querySelector('.char-counter');
        
        if (commentTextarea && charCounter) {
            commentTextarea.addEventListener('input', function() {
                const length = this.value.length;
                const maxLength = 500;
                charCounter.textContent = `${length}/${maxLength}`;
                
                if (length > maxLength) {
                    this.value = this.value.substring(0, maxLength);
                    charCounter.textContent = `${maxLength}/${maxLength}`;
                }
            });
        }
    }
}

// Функция обновления формы для неавторизованных пользователей
function updateReviewFormForUnauthorizedUser() {
    const formContainer = document.querySelector('.form-container');
    
    if (!formContainer) return;
    
    // Показываем сообщение вместо формы
    formContainer.innerHTML = `
        <div class="auth-required-message">
            <h3><i class="fas fa-lock"></i> Чтобы оставить отзыв</h3>
            <p>Пожалуйста, зарегистрируйтесь или авторизуйтесь в системе</p>
            <div class="auth-required-actions">
                <button class="btn btn-primary" id="show-login-modal">
                    <i class="fas fa-sign-in-alt"></i>
                    Войти
                </button>
                <button class="btn btn-ghost" id="show-register-modal">
                    <i class="fas fa-user-plus"></i>
                    Регистрация
                </button>
            </div>
        </div>
    `;
    
    // Добавляем обработчики для кнопок
    document.getElementById('show-login-modal')?.addEventListener('click', () => {
        showModal(document.getElementById('login-modal'));
    });
    
    document.getElementById('show-register-modal')?.addEventListener('click', () => {
        showModal(document.getElementById('register-modal'));
    });
}

// Настройка обработчиков закрытия модальных окон
function setupModalCloseHandlers() {
    // Закрытие по кнопке закрытия
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const modal = this.closest('.modal');
            if (modal) {
                hideModal(modal.id);
            }
        });
    });

    // Закрытие по клику вне модального окна
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                hideModal(this.id);
            }
        });
    });

    // Закрытие по ESC
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                if (modal.style.display === 'flex') {
                    hideModal(modal.id);
                }
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация анимаций
    initAnimations();

    // Проверка авторизации при загрузке
    checkAuthStatus();

    // Обработчики фильтров по рейтингу
    const ratingFilterButtons = document.querySelectorAll('.rating-filter-btn');
    ratingFilterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Удаляем активный класс у всех кнопок
            ratingFilterButtons.forEach(btn => btn.classList.remove('active'));
            // Добавляем активный класс текущей кнопке
            this.classList.add('active');
            // Перезагружаем отзывы с новыми фильтрами
            loadReviews();
        });
    });
    
    // Обработчик селекта сортировки
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            loadReviews();
        });
    }
    
    // Обработчик кнопки "Загрузить еще" (если нужен в будущем)
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            loadReviews(); // Для простоты перезагружаем все отзывы
        });
    }
    
    // Загрузка отзывов
    loadReviews();
    
    // Проверка авторизации при загрузке и обновление интерфейса
    const token = localStorage.getItem('token');
    if (token) {
        // Если пользователь авторизован, проверим его данные и обновим интерфейс
        fetch('/api/profile', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Not authenticated');
            }
        })
        .then(user => {
            updateAuthUI(user);
        })
        .catch(() => {
            // Если токен недействителен, очищаем его и обновляем интерфейс
            localStorage.removeItem('token');
            updateAuthUI(null);
        });
    } else {
        // Пользователь не авторизован
        updateAuthUI(null);
    }
    
    // Обработка формы
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Проверяем, авторизован ли пользователь
            const token = localStorage.getItem('token');
            if (!token) {
                // Если не авторизован, показываем окно входа
                showModal(document.getElementById('login-modal'));
                return;
            }
            
            const formData = new FormData(reviewForm);
            const reviewData = {
                name: formData.get('name'),
                email: formData.get('email'),
                rating: formData.get('rating'),
                comment: formData.get('comment')
            };
            
            submitReview(reviewData);
        });
    }
    
    // Обработчик счетчика символов
    const commentTextarea = document.getElementById('comment');
    const charCounter = document.querySelector('.char-counter');
    
    if (commentTextarea && charCounter) {
        commentTextarea.addEventListener('input', function() {
            const length = this.value.length;
            const maxLength = 500;
            charCounter.textContent = `${length}/${maxLength}`;
            
            if (length > maxLength) {
                this.value = this.value.substring(0, maxLength);
                charCounter.textContent = `${maxLength}/${maxLength}`;
            }
        });
    }

    // Закрытие модалок
    setupModalCloseHandlers();

    // Обработка формы входа
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Обработка формы регистрации
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Переключение между формами
    document.getElementById('switch-to-register')?.addEventListener('click', () => {
        switchModals(
            document.getElementById('login-modal'), 
            document.getElementById('register-modal')
        );
    });
    
    document.getElementById('switch-to-login')?.addEventListener('click', () => {
        switchModals(
            document.getElementById('register-modal'), 
            document.getElementById('login-modal')
        );
    });
    
    // Обработчики отмены
    document.getElementById('cancel-login')?.addEventListener('click', () => {
        hideModal('login-modal');
    });
    
    document.getElementById('cancel-register')?.addEventListener('click', () => {
        hideModal('register-modal');
    });
});

// Функция для обновления статистики отзывов
function updateReviewsStats(reviews) {
    const totalReviewsEl = document.getElementById('totalReviews');
    const averageRatingEl = document.getElementById('averageRating');
    
    if (totalReviewsEl) {
        totalReviewsEl.textContent = reviews.length;
    }
    
    if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = (totalRating / reviews.length).toFixed(1);
        if (averageRatingEl) {
            averageRatingEl.textContent = averageRating;
        }
    } else {
        if (averageRatingEl) {
            averageRatingEl.textContent = '0.0';
        }
    }
}

// Функция для фильтрации и сортировки отзывов
function filterAndSortReviews(reviews) {
    // Получаем выбранные фильтры
    const selectedRating = document.querySelector('.rating-filter-btn.active')?.dataset.rating || 'all';
    const sortValue = document.getElementById('sortSelect')?.value || 'newest';
    
    // Фильтруем по рейтингу
    let filteredReviews = reviews;
    if (selectedRating !== 'all') {
        const rating = parseInt(selectedRating);
        filteredReviews = reviews.filter(review => review.rating === rating);
    }
    
    // Сортируем
    filteredReviews.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date || a.updatedAt || a.timestamp || new Date());
        const dateB = new Date(b.createdAt || b.date || b.updatedAt || b.timestamp || new Date());
        
        switch(sortValue) {
            case 'newest':
                return dateB - dateA; // Новые первыми
            case 'oldest':
                return dateA - dateB; // Старые первыми
            case 'highest':
                if (b.rating !== a.rating) return b.rating - a.rating; // Высокий рейтинг первым
                return dateB - dateA;
            case 'lowest':
                if (a.rating !== b.rating) return a.rating - b.rating; // Низкий рейтинг первым
                return dateB - dateA;
            default:
                return dateB - dateA;
        }
    });
    
    return filteredReviews;
}

// Обновляем функцию загрузки отзывов с учетом фильтрации
function loadReviews() {
    fetch('/api/reviews')
        .then(response => response.json())
        .then(reviews => {
            const reviewsList = document.getElementById('reviewsList');
            
            if (reviews.length === 0) {
                reviewsList.innerHTML = `
                    <div class="no-reviews">
                        <p>Пока нет отзывов. Будьте первым!</p>
                    </div>
                `;
                
                // Обновляем статистику
                updateReviewsStats([]);
                return;
            }
            
            // Фильтруем и сортируем отзывы
            const filteredReviews = filterAndSortReviews(reviews);
            
            // Обновляем статистику
            updateReviewsStats(filteredReviews);
            
            if (filteredReviews.length === 0) {
                reviewsList.innerHTML = `
                    <div class="no-reviews">
                        <p>Нет отзывов, соответствующих фильтрам.</p>
                    </div>
                `;
                return;
            }
            
            reviewsList.innerHTML = '';
            
            filteredReviews.forEach(review => {
                const reviewCard = createReviewCard(review);
                reviewsList.appendChild(reviewCard);
            });
        })
        .catch(error => {
            console.error('Ошибка загрузки отзывов:', error);
            const reviewsList = document.getElementById('reviewsList');
            if (reviewsList) {
                reviewsList.innerHTML = `
                    <div class="error-loading">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Ошибка загрузки</h3>
                        <p>Не удалось загрузить отзывы. Пожалуйста, попробуйте позже.</p>
                        <button class="btn-outline-modern" onclick="loadReviews()">
                            <i class="fas fa-redo"></i>
                            Повторить попытку
                        </button>
                    </div>
                `;
            }
        });
}

function createReviewCard(review) {
    const card = document.createElement('div');
    card.className = 'review-card-modern'; // Обновляем класс для соответствия стилям
    
    // Создаем звезды рейтинга
    let stars = '';
    for (let i = 0; i < 5; i++) {
        if (i < review.rating) {
            stars += '<i class="fas fa-star"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    
    // Получаем инициалы для аватара
    const initials = review.name.split(' ').map(n => n[0]).join('').toUpperCase();
    
    // Форматируем дату
    const reviewDate = review.createdAt || review.date || new Date().toISOString();
    const date = new Date(reviewDate);
    const formattedDate = date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    card.innerHTML = `
        <div class="review-header-modern">
            <div class="review-author">
                <div class="author-avatar">${initials}</div>
                <div class="author-info">
                    <h4>${review.name}</h4>
                    <p>${review.email || 'Пользователь'}</p>
                </div>
            </div>
            <div class="review-rating">${stars}</div>
        </div>
        <div class="review-content">
            <p>${review.comment}</p>
        </div>
        <div class="review-footer">
            <div class="review-date">
                ${formattedDate}
            </div>
        </div>
    `;
    
    return card;
}

function submitReview(reviewData) {
    // Добавляем дату создания отзыва
    const reviewWithDate = {
        ...reviewData,
        createdAt: new Date().toISOString()
    };
    
    // Получаем токен пользователя
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Для отправки отзыва необходимо авторизоваться');
        showModal(document.getElementById('login-modal'));
        return;
    }
    
    fetch('/api/reviews', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewWithDate)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            document.getElementById('reviewForm').reset();
            loadReviews(); // Обновляем список отзывов
        } else {
            alert('Ошибка: ' + (data.error || 'Не удалось отправить отзыв'));
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при отправке отзыва');
    });
}

// Упрощенная функция инициализации анимаций
function initAnimations() {
    // Анимация появления элементов при загрузке
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
}