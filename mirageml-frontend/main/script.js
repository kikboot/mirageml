document.addEventListener('DOMContentLoaded', () => {
    console.log('[Main] DOM загружен');
    
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

    console.log('[Main] loginBtn:', loginBtn);
    console.log('[Main] registerBtn:', registerBtn);
    console.log('[Main] loginModal:', loginModal);
    console.log('[Main] registerModal:', registerModal);

    initAnimations();

    checkAuthStatus();

    initGoogleAuth();

    initTermsHandlers();

    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        const emailInput = document.getElementById('login-email');
        if (emailInput) {
            emailInput.value = rememberedEmail;
        }
        const rememberMe = document.getElementById('remember-me');
        if (rememberMe) {
            rememberMe.checked = true;
        }
    }

    initMobileMenu();

    if (loginBtn) {
        console.log('[Main] Добавляю обработчик для loginBtn');
        loginBtn.addEventListener('click', () => {
            console.log('[Main] Клик на loginBtn');
            showModal(loginModal);
            hideNotification('login-notification');
        });
    } else {
        console.error('[Main] loginBtn не найден!');
    }

    if (registerBtn) {
        console.log('[Main] Добавляю обработчик для registerBtn');
        registerBtn.addEventListener('click', () => {
            console.log('[Main] Клик на registerBtn');
            showModal(registerModal);
            hideNotification('register-notification');
        });
    } else {
        console.error('[Main] registerBtn не найден!');
    }

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
            switchModals(loginModal, registerModal);
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', () => {
            switchModals(registerModal, loginModal);
        });
    }

    setupModalCloseHandlers();

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    if (document.getElementById('reviews-container')) {
        loadReviews();
    }

    initParallaxEffects();

    initScrollAnimations();

    initFAQAccordion();

    initUXEnhancements();

    initSmoothScroll();

    if (mobileMenuContainer) {
        mobileMenuContainer.addEventListener('click', (e) => {
            if (e.target === mobileMenuContainer) {
                closeMobileMenu();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenuContainer.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    window.addEventListener('resize', handleResize);
});

function openMobileMenu() {
    const mobileMenuContainer = document.querySelector('.mobile-menu-container');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav .nav-link');
    const mobileAuthButtons = document.querySelectorAll('.mobile-auth-buttons .btn');
    
    if (!mobileMenuContainer || !mobileMenuBtn) return;

    mobileMenuContainer.classList.add('active');
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

    if (!mobileMenuContainer || !mobileMenuBtn) return;

    mobileNavLinks.forEach(link => {
        link.classList.remove('animate-in');
        link.style.removeProperty('--i');
    });

    mobileAuthButtons.forEach(btn => {
        btn.classList.remove('animate-in');
    });

    mobileMenuContainer.classList.remove('active');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

function initMobileMenu() {
    updateMobileMenuVisibility();
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
        updateGridLayouts();
    }, 250);
}

function updateGridLayouts() {
    const grids = document.querySelectorAll('.product-grid, .audience-grid, .advantages-grid-modern, .features-grid-modern, .reviews-grid-modern, .blocks-grid, .pricing-grid');

    grids.forEach(grid => {
        if (window.innerWidth <= 768) {
            grid.style.gridTemplateColumns = '1fr';
        } else if (window.innerWidth <= 1024) {
            grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        } else {
            if (grid.classList.contains('blocks-grid') || grid.classList.contains('features-grid-modern')) {
                grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
            }
        }
    });
}

function initAnimations() {
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

    document.documentElement.style.setProperty('--float-animation-duration', '20s');

    elements.forEach((element, index) => {
        element.style.setProperty('--float-delay', `${index * 0.5}s`);
        element.style.setProperty('--float-distance', `${15 + Math.random() * 10}px`);

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

function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    const answer = otherItem.querySelector('.faq-answer');
                    answer.style.maxHeight = '0';
                }
            });

            item.classList.toggle('active');
            const answer = item.querySelector('.faq-answer');

            if (item.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                answer.style.maxHeight = '0';
            }
        });

        question.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                question.click();
            }
        });
    });
}

