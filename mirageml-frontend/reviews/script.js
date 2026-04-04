// ==========================================
// MirageML Reviews Page
// ==========================================

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

// ==========================================
// Auth Status
// ==========================================

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
    const authStatusText = document.getElementById('auth-status-text');

    if (user) {
        if (authStatusText) authStatusText.textContent = user.name;
        updateReviewFormForAuthorizedUser(user);
    } else {
        if (authStatusText) authStatusText.textContent = 'Гость';
        updateReviewFormForUnauthorizedUser();
    }
}

function logout() {
    localStorage.removeItem('token');
    updateAuthUI(null);
}

// ==========================================
// Review Form
// ==========================================

function updateReviewFormForAuthorizedUser(user) {
    const formContainer = document.querySelector('.form-container');
    if (!formContainer) return;

    formContainer.innerHTML = `
        <div class="form-header">
            <h2><i class="fas fa-edit"></i> Оставить отзыв</h2>
            <p>Поделитесь вашим опытом работы с MirageML</p>
        </div>

        <form id="reviewForm" class="modern-form">
            <input type="hidden" id="name" name="name" value="${user.name}">
            <input type="hidden" id="email" name="email" value="${user.email}">

            <div class="form-group">
                <label><i class="fas fa-star"></i> Ваша оценка*</label>
                <div class="rating-stars-modern">
                    <input type="radio" id="star1" name="rating" value="1">
                    <label for="star1" class="star-label"><i class="fas fa-star"></i><span>Ужасно</span></label>
                    <input type="radio" id="star2" name="rating" value="2">
                    <label for="star2" class="star-label"><i class="fas fa-star"></i><span>Плохо</span></label>
                    <input type="radio" id="star3" name="rating" value="3">
                    <label for="star3" class="star-label"><i class="fas fa-star"></i><span>Нормально</span></label>
                    <input type="radio" id="star4" name="rating" value="4">
                    <label for="star4" class="star-label"><i class="fas fa-star"></i><span>Хорошо</span></label>
                    <input type="radio" id="star5" name="rating" value="5" required>
                    <label for="star5" class="star-label"><i class="fas fa-star"></i><span>Отлично</span></label>
                </div>
            </div>

            <div class="form-group">
                <label for="comment"><i class="fas fa-comment"></i> Ваш отзыв*</label>
                <textarea id="comment" name="comment" required placeholder="Расскажите о вашем опыте использования MirageML..."></textarea>
                <div class="char-counter">0/500</div>
            </div>

            <button type="submit" class="cta-button primary submit-btn">
                <i class="fas fa-paper-plane"></i> Опубликовать отзыв
                <div class="btn-shine"></div>
            </button>
        </form>
    `;

    initReviewForm();
}

function updateReviewFormForUnauthorizedUser() {
    const formContainer = document.querySelector('.form-container');
    if (!formContainer) return;

    formContainer.innerHTML = `
        <div class="auth-required-message">
            <h3><i class="fas fa-lock"></i> Чтобы оставить отзыв</h3>
            <p>Пожалуйста, авторизуйтесь на <a href="../main/index.html">главной странице</a></p>
        </div>
    `;
}

function initReviewForm() {
    const reviewForm = document.getElementById('reviewForm');
    if (!reviewForm) return;

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
            charCounter.textContent = `${Math.min(length, maxLength)}/${maxLength}`;
            if (length > maxLength) {
                this.value = this.value.substring(0, maxLength);
            }
        });
    }
}

async function submitReview(reviewData) {
    try {
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData)
        });

        const data = await response.json();

        if (data.success) {
            alert('Спасибо за ваш отзыв! Он появится после модерации.');
            document.getElementById('reviewForm')?.reset();
            loadReviews();
        } else {
            alert(data.error || 'Ошибка при отправке отзыва');
        }
    } catch (error) {
        console.error('Ошибка отправки отзыва:', error);
        alert('Ошибка подключения к серверу');
    }
}

// ==========================================
// Date Formatting Helpers
// ==========================================

