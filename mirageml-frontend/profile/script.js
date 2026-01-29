// Вспомогательная функция для установки начального состояния элементов
function setInitialDisplayState() {
    const isMobile = window.innerWidth <= 768;
    const mobileContainer = document.querySelector('.mobile-profile-container');
    const desktopContainer = document.querySelector('.desktop-profile-container');
    const mobileHeader = document.querySelector('.mobile-header');
    const glassHeader = document.querySelector('.glass-header');
    
    if (isMobile) {
        if (mobileContainer) mobileContainer.style.display = 'block';
        if (desktopContainer) desktopContainer.style.display = 'none';
        if (mobileHeader) mobileHeader.style.display = 'block';
        if (glassHeader) glassHeader.style.display = 'none';
    } else {
        if (mobileContainer) mobileContainer.style.display = 'none';
        if (desktopContainer) desktopContainer.style.display = 'block';
        if (mobileHeader) mobileHeader.style.display = 'none';
        if (glassHeader) glassHeader.style.display = 'block';
    }
}

// Функция для инициализации профиля
function initializeProfile() {
    // Устанавливаем начальное состояние отображения элементов
    setInitialDisplayState();
    
    // Проверяем тип устройства
    const isMobile = window.innerWidth <= 768;
    
    // Инициализируем соответствующую версию
    if (isMobile) {
        document.body.classList.add('mobile-version');
        initMobileVersion();
    } else {
        document.body.classList.add('desktop-version');
        initDesktopVersion();
    }
    
    // Общие инициализации
    initCommonFeatures();
}

document.addEventListener('DOMContentLoaded', function () {
    initializeProfile();
    
    // Добавляем обработчик изменения размера окна для переключения между мобильной и десктопной версией
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            const isCurrentlyMobile = window.innerWidth <= 768;
            const currentIsMobile = document.body.classList.contains('mobile-version');
            const currentIsDesktop = document.body.classList.contains('desktop-version');
            
            // Если состояние изменилось, переключаем версии
            if ((isCurrentlyMobile && !currentIsMobile) || (!isCurrentlyMobile && !currentIsDesktop)) {
                initializeVersionBasedOnScreenSize();
            }
        }, 250); // Задержка для предотвращения частых срабатываний
    });
});


// Функция для инициализации версии на основе размера экрана
function initializeVersionBasedOnScreenSize() {
    const isMobile = window.innerWidth <= 768;
    
    // Удаляем классы предыдущей версии
    document.body.classList.remove('mobile-version', 'desktop-version');
    
    // Скрываем все контейнеры
    const mobileContainer = document.querySelector('.mobile-profile-container');
    const desktopContainer = document.querySelector('.desktop-profile-container');
    const mobileHeader = document.querySelector('.mobile-header');
    const glassHeader = document.querySelector('.glass-header');
    
    if (mobileContainer) mobileContainer.style.display = 'none';
    if (desktopContainer) desktopContainer.style.display = 'none';
    if (mobileHeader) mobileHeader.style.display = 'none';
    if (glassHeader) glassHeader.style.display = 'none';
    
    // Инициализируем нужную версию
    if (isMobile) {
        document.body.classList.add('mobile-version');
        if (mobileContainer) mobileContainer.style.display = 'block';
        if (mobileHeader) mobileHeader.style.display = 'block';
        initMobileVersion();
    } else {
        document.body.classList.add('desktop-version');
        if (desktopContainer) desktopContainer.style.display = 'block';
        if (glassHeader) glassHeader.style.display = 'block';
        initDesktopVersion();
    }
}

// ============================================
// МОБИЛЬНАЯ ВЕРСИЯ
// ============================================

function initMobileVersion() {
    console.log('Загружена мобильная версия');
    
    // Показываем мобильные элементы и скрываем десктопные
    const mobileContainer = document.querySelector('.mobile-profile-container');
    const desktopContainer = document.querySelector('.desktop-profile-container');
    const mobileHeader = document.querySelector('.mobile-header');
    const glassHeader = document.querySelector('.glass-header');
    
    if (mobileContainer) mobileContainer.style.display = 'block';
    if (desktopContainer) desktopContainer.style.display = 'none';
    if (mobileHeader) mobileHeader.style.display = 'block';
    if (glassHeader) glassHeader.style.display = 'none';
    
    // Загрузка данных профиля
    loadMobileProfile().then(user => {
        if (user) {
            // Проверяем активную вкладку и загружаем проекты если нужно
            const activeTab = document.querySelector('.mobile-tab.active');
            if (activeTab && activeTab.dataset.tab === 'projects-tab') {
                renderMobileProjects();
            }
            if (activeTab && activeTab.dataset.tab === 'security-tab') {
                loadMobileActiveSessions();
            }
        }
    });

    // Навигация по мобильным табам
    initMobileTabNavigation();

    // Обработчики мобильных форм
    initMobileFormHandlers();

    // Обработчики мобильного меню
    initMobileMenuHandlers();

    // Обработчики мобильных модальных окон
    initMobileModalHandlers();

    // Обработчики мобильных действий
    initMobileActionHandlers();

    // Анимации для мобильных
    initMobileAnimations();
}

// Загрузка профиля для мобильных
async function loadMobileProfile() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '../main/index.html';
            return;
        }

        const response = await fetch('http://localhost:3001/api/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '../main/index.html';
            }
            throw new Error('Ошибка загрузки данных');
        }

        const user = await response.json();

        // Заполняем мобильную форму профиля
        if (document.getElementById('mobile-name')) {
            document.getElementById('mobile-name').value = user.name;
            document.getElementById('mobile-email').value = user.email;
            document.getElementById('mobile-phone').value = user.phone || '';
            document.getElementById('mobile-country').value = user.country || 'ru';
        }
        
        // Обновляем информацию в мобильном меню
        if (document.getElementById('mobile-user-name')) {
            document.getElementById('mobile-user-name').textContent = user.name;
            document.getElementById('mobile-user-email').textContent = user.email;
        }
        if (document.getElementById('mobile-user-avatar')) {
            document.getElementById('mobile-user-avatar').textContent =
                user.name.substring(0, 2).toUpperCase();
        }


        return user;
    } catch (error) {
        showMobileToast(error.message, 'error');
        console.error('Ошибка:', error);
    }
}

