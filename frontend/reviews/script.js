// ==========================================
// MiruFlow Reviews Page - Full Header Functionality
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('[Reviews] DOM загружен');
    
    initMobileMenu();
    
    initModals();
    
    checkAuthStatus();
    
    initGoogleAuth();
    
    initTermsHandlers();
    
    loadReviews();
    
    initRatingFilter();
    
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', loadReviews);
    }
    
    window.addEventListener('resize', handleResize);
});

// ==========================================
// Mobile Menu
// ==========================================

function initMobileMenu() {
    updateMobileMenuVisibility();
}

function openMobileMenu() {
    const mobileMenuContainer = document.querySelector('.mobile-menu-container');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav .nav-link');
    const mobileAuthButtons = document.querySelectorAll('.mobile-auth-buttons .btn');
    
    if (!mobileMenuContainer || !mobileMenuBtn) return;

    mobileMenuContainer.classList.add('active');
    mobileMenuBtn.classList.add('active');
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
    const mobileProfileBtn = document.getElementById('mobile-profile-btn');
    const mobileProfileMenu = document.getElementById('mobile-profile-menu');
    const mobileProfileSection = document.querySelector('.mobile-profile-section');

    if (!mobileMenuContainer || !mobileMenuBtn) return;

    // Сброс профиля при закрытии меню
    if (mobileProfileBtn) mobileProfileBtn.classList.remove('active');
    if (mobileProfileMenu) mobileProfileMenu.classList.remove('active');
    if (mobileProfileSection) mobileProfileSection.classList.remove('fixed');

    mobileNavLinks.forEach(link => {
        link.classList.remove('animate-in');
        link.style.removeProperty('--i');
    });

    mobileAuthButtons.forEach(btn => {
        btn.classList.remove('animate-in');
    });

    mobileMenuContainer.classList.remove('active');
    mobileMenuBtn.classList.remove('active');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
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

function handleResize() {
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(() => {
        updateMobileMenuVisibility();
    }, 250);
}

// ==========================================
// Modals
// ==========================================

function initModals() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const mobileLoginBtn = document.getElementById('mobile-login-btn');
    const mobileRegisterBtn = document.getElementById('mobile-register-btn');
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            showModal(document.getElementById('login-modal'));
            hideNotification('login-notification');
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            showModal(document.getElementById('register-modal'));
            hideNotification('register-notification');
        });
    }

    if (mobileLoginBtn) {
        mobileLoginBtn.addEventListener('click', () => {
            closeMobileMenu();
            setTimeout(() => {
                showModal(document.getElementById('login-modal'));
                hideNotification('login-notification');
            }, 300);
        });
    }

    if (mobileRegisterBtn) {
        mobileRegisterBtn.addEventListener('click', () => {
            closeMobileMenu();
            setTimeout(() => {
                showModal(document.getElementById('register-modal'));
                hideNotification('register-notification');
            }, 300);
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

    if (switchToRegister) {
        switchToRegister.addEventListener('click', () => {
            switchModals(document.getElementById('login-modal'), document.getElementById('register-modal'));
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', () => {
            switchModals(document.getElementById('register-modal'), document.getElementById('login-modal'));
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

    const mobileMenuContainer = document.querySelector('.mobile-menu-container');
    if (mobileMenuContainer) {
        mobileMenuContainer.addEventListener('click', (e) => {
            if (e.target === mobileMenuContainer) {
                closeMobileMenu();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const mobileMenuContainer = document.querySelector('.mobile-menu-container');
            if (mobileMenuContainer && mobileMenuContainer.classList.contains('active')) {
                closeMobileMenu();
            }
        }
    });

    const mobileProfileBtn = document.getElementById('mobile-profile-btn');
    const mobileProfileMenu = document.getElementById('mobile-profile-menu');
    const mobileProfileSection = document.querySelector('.mobile-profile-section');
    
    if (mobileProfileBtn && mobileProfileMenu) {
        mobileProfileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileProfileBtn.classList.toggle('active');
            mobileProfileMenu.classList.toggle('active');
            if (mobileProfileSection) mobileProfileSection.classList.toggle('fixed');
        });

        mobileProfileMenu.querySelectorAll('.mobile-profile-item').forEach(item => {
            item.addEventListener('click', () => {
                mobileProfileBtn.classList.remove('active');
                mobileProfileMenu.classList.remove('active');
                if (mobileProfileSection) mobileProfileSection.classList.remove('fixed');
                closeMobileMenu();
            });
        });
    }

    document.querySelectorAll('.mobile-nav .nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (mobileProfileBtn) mobileProfileBtn.classList.remove('active');
            if (mobileProfileMenu) mobileProfileMenu.classList.remove('active');
            closeMobileMenu();
        });
    });

    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', () => {
            logout();
        });
    }
}

