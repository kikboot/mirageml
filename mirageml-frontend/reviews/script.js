function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

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

function updateAuthUI(user) {
    const authButtons = document.querySelector('.auth-buttons');
    const mainNavLink = document.querySelector('.main-link');

    if (!authButtons) return;

    if (user) {
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

        mainNavLink && (mainNavLink.style.display = 'none');

        document.getElementById('logout-btn')?.addEventListener('click', logout);

        initUserMenu();

        updateReviewFormForAuthorizedUser(user);
    } else {
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
        
        mainNavLink && (mainNavLink.style.display = 'flex');

        document.getElementById('login-btn')?.addEventListener('click', () => {
            showModal(document.getElementById('login-modal'));
            hideNotification('login-notification');
        });

        document.getElementById('register-btn')?.addEventListener('click', () => {
            showModal(document.getElementById('register-modal'));
            hideNotification('register-notification');
        });

        updateReviewFormForUnauthorizedUser();
    }
}

function initUserMenu() {
    const userMenus = document.querySelectorAll('.user-menu');

    userMenus.forEach(menu => {
        const button = menu.querySelector('.user-avatar');
        const dropdown = menu.querySelector('.dropdown-content');

        if (!button || !dropdown) return;

        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', !isExpanded);
            dropdown.style.display = isExpanded ? 'none' : 'block';
        });

        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target)) {
                button.setAttribute('aria-expanded', 'false');
                dropdown.style.display = 'none';
            }
        });
    });
}

function logout() {
    localStorage.removeItem('token');
    updateAuthUI(null);

    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

function showModal(modal) {
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        const firstInput = modal.querySelector('input');
        if (firstInput) {
            setTimeout(() => {
                firstInput.focus();
                firstInput.select();
            }, 100);
        }
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';

        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

function hideNotification(notificationId) {
    const notification = document.getElementById(notificationId);
    if (notification) {
        notification.style.display = 'none';
        notification.textContent = '';
    }
}

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

function switchModals(fromModal, toModal) {
    if (fromModal) fromModal.style.display = 'none';
    if (toModal) {
        toModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        const firstInput = toModal.querySelector('input');
        if (firstInput) {
            setTimeout(() => {
                firstInput.focus();
                firstInput.select();
            }, 100);
        }
    }
}

function updateReviewFormForAuthorizedUser(user) {
    const formContainer = document.querySelector('.form-container');

    if (!formContainer) return;

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

function updateReviewFormForUnauthorizedUser() {
    const formContainer = document.querySelector('.form-container');
    
    if (!formContainer) return;
    
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
    
    document.getElementById('show-login-modal')?.addEventListener('click', () => {
        showModal(document.getElementById('login-modal'));
    });
    
    document.getElementById('show-register-modal')?.addEventListener('click', () => {
        showModal(document.getElementById('register-modal'));
    });
}

function setupModalCloseHandlers() {
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const modal = this.closest('.modal');
            if (modal) {
                hideModal(modal.id);
            }
        });
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                hideModal(this.id);
            }
        });
    });

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
    initAnimations();

    checkAuthStatus();

    const ratingFilterButtons = document.querySelectorAll('.rating-filter-btn');
    ratingFilterButtons.forEach(button => {
        button.addEventListener('click', function() {
            ratingFilterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            loadReviews();
        });
    });
    
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            loadReviews();
        });
    }
    
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            loadReviews(); // Для простоты перезагружаем все отзывы
        });
    }
    
    loadReviews();
    
    const token = localStorage.getItem('token');
    if (token) {
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
            localStorage.removeItem('token');
            updateAuthUI(null);
        });
    } else {
        updateAuthUI(null);
    }
    
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const token = localStorage.getItem('token');
            if (!token) {
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

    setupModalCloseHandlers();

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

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
    
    document.getElementById('cancel-login')?.addEventListener('click', () => {
        hideModal('login-modal');
    });
    
    document.getElementById('cancel-register')?.addEventListener('click', () => {
        hideModal('register-modal');
    });
});

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

function filterAndSortReviews(reviews) {
    const selectedRating = document.querySelector('.rating-filter-btn.active')?.dataset.rating || 'all';
    const sortValue = document.getElementById('sortSelect')?.value || 'newest';
    
    let filteredReviews = reviews;
    if (selectedRating !== 'all') {
        const rating = parseInt(selectedRating);
        filteredReviews = reviews.filter(review => review.rating === rating);
    }
    
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
                
                updateReviewsStats([]);
                return;
            }
            
            const filteredReviews = filterAndSortReviews(reviews);
            
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
    
    let stars = '';
    for (let i = 0; i < 5; i++) {
        if (i < review.rating) {
            stars += '<i class="fas fa-star"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    
    const initials = review.name.split(' ').map(n => n[0]).join('').toUpperCase();
    
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
    const reviewWithDate = {
        ...reviewData,
        createdAt: new Date().toISOString()
    };
    
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

function initAnimations() {
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
}