// Обновление статистики для мобильных - заглушка
async function updateMobileStats() {
    // Функция оставлена для совместимости, но не обновляет счетчики, так как они были удалены
    return;
}

// Навигация по мобильным табам
function initMobileTabNavigation() {
    document.querySelectorAll('.mobile-tab').forEach(tab => {
        tab.addEventListener('click', function (e) {
            e.preventDefault();
            
            // Убираем активный класс у всех табов
            document.querySelectorAll('.mobile-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.mobile-tab-content').forEach(content => content.classList.remove('active'));
            
            // Добавляем активный класс текущему табу
            this.classList.add('active');
            const targetTabId = this.getAttribute('data-tab');
            const targetTab = document.getElementById('mobile-' + targetTabId);
            
            if (targetTab) {
                targetTab.classList.add('active');
                
                // Прокручиваем к началу вкладки
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                
                // Загружаем проекты при переключении на вкладку проектов
                if (targetTabId === 'projects-tab') {
                    renderMobileProjects();
                }
                
                // Загружаем сессии при переключении на вкладку безопасности
                if (targetTabId === 'security-tab') {
                    loadMobileActiveSessions();
                }
            }
        });
    });

    // Также навигация через мобильное меню
    document.querySelectorAll('.mobile-nav-item[data-tab]').forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            closeMobileMenu();
            
            const targetTabId = this.getAttribute('data-tab');
            const targetTab = document.querySelector(`.mobile-tab[data-tab="${targetTabId}"]`);
            
            if (targetTab) {
                targetTab.click();
            }
        });
    });
}

// Загрузка и отображение проектов для мобильных
async function loadMobileProjects() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Токен не найден');
        }

        const response = await fetch('http://localhost:3001/api/projects', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка загрузки проектов: ' + response.status);
        }

        const projects = await response.json();
        console.log('Загружены проекты для мобильных:', projects);
        return Array.isArray(projects) ? projects : [];
    } catch (error) {
        console.error('Ошибка загрузки проектов:', error);
        showMobileToast('Не удалось загрузить проекты', 'error');
        return [];
    }
}

async function renderMobileProjects() {
    const projectsContainer = document.getElementById('mobile-projects-container');
    if (!projectsContainer) {
        console.error('Контейнер проектов не найден');
        return;
    }

    // Показываем индикатор загрузки
    projectsContainer.innerHTML = `
        <div class="mobile-projects-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Загрузка проектов...</span>
        </div>
    `;

    try {
        const projects = await loadMobileProjects();
        console.log('Проекты для отображения:', projects);
        
        // Обновляем счетчик проектов
        await updateMobileStats();
        
        if (!projects || projects.length === 0) {
            projectsContainer.innerHTML = `
                <div class="mobile-empty-projects">
                    <i class="fas fa-folder-open"></i>
                    <h3>Проектов пока нет</h3>
                    <p>Создайте свой первый проект</p>
                    <button class="btn btn-primary mobile-full-btn" id="mobile-create-project-empty">
                        <i class="fas fa-plus"></i>
                        Создать проект
                    </button>
                </div>
            `;

            document.getElementById('mobile-create-project-empty')?.addEventListener('click', () => {
                showModal('create-project-modal');
            });

            return;
        }

        projectsContainer.innerHTML = projects.map(project => `
            <div class="mobile-project-card" data-id="${project.id}">
                <div class="mobile-project-header">
                    <div class="mobile-project-icon">
                        <i class="fas fa-project-diagram"></i>
                    </div>
                    <div class="mobile-project-actions">
                        <button class="mobile-project-action-btn edit-mobile-project-btn" data-id="${project.id}" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="mobile-project-action-btn delete-mobile-project-btn" data-id="${project.id}" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="mobile-project-title">${project.name || 'Без названия'}</div>
                <div class="mobile-project-description">
                    ${project.description || 'Описание проекта отсутствует'}
                </div>
                <div class="mobile-project-meta">
                    <div class="mobile-project-date">
                        ${project.createdAt ? new Date(project.createdAt).toLocaleDateString('ru-RU') : 'Дата неизвестна'}
                    </div>
                    <div class="mobile-project-status ${project.status === 'active' ? 'mobile-status-active' : 'mobile-status-draft'}">
                        ${project.status === 'active' ? 'Активен' : 'Черновик'}
                    </div>
                </div>
            </div>
        `).join('');

        // Обработчики для мобильных проектов
        initMobileProjectHandlers();

        // Анимация появления проектов
        setTimeout(() => {
            document.querySelectorAll('.mobile-project-card').forEach((card, index) => {
                card.style.animationDelay = `${index * 0.1}s`;
                card.classList.add('fade-in');
            });
        }, 100);

    } catch (error) {
        console.error('Ошибка при отображении проектов:', error);
        projectsContainer.innerHTML = `
            <div class="mobile-empty-projects">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Ошибка загрузки</h3>
                <p>Не удалось загрузить проекты</p>
                <button class="btn btn-primary mobile-full-btn" onclick="renderMobileProjects()">
                    <i class="fas fa-redo"></i>
                    Попробовать снова
                </button>
            </div>
        `;
    }
}