function initUXEnhancements() {
    document.querySelectorAll('.btn, .cta-button').forEach(button => {
        button.addEventListener('click', function() {
            const originalText = this.innerHTML;

            if (this.type === 'submit' || this.classList.contains('primary')) {
                this.classList.add('loading');
                this.innerHTML = '<span class="spinner"></span>' + originalText;

                setTimeout(() => {
                    this.classList.remove('loading');
                    this.innerHTML = originalText;
                }, 3000);
            }
        });
    });

    document.querySelectorAll('.card-hover').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

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

    initMobileScroll();
}

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

    const oldError = formGroup.querySelector('.input-error');
    if (oldError) oldError.remove();

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

        if (swipeDistance > 100 && window.scrollY === 0) {
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

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(href);
            
            if (targetElement) {
                closeMobileMenu();

                const headerHeight = document.querySelector('.glass-header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                smoothScrollTo(targetPosition, 800);

                history.pushState(null, null, href);
            }
        });
    });
}

function showModal(modal) {
    console.log('[Main] showModal вызвана с modal:', modal);
    
    if (modal) {
        console.log('[Main] Устанавливаю modal.style.display = flex');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        const firstInput = modal.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }

        modal.addEventListener('keydown', handleModalKeyboard);
    } else {
        console.error('[Main] modal не передан в showModal!');
    }
}

function hideModal(modal) {
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';

        modal.removeEventListener('keydown', handleModalKeyboard);

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

        notification.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

async function handleLogin(e) {
    e.preventDefault();

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    const isEmailValid = validateInput(emailInput);
    const isPasswordValid = validateInput(passwordInput);
    
    if (!isEmailValid || !isPasswordValid) {
        return;
    }
    
    try {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner"></span> Вход...';
        submitBtn.disabled = true;

        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        let data = {};
        if (response.headers.get('content-type') && response.headers.get('content-type').includes('application/json')) {
            if(response.ok) {
                try {
                    data = await response.json();
                } catch (e) {
                    data = { success: false, error: 'Ответ сервера не в формате JSON' };
                }
            } else {
                try {
                    data = await response.json();
                } catch (e) {
                    data = { error: await response.text() || 'Неизвестная ошибка сервера' };
                }
            }
        } else {
            if(response.ok) {
                data = { success: false, error: 'Ответ сервера не в формате JSON' };
            } else {
                data = { error: await response.text() || 'Ответ сервера не в формате JSON' };
            }
        }

        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        if (response.ok && data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('authToken', data.token);
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('authToken', data.token);
            localStorage.setItem('rememberedEmail', email);

            updateAuthUI(data.user);
            document.querySelectorAll('.modal').forEach(m => hideModal(m));
            showSuccessMessage('Вход выполнен успешно!');
            setTimeout(() => window.location.reload(), 1000);
        } else {
            handleLoginError(response.status, data.error || 'Неизвестная ошибка');
        }
    } catch (error) {
        console.error('Ошибка при входе:', error);

        if (error instanceof TypeError && error.message.includes('fetch')) {
            showNotification('login-notification', 'Не удается подключиться к серверу. Проверьте, что сервер запущен на порту 3001.');
        } else {
            showNotification('login-notification', `Ошибка соединения с сервером: ${error.message}`);
        }

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

    hideNotification('register-notification');

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

    pendingRegistration = { name, email, password };
    hideModal(document.getElementById('register-modal'));
    showTermsModal();
}

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

function initGoogleAuth() {
    const googleLoginBtn = document.getElementById('google-login-btn');
    const googleRegisterBtn = document.getElementById('google-register-btn');

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            handleGoogleLogin('login');
        });
    }

    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener('click', () => {
            handleGoogleLogin('register');
        });
    }
}

