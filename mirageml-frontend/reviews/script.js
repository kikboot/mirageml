document.addEventListener('DOMContentLoaded', function() {
            // Загрузка отзывов
            loadReviews();
            
            // Обработка формы
            const reviewForm = document.getElementById('reviewForm');
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
        });
        
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
                        return;
                    }
                    
                    reviewsList.innerHTML = '';
                    
                    // Фильтруем только одобренные отзывы (если нужно)
                    const approvedReviews = reviews.filter(review => review.approved !== false);
                    
                    if (approvedReviews.length === 0) {
                        reviewsList.innerHTML = `
                            <div class="no-reviews">
                                <p>Отзывы на модерации. Скоро они появятся здесь.</p>
                            </div>
                        `;
                        return;
                    }
                    
                    approvedReviews.forEach(review => {
                        const reviewCard = createReviewCard(review);
                        reviewsList.appendChild(reviewCard);
                    });
                })
                .catch(error => {
                    console.error('Ошибка загрузки отзывов:', error);
                });
        }
        
        function createReviewCard(review) {
            const card = document.createElement('div');
            card.className = 'review-card';
            
            // Создаем звезды рейтинга
            let stars = '';
            for (let i = 0; i < 5; i++) {
                if (i < review.rating) {
                    stars += '<i class="fas fa-star"></i>';
                } else {
                    stars += '<i class="far fa-star"></i>';
                }
            }
            
            // Получаем инициалы для аватара
            const initials = review.name.split(' ').map(n => n[0]).join('').toUpperCase();
            
            // Форматируем дату
            const date = new Date(review.date);
            const formattedDate = date.toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            card.innerHTML = `
                <div class="review-header">
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
                <div class="review-date">
                    ${formattedDate}
                </div>
            `;
            
            return card;
        }
        
        function submitReview(reviewData) {
            fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reviewData)
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