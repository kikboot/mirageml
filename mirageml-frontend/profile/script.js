document.addEventListener('DOMContentLoaded', function() {
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
                        <button class="btn btn-outline edit-project-btn" onclick="location.href='../editor/index.html?project=${project.id}'">
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

        // Обработчики для кнопок удаления
        document.querySelectorAll('.delete-project-btn').forEach(btn => {
            btn.addEventListener('click', async function() {
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
    document.getElementById('create-project-btn')?.addEventListener('click', function() {
        document.getElementById('create-project-modal').style.display = 'flex';
        document.getElementById('project-name').focus();
    });

    // Обработчик формы создания проекта
    document.getElementById('create-project-form')?.addEventListener('submit', async function(e) {
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
    document.getElementById('cancel-create-project')?.addEventListener('click', function() {
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
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.tabs').forEach(tab => tab.classList.remove('active'));
            document.getElementById(this.getAttribute('data-tab')).classList.add('active');
        });
    });
    
    // Сохранение профиля
    document.getElementById('profile-form')?.addEventListener('submit', async function(e) {
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
    document.getElementById('cancel-changes')?.addEventListener('click', async function() {
        await loadProfile();
        showToast('Изменения отменены', 'info');
    });
    
    // Смена пароля - обработка клика по кнопке
    document.getElementById('change-password-btn')?.addEventListener('click', function() {
        document.getElementById('password-modal').style.display = 'flex';
        document.getElementById('current-password').focus();
    });
    
    // Обработчик формы смены пароля
    document.getElementById('password-form')?.addEventListener('submit', async function(e) {
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
    document.getElementById('cancel-password')?.addEventListener('click', function() {
        document.getElementById('password-modal').style.display = 'none';
        document.getElementById('password-form').reset();
    });
    
    // Выход из аккаунта
    document.getElementById('logout-btn')?.addEventListener('click', function(e) {
        e.preventDefault();
        if(confirm('Вы уверены, что хотите выйти?')) {
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
    document.getElementById('delete-account-link')?.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('delete-modal').style.display = 'flex';
        document.getElementById('delete-password').focus();
    });
    
    // Обработчик формы удаления аккаунта
    document.getElementById('delete-account-form')?.addEventListener('submit', async function(e) {
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
    document.getElementById('cancel-delete')?.addEventListener('click', function() {
        document.getElementById('delete-modal').style.display = 'none';
        document.getElementById('delete-password').value = '';
    });
    
    // Закрытие модальных окон
    document.querySelectorAll('.close-btn, .btn-outline').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    window.addEventListener('click', function(e) {
        if(e.target.classList.contains('modal')) {
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
    if(confirm('Завершить эту сессию?')) {
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