function formatRelativeDate(dateString) {
    if (!dateString) return 'Неизвестно';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Неизвестно';

    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffSec < 60) return 'только что';
    if (diffMin < 60) {
        const n = diffMin;
        if (n === 1) return '1 минуту назад';
        if (n >= 2 && n <= 4) return `${n} минуты назад`;
        return `${n} минут назад`;
    }
    if (diffHour < 24) {
        const n = diffHour;
        if (n === 1) return '1 час назад';
        if (n >= 2 && n <= 4) return `${n} часа назад`;
        return `${n} часов назад`;
    }
    if (diffDay < 30) {
        const n = diffDay;
        if (n === 1) return 'вчера';
        if (n >= 2 && n <= 4) return `${n} дня назад`;
        return `${n} дней назад`;
    }
    if (diffMonth < 12) {
        const n = diffMonth;
        if (n === 1) return 'месяц назад';
        if (n >= 2 && n <= 4) return `${n} месяца назад`;
        return `${n} месяцев назад`;
    }
    const n = diffYear;
    if (n === 1) return 'год назад';
    if (n >= 2 && n <= 4) return `${n} года назад`;
    return `${n} лет назад`;
}

function formatFullDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

// ==========================================
// Reviews Display
// ==========================================

function updateReviewsStats(reviews) {
    const totalReviewsEl = document.getElementById('totalReviews');
    const averageRatingEl = document.getElementById('averageRating');

    if (totalReviewsEl) totalReviewsEl.textContent = reviews.length;

    if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = (totalRating / reviews.length).toFixed(1);
        if (averageRatingEl) averageRatingEl.textContent = averageRating;
    } else {
        if (averageRatingEl) averageRatingEl.textContent = '0.0';
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
            case 'newest': return dateB - dateA;
            case 'oldest': return dateA - dateB;
            case 'highest': return b.rating !== a.rating ? b.rating - a.rating : dateB - dateA;
            case 'lowest': return a.rating !== b.rating ? a.rating - b.rating : dateB - dateA;
            default: return dateB - dateA;
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
                reviewsList.innerHTML = '<div class="no-reviews"><p>Пока нет отзывов. Будьте первым!</p></div>';
                updateReviewsStats([]);
                return;
            }

            const filteredReviews = filterAndSortReviews(reviews);
            updateReviewsStats(filteredReviews);

            if (filteredReviews.length === 0) {
                reviewsList.innerHTML = '<div class="no-reviews"><p>Нет отзывов, соответствующих фильтрам.</p></div>';
                return;
            }

            reviewsList.innerHTML = '';
            filteredReviews.forEach(review => {
                reviewsList.appendChild(createReviewCard(review));
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
                        <p>Не удалось загрузить отзывы. Попробуйте позже.</p>
                        <button class="btn-outline-modern" onclick="loadReviews()">
                            <i class="fas fa-redo"></i> Повторить попытку
                        </button>
                    </div>`;
            }
        });
}

function createReviewCard(review) {
    const card = document.createElement('div');
    card.className = 'review-card-modern';

    let stars = '';
    for (let i = 0; i < 5; i++) {
        stars += i < review.rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
    }

    const initials = review.name.split(' ').map(n => n[0]).join('').toUpperCase();
    const relativeDate = formatRelativeDate(review.createdAt);
    const fullDate = formatFullDate(review.createdAt);

    card.innerHTML = `
        <div class="review-header-modern">
            <div class="review-author">
                <div class="author-avatar">${initials}</div>
                <div class="author-info">
                    <h4>${review.name}</h4>
                    <p class="review-date" title="${fullDate}">${relativeDate}</p>
                </div>
            </div>
            <div class="review-rating">${stars}</div>
        </div>
        <div class="review-content">
            <p>${review.comment || ''}</p>
        </div>`;

    return card;
}

// ==========================================
// Animations
// ==========================================

function initAnimations() {
    const elements = document.querySelectorAll('.preview-element');
    elements.forEach(el => {
        el.style.setProperty('--float-delay', `${Math.random() * 3}s`);
    });
}

// ==========================================
// DOM Ready
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    initAnimations();
    checkAuthStatus();
    loadReviews();

    // Rating filter
    document.querySelectorAll('.rating-filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.rating-filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            loadReviews();
        });
    });

    // Sort
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', loadReviews);
    }
});