function showModal(modal) {
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        const firstInput = modal.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
        modal.addEventListener('keydown', handleModalKeyboard);
    }
}

function hideModal(modal) {
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        modal.removeEventListener('keydown', handleModalKeyboard);
    }
}

function handleModalKeyboard(e) {
    if (e.key === 'Escape') {
        const modal = e.target.closest('.modal');
        hideModal(modal);
    }
    if (e.key === 'Tab') {
        const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const modal = e.target.closest('.modal');
        if (modal) {
            const focusableContent = modal.querySelectorAll(focusableElements);
            const firstFocusableElement = focusableContent[0];
            const lastFocusableElement = focusableContent[focusableContent.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === firstFocusableElement) {
                    lastFocusableElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusableElement) {
                    firstFocusableElement.focus();
                    e.preventDefault();
                }
            }
        }
    }
}

function switchModals(fromModal, toModal) {
    hideModal(fromModal);
    showModal(toModal);
}

function setupModalCloseHandlers() {
    document.querySelectorAll('.close-btn, .btn-ghost').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target.id === 'cancel-login' || e.target.id === 'cancel-register' || e.target.classList.contains('close-btn')) {
                document.querySelectorAll('.modal').forEach(modal => {
                    hideModal(modal);
                });
            }
        });
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal);
            }
        });
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
        if (type === 'success') {
            setTimeout(() => {
                notification.style.display = 'none';
            }, 5000);
        }
    }
}

function showSuccessMessage(message) {
    alert(message);
}

// ==========================================
// Auth
// ==========================================

let pendingRegistration = null;
let pendingGoogleData = null;

async function checkAuthStatus() {
    let token = localStorage.getItem('token');
    if (!token) {
        token = sessionStorage.getItem('token');
    }
    if (!token) {
        resetAuthUI();
        updateReviewFormForUnauthorizedUser();
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
            updateReviewFormForAuthorizedUser(user);
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('authToken');
            resetAuthUI();
            updateReviewFormForUnauthorizedUser();
        }
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('authToken');
        resetAuthUI();
        updateReviewFormForUnauthorizedUser();
    }
}

function resetAuthUI() {
    const mobileProfileSection = document.querySelector('.mobile-profile-section');
    const mobileAuthButtons = document.querySelector('.mobile-auth-buttons');
    const mobileNav = document.querySelector('.mobile-nav');
    
    if (mobileProfileSection) {
        mobileProfileSection.style.display = 'none';
    }
    
    if (mobileAuthButtons) {
        mobileAuthButtons.style.display = 'flex';
    }
    
    if (mobileNav) {
        mobileNav.style.marginTop = '0';
    }
}