async function handleGoogleLogin(mode) {
    const clientId = await getGoogleClientId();

    if (!clientId) {
        showNotification('login-notification', 'Google авторизация не настроена. Обратитесь к администратору.');
        return;
    }

    if (typeof google === 'undefined' || !google.accounts) {
        showNotification('login-notification', 'Google SDK не загрузился. Обновите страницу.');
        return;
    }

    console.log('[Google OAuth] Инициализация Google Identity Services');

    google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
            console.log('[Google OAuth] Получен credential от Google');

            try {
                const existsResult = await checkGoogleUserExists(response.credential);
                console.log('[Google OAuth] Проверка пользователя:', existsResult);

                if (existsResult.exists) {
                    console.log('[Google OAuth] Пользователь существует — авторизуем');
                    await submitGoogleAuthDirect({ credential: response.credential }, mode);
                } else {
                    console.log('[Google OAuth] Новый пользователь — показываем соглашение');
                    pendingGoogleData = { credential: response.credential, mode };
                    hideModal(document.getElementById('login-modal'));
                    hideModal(document.getElementById('register-modal'));
                    showTermsModal();
                }
            } catch (error) {
                console.error('[Google OAuth] Ошибка проверки:', error);
                showNotification('login-notification', `Ошибка: ${error.message}`);
                resetGoogleButtons();
            }
        },
        auto_select: false,
        cancel_on_tap_outside: true
    });

    google.accounts.id.prompt((notification) => {
        console.log('[Google OAuth] Prompt notification:', notification);
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('[Google OAuth] One Tap недоступен — используем popup');
            google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: 'email profile',
                callback: (tokenResponse) => {
                    console.log('[Google OAuth] Получен access_token:', tokenResponse);
                    if (tokenResponse.access_token) {
                        fetchGoogleProfile(tokenResponse.access_token, mode);
                    } else {
                        showNotification('login-notification', 'Ошибка получения данных из Google');
                        resetGoogleButtons();
                    }
                }
            }).requestAccessToken();
        }
    });
}

async function checkGoogleUserExists(credential) {
    try {
        const response = await fetch('/api/auth/google/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential })
        });
        if (!response.ok) return { exists: false };
        return await response.json();
    } catch (error) {
        console.error('Ошибка проверки пользователя Google:', error);
        return { exists: false };
    }
}

async function submitGoogleAuthDirect(authData, mode) {
    try {
        const submitBtn = mode === 'login'
            ? document.getElementById('google-login-btn')
            : document.getElementById('google-register-btn');

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> Авторизация...';
        }

        const response = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...authData, acceptTerms: true })
        });

        const data = await response.json();

        if (submitBtn) {
            submitBtn.innerHTML = mode === 'login'
                ? '<span>Войти через Google</span>'
                : '<span>Зарегистрироваться через Google</span>';
            submitBtn.disabled = false;
        }

        if (response.ok && data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('authToken', data.token);
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('authToken', data.token);

            updateAuthUI(data.user);
            document.querySelectorAll('.modal').forEach(m => hideModal(m));

            const message = mode === 'login' ? 'Вход через Google выполнен!' : 'Регистрация через Google успешна!';
            showSuccessMessage(message);
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showNotification('login-notification', data.error || 'Ошибка авторизации через Google');
            resetGoogleButtons();
        }
    } catch (error) {
        console.error('Google OAuth ошибка:', error);
        showNotification('login-notification', `Ошибка соединения: ${error.message}`);
        resetGoogleButtons();
    }
}

async function fetchGoogleProfile(accessToken, mode) {
    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (!response.ok) throw new Error('Не удалось получить профиль Google');

        const profile = await response.json();

        const emailCheck = await fetch('/api/auth/google/check-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: profile.email })
        });

        const emailExists = emailCheck.ok && (await emailCheck.json()).exists;

        if (emailExists) {
            await submitGoogleAuthDirect({ access_token: accessToken }, mode);
        } else {
            pendingGoogleData = { access_token: accessToken, mode };
            const loginModalEl = document.getElementById('login-modal');
            const registerModalEl = document.getElementById('register-modal');
            hideModal(loginModalEl);
            hideModal(registerModalEl);
            showTermsModal();
        }
    } catch (error) {
        console.error('Google Profile ошибка:', error);
        showNotification('login-notification', `Ошибка получения профиля: ${error.message}`);
        resetGoogleButtons();
    }
}

async function getGoogleClientId() {
    try {
        const response = await fetch('/api/config/google-client-id');
        if (!response.ok) return null;
        const data = await response.json();
        return data.clientId;
    } catch (error) {
        console.error('Ошибка получения Google Client ID:', error);
        return null;
    }
}

function resetGoogleButtons() {
    const loginBtn = document.getElementById('google-login-btn');
    const registerBtn = document.getElementById('google-register-btn');

    if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.innerHTML = `
            <svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Войти через Google</span>`;
    }

    if (registerBtn) {
        registerBtn.disabled = false;
        registerBtn.innerHTML = `
            <svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Зарегистрироваться через Google</span>`;
    }
}

