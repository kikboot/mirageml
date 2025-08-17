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

    // Проверка авторизации при загрузке
    checkAuthStatus();

    // Открытие модальных окон с очисткой уведомлений
    if (loginBtn) loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'flex';
        document.getElementById('login-notification').style.display = 'none';
    });
    
    if (registerBtn) registerBtn.addEventListener('click', () => {
        registerModal.style.display = 'flex';
        document.getElementById('register-notification').style.display = 'none';
    });
    
    if (createProjectBtn) {
        createProjectBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const token = localStorage.getItem('token');
            if (token) {
                window.location.href = '/editor';
            } else {
                loginModal.style.display = 'flex';
            }
        });
    }

    // Переключение между формами
    if (switchToRegister) {
        switchToRegister.addEventListener('click', () => {
            loginModal.style.display = 'none';
            registerModal.style.display = 'flex';
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', () => {
            registerModal.style.display = 'none';
            loginModal.style.display = 'flex';
        });
    }

    // Закрытие модалок
    document.querySelectorAll('.close-btn, .btn-outline').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });

    // Обработка формы входа
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const notification = document.getElementById('login-notification');

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                
                if (data.success) {
                    localStorage.setItem('token', data.token);
                    updateAuthUI(data.user);
                    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
                    window.location.reload();
                } else {
                    // Показываем конкретное сообщение об ошибке
                    if (response.status === 401) {
                        notification.textContent = data.error || 'Неверный email или пароль';
                    } else if (response.status === 404) {
                        notification.textContent = 'Такого аккаунта не существует';
                    } else {
                        notification.textContent = data.error || 'Ошибка авторизации';
                    }
                    notification.style.display = 'block';
                }
            } catch (error) {
                notification.textContent = 'Ошибка соединения с сервером';
                notification.style.display = 'block';
            }
        });
    }

    // Обработка формы регистрации
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirm = document.getElementById('register-confirm').value;
            const notification = document.getElementById('register-notification');

            // Скрываем уведомление при новом вводе
            notification.style.display = 'none';

            if (password !== confirm) {
                notification.textContent = 'Пароли не совпадают';
                notification.style.display = 'block';
                return;
            }

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();
                
                if (data.success) {
                    notification.textContent = 'Регистрация успешна! Теперь войдите в систему.';
                    notification.className = 'notification success';
                    notification.style.display = 'block';
                    
                    // Очищаем форму
                    registerForm.reset();
                    
                    // Переключаем на форму входа через 2 секунды
                    setTimeout(() => {
                        notification.style.display = 'none';
                        registerModal.style.display = 'none';
                        loginModal.style.display = 'flex';
                        notification.className = 'notification error';
                    }, 2000);
                } else {
                    if (response.status === 400 && data.error.includes('уже используется')) {
                        notification.textContent = 'Такая почта уже зарегистрирована';
                    } else {
                        notification.textContent = data.error || 'Ошибка регистрации';
                    }
                    notification.style.display = 'block';
                }
            } catch (error) {
                notification.textContent = 'Ошибка соединения с сервером';
                notification.style.display = 'block';
            }
        });
    }

    // Загрузка отзывов
    if (document.getElementById('reviews-container')) {
        loadReviews();
    }
});

// Проверка статуса авторизации
async function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('/api/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const user = await response.json();
            updateAuthUI(user);
        } else {
            localStorage.removeItem('token');
        }
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
    }
}

function updateAuthUI(user) {
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;

    authButtons.innerHTML = `
        <div class="user-menu">
            <button class="user-avatar" aria-label="Меню пользователя">
                ${user.avatar}
            </button>
            <div class="dropdown-content">
                <a href="/profile" class="dropdown-item">
                    <i class="fas fa-user"></i> Профиль
                </a>
                <a href="#" id="logout-btn" class="dropdown-item">
                    <i class="fas fa-sign-out-alt"></i> Выйти
                </a>
            </div>
        </div>
    `;

    document.getElementById('logout-btn')?.addEventListener('click', logout);
}

document.addEventListener('DOMContentLoaded', function() {
    const userMenu = document.querySelector('.user-menu');
    const dropdownContent = document.querySelector('.dropdown-content');
    let closeTimeout;
    
    userMenu.addEventListener('mouseenter', function() {
        clearTimeout(closeTimeout);
        dropdownContent.style.opacity = '1';
        dropdownContent.style.visibility = 'visible';
        dropdownContent.style.transform = 'translateY(0)';
    });
    
    userMenu.addEventListener('mouseleave', function() {
        closeTimeout = setTimeout(function() {
            dropdownContent.style.opacity = '0';
            dropdownContent.style.visibility = 'hidden';
            dropdownContent.style.transform = 'translateY(-10px)';
        }, 1000);
    });
    
    // Чтобы меню не закрывалось при наведении на него
    dropdownContent.addEventListener('mouseenter', function() {
        clearTimeout(closeTimeout);
    });
    
    dropdownContent.addEventListener('mouseleave', function() {
        closeTimeout = setTimeout(function() {
            dropdownContent.style.opacity = '0';
            dropdownContent.style.visibility = 'hidden';
            dropdownContent.style.transform = 'translateY(-10px)';
        }, 1000);
    });
});

// Выход из системы
async function logout() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        await fetch('/api/logout', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    } catch (error) {
        console.error('Ошибка при выходе:', error);
    }

    localStorage.removeItem('token');
    window.location.reload();
}

// Загрузка отзывов
async function loadReviews() {
    const container = document.getElementById('reviews-container');
    if (!container) return;

    try {
        const response = await fetch('/api/reviews');
        const reviews = await response.json();
        
        if (reviews.length === 0) {
            container.innerHTML = '<div class="no-reviews">Пока нет отзывов. Будьте первым!</div>';
            return;
        }
        
        container.innerHTML = reviews.slice(0, 3).map(review => `
            <div class="review-card">
                <div class="review-header">
                    <div class="user-avatar">${getInitials(review.name)}</div>
                    <div>
                        <div class="user-name">${review.name}</div>
                        <div class="review-date">${formatDate(review.createdAt)}</div>
                    </div>
                </div>
                <div class="review-text">${review.comment}</div>
                <div class="review-rating">${renderStars(review.rating)}</div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<div class="error-loading">Не удалось загрузить отзывы</div>';
    }
}

// Вспомогательные функции
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
}

function renderStars(rating) {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

// Анимация элементов в превью редактора
function animateEditorElements() {
    const elements = document.querySelectorAll('.element');
    
    // Функция для генерации случайных значений в пределах
    const getRandomValue = (min, max) => Math.random() * (max - min) + min;
    
    // Анимируем каждый элемент
    elements.forEach(el => {
        // Устанавливаем случайную задержку для каждого элемента
        el.style.animationDelay = `${getRandomValue(0, 5)}s`;
        
        // Периодически меняем параметры анимации
        setInterval(() => {
            const duration = getRandomValue(12, 20);
            el.style.animationDuration = `${duration}s`;
        }, 10000);
    });
}

// Запускаем анимацию после загрузки страницы
document.addEventListener('DOMContentLoaded', animateEditorElements);

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