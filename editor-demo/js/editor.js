// MirageML Editor Pro - Full Featured Visual Editor
let state = {
    sections: [],
    selectedSection: null,
    selectedElement: null,
    zoom: 1,
    history: [],
    historyIndex: -1,
    clipboard: null,
    dragState: { isResizing: false, isRotating: false, direction: null },
    imageUpload: { file: null, url: null },
    settings: { showGrid: true, showGuides: false, snapToGrid: true }
};

let DOM = {};

function init() {
    initDOM();
    initTabs();
    renderSectionsLibrary('all');
    setupEventListeners();
    setupDragAndDrop();
    setupKeyboardShortcuts();
    setupImageUpload();
    setupToolbar();
    setupCanvasInteractions();
    renderRulers();
    
    console.log('✅ MirageML Editor Pro initialized');
    updateStatus('Готов к работе');
}

function initDOM() {
    DOM.canvas = document.getElementById('canvas');
    DOM.canvasPlaceholder = document.getElementById('canvas-placeholder');
    DOM.canvasWrapper = document.getElementById('canvas-wrapper');
    DOM.sectionsLibrary = document.getElementById('sections-library');
    DOM.propertiesContent = document.getElementById('properties-content');
    DOM.sectionSearch = document.getElementById('section-search');
    DOM.categoriesFilter = document.getElementById('categories-filter');
    DOM.zoomLevel = document.getElementById('zoom-level');
    DOM.floatingToolbar = document.getElementById('floating-toolbar');
    DOM.guidesOverlay = document.getElementById('guides-overlay');
    DOM.statusMessage = document.getElementById('status-message');
    DOM.cursorPosition = document.getElementById('cursor-position');
    DOM.elementsCount = document.getElementById('elements-count');
    
    DOM.modals = {
        export: document.getElementById('export-modal'),
        preview: document.getElementById('preview-modal'),
        help: document.getElementById('help-modal'),
        imageUpload: document.getElementById('image-upload-modal'),
        addElement: document.getElementById('add-element-modal')
    };
}

function initTabs() {
    document.querySelectorAll('.sidebar-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
        });
    });
}

function renderSectionsLibrary(category) {
    if (!DOM.sectionsLibrary) return;
    
    DOM.sectionsLibrary.innerHTML = '';
    const filtered = category === 'all' 
        ? SECTIONS_LIBRARY 
        : SECTIONS_LIBRARY.filter(s => s.category === category);
    
    filtered.forEach(section => {
        const card = document.createElement('div');
        card.className = 'section-card';
        card.draggable = true;
        card.dataset.sectionId = section.id;
        card.innerHTML = `
            <div class="section-preview">
                <i class="fas ${section.icon}"></i>
            </div>
            <div class="section-info">
                <h4>${section.name}</h4>
                <p>${section.category}</p>
            </div>
        `;
        card.addEventListener('click', () => addSectionToCanvas(section));
        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', section.id);
            e.dataTransfer.effectAllowed = 'copy';
        });
        DOM.sectionsLibrary.appendChild(card);
    });
    
    updateStatus(`Загружено ${filtered.length} секций`);
}

function addSectionToCanvas(sectionData, isImage = false, imageData = null) {
    const sectionId = `section-${Date.now()}`;
    if (DOM.canvasPlaceholder) DOM.canvasPlaceholder.style.display = 'none';
    
    const sectionContainer = document.createElement('div');
    sectionContainer.className = 'canvas-section';
    sectionContainer.id = sectionId;
    
    if (isImage && imageData) {
        sectionContainer.innerHTML = `<img src="${imageData.url}" alt="${imageData.alt}" style="width: ${imageData.width}px; display: block;">`;
    } else {
        sectionContainer.innerHTML = sectionData.html;
    }
    
    // Resize handles
    ['nw','n','ne','e','se','s','sw','w'].forEach(dir => {
        const handle = document.createElement('div');
        handle.className = `resize-handle ${dir}`;
        handle.dataset.direction = dir;
        sectionContainer.appendChild(handle);
    });
    
    // Rotate handle & line
    const rotateHandle = document.createElement('div');
    rotateHandle.className = 'rotate-handle';
    rotateHandle.innerHTML = '<i class="fas fa-sync-alt"></i>';
    sectionContainer.appendChild(rotateHandle);
    
    const rotateLine = document.createElement('div');
    rotateLine.className = 'rotate-line';
    sectionContainer.appendChild(rotateLine);
    
    // Controls
    const controls = document.createElement('div');
    controls.className = 'section-controls';
    controls.innerHTML = `
        <button onclick="duplicateSelected('${sectionId}')" title="Дублировать"><i class="fas fa-copy"></i></button>
        <button onclick="moveSectionUp('${sectionId}')" title="Вверх"><i class="fas fa-arrow-up"></i></button>
        <button onclick="moveSectionDown('${sectionId}')" title="Вниз"><i class="fas fa-arrow-down"></i></button>
        <button onclick="showAddElementModal('${sectionId}')" title="Добавить элемент"><i class="fas fa-plus"></i></button>
        <button onclick="deleteSelected('${sectionId}')" title="Удалить"><i class="fas fa-trash"></i></button>
    `;
    sectionContainer.appendChild(controls);
    
    DOM.canvas.appendChild(sectionContainer);
    
    state.sections.push({
        id: sectionId,
        sectionId: sectionData.id,
        name: isImage ? 'Изображение' : sectionData.name,
        element: sectionContainer,
        html: sectionData.html,
        css: sectionData.css || '',
        isImage: isImage || false,
        imageData: imageData || null,
        rotation: 0,
        elements: []
    });
    
    parseSectionElements(state.sections[state.sections.length - 1]);
    saveToHistory();
    selectSection(sectionId);
    updateElementsCount();
    showToast('Секция добавлена', 'success');
}

function parseSectionElements(section) {
    section.elements = [];
    const elements = section.element.querySelectorAll('h1, h2, h3, h4, p, button, img, a, div, span, hr');
    elements.forEach((el, index) => {
        if (!el.closest('.section-controls') && !el.closest('.resize-handle') && !el.closest('.rotate-handle')) {
            section.elements.push({
                id: `el-${index}-${Date.now()}`,
                tag: el.tagName.toLowerCase(),
                element: el,
                name: getElementName(el)
            });
        }
    });
}

function getElementName(el) {
    const tag = el.tagName.toLowerCase();
    if (['h1','h2','h3','h4'].includes(tag)) return `Заголовок ${tag.toUpperCase()}`;
    if (tag === 'p') return 'Текст';
    if (tag === 'button') return 'Кнопка';
    if (tag === 'img') return 'Изображение';
    if (tag === 'a') return 'Ссылка';
    if (tag === 'hr') return 'Линия';
    return el.textContent?.trim().substring(0, 15) || 'Блок';
}

function selectSection(sectionId) {
    document.querySelectorAll('.canvas-section').forEach(el => el.classList.remove('selected'));
    
    const section = state.sections.find(s => s.id === sectionId);
    if (section) {
        section.element.classList.add('selected');
        state.selectedSection = section;
        state.selectedElement = null;
        
        renderSectionProperties(section);
        showFloatingToolbar();
        updateStatus(`Выбрана секция: ${section.name}`);
        updateSectionCounter();
        updateMinimap();
    }
}

function selectElement(sectionId, elementId) {
    const section = state.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const element = section.elements.find(el => el.id === elementId);
    if (!element) return;
    
    state.selectedElement = element;
    state.selectedSection = section; // Запоминаем секцию для фона
    
    // Подсвечиваем элемент
    highlightElement(element.element);
    // Рендерим свойства элемента
    renderElementProperties(element);
    // Показываем toolbar
    showFloatingToolbar();
    
    updateStatus(`Выбран элемент: ${element.name}`);
    updateSectionCounter();
    updateMinimap();
}

function highlightElement(el) {
    // Снимаем выделение со всех элементов
    document.querySelectorAll('.canvas-element-highlight').forEach(e => {
        e.classList.remove('canvas-element-highlight');
        e.style.outline = '';
    });
    
    // Выделяем текущий
    el.classList.add('canvas-element-highlight');
    el.style.outline = '2px dashed var(--primary)';
    el.style.outlineOffset = '2px';
    el.style.position = 'relative';
    el.style.zIndex = '1000';
}