function updateAuthUI(user) {
    const authButtons = document.querySelector('.auth-buttons');
    const mobileProfileSection = document.querySelector('.mobile-profile-section');
    const mobileAuthButtons = document.querySelector('.mobile-auth-buttons');
    const mobileNav = document.querySelector('.mobile-nav');
    
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
                    <a href="/profile" class="dropdown-item" role="menuitem">
                        <i class="fas fa-user"></i> Профиль
                    </a>
                    <a href="/projects" class="dropdown-item" role="menuitem">
                        <i class="fas fa-project-diagram"></i> Мои проекты
                    </a>
                    <a href="/settings" class="dropdown-item" role="menuitem">
                        <i class="fas fa-cog"></i> Настройки
                    </a>
                    <a href="../support/index.html" class="dropdown-item" role="menuitem">
                        <i class="fas fa-headset"></i> Тех-поддержка
                    </a>
                    <div class="dropdown-divider"></div>
                    <button id="logout-btn" class="dropdown-item" role="menuitem">
                        <i class="fas fa-sign-out-alt"></i> Выйти
                    </button>
                </div>
            </div>`;
        
        if (mobileProfileSection) {
            mobileProfileSection.style.display = 'block';
            mobileProfileSection.innerHTML = `
                <button class="mobile-profile-btn" id="mobile-profile-btn">
                    <div class="mobile-profile-avatar" style="background: linear-gradient(135deg, var(--primary), var(--primary-light)); color: white;">
                        ${userInitials}
                    </div>
                    <span class="mobile-profile-text">${user.name}</span>
                    <i class="fas fa-chevron-down mobile-profile-arrow"></i>
                </button>
                <div class="mobile-profile-menu" id="mobile-profile-menu">
                    <a href="/profile" class="mobile-profile-item">
                        <i class="fas fa-user-circle"></i> Мой профиль
                    </a>
                    <a href="/projects" class="mobile-profile-item">
                        <i class="fas fa-project-diagram"></i> Мои проекты
                    </a>
                    <a href="/settings" class="mobile-profile-item">
                        <i class="fas fa-cog"></i> Настройки
                    </a>
                    <button class="mobile-profile-item" id="mobile-logout-btn">
                        <i class="fas fa-sign-out-alt"></i> Выйти
                    </button>
                </div>`;
            
            initMobileProfileHandlers();
        }
        
        if (mobileAuthButtons) {
            mobileAuthButtons.style.display = 'none';
        }

        initDesktopUserMenu();
        updateReviewFormForAuthorizedUser(user);
    } else {
        resetAuthUI();
    }
}

function initDesktopUserMenu() {
    const userAvatar = document.querySelector('.user-avatar');
    const userMenu = document.querySelector('.user-menu');
    
    if (userAvatar && userMenu) {
        userAvatar.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = userMenu.classList.contains('active');
            closeAllUserMenus();
            if (!isActive) {
                userMenu.classList.add('active');
                userAvatar.setAttribute('aria-expanded', 'true');
            }
        });

        document.addEventListener('click', () => {
            userMenu.classList.remove('active');
            userAvatar.setAttribute('aria-expanded', 'false');
        });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
        });
    }
}

function closeAllUserMenus() {
    const userMenus = document.querySelectorAll('.user-menu');
    const userAvatars = document.querySelectorAll('.user-avatar');
    userMenus.forEach(menu => menu.classList.remove('active'));
    userAvatars.forEach(avatar => avatar.setAttribute('aria-expanded', 'false'));
}

function initMobileProfileHandlers() {
    const mobileProfileBtn = document.getElementById('mobile-profile-btn');
    const mobileProfileMenu = document.getElementById('mobile-profile-menu');
    
    if (mobileProfileBtn && mobileProfileMenu) {
        mobileProfileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileProfileBtn.classList.toggle('active');
            mobileProfileMenu.classList.toggle('active');
        });

        mobileProfileMenu.querySelectorAll('.mobile-profile-item').forEach(item => {
            item.addEventListener('click', () => {
                mobileProfileBtn.classList.remove('active');
                mobileProfileMenu.classList.remove('active');
                closeMobileMenu();
            });
        });
    }

    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', () => {
            logout();
        });
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('authToken');
    window.location.reload();
}

async function handleLogin(e) {
    e.preventDefault();

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        let data = {};
        if (response.headers.get('content-type') && response.headers.get('content-type').includes('application/json')) {
            data = await response.json();
        } else {
            data = { error: await response.text() || 'Ошибка сервера' };
        }

        if (response.ok && data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('authToken', data.token);
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('authToken', data.token);

            updateAuthUI(data.user);
            document.querySelectorAll('.modal').forEach(m => hideModal(m));
            checkAuthStatus();
        } else {
            showNotification('login-notification', data.error || 'Ошибка входа');
        }
    } catch (error) {
        console.error('Ошибка входа:', error);
        showNotification('login-notification', 'Ошибка соединения с сервером');
    }
}

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

    hideNotification('register-notification');

    if (password !== confirm) {
        showNotification('register-notification', 'Пароли не совпадают');
        return;
    }

    pendingRegistration = { name, email, password };
    hideModal(document.getElementById('register-modal'));
    showTermsModal();
}

function initGoogleAuth() {
    const googleLoginBtn = document.getElementById('google-login-btn');
    const googleRegisterBtn = document.getElementById('google-register-btn');

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => handleGoogleLogin('login'));
    }
    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener('click', () => handleGoogleLogin('register'));
    }
}

async function handleGoogleLogin(mode) {
    showNotification('login-notification', 'Google авторизация недоступна на этой странице');
}

async function submitRegistration(name, email, password) {
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, acceptTerms: true })
        });

        const data = await response.json();

        if (response.ok && (data.success || response.status === 201)) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('authToken', data.token);
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('authToken', data.token);

            updateAuthUI(data.user);
            document.querySelectorAll('.modal').forEach(m => hideModal(m));
            showSuccessMessage('Регистрация успешна!');
            checkAuthStatus();
        } else {
            showNotification('register-notification', data.error || 'Ошибка регистрации');
        }
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        showNotification('register-notification', 'Ошибка соединения');
    }
}

// ==========================================
// Terms Modal
// ==========================================

function initTermsHandlers() {
    const acceptCheckbox = document.getElementById('accept-terms');
    const acceptBtn = document.getElementById('terms-accept-btn');
    const declineBtn = document.getElementById('terms-decline-btn');
    const termsModal = document.getElementById('terms-modal');
    const closeBtn = termsModal?.querySelector('.close-btn');

    if (acceptCheckbox && acceptBtn) {
        acceptCheckbox.addEventListener('change', () => {
            acceptBtn.disabled = !acceptCheckbox.checked;
        });
    }

    if (acceptBtn) {
        acceptBtn.addEventListener('click', async () => {
            if (!acceptCheckbox.checked) return;

            if (pendingRegistration) {
                const { name, email, password } = pendingRegistration;
                pendingRegistration = null;
                hideModal(termsModal);
                await submitRegistration(name, email, password);
            } else if (pendingGoogleData) {
                const { credential, access_token } = pendingGoogleData;
                pendingGoogleData = null;
                hideModal(termsModal);
            }
        });
    }

    if (declineBtn) {
        declineBtn.addEventListener('click', () => {
            pendingRegistration = null;
            pendingGoogleData = null;
            hideModal(termsModal);
            showNotification('register-notification', 'Необходимо принять условия');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            pendingRegistration = null;
            pendingGoogleData = null;
            hideModal(termsModal);
        });
    }

    if (termsModal) {
        termsModal.addEventListener('click', (e) => {
            if (e.target === termsModal) {
                pendingRegistration = null;
                pendingGoogleData = null;
                hideModal(termsModal);
            }
        });
    }
}

function showTermsModal() {
    const termsModal = document.getElementById('terms-modal');
    const acceptCheckbox = document.getElementById('accept-terms');
    const acceptBtn = document.getElementById('terms-accept-btn');

    if (acceptCheckbox) acceptCheckbox.checked = false;
    if (acceptBtn) acceptBtn.disabled = true;

    showModal(termsModal);
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
            <p>Поделитесь вашим опытом работы с MiruFlow</p>
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
                <textarea id="comment" name="comment" required placeholder="Расскажите о вашем опыте использования MiruFlow..."></textarea>
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
            <h3><i class="fas fa-lock"></i> Авторизация erforderlich</h3>
            <p>Чтобы оставить отзыв, пожалуйста, войдите или зарегистрируйтесь.</p>
            <div class="auth-required-actions">
                <button class="btn btn-primary" id="review-login-btn">
                    <i class="fas fa-sign-in-alt"></i> Войти
                </button>
                <button class="btn btn-ghost" id="review-register-btn">
                    <i class="fas fa-user-plus"></i> Регистрация
                </button>
            </div>
        </div>
    `;

    const reviewLoginBtn = document.getElementById('review-login-btn');
    const reviewRegisterBtn = document.getElementById('review-register-btn');

    if (reviewLoginBtn) {
        reviewLoginBtn.addEventListener('click', () => {
            showModal(document.getElementById('login-modal'));
        });
    }
    if (reviewRegisterBtn) {
        reviewRegisterBtn.addEventListener('click', () => {
            showModal(document.getElementById('register-modal'));
        });
    }
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
// Reviews Display
// ==========================================

function initRatingFilter() {
    document.querySelectorAll('.rating-filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.rating-filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            loadReviews();
        });
    });
}

function getInitials(name) {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

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