// Обработчики мобильных проектов
function initMobileProjectHandlers() {
    // Редактирование проекта
    document.querySelectorAll('.edit-mobile-project-btn').forEach(btn => {
        btn.addEventListener('click', async function () {
            const projectId = this.dataset.id;
            window.location.href = `../editor/index.html?project=${projectId}`;
        });
    });

    // Удаление проекта
    document.querySelectorAll('.delete-mobile-project-btn').forEach(btn => {
        btn.addEventListener('click', async function () {
            const projectId = this.dataset.id;
            const projectCard = this.closest('.mobile-project-card');
            const projectName = projectCard.querySelector('.mobile-project-title').textContent;
            
            if (confirm(`Удалить проект "${projectName}"?`)) {
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`http://localhost:3001/api/projects/${projectId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!response.ok) throw new Error('Ошибка удаления проекта');

                    showMobileToast('Проект удален', 'success');
                    
                    // Анимация удаления
                    projectCard.style.opacity = '0';
                    projectCard.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        renderMobileProjects();
                    }, 300);
                    
                } catch (error) {
                    showMobileToast(error.message, 'error');
                }
            }
        });
    });
}

// Обработчики мобильных форм
function initMobileFormHandlers() {
    // Используем setTimeout для гарантии, что DOM элементы полностью загружены
    setTimeout(() => {
        // Форма профиля
        const mobileProfileForm = document.getElementById('mobile-profile-form');
        if (mobileProfileForm) {
            // Удаляем существующий обработчик, если он есть, чтобы избежать дублирования
            if (mobileProfileForm._originalSubmitHandler) {
                mobileProfileForm.removeEventListener('submit', mobileProfileForm._originalSubmitHandler);
            }
            
            mobileProfileForm._originalSubmitHandler = function(e) {
                handleMobileProfileSave(e);
            };
            
            mobileProfileForm.addEventListener('submit', mobileProfileForm._originalSubmitHandler);
        }

        // Отмена изменений профиля
        const mobileCancelBtn = document.getElementById('mobile-cancel-changes');
        if (mobileCancelBtn) {
            // Удаляем существующий обработчик, если он есть
            if (mobileCancelBtn._originalClickHandler) {
                mobileCancelBtn.removeEventListener('click', mobileCancelBtn._originalClickHandler);
            }
            
            mobileCancelBtn._originalClickHandler = function(e) {
                handleMobileProfileCancel(e);
            };
            
            mobileCancelBtn.addEventListener('click', mobileCancelBtn._originalClickHandler);
        }
    }, 0);
}

async function handleMobileProfileSave(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('mobile-save-changes');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3001/api/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: document.getElementById('mobile-name').value,
                email: document.getElementById('mobile-email').value,
                phone: document.getElementById('mobile-phone').value,
                country: document.getElementById('mobile-country').value
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка сохранения');
        }

        const result = await response.json();
        
        // Обновляем данные в мобильном меню
        document.getElementById('mobile-user-name').textContent = document.getElementById('mobile-name').value;
        document.getElementById('mobile-user-avatar').textContent = 
            document.getElementById('mobile-name').value.substring(0, 2).toUpperCase();
        
        showMobileToast(result.message || 'Изменения сохранены!', 'success');
        
    } catch (error) {
        showMobileToast(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

async function handleMobileProfileCancel() {
    await loadMobileProfile();
    showMobileToast('Изменения отменены', 'info');
}

// Обработчики мобильного меню
function initMobileMenuHandlers() {
    const menuBtn = document.getElementById('mobile-profile-menu');
    const menuOverlay = document.getElementById('mobile-menu-overlay');
    const menuContent = document.getElementById('mobile-profile-menu-content');
    const closeBtn = document.getElementById('close-mobile-menu');

    if (menuBtn && menuOverlay && menuContent) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Меню открыто');
            menuContent.classList.add('active');
            menuOverlay.style.display = 'block';
            setTimeout(() => {
                menuOverlay.style.opacity = '1';
            }, 10);
        });

        closeBtn?.addEventListener('click', closeMobileMenu);
        menuOverlay.addEventListener('click', closeMobileMenu);

        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menuContent.classList.contains('active')) {
                closeMobileMenu();
            }
        });

        // Предотвращаем закрытие при клике внутри меню
        menuContent.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

function closeMobileMenu() {
    const menuOverlay = document.getElementById('mobile-menu-overlay');
    const menuContent = document.getElementById('mobile-profile-menu-content');
    
    if (menuContent) {
        menuContent.classList.remove('active');
    }
    
    if (menuOverlay) {
        menuOverlay.style.opacity = '0';
        setTimeout(() => {
            menuOverlay.style.display = 'none';
        }, 300);
    }
}

// Обработчики мобильных модальных окон
function initMobileModalHandlers() {
    // Смена пароля
    document.getElementById('mobile-change-password')?.addEventListener('click', () => {
        showModal('password-modal');
    });

    // Создание проекта из мобильной версии
    document.getElementById('mobile-create-project')?.addEventListener('click', () => {
        showModal('create-project-modal');
    });

    document.getElementById('mobile-create-project-btn')?.addEventListener('click', () => {
        showModal('create-project-modal');
    });

    // Удаление аккаунта
    document.getElementById('mobile-delete-account')?.addEventListener('click', (e) => {
        e.preventDefault();
        showModal('delete-modal');
    });

    // Возврат на главную
    document.getElementById('back-to-main-mobile')?.addEventListener('click', () => {
        window.location.href = '../main/index.html';
    });
}

// Обработчики мобильных действий
function initMobileActionHandlers() {
    // Выход из аккаунта
    document.getElementById('mobile-logout')?.addEventListener('click', handleMobileLogout);
}

async function handleMobileLogout(e) {
    e.preventDefault();
    
    if (confirm('Вы уверены, что хотите выйти?')) {
        showMobileToast('Выход из системы...', 'info');

        try {
            const token = localStorage.getItem('token');
            await fetch('http://localhost:3001/api/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Ошибка при выходе:', error);
        } finally {
            localStorage.removeItem('token');
            showMobileToast('Вы успешно вышли', 'success');
            setTimeout(() => {
                window.location.href = '../main/index.html';
            }, 1500);
        }
    }
}

// Анимации для мобильных
function initMobileAnimations() {
    // Анимация появления элементов
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Анимируем карточки проектов
    document.querySelectorAll('.mobile-project-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Анимация статистики
    const stats = document.querySelectorAll('.mobile-stat-number');
    if (stats.length) {
        const statObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const stat = entry.target;
                    const targetValue = parseInt(stat.textContent);
                    animateMobileCounter(stat, 0, targetValue, 1500);
                    statObserver.unobserve(stat);
                }
            });
        }, { threshold: 0.5 });

        stats.forEach(stat => statObserver.observe(stat));
    }
}

function animateMobileCounter(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        
        element.textContent = value;
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Уведомления для мобильных
function showMobileToast(message, type = 'success') {
    // Удаляем предыдущие уведомления
    document.querySelectorAll('.mobile-toast').forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = `mobile-toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Стили для мобильного тоста
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        left: 20px;
        right: 20px;
        padding: 16px 20px;
        border-radius: var(--border-radius);
        color: white;
        font-weight: 500;
        z-index: 10000;
        box-shadow: var(--shadow-lg);
        display: flex;
        align-items: center;
        gap: 12px;
        animation: mobileToastSlideIn 0.3s ease-out;
        ${type === 'success' ? 'background: var(--success);' : 
          type === 'error' ? 'background: var(--danger);' : 
          'background: var(--info);'}
    `;
    
    // Добавляем анимацию
    const style = document.createElement('style');
    style.textContent = `
        @keyframes mobileToastSlideIn {
            from {
                transform: translateY(-100%);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(toast);

    // Автоматическое скрытие
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-100%)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Глобальная функция для завершения сессии на мобильных
function terminateMobileSession(element) {
    if (confirm('Завершить эту сессию?')) {
        const sessionItem = element.closest('.mobile-session-item');
        sessionItem.style.opacity = '0';
        sessionItem.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            sessionItem.remove();
            showMobileToast('Сессия завершена', 'success');
        }, 300);
    }
    }
    
    // Навигация по десктопным табам
    function initTabNavigation() {
        // Обработчики для бокового меню (навигационные ссылки)
        document.querySelectorAll('.nav-item-modern[data-tab]').forEach(item => {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                
                const targetTabId = this.getAttribute('data-tab');
                if (!targetTabId) return;
                
                // Убираем активный класс у всех элементов навигации и вкладок
                document.querySelectorAll('.nav-item-modern').forEach(navItem => navItem.classList.remove('active'));
                document.querySelectorAll('.profile-tab-modern').forEach(tab => tab.classList.remove('active'));
                
                // Добавляем активный класс текущему элементу навигации
                this.classList.add('active');
                
                // Находим и показываем соответствующую вкладку
                const targetTab = document.getElementById(targetTabId);
                if (targetTab) {
                    targetTab.classList.add('active');
                    
                    // Для вкладки проектов загружаем список проектов
                    if (targetTabId === 'projects-tab') {
                        renderProjects();
                    }
                    
                    // Для вкладки безопасности загружаем список сессий
                    if (targetTabId === 'security-tab') {
                        loadActiveSessions();
                    }
                }
            });
        });
    }
    
// ============================================
// ДЕСКТОПНАЯ ВЕРСИЯ
// ============================================

function initDesktopVersion() {
    console.log('Загружена десктопная версия');
    
    // Показываем десктопные элементы и скрываем мобильные
    const mobileContainer = document.querySelector('.mobile-profile-container');
    const desktopContainer = document.querySelector('.desktop-profile-container');
    const mobileHeader = document.querySelector('.mobile-header');
    const glassHeader = document.querySelector('.glass-header');
    
    if (mobileContainer) mobileContainer.style.display = 'none';
    if (desktopContainer) desktopContainer.style.display = 'block';
    if (mobileHeader) mobileHeader.style.display = 'none';
    if (glassHeader) glassHeader.style.display = 'block';
    
    // Инициализация анимаций
    initProfileAnimations();
    
    // Загрузка данных профиля с сервера
    loadProfile().then(user => {
        if (user) {
            if (document.querySelector('#projects-tab')?.classList.contains('active')) {
                renderProjects();
            }
            if (document.querySelector('#security-tab')?.classList.contains('active')) {
                loadActiveSessions();
            }
        }
    });

    // Навигация между вкладками
    initTabNavigation();

    // Обработчики форм
    initFormHandlers();

    // Обработчики модальных окон
    initModalHandlers();

    // Обработчики кнопок действий
    initActionHandlers();

    // Инициализация параллакс эффектов
    initProfileParallax();
}

// Загрузка данных профиля (десктоп)
async function loadProfile() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '../main/index.html';
            return;
        }

        const response = await fetch('http://localhost:3001/api/profile', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache'
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '../main/index.html';
            }
            throw new Error('Ошибка загрузки данных');
        }

        const user = await response.json();

        // Заполняем форму профиля
        document.getElementById('name').value = user.name;
        document.getElementById('email').value = user.email;
        document.getElementById('phone').value = user.phone || '';
        document.getElementById('country').value = user.country || 'ru';
        
        // Обновляем информацию в сайдбаре
        document.getElementById('user-name').textContent = user.name;
        document.getElementById('user-email').textContent = user.email;
        document.getElementById('user-avatar').querySelector('.avatar-content').textContent =
            user.name.substring(0, 2).toUpperCase();


        return user;
    } catch (error) {
        showToast(error.message, 'error');
        console.error('Ошибка:', error);
    }
}

