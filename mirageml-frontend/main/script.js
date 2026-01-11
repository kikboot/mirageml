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
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenuContainer = document.querySelector('.mobile-menu-container');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    const mobileLoginBtn = document.getElementById('mobile-login-btn');
    const mobileRegisterBtn = document.getElementById('mobile-register-btn');
    
    // Инициализация анимаций
    initAnimations();
    
    // Проверка авторизации при загрузке
    checkAuthStatus();
    
    // Инициализация мобильного меню
    initMobileMenu();

    // Открытие модальных окон с очисткой уведомлений
    if (loginBtn) loginBtn.addEventListener('click', () => {
        showModal(loginModal);
        hideNotification('login-notification');
    });
    
    if (registerBtn) registerBtn.addEventListener('click', () => {
        showModal(registerModal);
        hideNotification('register-notification');
    });
    
    if (mobileLoginBtn) {
        mobileLoginBtn.addEventListener('click', () => {
            closeMobileMenu();
            setTimeout(() => {
                showModal(loginModal);
                hideNotification('login-notification');
            }, 300);
        });
    }
    
    if (mobileRegisterBtn) {
        mobileRegisterBtn.addEventListener('click', () => {
            closeMobileMenu();
            setTimeout(() => {
                showModal(registerModal);
                hideNotification('register-notification');
            }, 300);
        });
    }
    
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

    // Открытие/закрытие мобильного меню
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', openMobileMenu);
    }
    
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', closeMobileMenu);
    }
    
    // Закрытие мобильного меню при клике на ссылку
    document.querySelectorAll('.mobile-nav .nav-link').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
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

    // Обработка FAQ аккордеона
    initFAQAccordion();

    // Инициализация обработчиков для улучшения UX
    initUXEnhancements();

    // Инициализация плавного скролла
    initSmoothScroll();
    
    // Закрытие мобильного меню при клике вне его
    if (mobileMenuContainer) {
        mobileMenuContainer.addEventListener('click', (e) => {
            if (e.target === mobileMenuContainer) {
                closeMobileMenu();
            }
        });
    }
    
    // Закрытие мобильного меню по клавише Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenuContainer.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    // Обновление хедера при изменении размера окна
    window.addEventListener('resize', handleResize);
});

// Функции мобильного меню
function openMobileMenu() {
    const mobileMenuContainer = document.querySelector('.mobile-menu-container');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav .nav-link');
    const mobileAuthButtons = document.querySelectorAll('.mobile-auth-buttons .btn');
    
    if (!mobileMenuContainer || !mobileMenuBtn) return;
    
    // Открываем меню
    mobileMenuContainer.classList.add('active');
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    
    // Добавляем задержку для анимации элементов меню
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
    
    // Убираем анимацию с элементов
    mobileNavLinks.forEach(link => {
        link.classList.remove('animate-in');
        link.style.removeProperty('--i');
    });
    
    mobileAuthButtons.forEach(btn => {
        btn.classList.remove('animate-in');
    });
    
    // Закрываем меню
    mobileMenuContainer.classList.remove('active');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

function initMobileMenu() {
    // Проверяем, нужно ли показывать мобильное меню
    updateMobileMenuVisibility();
}

function updateMobileMenuVisibility() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');
    const authButtons = document.querySelector('.auth-buttons');
    
    if (!mobileMenuBtn || !mainNav || !authButtons) return;
    
    // Проверяем ширину окна
    if (window.innerWidth <= 1024) {
        // Мобильный вид
        mobileMenuBtn.style.display = 'flex';
        mainNav.style.display = 'none';
        authButtons.style.display = 'none';
    } else {
        // Десктоп вид
        mobileMenuBtn.style.display = 'none';
        mainNav.style.display = 'flex';
        authButtons.style.display = 'flex';
        
        // Закрываем мобильное меню если оно открыто
        closeMobileMenu();
    }
}

function handleResize() {
    // Дебаунс для оптимизации
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(() => {
        updateMobileMenuVisibility();
        updateGridLayouts();
    }, 250);
}