let pendingRegistration = null;
let pendingGoogleData = null;

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
            }
            else if (pendingGoogleData) {
                const { credential, access_token } = pendingGoogleData;
                pendingGoogleData = null;
                hideModal(termsModal);
                await submitGoogleAuth({ credential, access_token });
            }
        });
    }

    if (declineBtn) {
        declineBtn.addEventListener('click', () => {
            pendingRegistration = null;
            pendingGoogleData = null;
            hideModal(termsModal);
            showNotification('register-notification', 'Для продолжения необходимо принять условия пользовательского соглашения');
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

function showTermsModal(callback) {
    const termsModal = document.getElementById('terms-modal');
    const acceptCheckbox = document.getElementById('accept-terms');
    const acceptBtn = document.getElementById('terms-accept-btn');

    if (acceptCheckbox) acceptCheckbox.checked = false;
    if (acceptBtn) acceptBtn.disabled = true;

    showModal(termsModal);
}

async function submitRegistration(name, email, password) {
    try {
        const registerForm = document.getElementById('register-form');
        const submitBtn = registerForm?.querySelector('button[type="submit"]');
        const originalText = submitBtn?.innerHTML || 'Зарегистрироваться';

        if (submitBtn) {
            submitBtn.innerHTML = '<span class="spinner"></span> Регистрация...';
            submitBtn.disabled = true;
        }

        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, acceptTerms: true })
        });

        let data = {};
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            if (response.ok) {
                try {
                    data = await response.json();
                } catch (e) {
                    data = { success: false, error: 'Ответ сервера не в формате JSON' };
                }
            } else {
                try {
                    data = await response.json();
                } catch (e) {
                    data = { error: await response.text() || 'Ошибка сервера' };
                }
            }
        } else {
            data = response.ok ? { success: true } : { error: await response.text() || 'Ошибка сервера' };
        }

        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }

        if (response.ok && (data.success || response.status === 201)) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('authToken', data.token);
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('authToken', data.token);

            updateAuthUI(data.user);
            document.querySelectorAll('.modal').forEach(m => hideModal(m));
            showSuccessMessage('Регистрация успешна! Добро пожаловать в MirageML!');
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showNotification('register-notification', data.error || 'Ошибка регистрации');
        }
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        showNotification('register-notification', `Ошибка соединения: ${error.message}`);
    }
}

async function submitGoogleAuth(authData) {
    try {
        const submitBtn = document.getElementById('google-register-btn') || document.getElementById('google-login-btn');
        const originalText = submitBtn?.innerHTML || 'Авторизация...';

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> Авторизация...';
        }

        const body = authData.credential ? { credential: authData.credential } : { access_token: authData.access_token };

        const response = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...body, acceptTerms: true })
        });

        const data = await response.json();

        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }

        if (response.ok && data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('authToken', data.token);
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('authToken', data.token);

            updateAuthUI(data.user);
            document.querySelectorAll('.modal').forEach(m => hideModal(m));
            showSuccessMessage('Вход через Google выполнен! Добро пожаловать!');
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showNotification('login-notification', data.error || 'Ошибка авторизации через Google');
            resetGoogleButtons();
        }
    } catch (error) {
        console.error('Google OAuth ошибка:', error);
        showNotification('login-notification', `Ошибка соединения: ${error.message}`);
        resetGoogleButtons();
    }
}

async function checkAuthStatus() {
    let token = localStorage.getItem('token');
    if (!token) {
        token = sessionStorage.getItem('token');
    }

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
            sessionStorage.removeItem('token');
        }
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
    }
}

function updateAuthUI(user) {
    const authButtons = document.querySelector('.auth-buttons');
    const mobileAuthButtons = document.querySelector('.mobile-auth-buttons');
    
    if (!authButtons) return;

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
        </div>
    `;

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
                    <a href="../support/index.html" class="dropdown-item" role="menuitem">
                        <i class="fas fa-headset"></i> Тех-поддержка
                    </a>
                    <div class="dropdown-divider"></div>
                    <button id="mobile-logout-btn" class="dropdown-item" role="menuitem">
                        <i class="fas fa-sign-out-alt"></i> Выйти
                    </button>
                </div>
            </div>
        `;

        const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', logout);
        }
    }

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

        avatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        document.addEventListener('click', () => {
            if (isOpen) {
                closeMenu();
            }
        });

        avatarBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                avatarBtn.click();
            } else if (e.key === 'Escape' && isOpen) {
                closeMenu();
                avatarBtn.focus();
            }
        });

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

        dropdownContent.addEventListener('mouseenter', () => {
            clearTimeout(closeTimeout);
        });

        dropdownContent.addEventListener('mouseleave', () => {
            closeMenu();
        });
    });
}