// Функция для обновления значений в панели свойств
function updatePropertiesPanel() {
    if (state.selectedSection && !state.selectedElement) {
        renderSectionProperties(state.selectedSection);
    } else if (state.selectedElement) {
        renderElementProperties(state.selectedElement);
    }
}

function renderSectionProperties(section) {
    if (!DOM.propertiesContent) return;
    
    // Определяем текущий тип фона
    const bgStyle = section.element.style.background || '';
    let bgType = 'color';
    if (bgStyle.includes('gradient')) bgType = 'gradient';
    if (bgStyle.includes('url(')) bgType = 'image';
    
    // Получаем текущий цвет фона
    const currentBgColor = getBgColorHex(bgStyle);
    const currentOpacity = getOpacityFromColor(bgStyle);
    
    DOM.propertiesContent.innerHTML = `
        <div class="property-group">
            <h4><i class="fas fa-list"></i> Элементы секции</h4>
            ${section.elements.length > 0 ? section.elements.map(el => `
                <div class="element-item" data-element-id="${el.id}" onclick="selectElement('${section.id}', '${el.id}')" style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(255,255,255,0.03);border:1px solid var(--glass-border);border-radius:8px;margin-bottom:8px;cursor:pointer;">
                    <i class="fas fa-${getElementIcon(el.tag)}" style="color:var(--primary);"></i>
                    <span style="flex:1;font-size:13px;color:var(--light);">${el.name}</span>
                    <span style="font-size:11px;color:var(--primary);background:rgba(99,102,241,0.2);padding:2px 6px;border-radius:4px;">${el.tag}</span>
                </div>
            `).join('') : '<p style="padding:0 20px;color:var(--gray);">Нет элементов</p>'}
            <button class="btn btn-ghost" onclick="showAddElementModal('${section.id}')" style="width:calc(100% - 40px);margin:12px 20px;">
                <i class="fas fa-plus"></i> Добавить элемент
            </button>
        </div>
        
        <div class="property-group">
            <h4><i class="fas fa-cog"></i> Основные</h4>
            <div class="property-item">
                <label><i class="fas fa-tag"></i> Название</label>
                <input type="text" id="prop-name" value="${section.name}" onchange="updateSectionName(this.value)">
            </div>
        </div>
        
        <div class="property-group">
            <h4><i class="fas fa-expand"></i> Размер</h4>
            <div class="property-row">
                <div class="property-item">
                    <label>Ширина (px)</label>
                    <input type="number" id="prop-width" value="${Math.round(section.element.getBoundingClientRect().width)}" onchange="updateSectionSize(this.value, document.getElementById('prop-height').value)">
                </div>
                <div class="property-item">
                    <label>Высота (px)</label>
                    <input type="number" id="prop-height" value="${Math.round(section.element.getBoundingClientRect().height)}" onchange="updateSectionSize(document.getElementById('prop-width').value, this.value)">
                </div>
            </div>
        </div>
        
        <div class="property-group">
            <h4><i class="fas fa-sync-alt"></i> Поворот</h4>
            <div class="property-item">
                <label>Угол (°)</label>
                <input type="number" id="prop-rotation" value="${section.rotation || 0}" min="0" max="360" onchange="updateSectionRotation(this.value)">
            </div>
        </div>
        
        <div class="property-group">
            <h4><i class="fas fa-arrows-alt"></i> Отступы</h4>
            <div class="property-row">
                <div class="property-item">
                    <label>Сверху</label>
                    <input type="number" id="prop-padding-top" value="${parseInt(getComputedStyle(section.element).paddingTop) || 0}" onchange="updateSectionPadding('top', this.value)">
                </div>
                <div class="property-item">
                    <label>Снизу</label>
                    <input type="number" id="prop-padding-bottom" value="${parseInt(getComputedStyle(section.element).paddingBottom) || 0}" onchange="updateSectionPadding('bottom', this.value)">
                </div>
            </div>
        </div>
        
        <div class="property-group">
            <h4><i class="fas fa-fill-drip"></i> Фон (Figma)</h4>
            
            <!-- Вкладки типа фона -->
            <div class="bg-tabs" style="display:flex;gap:4px;margin-bottom:12px;">
                <button class="bg-tab ${bgType==='color'?'active':''}" onclick="switchBgTab('color')" style="flex:1;padding:8px;background:${bgType==='color'?'rgba(99,102,241,0.2)':'rgba(255,255,255,0.05)'};border:1px solid ${bgType==='color'?'var(--primary)':'var(--glass-border)'};border-radius:6px;color:var(--light);cursor:pointer;">
                    <i class="fas fa-circle"></i> Цвет
                </button>
                <button class="bg-tab ${bgType==='gradient'?'active':''}" onclick="switchBgTab('gradient')" style="flex:1;padding:8px;background:${bgType==='gradient'?'rgba(99,102,241,0.2)':'rgba(255,255,255,0.05)'};border:1px solid ${bgType==='gradient'?'var(--primary)':'var(--glass-border)'};border-radius:6px;color:var(--light);cursor:pointer;">
                    <i class="fas fa-random"></i> Градиент
                </button>
                <button class="bg-tab ${bgType==='image'?'active':''}" onclick="switchBgTab('image')" style="flex:1;padding:8px;background:${bgType==='image'?'rgba(99,102,241,0.2)':'rgba(255,255,255,0.05)'};border:1px solid ${bgType==='image'?'var(--primary)':'var(--glass-border)'};border-radius:6px;color:var(--light);cursor:pointer;">
                    <i class="fas fa-image"></i> Фото
                </button>
            </div>
            
            <!-- Цвет -->
            <div id="bg-color-panel" style="display:${bgType==='color'?'block':'none'}">
                <div class="property-item">
                    <label><i class="fas fa-circle"></i> Цвет фона</label>
                    <div class="color-picker-wrapper">
                        <input type="color" id="prop-bg-color" value="${currentBgColor}" oninput="updateSectionBgColor(this.value)">
                        <input type="text" id="prop-bg-color-text" value="${currentBgColor}" onchange="updateSectionBgColor(this.value)" style="flex:1;">
                    </div>
                </div>
                <div class="property-item">
                    <label><i class="fas fa-tint"></i> Прозрачность</label>
                    <div class="range-wrapper">
                        <input type="range" id="bg-opacity" min="0" max="100" value="${currentOpacity}" oninput="updateBgOpacity(this.value)">
                        <span class="range-value" id="bg-opacity-value">${currentOpacity}%</span>
                    </div>
                </div>
            </div>
            
            <!-- Градиент -->
            <div id="bg-gradient-panel" style="display:${bgType==='gradient'?'block':'none'}">
                <div class="property-item">
                    <label><i class="fas fa-random"></i> Тип градиента</label>
                    <select id="gradient-type" onchange="updateGradient()" style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid var(--glass-border);border-radius:8px;color:var(--light);">
                        <option value="linear">Линейный (Linear)</option>
                        <option value="radial">Радиальный (Radial)</option>
                        <option value="conic">Конический (Conic)</option>
                    </select>
                </div>
                <div class="property-item" id="gradient-angle-container">
                    <label><i class="fas fa-compass"></i> Угол</label>
                    <div class="range-wrapper">
                        <input type="range" id="gradient-angle" min="0" max="360" value="90" oninput="updateGradient()">
                        <span class="range-value" id="gradient-angle-value">90°</span>
                    </div>
                </div>
                <div class="property-item">
                    <label><i class="fas fa-circle"></i> Цвет 1 (начало)</label>
                    <div class="color-picker-wrapper">
                        <input type="color" id="gradient-color-1" value="#6366f1" oninput="updateGradient()">
                        <input type="text" id="gradient-color-1-text" value="#6366f1" onchange="updateGradient()" style="flex:1;">
                    </div>
                </div>
                <div class="property-item">
                    <label><i class="fas fa-circle"></i> Цвет 2 (конец)</label>
                    <div class="color-picker-wrapper">
                        <input type="color" id="gradient-color-2" value="#a855f7" oninput="updateGradient()">
                        <input type="text" id="gradient-color-2-text" value="#a855f7" onchange="updateGradient()" style="flex:1;">
                    </div>
                </div>
                <div class="property-item">
                    <button class="btn btn-ghost" onclick="addGradientStop()" style="width:100%;">
                        <i class="fas fa-plus"></i> Добавить цвет
                    </button>
                </div>
            </div>
            
            <!-- Изображение -->
            <div id="bg-image-panel" style="display:${bgType==='image'?'block':'none'}">
                <div class="property-item">
                    <label><i class="fas fa-image"></i> URL изображения</label>
                    <input type="text" id="bg-image-url" placeholder="https://..." value="${getBgImageUrl(section.element.style.background)}" onchange="updateBgImage(this.value)" style="width:100%;">
                </div>
                <div class="property-item">
                    <button class="btn btn-ghost" onclick="setBgImage('Проблема.png')" style="width:100%;margin-bottom:8px;">
                        <i class="fas fa-image"></i> Использовать фото "Проблема.png"
                    </button>
                    <button class="btn btn-ghost" onclick="setBgImage('https://source.unsplash.com/random/1920x1080')" style="width:100%;">
                        <i class="fas fa-globe"></i> Случайное фото (Unsplash)
                    </button>
                </div>
                <div class="property-item">
                    <label><i class="fas fa-expand"></i> Размер</label>
                    <select id="bg-size" onchange="updateBgSize(this.value)" style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid var(--glass-border);border-radius:8px;color:var(--light);">
                        <option value="cover">Cover (заполнить)</option>
                        <option value="contain">Contain (вместить)</option>
                        <option value="auto">Auto (100%)</option>
                        <option value="repeat">Repeat (повтор)</option>
                    </select>
                </div>
                <div class="property-item">
                    <label><i class="fas fa-arrows-alt"></i> Позиция</label>
                    <select id="bg-position" onchange="updateBgPosition(this.value)" style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid var(--glass-border);border-radius:8px;color:var(--light);">
                        <option value="center">Центр</option>
                        <option value="top">Верх</option>
                        <option value="bottom">Низ</option>
                        <option value="left">Лево</option>
                        <option value="right">Право</option>
                        <option value="top left">Верх-Лево</option>
                        <option value="top right">Верх-Право</option>
                        <option value="bottom left">Низ-Лево</option>
                        <option value="bottom right">Низ-Право</option>
                    </select>
                </div>
                <div class="property-item">
                    <label><i class="fas fa-tint"></i> Прозрачность</label>
                    <div class="range-wrapper">
                        <input type="range" id="bg-image-opacity" min="0" max="100" value="100" oninput="updateBgImageOpacity(this.value)">
                        <span class="range-value" id="bg-image-opacity-value">100%</span>
                    </div>
                </div>
                <div class="property-item">
                    <label><i class="fas fa-circle"></i> Overlay (цвет поверх)</label>
                    <div class="color-picker-wrapper">
                        <input type="color" id="bg-overlay-color" value="#000000" oninput="updateBgOverlay()">
                        <input type="text" id="bg-overlay-color-text" value="#000000" onchange="updateBgOverlay()" style="flex:1;">
                    </div>
                </div>
                <div class="property-item">
                    <label>Прозрачность overlay</label>
                    <div class="range-wrapper">
                        <input type="range" id="bg-overlay-opacity" min="0" max="100" value="50" oninput="updateBgOverlay()">
                        <span class="range-value" id="bg-overlay-opacity-value">50%</span>
                    </div>
                </div>
            </div>
            
            <!-- Эффекты -->
            <div class="property-item" style="margin-top:16px;padding-top:16px;border-top:1px solid var(--glass-border);">
                <label><i class="fas fa-magic"></i> Размытие фона (blur)</label>
                <div class="range-wrapper">
                    <input type="range" id="bg-blur" min="0" max="20" value="0" oninput="updateBgBlur(this.value)">
                    <span class="range-value" id="bg-blur-value">0px</span>
                </div>
            </div>
            <div class="property-item">
                <label><i class="fas fa-adjust"></i> Яркость</label>
                <div class="range-wrapper">
                    <input type="range" id="bg-brightness" min="0" max="200" value="100" oninput="updateBgFilter()">
                    <span class="range-value" id="bg-brightness-value">100%</span>
                </div>
            </div>
            <div class="property-item">
                <label><i class="fas fa-circle-half-stroke"></i> Контраст</label>
                <div class="range-wrapper">
                    <input type="range" id="bg-contrast" min="0" max="200" value="100" oninput="updateBgFilter()">
                    <span class="range-value" id="bg-contrast-value">100%</span>
                </div>
            </div>
            <div class="property-item">
                <label><i class="fas fa-palette"></i> Насыщенность</label>
                <div class="range-wrapper">
                    <input type="range" id="bg-saturate" min="0" max="200" value="100" oninput="updateBgFilter()">
                    <span class="range-value" id="bg-saturate-value">100%</span>
                </div>
            </div>
        </div>
        
        <div class="property-group">
            <h4><i class="fas fa-check"></i> Действия</h4>
            <button class="btn btn-primary" onclick="saveToHistory(); showToast('Изменения сохранены', 'success')" style="width:calc(100% - 40px);margin:0 20px 12px;">
                <i class="fas fa-save"></i> Сохранить изменения
            </button>
        </div>
    `;
    
    setupColorPicker('prop-bg-color', 'prop-bg-color-text');
}