function updateGridLayouts() {
    // Обновляем количество колонок в зависимости от ширины экрана
    const grids = document.querySelectorAll('.product-grid, .audience-grid, .advantages-grid-modern, .features-grid-modern, .reviews-grid-modern, .blocks-grid, .pricing-grid');
    
    grids.forEach(grid => {
        if (window.innerWidth <= 768) {
            // Мобильные - 1 колонка
            grid.style.gridTemplateColumns = '1fr';
        } else if (window.innerWidth <= 1024) {
            // Планшеты - 2 колонки
            grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        } else {
            // Десктоп - 3 колонки (кроме некоторых исключений)
            if (grid.classList.contains('blocks-grid') || grid.classList.contains('features-grid-modern')) {
                grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
            }
        }
    });
}

// Анимации и эффекты с улучшенной производительностью
function initAnimations() {
    // Используем requestAnimationFrame для лучшей производительности
    requestAnimationFrame(() => {
        animateFloatingElements();
        animateBackgroundGrid();
        animateStats();
        initLazyLoading();
    });
}

function animateFloatingElements() {
    const elements = document.querySelectorAll('.preview-element');
    if (!elements.length) return;

    // Используем CSS переменные для анимации
    document.documentElement.style.setProperty('--float-animation-duration', '20s');
    
    elements.forEach((element, index) => {
        element.style.setProperty('--float-delay', `${index * 0.5}s`);
        element.style.setProperty('--float-distance', `${15 + Math.random() * 10}px`);
        
        // Добавляем Intersection Observer для оптимизации
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-float');
                } else {
                    entry.target.classList.remove('animate-float');
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(element);
    });
}

function animateBackgroundGrid() {
    const orbits = document.querySelectorAll('.grid-orbit');
    orbits.forEach((orbit, index) => {
        const speed = 60 + index * 15;
        orbit.style.animationDuration = `${speed}s`;
        
        // Пауза анимации при неактивной вкладке
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                orbit.style.animationPlayState = 'paused';
            } else {
                orbit.style.animationPlayState = 'running';
            }
        });
    });
}

function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    if (!stats.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stat = entry.target;
                const text = stat.textContent;
                
                if (text.includes('+')) {
                    const finalValue = parseInt(text);
                    animateCounter(stat, 0, finalValue, 1500);
                } else if (text.includes('%')) {
                    const finalValue = parseInt(text);
                    animateCounter(stat, 0, finalValue, 1500);
                } else if (text.includes('x')) {
                    const finalValue = parseInt(text);
                    animateCounter(stat, 0, finalValue, 1500);
                }
                observer.unobserve(stat);
            }
        });
    }, { 
        threshold: 0.5,
        rootMargin: '50px'
    });

    stats.forEach(stat => observer.observe(stat));
}

function animateCounter(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        
        if (element.textContent.includes('%')) {
            element.textContent = value + '%';
        } else if (element.textContent.includes('x')) {
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

// Ленивая загрузка изображений
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src], img[data-srcset]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                    if (img.dataset.srcset) {
                        img.srcset = img.dataset.srcset;
                    }
                    
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

// Параллакс эффекты с оптимизацией производительности
function initParallaxEffects() {
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

// Анимации при скролле с улучшенной производительностью
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
        '.advantage-card-modern, .feature-card-modern, .donate-method-modern, .product-card, .audience-card, .block-card'
    );
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in-view');
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '50px'
    });
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// FAQ аккордеон
function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Закрываем все другие открытые элементы
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    const answer = otherItem.querySelector('.faq-answer');
                    answer.style.maxHeight = '0';
                }
            });
            
            // Переключаем текущий элемент
            item.classList.toggle('active');
            const answer = item.querySelector('.faq-answer');
            
            if (item.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                answer.style.maxHeight = '0';
            }
        });
        
        // Обработка клавиатуры
        question.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                question.click();
            }
        });
    });
}

// Улучшения UX
function initUXEnhancements() {
    // Добавляем индикатор загрузки для кнопок
    document.querySelectorAll('.btn, .cta-button').forEach(button => {
        button.addEventListener('click', function() {
            const originalText = this.innerHTML;
            
            // Только для кнопок, которые выполняют действия
            if (this.type === 'submit' || this.classList.contains('primary')) {
                this.classList.add('loading');
                this.innerHTML = '<span class="spinner"></span>' + originalText;
                
                // Через 3 секунды сбрасываем состояние (на случай ошибки)
                setTimeout(() => {
                    this.classList.remove('loading');
                    this.innerHTML = originalText;
                }, 3000);
            }
        });
    });
    
    // Добавляем ховер-эффекты для карточек
    document.querySelectorAll('.card-hover').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Валидация форм в реальном времени
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                validateInput(input);
            });
            
            input.addEventListener('input', () => {
                clearError(input);
            });
        });
    });
    
    // Улучшенный скролл для мобильных
    initMobileScroll();
}

