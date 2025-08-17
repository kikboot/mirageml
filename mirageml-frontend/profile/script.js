document.addEventListener('DOMContentLoaded', function () {
    // Загрузка данных профиля с сервера
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

            document.getElementById('name').value = user.name;
            document.getElementById('email').value = user.email;
            document.getElementById('phone').value = user.phone || '';
            document.getElementById('country').value = user.country || 'ru';
            document.getElementById('user-name').textContent = user.name;
            document.getElementById('user-avatar').textContent = user.avatar;

            return user;
        } catch (error) {
            showToast(error.message, 'error');
            console.error('Ошибка:', error);
        }
    }

    // Загрузка проектов
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

    // Отображение проектов
    async function renderProjects() {
        const projects = await loadProjects();
        const projectsContainer = document.querySelector('.projects-list');

        if (!projectsContainer) return;

        projectsContainer.innerHTML = projects.map(project => `
            <div class="project-card" data-id="${project.id}">
                <div class="project-image">
                    <i class="fas fa-image fa-3x"></i>
                </div>
                <div class="project-info">
                    <div class="project-title">${project.name}</div>
                    <div class="project-date">Создан ${new Date(project.createdAt).toLocaleDateString()}</div>
                    <div class="project-actions">
                        <button class="btn btn-outline edit-project-btn" data-id="${project.id}">
                            <i class="fas fa-edit"></i> Редактировать
                        </button>
                        <div class="project-dropdown">
                            <button class="btn btn-outline dropdown-toggle">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <div class="dropdown-menu">
                                <button class="dropdown-item delete-project-btn">Удалить</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Обработчик открытия проекта
        document.querySelectorAll('.edit-project-btn').forEach(btn => {
            btn.addEventListener('click', async function () {
                const projectId = this.dataset.id;
                window.location.href = `../editor/index.html?project=${projectId}`;
            });
        });

        // Обработчики для кнопок удаления
        document.querySelectorAll('.delete-project-btn').forEach(btn => {
            btn.addEventListener('click', async function () {
                const projectId = this.closest('.project-card').dataset.id;
                if (confirm('Вы уверены, что хотите удалить этот проект?')) {
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
                        await renderProjects();
                    } catch (error) {
                        showToast(error.message, 'error');
                    }
                }
            });
        });
    }

    // Открытие модального окна создания проекта
    document.getElementById('create-project-btn')?.addEventListener('click', function () {
        document.getElementById('create-project-modal').style.display = 'flex';
        document.getElementById('project-name').focus();
    });

    // Обработчик формы создания проекта
    document.getElementById('create-project-form')?.addEventListener('submit', async function (e) {
        e.preventDefault();

        const projectName = document.getElementById('project-name').value.trim();
        if (!projectName) {
            showToast('Введите название проекта', 'error');
            return;
        }

        const submitBtn = this.querySelector('button[type="submit"]');
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

            // Закрываем модальное окно и очищаем форму
            document.getElementById('create-project-modal').style.display = 'none';
            this.reset();

            // Переключаем на вкладку проектов и обновляем список
            document.querySelector('[data-tab="projects-tab"]').click();
            await renderProjects();
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-plus"></i> Создать';
        }
    });

    // Отмена создания проекта
    document.getElementById('cancel-create-project')?.addEventListener('click', function () {
        document.getElementById('create-project-modal').style.display = 'none';
        document.getElementById('create-project-form').reset();
    });

    // Инициализация страницы
    loadProfile().then(() => {
        if (document.querySelector('#projects-tab')?.classList.contains('active')) {
            renderProjects();
        }
    });

    // При переключении на вкладку проектов загружаем их
    document.querySelector('[data-tab="projects-tab"]')?.addEventListener('click', renderProjects);

    // Переключение вкладок
    document.querySelectorAll('.tab-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            document.querySelectorAll('.tabs').forEach(tab => tab.classList.remove('active'));
            document.getElementById(this.getAttribute('data-tab')).classList.add('active');
        });
    });

    // Сохранение профиля
    document.getElementById('profile-form')?.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = this.querySelector('button[type="submit"]');
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
            document.getElementById('user-name').textContent = document.getElementById('name').value;
            document.getElementById('user-avatar').textContent = document.getElementById('name').value.substring(0, 2).toUpperCase();
            showToast(result.message || 'Изменения сохранены!', 'success');
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Сохранить изменения';
        }
    });

    // Отмена изменений профиля
    document.getElementById('cancel-changes')?.addEventListener('click', async function () {
        await loadProfile();
        showToast('Изменения отменены', 'info');
    });

    // Смена пароля - обработка клика по кнопке
    document.getElementById('change-password-btn')?.addEventListener('click', function () {
        document.getElementById('password-modal').style.display = 'flex';
        document.getElementById('current-password').focus();
    });

    // Обработчик формы смены пароля
    document.getElementById('password-form')?.addEventListener('submit', async function (e) {
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

        const submitBtn = this.querySelector('button[type="submit"]');
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

            // Закрываем модальное окно и очищаем форму
            document.getElementById('password-modal').style.display = 'none';
            this.reset();
        } catch (error) {
            showToast(error.message, 'error');
            console.error('Ошибка:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Изменить пароль';
        }
    });

    // Закрытие модального окна смены пароля
    document.getElementById('cancel-password')?.addEventListener('click', function () {
        document.getElementById('password-modal').style.display = 'none';
        document.getElementById('password-form').reset();
    });

    // Выход из аккаунта
    document.getElementById('logout-btn')?.addEventListener('click', function (e) {
        e.preventDefault();
        if (confirm('Вы уверены, что хотите выйти?')) {
            showToast('Выход из системы...', 'info');

            const token = localStorage.getItem('token');
            fetch('http://localhost:3001/api/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(() => {
                    localStorage.removeItem('token');
                    showToast('Вы успешно вышли из системы', 'success');
                    setTimeout(() => {
                        window.location.href = '../main/index.html';
                    }, 1500);
                })
                .catch(error => {
                    showToast('Ошибка при выходе: ' + error.message, 'error');
                    console.error('Ошибка:', error);
                });
        }
    });

    // Удаление аккаунта
    document.getElementById('delete-account-link')?.addEventListener('click', function (e) {
        e.preventDefault();
        document.getElementById('delete-modal').style.display = 'flex';
        document.getElementById('delete-password').focus();
    });

    // Обработчик формы удаления аккаунта
    document.getElementById('delete-account-form')?.addEventListener('submit', async function (e) {
        e.preventDefault();

        const password = document.getElementById('delete-password').value;
        if (!password) {
            showToast('Введите пароль для подтверждения', 'error');
            return;
        }

        const submitBtn = document.getElementById('confirm-delete');
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
            console.error('Ошибка:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-trash"></i> Удалить аккаунт';
        }
    });

    // Отмена удаления аккаунта
    document.getElementById('cancel-delete')?.addEventListener('click', function () {
        document.getElementById('delete-modal').style.display = 'none';
        document.getElementById('delete-password').value = '';
    });

    // Закрытие модальных окон
    document.querySelectorAll('.close-btn, .btn-outline').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });

    window.addEventListener('click', function (e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Функция для показа уведомлений
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            ${message}
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
});

// Завершение сессии (глобальная функция)
function terminateSession(element) {
    if (confirm('Завершить эту сессию?')) {
        element.closest('tr').remove();

        // Создаем временное уведомление, так как showToast не доступна глобально
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.innerHTML = '<i class="fas fa-check-circle"></i> Сессия завершена';
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Конфигурация
        const config = {
            elementsCount: 25,
            lineCount: 15,
            types: ['button', 'input', 'card', 'dropdown', 'slider', 'checkbox', 'radio'],
            colors: ['#4361ee', '#3f37c9', '#4895ef', '#4cc9f0', '#7209b7', '#560bad']
        };

        // Состояние элементов
        const elements = [];
        const lines = [];

        // Создаем плавающие элементы
        function createFloatingElements() {
            const container = document.getElementById('floating-elements-container');
            
            for (let i = 0; i < config.elementsCount; i++) {
                const element = document.createElement('div');
                const type = config.types[Math.floor(Math.random() * config.types.length)];
                const size = Math.random() * 80 + 40;
                const duration = Math.random() * 25 + 15;
                const delay = Math.random() * 20;
                const color = config.colors[Math.floor(Math.random() * config.colors.length)];
                
                element.className = `floating-element floating-${type}`;
                element.dataset.id = i;
                
                // Позиционирование
                const left = Math.random() * 90 + 5;
                const top = Math.random() * 90 + 5;
                
                element.style.left = `${left}vw`;
                element.style.top = `${top}vh`;
                element.style.width = `${size}px`;
                element.style.height = `${type === 'input' ? size/3 : size/1.5}px`;
                element.style.animationDuration = `${duration}s`;
                element.style.animationDelay = `-${delay}s`;
                element.style.opacity = Math.random() * 0.3 + 0.1;
                
                // Стилизация по типам
                switch(type) {
                    case 'button':
                        element.style.backgroundColor = color;
                        element.style.borderRadius = '6px';
                        break;
                    case 'input':
                        element.style.backgroundColor = 'white';
                        element.style.border = `1px solid ${color}`;
                        element.style.borderRadius = '4px';
                        break;
                    case 'card':
                        element.style.backgroundColor = 'white';
                        element.style.boxShadow = `0 2px 8px ${color}20`;
                        element.style.borderRadius = '8px';
                        break;
                    case 'dropdown':
                        element.style.backgroundColor = color;
                        element.style.borderRadius = '4px';
                        element.style.position = 'relative';
                        element.innerHTML = '<div style="position: absolute; bottom: 0; width: 100%; height: 30%; background: rgba(0,0,0,0.1); border-radius: 0 0 4px 4px;"></div>';
                        break;
                    case 'slider':
                        element.style.backgroundColor = 'white';
                        element.style.border = `1px solid ${color}`;
                        element.style.borderRadius = '10px';
                        element.innerHTML = `<div style="width: ${Math.random() * 70 + 30}%; height: 100%; background: ${color}; border-radius: 10px;"></div>`;
                        break;
                    case 'checkbox':
                        element.style.width = element.style.height = `${size/2}px`;
                        element.style.backgroundColor = 'white';
                        element.style.border = `2px solid ${color}`;
                        element.style.borderRadius = '4px';
                        if (Math.random() > 0.5) {
                            element.innerHTML = '<div style="width: 60%; height: 60%; margin: 20%; background: ' + color + ';"></div>';
                        }
                        break;
                    case 'radio':
                        element.style.width = element.style.height = `${size/2}px`;
                        element.style.backgroundColor = 'white';
                        element.style.border = `2px solid ${color}`;
                        element.style.borderRadius = '50%';
                        if (Math.random() > 0.5) {
                            element.innerHTML = '<div style="width: 60%; height: 60%; margin: 20%; background: ' + color + '; border-radius: 50%;"></div>';
                        }
                        break;
                }
                
                container.appendChild(element);
                elements.push({
                    id: i,
                    element: element,
                    x: left,
                    y: top,
                    type: type
                });
            }
        }

        // Создаем соединительные линии
        function createConnectionLines() {
            const svg = document.getElementById('connections-svg');
            
            for (let i = 0; i < config.lineCount; i++) {
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                
                // Выбираем два случайных элемента
                const el1 = elements[Math.floor(Math.random() * elements.length)];
                const el2 = elements[Math.floor(Math.random() * elements.length)];
                
                if (el1 && el2 && el1.id !== el2.id) {
                    line.setAttribute('x1', `${el1.x}%`);
                    line.setAttribute('y1', `${el1.y}%`);
                    line.setAttribute('x2', `${el2.x}%`);
                    line.setAttribute('y2', `${el2.y}%`);
                    line.setAttribute('stroke', 'rgba(67, 97, 238, 0.15)');
                    line.setAttribute('stroke-width', '1');
                    line.setAttribute('stroke-dasharray', '5,3');
                    
                    svg.appendChild(line);
                    lines.push({
                        element: line,
                        el1: el1,
                        el2: el2
                    });
                }
            }
        }

        // Анимация элементов и линий
        function animateElements() {
            elements.forEach(el => {
                // Случайное движение
                const moveX = (Math.random() - 0.5) * 2;
                const moveY = (Math.random() - 0.5) * 2;
                
                el.x = Math.max(5, Math.min(95, el.x + moveX * 0.05));
                el.y = Math.max(5, Math.min(95, el.y + moveY * 0.05));
                
                el.element.style.left = `${el.x}vw`;
                el.element.style.top = `${el.y}vh`;
            });

            // Обновление линий
            lines.forEach(line => {
                line.element.setAttribute('x1', `${line.el1.x}%`);
                line.element.setAttribute('y1', `${line.el1.y}%`);
                line.element.setAttribute('x2', `${line.el2.x}%`);
                line.element.setAttribute('y2', `${line.el2.y}%`);
            });

            requestAnimationFrame(animateElements);
        }

        // Инициализация
        window.addEventListener('load', () => {
            createFloatingElements();
            createConnectionLines();
            animateElements();
            
            // Периодическое обновление линий
            setInterval(() => {
                const svg = document.getElementById('connections-svg');
                while (svg.firstChild) {
                    svg.removeChild(svg.firstChild);
                }
                lines.length = 0;
                createConnectionLines();
            }, 10000);
        });