// Переключение вкладок фона
window.switchBgTab = function(type) {
    if (!state.selectedSection) return;
    
    document.querySelectorAll('.bg-tab').forEach(tab => {
        tab.style.background = 'rgba(255,255,255,0.05)';
        tab.style.borderColor = 'var(--glass-border)';
    });
    event.target.closest('.bg-tab').style.background = 'rgba(99,102,241,0.2)';
    event.target.closest('.bg-tab').style.borderColor = 'var(--primary)';
    
    document.getElementById('bg-color-panel').style.display = type === 'color' ? 'block' : 'none';
    document.getElementById('bg-gradient-panel').style.display = type === 'gradient' ? 'block' : 'none';
    document.getElementById('bg-image-panel').style.display = type === 'image' ? 'block' : 'none';
    
    // Сохраняем текущий фон при переключении
    if (type === 'gradient' && !state.selectedSection.element.style.background.includes('gradient')) {
        updateGradient();
    }
    if (type === 'image' && !state.selectedSection.element.style.backgroundImage) {
        const input = document.getElementById('bg-image-url');
        if (input && input.value) {
            updateBgImage(input.value);
        }
    }
};

// Обновление градиента
window.updateGradient = function() {
    if (!state.selectedSection) return;
    
    const type = document.getElementById('gradient-type')?.value || 'linear';
    const angle = document.getElementById('gradient-angle')?.value || 90;
    const color1 = document.getElementById('gradient-color-1')?.value || '#6366f1';
    const color2 = document.getElementById('gradient-color-2')?.value || '#a855f7';
    
    let gradient;
    if (type === 'linear') {
        gradient = `linear-gradient(${angle}deg, ${color1}, ${color2})`;
        document.getElementById('gradient-angle-container').style.display = 'block';
    } else if (type === 'radial') {
        gradient = `radial-gradient(circle, ${color1}, ${color2})`;
        document.getElementById('gradient-angle-container').style.display = 'none';
    } else if (type === 'conic') {
        gradient = `conic-gradient(from ${angle}deg, ${color1}, ${color2})`;
        document.getElementById('gradient-angle-container').style.display = 'block';
    }
    
    state.selectedSection.element.style.background = gradient;
    
    // Обновляем значения
    document.getElementById('gradient-angle-value').textContent = `${angle}°`;
};

// Добавление стопа градиента
window.addGradientStop = function() {
    showToast('Функция в разработке', 'info');
};