// Валидация ввода
function validateInput(input) {
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    switch(input.type) {
        case 'email':
            if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                isValid = false;
                errorMessage = 'Введите корректный email адрес';
            }
            break;
            
        case 'password':
            if (value.length < 6) {
                isValid = false;
                errorMessage = 'Пароль должен содержать минимум 6 символов';
            }
            break;
            
        default:
            if (!value) {
                isValid = false;
                errorMessage = 'Это поле обязательно для заполнения';
            }
    }
    
    if (!isValid) {
        showInputError(input, errorMessage);
    } else {
        clearError(input);
    }
    
    return isValid;
}

function showInputError(input, message) {
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;
    
    // Удаляем старую ошибку
    const oldError = formGroup.querySelector('.input-error');
    if (oldError) oldError.remove();
    
    // Добавляем новую ошибку
    const errorElement = document.createElement('div');
    errorElement.className = 'input-error';
    errorElement.textContent = message;
    errorElement.style.color = 'var(--danger)';
    errorElement.style.fontSize = '0.875rem';
    errorElement.style.marginTop = '4px';
    
    formGroup.appendChild(errorElement);
    input.classList.add('error');
}

function clearError(input) {
    input.classList.remove('error');
    const formGroup = input.closest('.form-group');
    if (formGroup) {
        const errorElement = formGroup.querySelector('.input-error');
        if (errorElement) errorElement.remove();
    }
}

// Улучшенный скролл для мобильных
function initMobileScroll() {
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].clientY;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeDistance = touchStartY - touchEndY;
        
        // Вертикальный свайп вниз (только в самом верху страницы)
        if (swipeDistance > 100 && window.scrollY === 0) {
            // Плавный скролл к следующей секции
            const firstSection = document.querySelector('section');
            if (firstSection) {
                const sectionTop = firstSection.getBoundingClientRect().top + window.pageYOffset;
                smoothScrollTo(sectionTop, 500);
            }
        }
    }
}

function smoothScrollTo(to, duration) {
    const start = window.scrollY;
    const change = to - start;
    const increment = 20;
    let currentTime = 0;
    
    const animateScroll = function() {
        currentTime += increment;
        const val = easeInOutQuad(currentTime, start, change, duration);
        window.scrollTo(0, val);
        if (currentTime < duration) {
            requestAnimationFrame(animateScroll);
        }
    };
    
    animateScroll();
}

function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
}

// Плавный скролл
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(href);
            
            if (targetElement) {
                closeMobileMenu(); // Закрываем меню при клике на ссылку
                
                const headerHeight = document.querySelector('.glass-header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                smoothScrollTo(targetPosition, 800);
                
                // Обновляем URL без перезагрузки страницы
                history.pushState(null, null, href);
            }
        });
    });
}

// Управление модальными окнами с улучшенной доступностью
function showModal(modal) {
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Фокус на первом инпуте
        const firstInput = modal.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
        
        // Добавляем слушатель для клавиатуры
        modal.addEventListener('keydown', handleModalKeyboard);
    }
}

function hideModal(modal) {
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        
        // Удаляем слушатель клавиатуры
        modal.removeEventListener('keydown', handleModalKeyboard);
        
        // Возвращаем фокус на кнопку, которая открыла модалку
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.id === 'login-btn' || activeElement.id === 'register-btn' || activeElement.id === 'mobile-login-btn' || activeElement.id === 'mobile-register-btn')) {
            setTimeout(() => activeElement.focus(), 100);
        }
    }
}

