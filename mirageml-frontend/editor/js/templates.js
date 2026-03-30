// Обработка шаблонов проектов

function initTemplatesSystem() {
    setupTemplatesButton();
    setupTemplatesModal();
}

function setupTemplatesButton() {
    const templatesBtn = document.getElementById('templates-btn');
    if (templatesBtn) {
        templatesBtn.addEventListener('click', showTemplatesModal);
    }
}

function setupTemplatesModal() {
    // Закрытие по крестику
    const closeBtn = document.querySelector('#templates-modal .close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('templates-modal').style.display = 'none';
        });
    }

    // Закрытие по клику вне модального окна
    const modal = document.getElementById('templates-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

function showTemplatesModal() {
    const modal = document.getElementById('templates-modal');
    if (!modal) return;

    renderTemplatesGrid();
    modal.style.display = 'flex';
}

function renderTemplatesGrid() {
    const grid = document.getElementById('templates-grid');
    if (!grid) return;

    if (!window.PROJECT_TEMPLATES || window.PROJECT_TEMPLATES.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fas fa-inbox" style="font-size: 48px; color: var(--gray); margin-bottom: 16px;"></i>
                <p style="color: var(--gray);">Шаблоны пока не добавлены</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = window.PROJECT_TEMPLATES.map(template => {
        const sectionsCount = template.sections ? template.sections.length : 0;
        const sectionNames = getSectionNames(template.sections);

        return `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-header">
                    <div class="template-icon">
                        ${template.preview || '📄'}
                    </div>
                    <div class="template-info">
                        <h3>${template.name}</h3>
                        <p>${template.description || ''}</p>
                    </div>
                </div>
                
                <div class="template-preview">
                    ${template.preview || '📄'}
                </div>
                
                <div class="template-sections">
                    ${sectionNames.map(name => `<span class="template-section">${name}</span>`).join('')}
                </div>
                
                <div style="font-size: 13px; color: var(--gray); margin-top: 8px;">
                    <i class="fas fa-layer-group"></i> ${sectionsCount} секций
                </div>
                
                <button class="template-btn" onclick="selectAndLoadTemplate('${template.id}')">
                    <i class="fas fa-check"></i> Использовать шаблон
                </button>
            </div>
        `;
    }).join('');
}

function getSectionNames(sectionIds) {
    if (!sectionIds || !window.SECTIONS_LIBRARY) return [];
    
    return sectionIds.map(id => {
        const section = window.SECTIONS_LIBRARY.find(s => s.id === id);
        if (section) {
            // Возвращаем короткое имя категории
            const categoryNames = {
                'header': 'Шапка',
                'hero': 'Hero',
                'cover': 'Обложка',
                'about': 'О проекте',
                'features': 'Преимущества',
                'testimonials': 'Отзывы',
                'cta': 'CTA',
                'contact': 'Контакты',
                'footer': 'Подвал',
                'pricing': 'Тарифы',
                'form': 'Форма',
                'team': 'Команда',
                'gallery': 'Галерея'
            };
            return categoryNames[section.category] || section.category;
        }
        return id;
    });
}

window.selectAndLoadTemplate = function(templateId) {
    const template = window.PROJECT_TEMPLATES.find(t => t.id === templateId);
    if (!template) {
        showToast('Шаблон не найден', 'error');
        return;
    }

    // Подтверждение если уже есть секции
    if (state.sections && state.sections.length > 0) {
        const confirmed = confirm('Текущие секции будут удалены. Продолжить?');
        if (!confirmed) return;
    }

    // Закрываем модальное окно
    document.getElementById('templates-modal').style.display = 'none';

    // Загружаем шаблон
    loadProjectTemplate(templateId);
};

// Инициализация при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTemplatesSystem);
} else {
    initTemplatesSystem();
}