// Обновление статистики пользователя (десктоп) - заглушка
async function updateUserStats() {
    // Функция оставлена для совместимости, но не обновляет счетчики, так как они были удалены
    return;
}

// Загрузка и отображение проектов (десктоп)
async function loadProjects() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Токен не найден');
        }

        const response = await fetch('http://localhost:3001/api/projects', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка загрузки проектов: ' + response.status);
        }

        const projects = await response.json();
        console.log('Загружены проекты для десктоп:', projects);
        return Array.isArray(projects) ? projects : [];
    } catch (error) {
        console.error('Ошибка загрузки проектов:', error);
        showToast('Не удалось загрузить проекты', 'error');
        return [];
    }
}

async function renderProjects() {
    const projectsContainer = document.getElementById('projects-container');
    if (!projectsContainer) {
        console.error('Контейнер проектов не найден');
        return;
    }

    // Показываем индикатор загрузки
    projectsContainer.innerHTML = `
        <div class="projects-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Загрузка проектов...</span>
        </div>
    `;

    try {
        const projects = await loadProjects();
        console.log('Проекты для отображения (десктоп):', projects);
        
        // Обновляем счетчик проектов
        await updateUserStats();
        
        if (!projects || projects.length === 0) {
            projectsContainer.innerHTML = `
                <div class="empty-projects-state">
                    <i class="fas fa-folder-open fa-3x"></i>
                    <h3>Проектов пока нет</h3>
                    <p>Создайте свой первый проект чтобы начать работу</p>
                    <button class="btn btn-primary" id="create-project-empty-btn">
                        <i class="fas fa-plus"></i>
                        Создать проект
                    </button>
                </div>
            `;

            document.getElementById('create-project-empty-btn')?.addEventListener('click', () => {
                showModal('create-project-modal');
            });

            return;
        }

        projectsContainer.innerHTML = projects.map(project => `
            <div class="project-card-modern" data-id="${project.id}">
                <div class="project-header-modern">
                    <div class="project-icon-modern">
                        <i class="fas fa-project-diagram"></i>
                    </div>
                    <div class="project-actions-modern">
                        <button class="action-btn-modern edit-project-btn" data-id="${project.id}" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn-modern delete-project-btn" data-id="${project.id}" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="project-title-modern">${project.name || 'Без названия'}</div>
                <div class="project-description-modern">
                    ${project.description || 'Описание проекта отсутствует'}
                </div>
                <div class="project-meta-modern">
                    <div class="project-date-modern">
                        Создан ${project.createdAt ? new Date(project.createdAt).toLocaleDateString('ru-RU') : 'Дата неизвестна'}
                    </div>
                    <div class="project-status-modern ${project.status === 'active' ? 'status-active' : 'status-draft'}">
                        ${project.status === 'active' ? 'Активен' : 'Черновик'}
                    </div>
                </div>
            </div>
        `).join('');

        // Обработчики для кнопок проектов
        initProjectHandlers();

        // Анимация появления проектов
        setTimeout(() => {
            document.querySelectorAll('.project-card-modern').forEach((card, index) => {
                card.style.animationDelay = `${index * 0.1}s`;
                card.classList.add('fade-in');
            });
        }, 100);

    } catch (error) {
        console.error('Ошибка при отображении проектов:', error);
        projectsContainer.innerHTML = `
            <div class="empty-projects-state">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
                <h3>Ошибка загрузки</h3>
                <p>Не удалось загрузить проекты</p>
                <button class="btn btn-primary" onclick="renderProjects()">
                    <i class="fas fa-redo"></i>
                    Попробовать снова
                </button>
            </div>
        `;
    }
}