function handleModalKeyboard(e) {
    if (e.key === 'Escape') {
        const modal = e.target.closest('.modal');
        hideModal(modal);
    }
    
    // Ловушка фокуса внутри модалки
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
        
        // Автоматическое скрытие success уведомлений
        if (type === 'success') {
            setTimeout(() => {
                notification.style.display = 'none';
            }, 5000);
        }
        
        // Прокрутка к уведомлению
        notification.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Обработка форм
async function handleLogin(e) {
    e.preventDefault();
    
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Валидация перед отправкой
    const isEmailValid = validateInput(emailInput);
    const isPasswordValid = validateInput(passwordInput);
    
    if (!isEmailValid || !isPasswordValid) {
        return;
    }
    
    try {
        // Показываем состояние загрузки
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner"></span> Вход...';
        submitBtn.disabled = true;
        
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        // Восстанавливаем кнопку
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
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
        
        // Восстанавливаем кнопку при ошибке
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = 'Войти';
            submitBtn.disabled = false;
        }
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
    
    // Скрываем уведомление при новом вводе
    hideNotification('register-notification');

    // Валидация
    const isNameValid = validateInput(nameInput);
    const isEmailValid = validateInput(emailInput);
    const isPasswordValid = validateInput(passwordInput);
    
    if (!isNameValid || !isEmailValid || !isPasswordValid) {
        return;
    }

    if (password !== confirm) {
        showInputError(confirmInput, 'Пароли не совпадают');
        return;
    }

    try {
        // Показываем состояние загрузки
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner"></span> Регистрация...';
        submitBtn.disabled = true;
        
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        
        // Восстанавливаем кнопку
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
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
        
        // Восстанавливаем кнопку при ошибке
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = 'Зарегистрироваться';
            submitBtn.disabled = false;
        }
    }
}

// Обработка ошибок
function handleLoginError(status, error) {
    if (status === 401) {
        showNotification('login-notification', error || 'Неверный email или пароль');
    } else if (status === 404) {
        showNotification('login-notification', 'Такого аккаунта не существует');
    } else if (status === 429) {
        showNotification('login-notification', 'Слишком много попыток входа. Попробуйте позже.');
    } else if (status === 500) {
        showNotification('login-notification', 'Внутренняя ошибка сервера. Попробуйте позже.');
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
    } else if (status === 500) {
        showNotification('register-notification', 'Внутренняя ошибка сервера. Попробуйте позже.');
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
        }
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        localStorage.removeItem('token');
    }
}

