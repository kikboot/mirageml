document.addEventListener('DOMContentLoaded', function () {
    // Инициализация анимаций
    initProfileAnimations();
    
    // Загрузка данных профиля с сервера
    loadProfile().then(user => {
        if (user) {
            updateUserStats();
            if (document.querySelector('#projects-tab')?.classList.contains('active')) {
                renderProjects();
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
});

// Анимации профиля
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

// Загрузка данных профиля
async function loadProfile() {
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

// Обновление статистики пользователя
async function updateUserStats() {
    try {
        const token = localStorage.getItem('token');
        const [projectsResponse, sessionsResponse] = await Promise.all([
            fetch('http://localhost:3001/api/projects/count', {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch('http://localhost:3001/api/sessions/count', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        if (projectsResponse.ok) {
            const projectsData = await projectsResponse.json();
            document.getElementById('projects-count').textContent = projectsData.count;
            document.getElementById('projects-badge').textContent = projectsData.count;
        }

        if (sessionsResponse.ok) {
            const sessionsData = await sessionsResponse.json();
            document.getElementById('sessions-count').textContent = sessionsData.count;
        }
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

// Навигация по вкладкам
function initTabNavigation() {
    document.querySelectorAll('.nav-item-modern').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            
            // Убираем активный класс у всех вкладок
            document.querySelectorAll('.nav-item-modern').forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.profile-tab-modern').forEach(tab => tab.classList.remove('active'));
            
            // Добавляем активный класс текущей вкладке
            this.classList.add('active');
            const targetTab = document.getElementById(this.getAttribute('data-tab'));
            if (targetTab) {
                targetTab.classList.add('active');
                
                // Загружаем проекты при переключении на вкладку проектов
                if (this.getAttribute('data-tab') === 'projects-tab') {
                    renderProjects();
                }
            }
        });
    });
}

// Загрузка и отображение проектов
async function loadProjects() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3001/api/projects', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Ошибка загрузки проектов');
        return await response.json();
    } catch (error) {
        showToast(error.message, 'error');
        console.error('Ошибка:', error);
        return [];
    }
}

async function renderProjects() {
    const projectsContainer = document.getElementById('projects-container');
    if (!projectsContainer) return;

    // Показываем индикатор загрузки
    projectsContainer.innerHTML = `
        <div class="projects-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Загрузка проектов...</span>
        </div>
    `;

    const projects = await loadProjects();
    
    if (projects.length === 0) {
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
            <div class="project-title-modern">${project.name}</div>
            <div class="project-description-modern">
                ${project.description || 'Описание проекта отсутствует'}
            </div>
            <div class="project-meta-modern">
                <div class="project-date-modern">
                    Создан ${new Date(project.createdAt).toLocaleDateString('ru-RU')}
                </div>
                <div class="project-status-modern ${project.status === 'active' ? 'status-active' : 'status-draft'}">
                    ${project.status === 'active' ? 'Активен' : 'Черновик'}
                </div>
            </div>
        </div>
    `).join('');

    // Обработчики для кнопок проектов
    initProjectHandlers();
}

// Обработчики проектов
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

// Обработчики форм
function initFormHandlers() {
    // Форма профиля
    document.getElementById('profile-form')?.addEventListener('submit', handleProfileSave);

    // Отмена изменений профиля
    document.getElementById('cancel-changes')?.addEventListener('click', handleProfileCancel);
}

async function handleProfileSave(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('save-changes');
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
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                country: document.getElementById('country').value
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка сохранения');
        }

        const result = await response.json();
        
        // Обновляем данные в сайдбаре
        document.getElementById('user-name').textContent = document.getElementById('name').value;
        document.getElementById('user-avatar').querySelector('.avatar-content').textContent = 
            document.getElementById('name').value.substring(0, 2).toUpperCase();
        
        showToast(result.message || 'Изменения сохранены!', 'success');
        
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
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
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Фокусируемся на первом поле ввода
        const firstInput = modal.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
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

// Обработчики действий
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
        const response = await fetch('http://localhost:3001/api/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: projectName })
        });

        if (!response.ok) throw new Error('Ошибка создания проекта');

        const result = await response.json();
        showToast(`Проект "${projectName}" успешно создан`, 'success');

        hideModal('create-project-modal');

        // Переключаем на вкладку проектов и обновляем список
        document.querySelector('[data-tab="projects-tab"]').click();
        
    } catch (error) {
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

// Функция для показа уведомлений
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

// Глобальная функция для завершения сессии
function terminateSession(element) {
    if (confirm('Завершить эту сессию?')) {
        const sessionItem = element.closest('.session-item-modern');
        sessionItem.style.opacity = '0';
        sessionItem.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            sessionItem.remove();
            showToast('Сессия завершена', 'success');
        }, 300);
    }
}

// Обработка ошибок загрузки изображений
document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
        e.target.style.display = 'none';
        console.warn('Изображение не загружено:', e.target.src);
    }
}, true);

// Оптимизация производительности при скролле
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
            scrollTimeout = null;
            // Можно добавить ленивую загрузку или другие оптимизации
        }, 10);
    }
});

// CSS для дополнительных стилей
const additionalStyles = `
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

.session-item-modern {
    transition: all 0.3s ease;
}

.project-card-modern {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

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
`;

// Добавляем дополнительные стили
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);