// Обновление фона - цвет
window.updateSectionBgColor = function(value) {
    if (state.selectedSection) {
        // Получаем текущую прозрачность
        const opacity = document.getElementById('bg-opacity')?.value || 100;
        const hex = value.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        // Применяем цвет с прозрачностью
        state.selectedSection.element.style.background = `rgba(${r}, ${g}, ${b}, ${opacity/100})`;
        
        const colorInput = document.getElementById('prop-bg-color');
        const colorText = document.getElementById('prop-bg-color-text');
        if (colorInput && colorText) {
            if (colorInput.value !== value) colorInput.value = value;
            if (colorText.value !== value) colorText.value = value;
        }
    }
};

// Прозрачность цвета
window.updateBgOpacity = function(value) {
    if (state.selectedSection) {
        document.getElementById('bg-opacity-value').textContent = `${value}%`;
        const colorInput = document.getElementById('prop-bg-color');
        if (colorInput) {
            const hex = colorInput.value.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            state.selectedSection.element.style.background = `rgba(${r}, ${g}, ${b}, ${value/100})`;
        }
    }
};

// Получение прозрачности из цвета
function getOpacityFromColor(color) {
    if (!color) return 100;
    if (color.includes('rgba')) {
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
        return match && match[4] ? Math.round(parseFloat(match[4]) * 100) : 100;
    }
    return 100;
}

// Получение HEX из background
function getBgColorHex(bgStyle) {
    if (!bgStyle) return '#ffffff';
    if (bgStyle.startsWith('#')) return bgStyle;
    if (bgStyle.includes('rgba')) {
        const match = bgStyle.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
            const r = parseInt(match[1]).toString(16).padStart(2, '0');
            const g = parseInt(match[2]).toString(16).padStart(2, '0');
            const b = parseInt(match[3]).toString(16).padStart(2, '0');
            return `#${r}${g}${b}`;
        }
    }
    return '#ffffff';
}

