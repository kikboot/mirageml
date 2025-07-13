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