function updateAuthUI(user) {
    const authButtons = document.querySelector('.auth-buttons');
    const mobileAuthButtons = document.querySelector('.mobile-auth-buttons');
    
    if (!authButtons) return;

    const userInitials = getInitials(user.name);
    
    // Обновляем десктопную версию
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
                <div class="dropdown-divider"></div>
                <button id="logout-btn" class="dropdown-item" role="menuitem">
                    <i class="fas fa-sign-out-alt"></i> Выйти
                </button>
            </div>
        </div>
    `;

    // Обновляем мобильную версию
    if (mobileAuthButtons) {
        mobileAuthButtons.innerHTML = `
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
                    <div class="dropdown-divider"></div>
                    <button id="mobile-logout-btn" class="dropdown-item" role="menuitem">
                        <i class="fas fa-sign-out-alt"></i> Выйти
                    </button>
                </div>
            </div>
        `;
        
        // Добавляем обработчик для мобильной кнопки выхода
        const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', logout);
        }
    }

    // Инициализация пользовательского меню
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
            
            // Фокус на первом элементе меню
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
        
        // Открытие/закрытие по клику
        avatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });
        
        // Закрытие при клике вне меню
        document.addEventListener('click', () => {
            if (isOpen) {
                closeMenu();
            }
        });
        
        // Обработка клавиатуры
        avatarBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                avatarBtn.click();
            } else if (e.key === 'Escape' && isOpen) {
                closeMenu();
                avatarBtn.focus();
            }
        });
        
        // Управление фокусом в выпадающем меню
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
        
        // Предотвращаем закрытие при наведении на меню
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
        await fetch('/api/logout', {
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
    showSuccessMessage('Вы успешно вышли из системы');
    setTimeout(() => window.location.reload(), 1000);
}

// Загрузка отзывов
async function loadReviews() {
    const container = document.getElementById('reviews-container');
    if (!container) return;

    // Показываем скелетоны загрузки
    container.innerHTML = Array(3).fill(`
        <div class="review-skeleton">
            <div class="skeleton-header">
                <div class="skeleton-avatar"></div>
                <div class="skeleton-info">
                    <div class="skeleton-name"></div>
                    <div class="skeleton-date"></div>
                </div>
            </div>
            <div class="skeleton-text"></div>
            <div class="skeleton-rating"></div>
        </div>
    `).join('');

    try {
        const response = await fetch('/api/reviews');
        const reviews = await response.json();
        
        if (reviews.length === 0) {
            container.innerHTML = '<div class="no-reviews">Пока нет отзывов. Будьте первым!</div>';
            return;
        }
        
        // Отображаем только первые 3 отзыва
        const limitedReviews = reviews.slice(0, 3);
        container.innerHTML = limitedReviews.map(review => `
            <div class="review-card-modern" tabindex="0" role="article">
                <div class="review-header-modern">
                    <div class="user-avatar-modern" aria-label="Аватар ${review.name}">${getInitials(review.name)}</div>
                    <div class="user-info">
                        <div class="user-name">${review.name}</div>
                        <div class="review-date">${formatDate(review.createdAt)}</div>
                    </div>
                </div>
                <div class="review-text">${review.comment}</div>
                <div class="review-rating" aria-label="Рейтинг: ${review.rating} из 5 звезд">
                    ${renderStars(review.rating)}
                </div>
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
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

// Вспомогательные функции
function getInitials(name) {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function formatDate(dateString) {
    try {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    } catch (error) {
        return dateString;
    }
}

function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '★'.repeat(fullStars);
    if (hasHalfStar) stars += '½';
    stars += '☆'.repeat(emptyStars);
    
    return `<span class="stars" aria-hidden="true">${stars}</span>`;
}

function redirectToEditor() {
    window.location.href = '/editor';
}

function showSuccessMessage(message) {
    // Создаем временное уведомление об успехе
    const existingNotification = document.querySelector('.success-message');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const successNotification = document.createElement('div');
    successNotification.className = 'success-message';
    successNotification.textContent = message;
    successNotification.setAttribute('role', 'alert');
    successNotification.setAttribute('aria-live', 'polite');
    
    document.body.appendChild(successNotification);
    
    // Анимация появления
    requestAnimationFrame(() => {
        successNotification.classList.add('show');
    });
    
    setTimeout(() => {
        successNotification.classList.remove('show');
        setTimeout(() => {
            if (successNotification.parentNode) {
                successNotification.parentNode.removeChild(successNotification);
            }
        }, 300);
    }, 3000);
}

// Оптимизация производительности при скролле
let lastScrollY = window.pageYOffset;
let ticking = false;

function updateOnScroll() {
    const scrollY = window.pageYOffset;
    
    // Обновляем позиции параллакс элементов только при значительном скролле
    if (Math.abs(scrollY - lastScrollY) > 5) {
        const shapes = document.querySelectorAll('.shape');
        shapes.forEach(shape => {
            const rate = scrollY * -0.3;
            shape.style.transform = `translateY(${rate}px)`;
        });
        
        lastScrollY = scrollY;
    }
    
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(updateOnScroll);
        ticking = true;
    }
});

// Обработка ошибок загрузки изображений
document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
        const img = e.target;
        
        // Пытаемся загрузить fallback изображение
        if (img.dataset.fallback) {
            img.src = img.dataset.fallback;
        } else {
            // Скрываем сломанные изображения
            img.style.display = 'none';
            console.warn('Изображение не загружено:', img.src);
        }
    }
}, true);

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
    
    // Предзагрузка шрифтов
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = 'https://fonts.googleapis.com';
    document.head.appendChild(link);
    
    const link2 = document.createElement('link');
    link2.rel = 'preconnect';
    link2.href = 'https://fonts.gstatic.com';
    link2.crossOrigin = 'anonymous';
    document.head.appendChild(link2);
}

// Инициализация предзагрузки после загрузки страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadCriticalResources);
} else {
    preloadCriticalResources();
}

// Сохранение состояния при перезагрузке
window.addEventListener('beforeunload', () => {
    const scrollPosition = window.pageYOffset;
    sessionStorage.setItem('scrollPosition', scrollPosition);
});

// Восстановление позиции скролла
window.addEventListener('load', () => {
    const savedPosition = sessionStorage.getItem('scrollPosition');
    if (savedPosition) {
        window.scrollTo(0, parseInt(savedPosition));
        sessionStorage.removeItem('scrollPosition');
    }
    
    // Обновляем видимость мобильного меню после загрузки
    updateMobileMenuVisibility();
});