// Получение URL изображения из background
function getBgImageUrl(bgStyle) {
    if (!bgStyle) return '';
    const match = bgStyle.match(/url\(['"]?(.*?)['"]?\)/);
    return match ? match[1] : '';
}

// Быстрая установка фона
window.setBgImage = function(url) {
    if (!state.selectedSection) {
        showToast('Выберите секцию', 'error');
        return;
    }
    
    const input = document.getElementById('bg-image-url');
    if (input) {
        input.value = url;
        updateBgImage(url);
        showToast('Фон установлен', 'success');
    }
};

// Обновление фона - изображение
window.updateBgImage = function(url) {
    if (!state.selectedSection) return;
    
    const size = document.getElementById('bg-size')?.value || 'cover';
    const position = document.getElementById('bg-position')?.value || 'center';
    
    if (url) {
        state.selectedSection.element.style.background = `url(${url}) ${size} ${position} no-repeat`;
    } else {
        state.selectedSection.element.style.background = '';
    }
};

// Размер фона
window.updateBgSize = function(value) {
    if (state.selectedSection) {
        state.selectedSection.element.style.backgroundSize = value;
        state.selectedSection.element.style.backgroundRepeat = value === 'repeat' ? 'repeat' : 'no-repeat';
    }
};

// Позиция фона
window.updateBgPosition = function(value) {
    if (state.selectedSection) {
        state.selectedSection.element.style.backgroundPosition = value;
    }
};

// Прозрачность изображения
window.updateBgImageOpacity = function(value) {
    if (state.selectedSection) {
        document.getElementById('bg-image-opacity-value').textContent = `${value}%`;
        state.selectedSection.element.style.opacity = value / 100;
    }
};

// Overlay
window.updateBgOverlay = function() {
    if (!state.selectedSection) return;
    
    const color = document.getElementById('bg-overlay-color')?.value || '#000000';
    const opacity = document.getElementById('bg-overlay-opacity')?.value || 50;
    
    document.getElementById('bg-overlay-opacity-value').textContent = `${opacity}%`;
    
    const url = getBgImageUrl(state.selectedSection.element.style.background);
    if (url) {
        state.selectedSection.element.style.background = `linear-gradient(rgba(0,0,0,${opacity/100}), rgba(0,0,0,${opacity/100})), url(${url})`;
        state.selectedSection.element.style.backgroundSize = 'cover';
        state.selectedSection.element.style.backgroundPosition = 'center';
    }
};

// Размытие
window.updateBgBlur = function(value) {
    if (state.selectedSection) {
        document.getElementById('bg-blur-value').textContent = `${value}px`;
        applyBgFilters();
    }
};

// Фильтры
window.updateBgFilter = function() {
    if (state.selectedSection) {
        const brightness = document.getElementById('bg-brightness')?.value || 100;
        const contrast = document.getElementById('bg-contrast')?.value || 100;
        const saturate = document.getElementById('bg-saturate')?.value || 100;
        
        document.getElementById('bg-brightness-value').textContent = `${brightness}%`;
        document.getElementById('bg-contrast-value').textContent = `${contrast}%`;
        document.getElementById('bg-saturate-value').textContent = `${saturate}%`;
        
        applyBgFilters();
    }
};

// Применение фильтров
function applyBgFilters() {
    if (!state.selectedSection) return;
    
    const blur = document.getElementById('bg-blur')?.value || 0;
    const brightness = document.getElementById('bg-brightness')?.value || 100;
    const contrast = document.getElementById('bg-contrast')?.value || 100;
    const saturate = document.getElementById('bg-saturate')?.value || 100;
    
    state.selectedSection.element.style.filter = `blur(${blur}px) brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`;
}

function renderElementProperties(element) {
    if (!DOM.propertiesContent) return;

    const el = element.element;
    const computedStyle = window.getComputedStyle(el);
    const tag = element.tag;
    
    // Получаем текущие цвета
    const currentColor = rgbToHex(computedStyle.color);
    const currentBgColor = rgbToHex(computedStyle.backgroundColor);

    DOM.propertiesContent.innerHTML = `
        <div class="property-group">
            <h4><i class="fas fa-edit"></i> ${tag.toUpperCase()}</h4>
            <div class="property-item">
                <label><i class="fas fa-tag"></i> Название</label>
                <input type="text" id="el-name" value="${element.name}" onchange="updateElementName(this.value)">
            </div>
            ${tag !== 'img' && tag !== 'hr' ? `
            <div class="property-item">
                <label><i class="fas fa-font"></i> Текст</label>
                <textarea id="el-text" rows="3" oninput="updateElementText(this.value)">${el.textContent || ''}</textarea>
            </div>
            ` : ''}
            ${tag === 'img' ? `
            <div class="property-item">
                <label><i class="fas fa-image"></i> URL</label>
                <input type="text" id="el-src" value="${el.src || ''}" onchange="updateElementSrc(this.value)">
            </div>
            ` : ''}
        </div>

        <div class="property-group">
            <h4><i class="fas fa-fill-drip"></i> Цвета элемента</h4>
            <div class="property-item">
                <label><i class="fas fa-circle"></i> Цвет текста</label>
                <div class="color-picker-wrapper">
                    <input type="color" id="el-color" value="${currentColor}" oninput="updateElementColor(this.value)">
                    <input type="text" id="el-color-text" value="${currentColor}" onchange="updateElementColor(this.value)" style="flex:1;">
                </div>
            </div>
            <div class="property-item">
                <label><i class="fas fa-circle"></i> Цвет фона</label>
                <div class="color-picker-wrapper">
                    <input type="color" id="el-bg-color" value="${currentBgColor}" oninput="updateElementBgColor(this.value)">
                    <input type="text" id="el-bg-color-text" value="${currentBgColor}" onchange="updateElementBgColor(this.value)" style="flex:1;">
                </div>
            </div>
        </div>

        <div class="property-group">
            <h4><i class="fas fa-text-height"></i> Шрифт</h4>
            <div class="property-row">
                <div class="property-item">
                    <label>Размер</label>
                    <input type="text" id="el-font-size" value="${computedStyle.fontSize}" onchange="updateElementStyle('fontSize', this.value)">
                </div>
                <div class="property-item">
                    <label>Вес</label>
                    <select id="el-font-weight" onchange="updateElementStyle('fontWeight', this.value)">
                        <option value="400" ${computedStyle.fontWeight == '400' ? 'selected' : ''}>Normal</option>
                        <option value="600" ${computedStyle.fontWeight == '600' ? 'selected' : ''}>SemiBold</option>
                        <option value="700" ${computedStyle.fontWeight == '700' ? 'selected' : ''}>Bold</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="property-group">
            <h4><i class="fas fa-expand"></i> Размер и отступы</h4>
            <div class="property-row">
                <div class="property-item">
                    <label>Ширина</label>
                    <input type="text" id="el-width" value="${el.style.width || 'auto'}" onchange="updateElementStyle('width', this.value)">
                </div>
                <div class="property-item">
                    <label>Высота</label>
                    <input type="text" id="el-height" value="${el.style.height || 'auto'}" onchange="updateElementStyle('height', this.value)">
                </div>
            </div>
            <div class="property-row">
                <div class="property-item">
                    <label>Padding</label>
                    <input type="text" id="el-padding" value="${el.style.padding || ''}" onchange="updateElementStyle('padding', this.value)" placeholder="10px">
                </div>
                <div class="property-item">
                    <label>Margin</label>
                    <input type="text" id="el-margin" value="${el.style.margin || ''}" onchange="updateElementStyle('margin', this.value)" placeholder="10px">
                </div>
            </div>
            <div class="property-item">
                <label>Border Radius</label>
                <input type="text" id="el-border-radius" value="${el.style.borderRadius || ''}" onchange="updateElementStyle('borderRadius', this.value)" placeholder="8px">
            </div>
        </div>

        <div class="property-group">
            <h4><i class="fas fa-check"></i> Действия</h4>
            <button class="btn btn-primary" onclick="saveToHistory(); showToast('Изменения сохранены', 'success')" style="width:calc(100% - 40px);margin:0 20px 12px;">
                <i class="fas fa-save"></i> Сохранить изменения
            </button>
            <button class="btn btn-outline" onclick="deleteElement('${state.selectedSection.id}', '${element.id}')" style="width:calc(100% - 40px);margin:0 20px;">
                <i class="fas fa-trash"></i> Удалить элемент
            </button>
        </div>
    `;

    setupColorPicker('el-color', 'el-color-text');
    setupColorPicker('el-bg-color', 'el-bg-color-text');
}

// Live обновление свойств элемента
window.updateElementName = function(value) {
    if (state.selectedElement) {
        state.selectedElement.name = value;
    }
};

window.updateElementText = function(value) {
    if (state.selectedElement) {
        state.selectedElement.element.textContent = value;
    }
};

window.updateElementSrc = function(value) {
    if (state.selectedElement && state.selectedElement.tag === 'img') {
        state.selectedElement.element.src = value;
    }
};

window.updateElementStyle = function(property, value) {
    if (state.selectedElement) {
        state.selectedElement.element.style[property] = value;
    }
};

window.updateElementColor = function(value) {
    if (state.selectedElement) {
        state.selectedElement.element.style.color = value;
        const colorInput = document.getElementById('el-color');
        const colorText = document.getElementById('el-color-text');
        if (colorInput && colorText) {
            if (colorInput.value !== value) colorInput.value = value;
            if (colorText.value !== value) colorText.value = value;
        }
    }
};

window.updateElementBgColor = function(value) {
    if (state.selectedElement) {
        state.selectedElement.element.style.backgroundColor = value;
        const bgInput = document.getElementById('el-bg-color');
        const bgText = document.getElementById('el-bg-color-text');
        if (bgInput && bgText) {
            if (bgInput.value !== value) bgInput.value = value;
            if (bgText.value !== value) bgText.value = value;
        }
    }
};

function setupColorPicker(colorId, textId) {
    const colorInput = document.getElementById(colorId);
    const colorText = document.getElementById(textId);
    if (colorInput && colorText) {
        colorInput.addEventListener('input', () => colorText.value = colorInput.value);
        colorText.addEventListener('input', () => {
            if (/^#[0-9A-Fa-f]{6}$/.test(colorText.value)) colorInput.value = colorText.value;
        });
    }
}

function getElementIcon(tag) {
    const icons = { h1:'fa-heading', h2:'fa-heading', h3:'fa-heading', p:'fa-paragraph', button:'fa-square', img:'fa-image', a:'fa-link', div:'fa-square', hr:'fa-minus' };
    return icons[tag] || 'fa-square';
}

// Live обновление свойств секции
window.updateSectionName = function(value) {
    if (state.selectedSection) {
        state.selectedSection.name = value;
        updateElementsCount();
    }
};

window.updateSectionSize = function(width, height) {
    if (state.selectedSection) {
        state.selectedSection.element.style.width = `${width}px`;
        state.selectedSection.element.style.height = `${height}px`;
    }
};

window.updateSectionRotation = function(value) {
    if (state.selectedSection) {
        state.selectedSection.element.style.transform = `rotate(${value}deg)`;
        state.selectedSection.rotation = parseInt(value);
    }
};

window.updateSectionPadding = function(side, value) {
    if (state.selectedSection) {
        if (side === 'top') state.selectedSection.element.style.paddingTop = `${value}px`;
        if (side === 'bottom') state.selectedSection.element.style.paddingBottom = `${value}px`;
    }
};

window.updateSectionBgColor = function(value) {
    if (state.selectedSection) {
        state.selectedSection.element.style.backgroundColor = value;
        // Синхронизируем color picker и text input
        const colorInput = document.getElementById('prop-bg-color');
        const colorText = document.getElementById('prop-bg-color-text');
        if (colorInput && colorText) {
            if (colorInput.value !== value) colorInput.value = value;
            if (colorText.value !== value) colorText.value = value;
        }
    }
};

window.applySectionProperties = function() {
    if (!state.selectedSection) return;
    const section = state.selectedSection.element;
    
    const width = document.getElementById('prop-width')?.value;
    const height = document.getElementById('prop-height')?.value;
    if (width) section.style.width = `${width}px`;
    if (height) section.style.height = `${height}px`;
    
    const rotation = document.getElementById('prop-rotation')?.value || 0;
    section.style.transform = `rotate(${rotation}deg)`;
    state.selectedSection.rotation = parseInt(rotation);
    
    const paddingTop = document.getElementById('prop-padding-top')?.value || 0;
    const paddingBottom = document.getElementById('prop-padding-bottom')?.value || 0;
    section.style.paddingTop = `${paddingTop}px`;
    section.style.paddingBottom = `${paddingBottom}px`;
    
    const bgColor = document.getElementById('prop-bg-color')?.value;
    if (bgColor && bgColor !== '#ffffff') section.style.backgroundColor = bgColor;
    
    // Не снимаем выделение - оставляем возможность продолжать редактирование
    saveToHistory();
    renderSectionProperties(state.selectedSection); // Перерисовываем панель с новыми значениями
    showToast('Свойства применены', 'success');
    updateStatus('Свойства секции обновлены');
};

window.applyElementProperties = function() {
    if (!state.selectedElement) return;
    const el = state.selectedElement.element;
    
    const text = document.getElementById('el-text')?.value;
    if (text !== undefined) el.textContent = text;
    
    const src = document.getElementById('el-src')?.value;
    if (src) el.src = src;
    
    const fontSize = document.getElementById('el-font-size')?.value;
    const fontWeight = document.getElementById('el-font-weight')?.value;
    if (fontSize) el.style.fontSize = fontSize;
    if (fontWeight) el.style.fontWeight = fontWeight;
    
    const color = document.getElementById('el-color')?.value;
    const bgColor = document.getElementById('el-bg-color')?.value;
    if (color) el.style.color = color;
    if (bgColor) el.style.backgroundColor = bgColor;
    
    const width = document.getElementById('el-width')?.value;
    const height = document.getElementById('el-height')?.value;
    const borderRadius = document.getElementById('el-border-radius')?.value;
    if (width) el.style.width = width;
    if (height) el.style.height = height;
    if (borderRadius) el.style.borderRadius = borderRadius;
    
    // Обновляем название элемента
    state.selectedElement.name = getElementName(el);
    
    // Не снимаем выделение - оставляем возможность продолжать редактирование
    saveToHistory();
    renderElementProperties(state.selectedElement); // Перерисовываем панель с новыми значениями
    showToast('Свойства применены', 'success');
    updateStatus('Свойства элемента обновлены');
};

window.deleteElement = function(sectionId, elementId) {
    const section = state.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const element = section.elements.find(el => el.id === elementId);
    if (element && confirm('Удалить элемент?')) {
        element.element.remove();
        section.elements = section.elements.filter(el => el.id !== elementId);
        state.selectedElement = null;
        renderSectionProperties(section);
        saveToHistory();
        showToast('Элемент удалён', 'success');
    }
};

window.showAddElementModal = function(sectionId) {
    let modal = document.getElementById('add-element-modal');
    const grid = modal.querySelector('.elements-grid-modal');
    
    grid.innerHTML = [
        {type:'h1',icon:'fa-heading',name:'H1'}, {type:'h2',icon:'fa-heading',name:'H2'},
        {type:'h3',icon:'fa-heading',name:'H3'}, {type:'p',icon:'fa-paragraph',name:'Текст'},
        {type:'button',icon:'fa-square',name:'Кнопка'}, {type:'img',icon:'fa-image',name:'Img'},
        {type:'div',icon:'fa-square',name:'Блок'}, {type:'hr',icon:'fa-minus',name:'Линия'},
        {type:'video',icon:'fa-video',name:'Видео'}, {type:'form',icon:'fa-envelope',name:'Форма'},
        {type:'map',icon:'fa-map-marker-alt',name:'Карта'}, {type:'social',icon:'fa-share-alt',name:'Соцсети'}
    ].map(el => `
        <div class="component-item" onclick="addElement('${el.type}')" style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px;background:rgba(255,255,255,0.03);border:1px solid var(--glass-border);border-radius:8px;cursor:pointer;">
            <i class="fas ${el.icon}" style="font-size:24px;color:var(--primary);"></i>
            <span style="font-size:11px;color:var(--gray-light);">${el.name}</span>
        </div>
    `).join('');
    
    modal.dataset.sectionId = sectionId;
    modal.style.display = 'flex';
};

window.addElement = function(type) {
    const sectionId = document.getElementById('add-element-modal')?.dataset.sectionId;
    if (!sectionId) return;
    const section = state.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    let newElement;
    if (type === 'h1') { newElement = document.createElement('h1'); newElement.textContent = 'Заголовок'; newElement.style.cssText = 'font-size:32px;color:#1a202c;margin-bottom:16px;'; }
    else if (type === 'h2') { newElement = document.createElement('h2'); newElement.textContent = 'Подзаголовок'; newElement.style.cssText = 'font-size:24px;color:#1a202c;margin-bottom:12px;'; }
    else if (type === 'h3') { newElement = document.createElement('h3'); newElement.textContent = 'Заголовок H3'; newElement.style.cssText = 'font-size:20px;color:#1a202c;margin-bottom:10px;'; }
    else if (type === 'p') { newElement = document.createElement('p'); newElement.textContent = 'Текст абзаца'; newElement.style.cssText = 'font-size:16px;color:#4a5568;line-height:1.6;margin-bottom:16px;'; }
    else if (type === 'button') { newElement = document.createElement('button'); newElement.textContent = 'Кнопка'; newElement.style.cssText = 'padding:12px 24px;background:#6366f1;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;'; }
    else if (type === 'img') { newElement = document.createElement('img'); newElement.src = 'https://via.placeholder.com/400x300'; newElement.alt = 'Image'; newElement.style.cssText = 'max-width:100%;height:auto;border-radius:8px;'; }
    else if (type === 'div') { newElement = document.createElement('div'); newElement.style.cssText = 'padding:20px;background:#f7fafc;border-radius:8px;margin:16px 0;'; }
    else if (type === 'hr') { newElement = document.createElement('hr'); newElement.style.cssText = 'border:none;border-top:1px solid #e2e8f0;margin:24px 0;'; }
    
    if (newElement) {
        section.element.appendChild(newElement);
        parseSectionElements(section);
        renderSectionProperties(section);
        saveToHistory();
        showToast('Элемент добавлен', 'success');
        document.getElementById('add-element-modal').style.display = 'none';
    }
};

window.deleteSelected = function(sectionId) {
    const id = sectionId || state.selectedSection?.id;
    if (!id) return;
    
    const index = state.sections.findIndex(s => s.id === id);
    if (index === -1) return;
    
    if (confirm('Удалить секцию?')) {
        state.sections[index].element.remove();
        state.sections.splice(index, 1);
        state.selectedSection = null;
        state.selectedElement = null;
        DOM.propertiesContent.innerHTML = `<div class="empty-state"><i class="fas fa-sliders-h"></i><p>Выберите секцию<br>для редактирования</p></div>`;
        DOM.floatingToolbar.style.display = 'none';
        saveToHistory();
        updateElementsCount();
        if (state.sections.length === 0) DOM.canvasPlaceholder.style.display = 'flex';
        showToast('Секция удалена', 'success');
    }
};

window.duplicateSelected = function(sectionId) {
    const id = sectionId || state.selectedSection?.id;
    if (!id) return;
    
    const section = state.sections.find(s => s.id === id);
    if (section) {
        const originalData = SECTIONS_LIBRARY.find(s => s.id === section.sectionId);
        if (originalData) addSectionToCanvas(originalData);
        showToast('Секция скопирована', 'success');
    }
};

window.moveSectionUp = function(sectionId) {
    const id = sectionId || state.selectedSection?.id;
    if (!id) return;
    
    const index = state.sections.findIndex(s => s.id === id);
    if (index > 0) {
        [state.sections[index], state.sections[index - 1]] = [state.sections[index - 1], state.sections[index]];
        state.sections[index].element.after(state.sections[index - 1].element);
        saveToHistory();
        showToast('Секция перемещена вверх', 'success');
    }
};

window.moveSectionDown = function(sectionId) {
    const id = sectionId || state.selectedSection?.id;
    if (!id) return;
    
    const index = state.sections.findIndex(s => s.id === id);
    if (index < state.sections.length - 1) {
        [state.sections[index], state.sections[index + 1]] = [state.sections[index + 1], state.sections[index]];
        state.sections[index].element.before(state.sections[index + 1].element);
        saveToHistory();
        showToast('Секция перемещена вниз', 'success');
    }
};

function showFloatingToolbar() {
    if (DOM.floatingToolbar) DOM.floatingToolbar.style.display = 'flex';
}

function setupToolbar() {
    document.getElementById('grid-btn')?.addEventListener('click', function() {
        state.settings.showGrid = !state.settings.showGrid;
        this.classList.toggle('active', state.settings.showGrid);
        DOM.canvas.style.backgroundImage = state.settings.showGrid 
            ? 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)'
            : 'none';
        DOM.canvas.style.backgroundSize = state.settings.showGrid ? '20px 20px' : 'auto';
    });
    
    document.getElementById('guides-btn')?.addEventListener('click', function() {
        state.settings.showGuides = !state.settings.showGuides;
        this.classList.toggle('active', state.settings.showGuides);
        DOM.guidesOverlay.style.display = state.settings.showGuides ? 'block' : 'none';
    });
    
    document.getElementById('snap-btn')?.addEventListener('click', function() {
        state.settings.snapToGrid = !state.settings.snapToGrid;
        this.classList.toggle('active', state.settings.snapToGrid);
    });
}

function setupCanvasInteractions() {
    DOM.canvas?.addEventListener('click', (e) => {
        // Игнорируем клики по контролам
        if (e.target.closest('.section-controls') || e.target.closest('.resize-handle') || e.target.closest('.rotate-handle')) {
            return;
        }
        
        // Проверяем клик по элементу внутри секции
        const textElement = e.target.closest('h1, h2, h3, h4, p, button, a, img, div');
        if (textElement && !e.target.closest('.canvas-section')) {
            const section = state.sections.find(s => s.element.contains(textElement));
            if (section) {
                const element = section.elements.find(el => el.element === textElement);
                if (element) {
                    selectElement(section.id, element.id);
                    e.stopPropagation();
                    return;
                }
            }
        }
        
        if (e.target === DOM.canvas || e.target === DOM.canvasPlaceholder) {
            document.querySelectorAll('.canvas-section').forEach(el => el.classList.remove('selected'));
            document.querySelectorAll('.canvas-element-highlight').forEach(el => {
                el.classList.remove('canvas-element-highlight');
                el.style.outline = '';
            });
            state.selectedSection = null;
            state.selectedElement = null;
            DOM.floatingToolbar.style.display = 'none';
            DOM.propertiesContent.innerHTML = `<div class="empty-state"><i class="fas fa-sliders-h"></i><p>Выберите секцию<br>для редактирования</p></div>`;
            updateSectionCounter();
        }
    });
    
    // Клик по секции для выделения
    DOM.canvas?.addEventListener('click', (e) => {
        const sectionEl = e.target.closest('.canvas-section');
        if (sectionEl && !e.target.closest('.section-controls')) {
            const section = state.sections.find(s => s.element === sectionEl);
            if (section) {
                selectSection(section.id);
                e.stopPropagation();
            }
        }
    });
    
    // Двойной клик для быстрого редактирования текста
    DOM.canvas?.addEventListener('dblclick', (e) => {
        const textElement = e.target.closest('h1, h2, h3, h4, p, button, a');
        if (textElement && !e.target.closest('.section-controls')) {
            const section = state.sections.find(s => s.element.contains(textElement));
            if (section) {
                const element = section.elements.find(el => el.element === textElement);
                if (element) {
                    selectElement(section.id, element.id);
                    // Открываем prompt для быстрого редактирования
                    const newText = prompt('Введите текст:', textElement.textContent);
                    if (newText !== null) {
                        textElement.textContent = newText;
                        element.name = getElementName(textElement);
                        saveToHistory();
                        renderElementProperties(element);
                        showToast('Текст обновлён', 'success');
                    }
                }
            }
        }
    });
    
    DOM.canvas?.addEventListener('mousemove', (e) => {
        const rect = DOM.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (DOM.cursorPosition) DOM.cursorPosition.textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}`;
    });
    
    // Обновление мини-карты при скролле
    DOM.canvasWrapper?.addEventListener('scroll', () => {
        updateMinimap();
    });
}

function renderRulers() {
    const hRuler = document.getElementById('ruler-horizontal');
    const vRuler = document.getElementById('ruler-vertical');
    
    if (hRuler) {
        let markings = '';
        for (let i = 0; i < 200; i++) {
            markings += `<div style="position:absolute;left:${i*10}px;bottom:0;width:1px;height:${i%10===0?'100%':'50%'};background:var(--gray);font-size:9px;padding-left:2px;">${i%10===0?i:''}</div>`;
        }
        hRuler.querySelector('.ruler-markings').innerHTML = markings;
    }
}

function setupDragAndDrop() {
    DOM.canvas?.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
    DOM.canvas?.addEventListener('drop', (e) => {
        e.preventDefault();
        const sectionId = e.dataTransfer.getData('text/plain');
        const sectionData = SECTIONS_LIBRARY.find(s => s.id === sectionId);
        if (sectionData) addSectionToCanvas(sectionData);
    });
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

function handleMouseMove(e) {
    if (!state.selectedSection) return;
    const element = state.selectedSection.element;
    
    if (state.dragState.isResizing) {
        const dx = e.clientX - state.dragState.startX;
        const dy = e.clientY - state.dragState.startY;
        let newWidth = state.dragState.startWidth;
        let newHeight = state.dragState.startHeight;
        const dir = state.dragState.direction;
        
        if (dir.includes('e')) newWidth = Math.max(100, state.dragState.startWidth + dx);
        if (dir.includes('w')) { newWidth = Math.max(100, state.dragState.startWidth - dx); element.style.left = `${state.dragState.startLeft + dx}px`; }
        if (dir.includes('n')) { newHeight = Math.max(50, state.dragState.startHeight - dy); element.style.top = `${state.dragState.startTop + dy}px`; }
        if (dir.includes('s')) newHeight = Math.max(50, state.dragState.startHeight + dy);
        
        element.style.width = `${newWidth}px`;
        element.style.height = `${newHeight}px`;
    }
    
    if (state.dragState.isRotating) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI + 90;
        element.style.transform = `rotate(${Math.round(angle)}deg)`;
        state.selectedSection.rotation = Math.round(angle);
    }
}

function handleMouseUp() {
    if (state.dragState.isResizing || state.dragState.isRotating) saveToHistory();
    state.dragState.isResizing = false;
    state.dragState.isRotating = false;
}

DOM.canvas?.addEventListener('mousedown', (e) => {
    const resizeHandle = e.target.closest('.resize-handle');
    const rotateHandle = e.target.closest('.rotate-handle');
    
    if (resizeHandle && state.selectedSection) {
        e.preventDefault();
        e.stopPropagation();
        const element = state.selectedSection.element;
        const rect = element.getBoundingClientRect();
        state.dragState.isResizing = true;
        state.dragState.direction = resizeHandle.dataset.direction;
        state.dragState.startX = e.clientX;
        state.dragState.startY = e.clientY;
        state.dragState.startWidth = rect.width;
        state.dragState.startHeight = rect.height;
        state.dragState.startLeft = parseInt(element.style.left) || 0;
        state.dragState.startTop = parseInt(element.style.top) || 0;
    }
    if (rotateHandle && state.selectedSection) {
        e.preventDefault();
        state.dragState.isRotating = true;
    }
});

function setupImageUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('image-upload-input');
    
    document.getElementById('upload-image-btn')?.addEventListener('click', () => {
        DOM.modals.imageUpload.style.display = 'flex';
    });
    
    uploadArea?.addEventListener('click', () => fileInput.click());
    uploadArea?.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
    uploadArea?.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    uploadArea?.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) handleImageFile(file);
    });
    
    fileInput?.addEventListener('change', (e) => { if (e.target.files[0]) handleImageFile(e.target.files[0]); });
    
    document.getElementById('cancel-image-upload')?.addEventListener('click', () => {
        DOM.modals.imageUpload.style.display = 'none';
        resetImageUpload();
    });
    
    document.getElementById('confirm-image-upload')?.addEventListener('click', () => {
        if (state.imageUpload.url) {
            const imageData = { 
                url: state.imageUpload.url, 
                width: parseInt(document.getElementById('image-width').value) || 400, 
                height: parseInt(document.getElementById('image-height').value) || 300, 
                alt: document.getElementById('image-alt').value || 'Image' 
            };
            addSectionToCanvas({ id: 'image', name: 'Изображение', category: 'media', icon: 'fa-image', html: '', css: '' }, true, imageData);
            DOM.modals.imageUpload.style.display = 'none';
            resetImageUpload();
            showToast('Изображение добавлено', 'success');
        }
    });
}

function handleImageFile(file) {
    if (!file.type.startsWith('image/')) { showToast('Выберите изображение', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
        state.imageUpload.file = file;
        state.imageUpload.url = e.target.result;
        document.getElementById('image-preview').src = e.target.result;
        document.getElementById('image-preview-container').classList.add('active');
    };
    reader.readAsDataURL(file);
}

function resetImageUpload() {
    state.imageUpload.file = null;
    state.imageUpload.url = null;
    document.getElementById('image-upload-input').value = '';
    document.getElementById('image-preview-container').classList.remove('active');
}

function setupEventListeners() {
    DOM.sectionSearch?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('.section-card').forEach(card => {
            card.style.display = card.querySelector('h4').textContent.toLowerCase().includes(query) ? 'block' : 'none';
        });
    });
    
    DOM.categoriesFilter?.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderSectionsLibrary(e.target.dataset.category);
        }
    });
    
    document.getElementById('zoom-in')?.addEventListener('click', () => { 
        state.zoom = Math.min(state.zoom + 0.1, 2); 
        DOM.canvas.style.transform = `scale(${state.zoom})`; 
        DOM.zoomLevel.textContent = `${Math.round(state.zoom * 100)}%`; 
    });
    
    document.getElementById('zoom-out')?.addEventListener('click', () => { 
        state.zoom = Math.max(state.zoom - 0.1, 0.5); 
        DOM.canvas.style.transform = `scale(${state.zoom})`; 
        DOM.zoomLevel.textContent = `${Math.round(state.zoom * 100)}%`; 
    });
    
    document.getElementById('reset-zoom')?.addEventListener('click', () => { 
        state.zoom = 1; 
        DOM.canvas.style.transform = `scale(${state.zoom})`; 
        DOM.zoomLevel.textContent = '100%'; 
    });
    
    document.getElementById('save-btn')?.addEventListener('click', saveProject);
    document.getElementById('preview-btn')?.addEventListener('click', showPreview);
    document.getElementById('export-btn')?.addEventListener('click', showExportModal);
    document.getElementById('help-btn')?.addEventListener('click', () => DOM.modals.help.style.display = 'flex');
    document.getElementById('undo-btn')?.addEventListener('click', undo);
    document.getElementById('redo-btn')?.addEventListener('click', redo);
    
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => document.querySelectorAll('.modal').forEach(m => m.style.display = 'none'));
    });
    
    document.querySelectorAll('.export-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.export-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.export-pane').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`${tab.dataset.export}-pane`).classList.add('active');
        });
    });
    
    document.querySelectorAll('.device-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const frame = document.getElementById('preview-frame');
            if (btn.dataset.device === 'tablet') frame.style.width = '768px';
            else if (btn.dataset.device === 'mobile') frame.style.width = '375px';
            else frame.style.width = '100%';
        });
    });
}

function showExportModal() {
    document.getElementById('export-html').value = generateHTML();
    document.getElementById('export-css').value = generateCSS();
    DOM.modals.export.style.display = 'flex';
}

function generateHTML() {
    let html = '<!DOCTYPE html>\n<html lang="ru">\n<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>MirageML Project</title><link rel="stylesheet" href="styles.css"></head>\n<body>\n';
    state.sections.forEach(s => {
        const clone = s.element.cloneNode(true);
        clone.querySelector('.section-controls')?.remove();
        clone.querySelectorAll('.resize-handle, .rotate-handle, .rotate-line').forEach(el => el.remove());
        clone.classList.remove('selected', 'canvas-section');
        clone.style.border = 'none';
        clone.style.boxShadow = 'none';
        html += clone.outerHTML + '\n';
    });
    html += '</body>\n</html>';
    return html;
}

function generateCSS() {
    let css = '/* MirageML Project Styles */\n* { margin: 0; padding: 0; box-sizing: border-box; }\nbody { font-family: "Inter", sans-serif; line-height: 1.6; }\n.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }\n\n';
    state.sections.forEach(s => css += `/* ${s.name} */\n${s.css}\n\n`);
    return css;
}

function showPreview() {
    const html = generateHTML().replace('<link rel="stylesheet" href="styles.css">', `<style>${generateCSS()}</style>`);
    document.getElementById('preview-frame').srcdoc = html;
    DOM.modals.preview.style.display = 'flex';
}

function saveProject() {
    localStorage.setItem('mirageml-project', JSON.stringify({ 
        sections: state.sections.map(s => ({ id: s.id, name: s.name })), 
        savedAt: new Date().toISOString() 
    }));
    showToast('Проект сохранён', 'success');
    updateStatus('Проект сохранён');
}

function saveToHistory() {
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push({ sections: state.sections.map(s => ({ id: s.id, name: s.name })) });
    state.historyIndex++;
    if (state.history.length > 50) { state.history.shift(); state.historyIndex--; }
}

function undo() { 
    if (state.historyIndex > 0) { 
        state.historyIndex--; 
        showToast('Отменено', 'info'); 
        updateStatus('Отменено действие');
    } 
}

function redo() { 
    if (state.historyIndex < state.history.length - 1) { 
        state.historyIndex++; 
        showToast('Повторено', 'info');
        updateStatus('Повторено действие');
    } 
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && state.selectedSection) { 
            e.preventDefault(); 
            state.clipboard = { type: 'section', data: state.selectedSection };
            updateStatus('Скопировано');
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'v' && state.clipboard) { 
            e.preventDefault(); 
            if (state.clipboard.type === 'section') addSectionToCanvas(SECTIONS_LIBRARY.find(s => s.id === state.clipboard.data.sectionId));
            updateStatus('Вставлено');
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'd' && state.selectedSection) { 
            e.preventDefault(); 
            duplicateSelected(); 
        }
        if (e.key === 'Delete' && state.selectedSection) { 
            e.preventDefault(); 
            deleteSelected(); 
        }
    });
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i><span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function updateStatus(message) {
    if (DOM.statusMessage) DOM.statusMessage.textContent = message;
}

function updateElementsCount() {
    if (DOM.elementsCount) DOM.elementsCount.textContent = `${state.sections.length} секций`;
    updateSectionCounter();
    updateMinimap();
}

function updateSectionCounter() {
    const counter = document.getElementById('section-counter');
    if (counter) {
        const currentIndex = state.selectedSection ? state.sections.findIndex(s => s.id === state.selectedSection.id) + 1 : 0;
        counter.textContent = `${currentIndex}/${state.sections.length}`;
    }
}

function updateMinimap() {
    const minimap = document.getElementById('minimap');
    const viewport = document.getElementById('minimap-viewport');
    if (!minimap || !viewport || state.sections.length === 0) return;
    
    // Очищаем мини-карту
    minimap.innerHTML = '';
    
    // Добавляем блоки для каждой секции
    const canvasHeight = DOM.canvas.scrollHeight;
    const sectionHeight = 100 / state.sections.length;
    
    state.sections.forEach((section, index) => {
        const block = document.createElement('div');
        block.style.cssText = `
            position: absolute;
            left: 2px;
            right: 2px;
            top: ${index * sectionHeight}%;
            height: ${sectionHeight - 2}%;
            background: ${section === state.selectedSection ? 'var(--primary)' : 'rgba(99, 102, 241, 0.3)'};
            border-radius: 2px;
            cursor: pointer;
        `;
        block.onclick = () => scrollToSection(index);
        block.title = section.name;
        minimap.appendChild(block);
    });
    
    // Добавляем viewport индикатор
    minimap.appendChild(viewport);
    
    // Обновляем позицию viewport
    const wrapper = DOM.canvasWrapper;
    const scrollTop = wrapper.scrollTop;
    const scrollHeight = wrapper.scrollHeight - wrapper.clientHeight;
    const viewportTop = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    const viewportHeight = scrollHeight > 0 ? (wrapper.clientHeight / wrapper.scrollHeight) * 100 : 100;
    
    viewport.style.top = `${viewportTop}%`;
    viewport.style.height = `${viewportHeight}%`;
}

function scrollToSection(index) {
    if (index < 0 || index >= state.sections.length) return;
    
    const section = state.sections[index].element;
    const wrapper = DOM.canvasWrapper;
    const sectionTop = section.offsetTop - 40;
    
    wrapper.scrollTo({
        top: sectionTop,
        behavior: 'smooth'
    });
    
    selectSection(state.sections[index].id);
    updateSectionCounter();
}

window.scrollToFirstSection = function() {
    scrollToSection(0);
};

window.scrollToLastSection = function() {
    scrollToSection(state.sections.length - 1);
};

window.scrollToPreviousSection = function() {
    if (!state.selectedSection) {
        scrollToSection(0);
        return;
    }
    const currentIndex = state.sections.findIndex(s => s.id === state.selectedSection.id);
    if (currentIndex > 0) {
        scrollToSection(currentIndex - 1);
    }
};

window.scrollToNextSection = function() {
    if (!state.selectedSection) {
        scrollToSection(0);
        return;
    }
    const currentIndex = state.sections.findIndex(s => s.id === state.selectedSection.id);
    if (currentIndex < state.sections.length - 1) {
        scrollToSection(currentIndex + 1);
    }
};

function rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent' || rgb.includes('rgba(0, 0, 0, 0)')) return '#ffffff';
    if (rgb.startsWith('#')) return rgb;
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return '#ffffff';
    return '#' + [match[1], match[2], match[3]].map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

window.addEventListener('DOMContentLoaded', init);