// Обработчики проектов (десктоп)
function initProjectHandlers() {
    // Редактирование проекта
    document.querySelectorAll('.edit-project-btn').forEach(btn => {
        btn.addEventListener('click', async function () {
            const projectId = this.dataset.id;
            window.location.href = `../editor/index.html?project=${projectId}`;
        });
    });

    // Удаление проекта
    document.querySelectorAll('.delete-project-btn').forEach(btn => {
        btn.addEventListener('click', async function () {
            const projectId = this.dataset.id;
            const projectCard = this.closest('.project-card-modern');
            const projectName = projectCard.querySelector('.project-title-modern').textContent;
            
            if (confirm(`Вы уверены, что хотите удалить проект "${projectName}"?`)) {
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`http://localhost:3001/api/projects/${projectId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!response.ok) throw new Error('Ошибка удаления проекта');

                    showToast('Проект успешно удален', 'success');
                    
                    // Анимация удаления
                    projectCard.style.opacity = '0';
                    projectCard.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        renderProjects();
                    }, 300);
                    
                } catch (error) {
                    showToast(error.message, 'error');
                }
            }
        });
    });
}

// Обработчики форм (десктоп)
function initFormHandlers() {
    // Используем setTimeout для гарантии, что DOM элементы полностью загружены
    setTimeout(() => {
        // Форма профиля
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            // Удаляем существующий обработчик, если он есть, чтобы избежать дублирования
            if (profileForm._originalSubmitHandler) {
                profileForm.removeEventListener('submit', profileForm._originalSubmitHandler);
            }
            
            profileForm._originalSubmitHandler = function(e) {
                handleProfileSave(e);
            };
            
            profileForm.addEventListener('submit', profileForm._originalSubmitHandler);
        }

        // Отмена изменений профиля
        const cancelBtn = document.getElementById('cancel-changes');
        if (cancelBtn) {
            // Удаляем существующий обработчик, если он есть
            if (cancelBtn._originalClickHandler) {
                cancelBtn.removeEventListener('click', cancelBtn._originalClickHandler);
            }
            
            cancelBtn._originalClickHandler = function(e) {
                handleProfileCancel(e);
            };
            
            cancelBtn.addEventListener('click', cancelBtn._originalClickHandler);
        }
        
        // Кнопка сохранения изменений (дополнительно привязываем обработчик, если форма не отправляется через submit)
        const saveBtn = document.getElementById('save-changes');
        if (saveBtn) {
            // Удаляем существующий обработчик, если он есть
            if (saveBtn._originalClickHandler) {
                saveBtn.removeEventListener('click', saveBtn._originalClickHandler);
            }
            saveBtn._originalClickHandler = function(e) {
                e.preventDefault(); // Предотвращаем стандартное поведение
                // Находим форму по ID, так как кнопка находится вне формы
                const form = document.getElementById('profile-form');
                if (form) {
                    // Вызываем submit программно
                    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                } else {
                    // Если форма не найдена, напрямую вызываем обработчик
                    handleProfileSave();
                }
            };
            
            saveBtn.addEventListener('click', saveBtn._originalClickHandler);

        }
    }, 0);
}

async function handleProfileSave(e) {
    // Проверяем, передано ли событие и вызываем preventDefault, если да
    if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
    }
    
    console.log('handleProfileSave вызвана'); // Отладочный вывод

    const submitBtn = document.getElementById('save-changes');
    if (!submitBtn) {
        console.error('Кнопка сохранения не найдена');
        return;
    }
    
    const originalText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';

    try {
        // Получаем элементы формы
        const nameElement = document.getElementById('name');
        const emailElement = document.getElementById('email');
        const phoneElement = document.getElementById('phone');
        const countryElement = document.getElementById('country');
        
        if (!nameElement || !emailElement || !countryElement) {
            throw new Error('Один или несколько элементов формы не найдены');
        }
        
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Токен авторизации не найден');
        }
        
        const response = await fetch('http://localhost:3001/api/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: nameElement.value,
                email: emailElement.value,
                phone: phoneElement?.value || '',
                country: countryElement.value
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка сохранения');
        }

        const result = await response.json();
        
        // Обновляем данные в сайдбаре
        const userNameElement = document.getElementById('user-name');
        const avatarElement = document.getElementById('user-avatar');
        
        if (userNameElement) {
            userNameElement.textContent = nameElement.value;
        }
        
        if (avatarElement) {
            const avatarContent = avatarElement.querySelector('.avatar-content');
            if (avatarContent) {
                avatarContent.textContent = nameElement.value.substring(0, 2).toUpperCase();
            }
        }
        
        showToast(result.message || 'Изменения сохранены!', 'success');
        
    } catch (error) {
        console.error('Ошибка при сохранении профиля:', error);
        showToast(error.message, 'error');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
}

async function handleProfileCancel() {
    await loadProfile();
    showToast('Изменения отменены', 'info');
}

// Обработчики модальных окон
function initModalHandlers() {
    // Смена пароля
    document.getElementById('change-password-btn')?.addEventListener('click', () => {
        showModal('password-modal');
    });

    document.getElementById('password-form')?.addEventListener('submit', handlePasswordChange);

    document.getElementById('cancel-password')?.addEventListener('click', () => {
        hideModal('password-modal');
        document.getElementById('password-form').reset();
    });

    // Удаление аккаунта
    document.getElementById('delete-account-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        showModal('delete-modal');
    });

    document.getElementById('delete-account-form')?.addEventListener('submit', handleAccountDelete);

    document.getElementById('cancel-delete')?.addEventListener('click', () => {
        hideModal('delete-modal');
        document.getElementById('delete-password').value = '';
    });

    // Создание проекта
    document.getElementById('create-project-btn')?.addEventListener('click', () => {
        showModal('create-project-modal');
    });

    document.getElementById('create-project-main-btn')?.addEventListener('click', () => {
        showModal('create-project-modal');
    });

    document.getElementById('create-project-form')?.addEventListener('submit', handleProjectCreate);

    document.getElementById('cancel-create-project')?.addEventListener('click', () => {
        hideModal('create-project-modal');
        document.getElementById('create-project-form').reset();
    });

    // Закрытие модальных окон
    initModalCloseHandlers();
}

function initModalCloseHandlers() {
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

    // Обработчики для мобильной версии модальных окон
    const mobileCreateProjectBtn = document.getElementById('mobile-create-project-btn');
    const mobileCreateProject = document.getElementById('mobile-create-project');
    const mobileCreateProjectEmpty = document.getElementById('mobile-create-project-empty');
    
    if (mobileCreateProjectBtn) {
        mobileCreateProjectBtn.addEventListener('click', () => {
            showModal('create-project-modal');
        });
    }
    
    if (mobileCreateProject) {
        mobileCreateProject.addEventListener('click', () => {
            showModal('create-project-modal');
        });
    }
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Фокусируемся на первом поле ввода
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
        
        // Сбрасываем форму
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

// Обработчики действий (десктоп)
function initActionHandlers() {
    // Выход из аккаунта
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);

    // Возврат на главную
    document.getElementById('back-to-main')?.addEventListener('click', () => {
        window.location.href = '../main/index.html';
    });
}

async function handlePasswordChange(e) {
    e.preventDefault();

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Валидация
    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Все поля обязательны для заполнения', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showToast('Новый пароль и подтверждение не совпадают', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showToast('Пароль должен содержать минимум 6 символов', 'error');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3001/api/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка при изменении пароля');
        }

        const data = await response.json();
        showToast(data.message || 'Пароль успешно изменен', 'success');

        hideModal('password-modal');

    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

async function handleAccountDelete(e) {
    e.preventDefault();

    const password = document.getElementById('delete-password').value;
    if (!password) {
        showToast('Введите пароль для подтверждения', 'error');
        return;
    }

    const submitBtn = document.getElementById('confirm-delete');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Удаление...';

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3001/api/account', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка при удалении аккаунта');
        }

        showToast('Аккаунт успешно удален', 'success');
        localStorage.clear();

        setTimeout(() => {
            window.location.href = '../main/index.html';
        }, 1500);

    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

async function handleProjectCreate(e) {
    e.preventDefault();

    const projectName = document.getElementById('project-name').value.trim();
    if (!projectName) {
        showToast('Введите название проекта', 'error');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Создание...';

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Токен не найден');
        }

        const response = await fetch('http://localhost:3001/api/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                name: projectName,
                description: "Новый проект"
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Ошибка сервера:', errorText);
            throw new Error('Ошибка создания проекта: ' + response.status);
        }

        const result = await response.json();
        console.log('Проект создан:', result);
        
        showToast(`Проект "${projectName}" успешно создан`, 'success');

        hideModal('create-project-modal');

        // Переключаем на вкладку проектов и обновляем список
        const projectsTabLink = document.querySelector('[data-tab="projects-tab"]');
        if (projectsTabLink) {
            projectsTabLink.click();
        } else {
            // Проверяем мобильную версию
            const mobileProjectsTab = document.querySelector('.mobile-tab[data-tab="projects-tab"]');
            if (mobileProjectsTab) {
                mobileProjectsTab.click();
            } else {
                // Если не удалось найти кнопку, перезагружаем страницу
                setTimeout(() => {
                    location.reload();
                }, 1000);
            }
        }
        
    } catch (error) {
        console.error('Ошибка при создании проекта:', error);
        showToast(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

async function handleLogout(e) {
    e.preventDefault();
    
    if (confirm('Вы уверены, что хотите выйти?')) {
        showToast('Выход из системы...', 'info');

        try {
            const token = localStorage.getItem('token');
            await fetch('http://localhost:3001/api/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Ошибка при выходе:', error);
        } finally {
            localStorage.removeItem('token');
            showToast('Вы успешно вышли из системы', 'success');
            setTimeout(() => {
                window.location.href = '../main/index.html';
            }, 1500);
        }
    }
}

// Анимации профиля (десктоп)
function initProfileAnimations() {
    // Анимация появления элементов
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Анимируем карточки и секции
    document.querySelectorAll('.security-section-modern, .project-card-modern').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Анимация статистики
    animateProfileStats();
}

function animateProfileStats() {
    const stats = document.querySelectorAll('.stat-number');
    if (!stats.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stat = entry.target;
                const targetValue = parseInt(stat.textContent);
                animateCounter(stat, 0, targetValue, 1500);
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
        
        element.textContent = value;
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Параллакс эффекты для профиля
function initProfileParallax() {
    const shapes = document.querySelectorAll('.shape');
    
    window.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        shapes.forEach((shape, index) => {
            const speed = 0.03 + (index * 0.01);
            const x = (mouseX - 0.5) * speed * 100;
            const y = (mouseY - 0.5) * speed * 100;
            
            shape.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
}

// Функция для показа уведомлений (десктоп)
function showToast(message, type = 'success') {
    // Удаляем предыдущие уведомления
    document.querySelectorAll('.toast').forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);

    // Автоматическое скрытие
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Функция для загрузки и отображения активных сессий (десктоп)
async function loadActiveSessions() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:3001/api/sessions', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка загрузки сессий');
        }

        const sessions = await response.json();
        const sessionsContainer = document.getElementById('sessions-container');
        
        if (!sessionsContainer) return;

        if (sessions.length === 0) {
            sessionsContainer.innerHTML = `
                <div class="no-sessions-message">
                    <i class="fas fa-inbox"></i>
                    <p>Нет активных сессий</p>
                </div>
            `;
            return;
        }

        // Сортируем сессии: текущая сессия первой, затем по времени последней активности
        const sortedSessions = sessions.sort((a, b) => {
            if (a.isCurrent) return -1;
            if (b.isCurrent) return 1;
            return new Date(b.lastActive) - new Date(a.lastActive);
        });

        sessionsContainer.innerHTML = sortedSessions.map(session => {
            const sessionDate = new Date(session.createdAt);
            const timeDiff = Math.floor((Date.now() - sessionDate.getTime()) / 1000);
            let timeText = 'Только что';
            
            if (timeDiff > 60) {
                const minutes = Math.floor(timeDiff / 60);
                if (minutes < 60) {
                    timeText = `${minutes} мин. назад`;
                } else {
                    const hours = Math.floor(minutes / 60);
                    if (hours < 24) {
                        timeText = `${hours} ч. назад`;
                    } else {
                        const days = Math.floor(hours / 24);
                        timeText = `${days} дн. назад`;
                    }
                }
            }

            const isCurrent = session.isCurrent;
            const statusClass = isCurrent ? 'current' : '';
            const locationText = isCurrent ? `${session.location} (текущая)` : session.location;
            
            return `
                <div class="session-item-modern ${statusClass}">
                    <div class="session-info">
                        <div class="session-device">
                            <i class="fas ${getDeviceIcon(session.device)}"></i>
                            ${session.device}
                        </div>
                        <div class="session-location">${locationText}</div>
                        <div class="session-time">${timeText}</div>
                    </div>
                    ${isCurrent ?
                        '<div class="session-status">Активна</div>' :
                        `<button class="btn btn-outline-modern danger session-action" onclick="terminateSessionByToken('${session.token}', this)">
                            Завершить
                        </button>`
                    }
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Ошибка загрузки сессий:', error);
        const sessionsContainer = document.getElementById('sessions-container');
        if (sessionsContainer) {
            sessionsContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Ошибка загрузки сессий</p>
                </div>
            `;
        }
    }
}

// Функция для загрузки и отображения активных сессий (мобильная версия)
async function loadMobileActiveSessions() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:3001/api/sessions', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка загрузки сессий');
        }

        const sessions = await response.json();
        const sessionsContainer = document.getElementById('mobile-sessions-list');
        
        if (!sessionsContainer) return;

        if (sessions.length === 0) {
            sessionsContainer.innerHTML = `
                <div class="mobile-no-sessions-message">
                    <i class="fas fa-inbox"></i>
                    <p>Нет активных сессий</p>
                </div>
            `;
            return;
        }

        // Сортируем сессии: текущая сессия первой, затем по времени последней активности
        const sortedSessions = sessions.sort((a, b) => {
            if (a.isCurrent) return -1;
            if (b.isCurrent) return 1;
            return new Date(b.lastActive) - new Date(a.lastActive);
        });

        sessionsContainer.innerHTML = sortedSessions.map(session => {
            const sessionDate = new Date(session.createdAt);
            const timeDiff = Math.floor((Date.now() - sessionDate.getTime()) / 1000);
            let timeText = 'Только что';
            
            if (timeDiff > 60) {
                const minutes = Math.floor(timeDiff / 60);
                if (minutes < 60) {
                    timeText = `${minutes} мин. назад`;
                } else {
                    const hours = Math.floor(minutes / 60);
                    if (hours < 24) {
                        timeText = `${hours} ч. назад`;
                    } else {
                        const days = Math.floor(hours / 24);
                        timeText = `${days} дн. назад`;
                    }
                }
            }

            const isCurrent = session.isCurrent;
            const statusClass = isCurrent ? 'current' : '';
            const locationText = isCurrent ? 'Текущая сессия' : session.location;
            
            return `
                <div class="mobile-session-item ${statusClass}">
                    <div class="mobile-session-info">
                        <div class="mobile-session-device">
                            <i class="fas ${getDeviceIcon(session.device)}"></i>
                            ${session.device}
                        </div>
                        <div class="mobile-session-location">${locationText}</div>
                        <div class="mobile-session-time">${timeText}</div>
                    </div>
                    ${isCurrent ?
                        '<div class="mobile-session-status">Активна</div>' :
                        `<button class="mobile-session-action" onclick="terminateSessionByToken('${session.token}', this)">
                            <i class="fas fa-times"></i>
                        </button>`
                    }
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Ошибка загрузки сессий:', error);
        const sessionsContainer = document.getElementById('mobile-sessions-list');
        if (sessionsContainer) {
            sessionsContainer.innerHTML = `
                <div class="mobile-error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Ошибка загрузки сессий</p>
                </div>
            `;
        }
    }
}

// Вспомогательная функция для получения иконки устройства
function getDeviceIcon(deviceInfo) {
    const device = deviceInfo.toLowerCase();
    
    if (device.includes('mobile') || device.includes('iphone') || device.includes('android')) {
        return 'fa-mobile-alt';
    } else if (device.includes('tablet')) {
        return 'fa-tablet-alt';
    } else if (device.includes('macos') || device.includes('mac')) {
        return 'fa-apple';
    } else if (device.includes('windows')) {
        return 'fa-windows';
    } else if (device.includes('linux')) {
        return 'fa-linux';
    } else if (device.includes('chrome')) {
        return 'fa-chrome';
    } else if (device.includes('firefox')) {
        return 'fa-firefox';
    } else if (device.includes('safari')) {
        return 'fa-safari';
    } else if (device.includes('edge')) {
        return 'fa-edge';
    } else {
        return 'fa-desktop';
    }
}

// Реальная функция для завершения сессии по токену
async function terminateSessionByToken(sessionToken, element) {
    if (!confirm('Завершить эту сессию?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '../main/index.html';
            return;
        }

        // Если завершаем текущую сессию, нужно выполнить logout
        const currentToken = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (sessionToken === currentToken) {
            await fetch('http://localhost:3001/api/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            window.location.href = '../main/index.html';
            return;
        }

        // Для других сессий - отправляем запрос на сервер для завершения конкретной сессии
        const response = await fetch('http://localhost:3001/api/sessions/terminate', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionToken: sessionToken })
        });

        if (response.ok) {
            await loadActiveSessions(); // Reload desktop sessions
            await loadMobileActiveSessions(); // Reload mobile sessions
            showToast('Сессия завершена', 'success');
        } else {
            const errorData = await response.json();
            showToast(errorData.error || 'Ошибка завершения сессии', 'error');
        }
    } catch (error) {
        console.error('Ошибка завершения сессии:', error);
        showToast('Ошибка завершения сессии', 'error');
    }
}

// Глобальная функция для завершения сессии (совместимость)
function terminateSession(element) {
    // Для совместимости вызываем функцию с правильной логикой
    const sessionItem = element.closest('.session-item-modern');
    const token = sessionItem?.dataset.token;
    if (token) {
        terminateSessionByToken(token, element);
    } else {
        // Если токен недоступен, просто перезагружаем список
        loadActiveSessions();
    }
}

// Глобальная функция для завершения сессии на мобильных (совместимость)
function terminateMobileSession(element) {
    // Для совместимости вызываем функцию с правильной логикой
    const sessionItem = element.closest('.mobile-session-item');
    const token = sessionItem?.dataset.token;
    if (token) {
        terminateSessionByToken(token, element);
    } else {
        // Если токен недоступен, просто перезагружаем список
        loadMobileActiveSessions();
    }
}

// ============================================
// ОБЩИЕ ФУНКЦИИ
// ============================================

function initCommonFeatures() {
    // Обработка ошибок загрузки изображений
    document.addEventListener('error', (e) => {
        if (e.target.tagName === 'IMG') {
            e.target.style.display = 'none';
            console.warn('Изображение не загружено:', e.target.src);
        }
    }, true);

    // Обработка ресайза окна
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const isMobile = window.innerWidth <= 768;
            const currentIsMobile = document.querySelector('.mobile-header')?.style.display !== 'none';
            
            if (isMobile !== currentIsMobile) {
                location.reload();
            }
        }, 250);
    });

    // Инициализация модальных окон при динамической загрузке
    setTimeout(initModalHandlers, 100);
}