// Инициализация Service Worker для оффлайн работы
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Оптимизация для медленных соединений
if ('connection' in navigator) {
    const connection = navigator.connection;
    
    if (connection.saveData) {
        // Отключаем анимации для экономии трафика
        document.querySelectorAll('.animate-float').forEach(el => {
            el.style.animation = 'none';
        });
        
        // Отключаем фоновые анимации
        document.querySelectorAll('.grid-orbit, .shape').forEach(el => {
            el.style.animation = 'none';
        });
    }
    
    if (connection.effectiveType.includes('2g') || connection.effectiveType.includes('3g')) {
        // Упрощаем анимации для медленных соединений
        document.documentElement.style.setProperty('--float-animation-duration', '30s');
        
        // Уменьшаем качество параллакса
        window.removeEventListener('mousemove', initParallaxEffects);
    }
}

// Полифиллы для старых браузеров
if (!Element.prototype.closest) {
    Element.prototype.closest = function(s) {
        var el = this;
        do {
            if (el.matches(s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
    };
}

if (!Element.prototype.matches) {
    Element.prototype.matches = 
        Element.prototype.matchesSelector || 
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector || 
        Element.prototype.oMatchesSelector || 
        Element.prototype.webkitMatchesSelector ||
        function(s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                i = matches.length;
            while (--i >= 0 && matches.item(i) !== this) {}
            return i > -1;
        };
}

// Поддержка touch events для мобильных устройств
if ('ontouchstart' in window) {
    document.documentElement.classList.add('touch-device');
    
    // Улучшаем обработку касаний для кнопок
    document.querySelectorAll('.btn, .cta-button, .nav-link').forEach(element => {
        element.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
        }, { passive: true });
        
        element.addEventListener('touchend', function() {
            this.classList.remove('touch-active');
        }, { passive: true });
    });
}

// Оптимизация для устройств с ограниченной памятью
if ('deviceMemory' in navigator && navigator.deviceMemory < 4) {
    // Отключаем некоторые тяжелые анимации
    const heavyAnimations = document.querySelectorAll('.shape, .grid-orbit, .icon-glow');
    heavyAnimations.forEach(el => {
        el.style.animation = 'none';
    });
}

// Поддержка prefers-reduced-motion
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('*').forEach(el => {
        el.style.animationDuration = '0.001ms !important';
        el.style.animationIterationCount = '1 !important';
        el.style.transitionDuration = '0.001ms !important';
    });
}

// Оптимизация для слабых процессоров
let animationFrameId = null;
window.addEventListener('scroll', () => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
    animationFrameId = requestAnimationFrame(() => {
        // Тяжелые операции при скролле
        animationFrameId = null;
    });
});

// Кэширование часто используемых элементов
const cachedElements = {
    header: null,
    mobileMenu: null,
    getHeader() {
        if (!this.header) {
            this.header = document.querySelector('.glass-header');
        }
        return this.header;
    },
    getMobileMenu() {
        if (!this.mobileMenu) {
            this.mobileMenu = document.querySelector('.mobile-menu-container');
        }
        return this.mobileMenu;
    }
};

// Улучшенная обработка ресайза с throttling
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        updateMobileMenuVisibility();
        updateGridLayouts();
    }, 150);
});

// Отслеживание производительности
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const timing = performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            
            if (loadTime > 3000) {
                console.log('Время загрузки страницы:', loadTime, 'мс');
                // Можно отправить метрики на сервер
            }
        }, 0);
    });
}

// Обработка потери фокуса вкладки
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Страница не видна - приостанавливаем тяжелые операции
        document.querySelectorAll('.animate-float, .grid-orbit, .shape').forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    } else {
        // Страница снова видна - возобновляем анимации
        document.querySelectorAll('.animate-float, .grid-orbit, .shape').forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }
});

// Улучшенная обработка кликов для мобильных
if ('ontouchstart' in window) {
    let lastTouchTime = 0;
    document.addEventListener('touchstart', (e) => {
        const currentTime = new Date().getTime();
        const timeSinceLastTouch = currentTime - lastTouchTime;
        
        // Предотвращаем быстрые двойные клики
        if (timeSinceLastTouch < 300 && timeSinceLastTouch > 0) {
            e.preventDefault();
        }
        
        lastTouchTime = currentTime;
    }, { passive: false });
}

// Фокус-ловушки для доступности
function initFocusTraps() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const focusableContent = modal.querySelectorAll(focusableElements);
        
        if (focusableContent.length > 0) {
            const firstFocusableElement = focusableContent[0];
            const lastFocusableElement = focusableContent[focusableContent.length - 1];
            
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
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
            });
        }
    });
}

// Инициализация фокус-ловушек
initFocusTraps();