async function logout() {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
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
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('authToken');
    showSuccessMessage('Вы успешно вышли из системы');
    setTimeout(() => window.location.reload(), 1000);
}

async function loadReviews() {
    const container = document.getElementById('reviews-container');
    if (!container) return;

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
        
        let reviews = [];
        if (response.headers.get('content-type') && response.headers.get('content-type').includes('application/json')) {
            reviews = await response.json();
        } else {
            console.error('Отзывы не в JSON формате:', await response.text());
            reviews = [];
        }

        if (reviews.length === 0) {
            container.innerHTML = '<div class="no-reviews">Пока нет отзывов. Будьте первым!</div>';
            return;
        }

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

        animateReviews();
    } catch (error) {
        console.error('Ошибка при загрузке отзывов:', error);
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

function getInitials(name) {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function formatDate(dateString) {
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

let lastScrollY = window.pageYOffset;
let ticking = false;

function updateOnScroll() {
    const scrollY = window.pageYOffset;

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

document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
        const img = e.target;

        if (img.dataset.fallback) {
            img.src = img.dataset.fallback;
        } else {
            img.style.display = 'none';
            console.warn('Изображение не загружено:', img.src);
        }
    }
}, true);

function preloadCriticalResources() {
    const criticalImages = [
        '../logo/logo3.svg',
        '../img/qr-код.jpg'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });

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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadCriticalResources);
} else {
    preloadCriticalResources();
}

window.addEventListener('beforeunload', () => {
    const scrollPosition = window.pageYOffset;
    sessionStorage.setItem('scrollPosition', scrollPosition);
});

window.addEventListener('load', () => {
    const savedPosition = sessionStorage.getItem('scrollPosition');
    if (savedPosition) {
        window.scrollTo(0, parseInt(savedPosition));
        sessionStorage.removeItem('scrollPosition');
    }
    
    updateMobileMenuVisibility();
});

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

if ('connection' in navigator) {
    const connection = navigator.connection;

    if (connection.saveData) {
        document.querySelectorAll('.animate-float').forEach(el => {
            el.style.animation = 'none';
        });

        document.querySelectorAll('.grid-orbit, .shape').forEach(el => {
            el.style.animation = 'none';
        });
    }

    if (connection.effectiveType.includes('2g') || connection.effectiveType.includes('3g')) {
        document.documentElement.style.setProperty('--float-animation-duration', '30s');

        window.removeEventListener('mousemove', initParallaxEffects);
    }
}

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

if ('ontouchstart' in window) {
    document.documentElement.classList.add('touch-device');

    document.querySelectorAll('.btn, .cta-button, .nav-link').forEach(element => {
        element.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
        }, { passive: true });
        
        element.addEventListener('touchend', function() {
            this.classList.remove('touch-active');
        }, { passive: true });
    });
}

if ('deviceMemory' in navigator && navigator.deviceMemory < 4) {
    const heavyAnimations = document.querySelectorAll('.shape, .grid-orbit, .icon-glow');
    heavyAnimations.forEach(el => {
        el.style.animation = 'none';
    });
}

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('*').forEach(el => {
        el.style.animationDuration = '0.001ms !important';
        el.style.animationIterationCount = '1 !important';
        el.style.transitionDuration = '0.001ms !important';
    });
}

let animationFrameId = null;
window.addEventListener('scroll', () => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    animationFrameId = requestAnimationFrame(() => {
        animationFrameId = null;
    });
});

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

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        updateMobileMenuVisibility();
        updateGridLayouts();
    }, 150);
});

if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const timing = performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            
            if (loadTime > 3000) {
                console.log('Время загрузки страницы:', loadTime, 'мс');
            }
        }, 0);
    });
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.querySelectorAll('.animate-float, .grid-orbit, .shape').forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    } else {
        document.querySelectorAll('.animate-float, .grid-orbit, .shape').forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }
});

if ('ontouchstart' in window) {
    let lastTouchTime = 0;
    document.addEventListener('touchstart', (e) => {
        const currentTime = new Date().getTime();
        const timeSinceLastTouch = currentTime - lastTouchTime;

        if (timeSinceLastTouch < 300 && timeSinceLastTouch > 0) {
            e.preventDefault();
        }

        lastTouchTime = currentTime;
    }, { passive: false });
}

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

initFocusTraps();