// CSS для дополнительных стилей
const additionalStyles = `
/* Анимации для проектов */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.fade-in {
    animation: fadeIn 0.5s ease forwards;
}

.project-card-modern,
.mobile-project-card {
    opacity: 0;
}

/* Исправление для модальных окон */
.modal-content {
    position: relative;
    z-index: 2001;
}

.close-btn {
    cursor: pointer;
    transition: all 0.3s ease;
}

.close-btn:hover {
    transform: scale(1.1);
}

/* Исправление для кнопки создания проекта */
#create-project-form button[type="submit"],
#create-project-empty-btn,
#mobile-create-project-empty {
    min-width: 120px;
}

/* Улучшение фокуса для модальных окон */
.modal.modern {
    backdrop-filter: blur(10px);
}

.modal-content.modal-modern {
    animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
    from {
        opacity: 0;
        transform: translateY(-30px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* Общие стили для пустых состояний */
.empty-projects-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 80px 20px;
    color: var(--gray-light);
}

.empty-projects-state i {
    font-size: 4rem;
    color: var(--gray);
    margin-bottom: 20px;
    opacity: 0.5;
}

.empty-projects-state h3 {
    font-size: 1.5rem;
    margin-bottom: 12px;
    color: var(--light);
}

.empty-projects-state p {
    margin-bottom: 30px;
    font-size: 1rem;
}

/* Стили для мобильных уведомлений */
.mobile-toast {
    position: fixed;
    top: 80px;
    left: 20px;
    right: 20px;
    padding: 16px 20px;
    border-radius: var(--border-radius);
    color: white;
    font-weight: 500;
    z-index: 10000;
    box-shadow: var(--shadow-lg);
    display: flex;
    align-items: center;
    gap: 12px;
    animation: mobileToastSlideIn 0.3s ease-out;
}

.mobile-toast.success {
    background: var(--success);
}

.mobile-toast.error {
    background: var(--danger);
}

.mobile-toast.info {
    background: var(--info);
}

@keyframes mobileToastSlideIn {
    from {
        transform: translateY(-100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* Мобильные дополнительные стили */
.mobile-empty-projects {
    text-align: center;
    padding: 80px 20px;
    color: var(--gray-light);
}

.mobile-empty-projects i {
    font-size: 3rem;
    color: var(--gray);
    margin-bottom: 20px;
    opacity: 0.5;
}

.mobile-empty-projects h3 {
    font-size: 1.25rem;
    margin-bottom: 12px;
    color: var(--light);
}

.mobile-empty-projects p {
    margin-bottom: 30px;
    font-size: 1rem;
}

/* Улучшенные кнопки для мобильных */
@media (max-width: 768px) {
    .btn {
        padding: 14px 20px;
        font-size: 15px;
        min-height: 48px;
    }
    
    .btn-primary {
        padding: 14px 20px;
    }
    
    .btn-outline-modern {
        padding: 14px 20px;
    }
    
    .mobile-full-btn {
        min-height: 48px;
    }
    
    .mobile-icon-btn {
        width: 44px;
        height: 44px;
        padding: 0;
    }
}

/* Корректировка позиции тостов на мобильных */
@media (max-width: 768px) {
    .mobile-toast {
        top: 70px;
        left: 16px;
        right: 16px;
    }
}

/* Анимация удаления */
@keyframes fadeOut {
    from {
        opacity: 1;
        transform: scale(1);
    }
    to {
        opacity: 0;
        transform: scale(0.8);
    }
}

.fade-out {
    animation: fadeOut 0.3s ease-out forwards;
}

/* Исправление для модального окна создания проекта */
#create-project-modal .modal-content {
    max-width: 450px;
}

#project-name {
    font-size: 16px;
    padding: 15px;
}

#create-project-form .modal-actions-modern {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

#create-project-form .btn {
    min-width: 100px;
}
`;

// Добавляем дополнительные стили
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Глобальные функции
window.showModal = showModal;
window.hideModal = hideModal;
window.terminateMobileSession = terminateMobileSession;
window.terminateSession = terminateSession;
window.renderProjects = renderProjects;
window.renderMobileProjects = renderMobileProjects;