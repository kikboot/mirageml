window.renderSectionPropertiesEnhanced = function(section) {
    if (!DOM.propertiesContent) return;

    const bgStyle = section.element.style.background || '';
    let bgType = 'color';
    if (bgStyle.includes('gradient')) bgType = 'gradient';
    if (bgStyle.includes('url(')) bgType = 'image';

    const videoElement = section.element.querySelector('video');
    if (videoElement) bgType = 'video';

    const currentBgColor = getBgColorHex(bgStyle);
    const currentOpacity = getOpacityFromColor(bgStyle);

    DOM.propertiesContent.innerHTML = `
        <!-- Элементы секции -->
        <div class="property-accordion">
            <div class="accordion-item expanded" data-accordion="elements">
                <div class="accordion-item-header" onclick="togglePropertyAccordion('elements')">
                    <i class="fas fa-chevron-down"></i>
                    <i class="fas fa-list" style="color:var(--primary);"></i>
                    <span>Элементы секции</span>
                </div>
                <div class="accordion-content expanded" id="accordion-elements">
                    ${section.elements.length > 0 ? section.elements.map(el => `
                        <div class="element-item" data-element-id="${el.id}" onclick="selectElement('${section.id}', '${el.id}', event)" style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(255,255,255,0.03);border:1px solid var(--glass-border);border-radius:8px;margin-bottom:8px;cursor:pointer;">
                            <i class="fas fa-${getElementIcon(el.tag)}" style="color:var(--primary);"></i>
                            <span style="flex:1;font-size:13px;color:var(--light);">${el.name}</span>
                            <span style="font-size:11px;color:var(--primary);background:rgba(99,102,241,0.2);padding:2px 6px;border-radius:4px;">${el.tag}</span>
                        </div>
                    `).join('') : '<p style="padding:0 20px;color:var(--gray);">Нет элементов</p>'}
                    <button class="btn btn-ghost" onclick="showAddElementModal('${section.id}')" style="width:calc(100% - 40px);margin:12px 20px;">
                        <i class="fas fa-plus"></i> Добавить элемент
                    </button>
                </div>
            </div>
        </div>

        <!-- Основные свойства -->
        <div class="property-accordion">
            <div class="accordion-item" data-accordion="main">
                <div class="accordion-item-header" onclick="togglePropertyAccordion('main')">
                    <i class="fas fa-chevron-right"></i>
                    <i class="fas fa-cog" style="color:var(--primary);"></i>
                    <span>Основные</span>
                </div>
                <div class="accordion-content" id="accordion-main">
                    <div class="property-item">
                        <label><i class="fas fa-tag"></i> Название</label>
                        <input type="text" id="prop-name" value="${section.name}" onchange="updateSectionName(this.value)">
                    </div>
                </div>
            </div>
        </div>

        <!-- Размер и отступы -->
        <div class="property-accordion">
            <div class="accordion-item" data-accordion="size">
                <div class="accordion-item-header" onclick="togglePropertyAccordion('size')">
                    <i class="fas fa-chevron-right"></i>
                    <i class="fas fa-expand" style="color:var(--secondary);"></i>
                    <span>Размер и отступы</span>
                </div>
                <div class="accordion-content" id="accordion-size">
                    <div class="property-row">
                        <div class="property-item">
                            <label>Ширина (px)</label>
                            <input type="text" id="prop-width" value="${Math.round(section.element.getBoundingClientRect().width)}" onchange="updateSectionSizeWithFormula(this.value, document.getElementById('prop-height').value)">
                        </div>
                        <div class="property-item">
                            <label>Высота (px)</label>
                            <input type="text" id="prop-height" value="${Math.round(section.element.getBoundingClientRect().height)}" onchange="updateSectionSizeWithFormula(document.getElementById('prop-width').value, this.value)">
                        </div>
                    </div>
                    <div class="property-item">
                        <label>Поворот (°)</label>
                        <input type="number" id="prop-rotation" value="${section.rotation || 0}" min="0" max="360" onchange="updateSectionRotation(this.value)">
                    </div>
                    <div class="property-row">
                        <div class="property-item">
                            <label>Отступ сверху</label>
                            <input type="text" id="prop-padding-top" value="${parseInt(getComputedStyle(section.element).paddingTop) || 0}" onchange="updateSectionPaddingWithFormula('top', this.value)">
                        </div>
                        <div class="property-item">
                            <label>Отступ снизу</label>
                            <input type="text" id="prop-padding-bottom" value="${parseInt(getComputedStyle(section.element).paddingBottom) || 0}" onchange="updateSectionPaddingWithFormula('bottom', this.value)">
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Фон секции -->
        <div class="property-accordion">
            <div class="accordion-item expanded" data-accordion="background">
                <div class="accordion-item-header" onclick="togglePropertyAccordion('background')">
                    <i class="fas fa-chevron-down"></i>
                    <i class="fas fa-fill-drip" style="color:var(--accent);"></i>
                    <span>Фон секции</span>
                </div>
                <div class="accordion-content expanded" id="accordion-background">
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
                        <button class="bg-tab ${bgType==='video'?'active':''}" onclick="switchBgTab('video')" style="flex:1;padding:8px;background:${bgType==='video'?'rgba(99,102,241,0.2)':'rgba(255,255,255,0.05)'};border:1px solid ${bgType==='video'?'var(--primary)':'var(--glass-border)'};border-radius:6px;color:var(--light);cursor:pointer;">
                            <i class="fas fa-video"></i> Видео
                        </button>
                    </div>

                    <!-- Панель цвета -->
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

                    <!-- Панель градиента с превью -->
                    <div id="bg-gradient-panel" style="display:${bgType==='gradient'?'block':'none'}">
                        <div class="gradient-preview" id="gradient-preview" style="width:100%;height:60px;border-radius:8px;margin-bottom:12px;border:1px solid var(--glass-border);"></div>
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

                    <!-- Панель изображения -->
                    <div id="bg-image-panel" style="display:${bgType==='image'?'block':'none'}">
                        <div class="property-item">
                            <label><i class="fas fa-image"></i> URL изображения</label>
                            <input type="text" id="bg-image-url" placeholder="https://..." value="${getBgImageUrl(section.element.style.background)}" onchange="updateBgImage(this.value)" style="width:100%;">
                        </div>
                        <div class="property-item">
                            <button class="btn btn-ghost" onclick="setBgImage('https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1920')" style="width:100%;margin-bottom:8px;">
                                <i class="fas fa-image"></i> Офис (Unsplash)
                            </button>
                            <button class="btn btn-ghost" onclick="setBgImage('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920')" style="width:100%;">
                                <i class="fas fa-globe"></i> Команда (Unsplash)
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

                    <!-- Панель видео -->
                    <div id="bg-video-panel" style="display:${bgType==='video'?'block':'none'}">
                        <div class="property-item">
                            <label><i class="fas fa-video"></i> URL видео</label>
                            <input type="text" id="bg-video-url" placeholder="https://..." value="${getVideoUrl(section.element)}" onchange="updateBgVideo(this.value)" style="width:100%;">
                        </div>
                        <div class="property-item">
                            <button class="btn btn-ghost" onclick="setBgVideo('https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4')" style="width:100%;margin-bottom:8px;">
                                <i class="fas fa-film"></i> Космос (Mixkit)
                            </button>
                            <button class="btn btn-ghost" onclick="setBgVideo('https://assets.mixkit.co/videos/preview/mixkit-abstract-video-of-a-man-with-a-camera-3977-large.mp4')" style="width:100%;">
                                <i class="fas fa-globe"></i> Абстракция (Mixkit)
                            </button>
                        </div>
                        <div class="property-item">
                            <label><i class="fas fa-circle"></i> Overlay (цвет поверх)</label>
                            <div class="color-picker-wrapper">
                                <input type="color" id="video-overlay-color" value="#000000" oninput="updateVideoOverlay()">
                                <input type="text" id="video-overlay-color-text" value="#000000" onchange="updateVideoOverlay()" style="flex:1;">
                            </div>
                        </div>
                        <div class="property-item">
                            <label>Прозрачность overlay</label>
                            <div class="range-wrapper">
                                <input type="range" id="video-overlay-opacity" min="0" max="100" value="50" oninput="updateVideoOverlay()">
                                <span class="range-value" id="video-overlay-opacity-value">50%</span>
                            </div>
                        </div>
                    </div>

                    <!-- Фильтры фона (Image Filters - унифицировано) -->
                    <div class="image-filters-section" style="margin-top:16px;padding-top:16px;border-top:1px solid var(--glass-border);">
                        <h4 style="font-size:12px;color:var(--primary);margin-bottom:12px;display:flex;align-items:center;gap:8px;">
                            <i class="fas fa-adjust"></i> Фильтры фона
                        </h4>
                        <div class="property-item">
                            <label><i class="fas fa-magic"></i> Размытие (blur)</label>
                            <div class="range-wrapper">
                                <input type="range" id="bg-blur" min="0" max="20" value="0" oninput="updateBgFilter()">
                                <span class="range-value" id="bg-blur-value">0px</span>
                            </div>
                        </div>
                        <div class="property-item">
                            <label><i class="fas fa-sun"></i> Яркость</label>
                            <div class="range-wrapper">
                                <input type="range" id="bg-brightness" min="0" max="200" value="100" oninput="updateBgFilter()">
                                <span class="range-value" id="bg-brightness-value">100%</span>
                            </div>
                        </div>
                        <div class="property-item">
                            <label><i class="fas fa-adjust"></i> Контраст</label>
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
                        <div class="property-item">
                            <label><i class="fas fa-droplet"></i> Сепия</label>
                            <div class="range-wrapper">
                                <input type="range" id="bg-sepia" min="0" max="100" value="0" oninput="updateBgFilter()">
                                <span class="range-value" id="bg-sepia-value">0%</span>
                            </div>
                        </div>
                        <div class="property-item">
                            <label><i class="fas fa-circle-half-stroke"></i> Инверсия</label>
                            <div class="range-wrapper">
                                <input type="range" id="bg-invert" min="0" max="100" value="0" oninput="updateBgFilter()">
                                <span class="range-value" id="bg-invert-value">0%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Действия -->
        <div class="property-accordion">
            <div class="accordion-item" data-accordion="actions">
                <div class="accordion-item-header" onclick="togglePropertyAccordion('actions')">
                    <i class="fas fa-chevron-right"></i>
                    <i class="fas fa-check-circle" style="color:var(--success);"></i>
                    <span>Действия</span>
                </div>
                <div class="accordion-content" id="accordion-actions">
                    <button class="btn btn-primary" onclick="saveToHistory(); showToast('Изменения сохранены', 'success')" style="width:calc(100% - 40px);margin:12px 20px;">
                        <i class="fas fa-save"></i> Сохранить изменения
                    </button>
                </div>
            </div>
        </div>
    `;

    setupColorPicker('prop-bg-color', 'prop-bg-color-text');
    updateGradientPreview();
}

window.renderElementPropertiesEnhanced = function(element) {
    if (!DOM.propertiesContent) return;

    const el = element.element;
    const computedStyle = window.getComputedStyle(el);
    const tag = element.tag;

    const currentColor = rgbToHex(computedStyle.color);
    const currentBgColor = rgbToHex(computedStyle.backgroundColor);
    
    const isText = ['h1', 'h2', 'h3', 'h4', 'p', 'span', 'a'].includes(tag);
    const isButton = tag === 'button';
    const isImage = tag === 'img' || el.classList.contains('logo');
    const isIcon = tag === 'i' || tag === 'svg' || el.classList.contains('fa');
    const isVideo = tag === 'video';

    DOM.propertiesContent.innerHTML = `
        <!-- Информация об элементе -->
        <div class="property-accordion">
            <div class="accordion-item expanded" data-accordion="el-info">
                <div class="accordion-item-header" onclick="togglePropertyAccordion('el-info')">
                    <i class="fas fa-chevron-down"></i>
                    <i class="fas fa-info-circle" style="color:var(--primary);"></i>
                    <span>${tag.toUpperCase()} - ${element.name}</span>
                </div>
                <div class="accordion-content expanded" id="accordion-el-info">
                    <div class="property-item">
                        <label><i class="fas fa-tag"></i> Название</label>
                        <input type="text" id="el-name" value="${element.name}" onchange="updateElementName(this.value)">
                    </div>
                    ${isText || isButton ? `
                    <div class="property-item">
                        <label><i class="fas fa-font"></i> Текст</label>
                        <textarea id="el-text" rows="3" oninput="updateElementText(this.value)">${el.textContent || ''}</textarea>
                    </div>
                    ` : ''}
                    ${isButton ? `
                    <div class="property-item">
                        <label><i class="fas fa-link"></i> Ссылка (href)</label>
                        <input type="text" id="el-href" value="${el.getAttribute('data-href') || el.getAttribute('href') || ''}" onchange="updateElementHref(this.value)" placeholder="https://...">
                    </div>
                    ` : ''}
                    ${isImage ? `
                    <div class="property-item">
                        <label><i class="fas fa-image"></i> URL изображения</label>
                        <input type="text" id="el-src" value="${el.src || ''}" onchange="updateElementSrc(this.value)">
                    </div>
                    <div class="property-item">
                        <button class="btn btn-ghost" onclick="document.getElementById('el-src').value='https://via.placeholder.com/400x300'; updateElementSrc('https://via.placeholder.com/400x300')" style="width:100%;margin-bottom:8px;">
                            <i class="fas fa-image"></i> Placeholder 400x300
                        </button>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>

        <!-- Цвета и градиенты -->
        <div class="property-accordion">
            <div class="accordion-item" data-accordion="el-colors">
                <div class="accordion-item-header" onclick="togglePropertyAccordion('el-colors')">
                    <i class="fas fa-chevron-right"></i>
                    <i class="fas fa-fill-drip" style="color:var(--accent);"></i>
                    <span>Цвета и градиенты</span>
                </div>
                <div class="accordion-content" id="accordion-el-colors">
                    <div class="property-item">
                        <label><i class="fas fa-circle"></i> Цвет текста</label>
                        <div class="color-picker-wrapper">
                            <input type="color" id="el-color" value="${currentColor}" oninput="updateElementColor(this.value)">
                            <input type="text" id="el-color-text" value="${currentColor}" onchange="updateElementColor(this.value)" style="flex:1;">
                        </div>
                    </div>
                    ${!isImage && !isVideo ? `
                    <div class="property-item">
                        <label><i class="fas fa-circle"></i> Цвет фона</label>
                        <div class="color-picker-wrapper">
                            <input type="color" id="el-bg-color" value="${currentBgColor}" oninput="updateElementBgColor(this.value)">
                            <input type="text" id="el-bg-color-text" value="${currentBgColor}" onchange="updateElementBgColor(this.value)" style="flex:1;">
                        </div>
                    </div>
                    ` : ''}
                    ${isText || isButton ? `
                    <div class="property-item">
                        <label><i class="fas fa-tint"></i> Прозрачность текста</label>
                        <div class="range-wrapper">
                            <input type="range" id="el-opacity" min="0" max="100" value="${Math.round(parseFloat(computedStyle.opacity) * 100)}" oninput="updateElementOpacity(this.value)">
                            <span class="range-value" id="el-opacity-value">${Math.round(parseFloat(computedStyle.opacity) * 100)}%</span>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>

        <!-- Шрифт и типографика -->
        ${(isText || isButton) ? `
        <div class="property-accordion">
            <div class="accordion-item" data-accordion="el-font">
                <div class="accordion-item-header" onclick="togglePropertyAccordion('el-font')">
                    <i class="fas fa-chevron-right"></i>
                    <i class="fas fa-font" style="color:var(--secondary);"></i>
                    <span>Шрифт и типографика</span>
                </div>
                <div class="accordion-content" id="accordion-el-font">
                    <div class="property-row">
                        <div class="property-item">
                            <label>Размер шрифта</label>
                            <input type="text" id="el-font-size" value="${computedStyle.fontSize}" onchange="updateElementStyle('fontSize', this.value)" placeholder="16px">
                        </div>
                        <div class="property-item">
                            <label>Вес шрифта</label>
                            <select id="el-font-weight" onchange="updateElementStyle('fontWeight', this.value)">
                                <option value="300" ${computedStyle.fontWeight == '300' ? 'selected' : ''}>Light</option>
                                <option value="400" ${computedStyle.fontWeight == '400' ? 'selected' : ''}>Normal</option>
                                <option value="500" ${computedStyle.fontWeight == '500' ? 'selected' : ''}>Medium</option>
                                <option value="600" ${computedStyle.fontWeight == '600' ? 'selected' : ''}>SemiBold</option>
                                <option value="700" ${computedStyle.fontWeight == '700' ? 'selected' : ''}>Bold</option>
                                <option value="800" ${computedStyle.fontWeight == '800' ? 'selected' : ''}>ExtraBold</option>
                            </select>
                        </div>
                    </div>
                    <div class="property-item">
                        <label>Семейство шрифтов</label>
                        <select id="el-font-family" onchange="updateElementStyle('fontFamily', this.value)">
                            <option value="inherit" ${computedStyle.fontFamily.includes('inherit') ? 'selected' : ''}>Наследовать</option>
                            <option value="'Inter', sans-serif" ${computedStyle.fontFamily.includes('Inter') ? 'selected' : ''}>Inter</option>
                            <option value="Arial, sans-serif" ${computedStyle.fontFamily.includes('Arial') ? 'selected' : ''}>Arial</option>
                            <option value="'Times New Roman', serif" ${computedStyle.fontFamily.includes('Times') ? 'selected' : ''}>Times New Roman</option>
                            <option value="'Courier New', monospace" ${computedStyle.fontFamily.includes('Courier') ? 'selected' : ''}>Courier New</option>
                            <option value="Georgia, serif" ${computedStyle.fontFamily.includes('Georgia') ? 'selected' : ''}>Georgia</option>
                            <option value="Verdana, sans-serif" ${computedStyle.fontFamily.includes('Verdana') ? 'selected' : ''}>Verdana</option>
                        </select>
                    </div>
                    <div class="property-row">
                        <div class="property-item">
                            <label>Межбуквенный интервал</label>
                            <input type="text" id="el-letter-spacing" value="${computedStyle.letterSpacing}" onchange="updateElementStyle('letterSpacing', this.value)" placeholder="normal">
                        </div>
                        <div class="property-item">
                            <label>Межстрочный интервал</label>
                            <input type="text" id="el-line-height" value="${computedStyle.lineHeight}" onchange="updateElementStyle('lineHeight', this.value)" placeholder="normal">
                        </div>
                    </div>
                    <div class="property-item">
                        <label>Выравнивание текста</label>
                        <div style="display:flex;gap:4px;">
                            <button class="btn btn-ghost" onclick="updateElementStyle('textAlign', 'left')" style="flex:1;"><i class="fas fa-align-left"></i></button>
                            <button class="btn btn-ghost" onclick="updateElementStyle('textAlign', 'center')" style="flex:1;"><i class="fas fa-align-center"></i></button>
                            <button class="btn btn-ghost" onclick="updateElementStyle('textAlign', 'right')" style="flex:1;"><i class="fas fa-align-right"></i></button>
                            <button class="btn btn-ghost" onclick="updateElementStyle('textAlign', 'justify')" style="flex:1;"><i class="fas fa-align-justify"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        ` : ''}

        <!-- Размер и отступы -->
        <div class="property-accordion">
            <div class="accordion-item" data-accordion="el-size">
                <div class="accordion-item-header" onclick="togglePropertyAccordion('el-size')">
                    <i class="fas fa-chevron-right"></i>
                    <i class="fas fa-expand-arrows-alt" style="color:var(--primary);"></i>
                    <span>Размер и отступы</span>
                </div>
                <div class="accordion-content" id="accordion-el-size">
                    <div class="property-row">
                        <div class="property-item">
                            <label>Ширина</label>
                            <input type="text" id="el-width" value="${el.style.width || 'auto'}" onchange="updateElementStyleWithFormula('width', this.value)" placeholder="auto">
                        </div>
                        <div class="property-item">
                            <label>Высота</label>
                            <input type="text" id="el-height" value="${el.style.height || 'auto'}" onchange="updateElementStyleWithFormula('height', this.value)" placeholder="auto">
                        </div>
                    </div>
                    <div class="property-item">
                        <label>Padding (отступы внутри)</label>
                        <input type="text" id="el-padding" value="${el.style.padding || ''}" onchange="updateElementStyleWithFormula('padding', this.value)" placeholder="10px или 10px 20px">
                    </div>
                    <div class="property-item">
                        <label>Margin (отступы снаружи)</label>
                        <input type="text" id="el-margin" value="${el.style.margin || ''}" onchange="updateElementStyleWithFormula('margin', this.value)" placeholder="10px или 10px auto">
                    </div>
                    <div class="property-item">
                        <label>Border Radius (скругление)</label>
                        <input type="text" id="el-border-radius" value="${el.style.borderRadius || ''}" onchange="updateElementStyleWithFormula('borderRadius', this.value)" placeholder="8px">
                    </div>
                </div>
            </div>
        </div>

        <!-- Обводка (Border) -->
        <div class="property-accordion">
            <div class="accordion-item" data-accordion="el-border">
                <div class="accordion-item-header" onclick="togglePropertyAccordion('el-border')">
                    <i class="fas fa-chevron-right"></i>
                    <i class="fas fa-square" style="color:var(--gray-light);"></i>
                    <span>Обводка (Border)</span>
                </div>
                <div class="accordion-content" id="accordion-el-border">
                    <div class="property-row">
                        <div class="property-item">
                            <label>Толщина</label>
                            <input type="text" id="el-border-width" value="${el.style.borderWidth || '0'}" onchange="updateElementStyleWithFormula('borderWidth', this.value)" placeholder="0">
                        </div>
                        <div class="property-item">
                            <label>Стиль</label>
                            <select id="el-border-style" onchange="updateElementBorder()">
                                <option value="none" ${el.style.borderStyle === 'none' ? 'selected' : ''}>Нет</option>
                                <option value="solid" ${el.style.borderStyle === 'solid' ? 'selected' : ''}>Solid</option>
                                <option value="dashed" ${el.style.borderStyle === 'dashed' ? 'selected' : ''}>Dashed</option>
                                <option value="dotted" ${el.style.borderStyle === 'dotted' ? 'selected' : ''}>Dotted</option>
                                <option value="double" ${el.style.borderStyle === 'double' ? 'selected' : ''}>Double</option>
                            </select>
                        </div>
                    </div>
                    <div class="property-item">
                        <label>Цвет обводки</label>
                        <div class="color-picker-wrapper">
                            <input type="color" id="el-border-color" value="${rgbToHex(el.style.borderColor) || '#6366f1'}" oninput="updateElementBorder()">
                            <input type="text" id="el-border-color-text" value="${rgbToHex(el.style.borderColor) || '#6366f1'}" onchange="updateElementBorder()" style="flex:1;">
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Эффекты (тени, трансформации) -->
        <div class="property-accordion">
            <div class="accordion-item" data-accordion="el-effects">
                <div class="accordion-item-header" onclick="togglePropertyAccordion('el-effects')">
                    <i class="fas fa-chevron-right"></i>
                    <i class="fas fa-magic" style="color:var(--warning);"></i>
                    <span>Эффекты</span>
                </div>
                <div class="accordion-content" id="accordion-el-effects">
                    <div class="property-item">
                        <label><i class="fas fa-shadow"></i> Тень (box-shadow)</label>
                        <input type="text" id="el-box-shadow" value="${el.style.boxShadow || 'none'}" onchange="updateElementStyle('boxShadow', this.value)" placeholder="0 4px 12px rgba(0,0,0,0.1)">
                    </div>
                    <div class="property-item">
                        <label><i class="fas fa-text-shadow"></i> Тень текста</label>
                        <input type="text" id="el-text-shadow" value="${el.style.textShadow || 'none'}" onchange="updateElementStyle('textShadow', this.value)" placeholder="1px 1px 2px rgba(0,0,0,0.3)">
                    </div>
                    <div class="property-item">
                        <label><i class="fas fa-sync"></i> Трансформация</label>
                        <input type="text" id="el-transform" value="${el.style.transform || 'none'}" onchange="updateElementStyle('transform', this.value)" placeholder="rotate(0deg) scale(1)">
                    </div>
                    <div class="property-item">
                        <label><i class="fas fa-clock"></i> Transition (анимация)</label>
                        <input type="text" id="el-transition" value="${el.style.transition || 'all 0.3s ease'}" onchange="updateElementStyle('transition', this.value)" placeholder="all 0.3s ease">
                    </div>
                </div>
            </div>
        </div>

        <!-- Image Filters (унифицировано для изображений, лого, иконок) -->
        ${(isImage || isIcon) ? `
        <div class="property-accordion">
            <div class="accordion-item expanded" data-accordion="el-filters">
                <div class="accordion-item-header" onclick="togglePropertyAccordion('el-filters')">
                    <i class="fas fa-chevron-down"></i>
                    <i class="fas fa-sliders-h" style="color:var(--accent);"></i>
                    <span>Image Filters</span>
                </div>
                <div class="accordion-content expanded" id="accordion-el-filters">
                    <div class="property-item">
                        <label><i class="fas fa-sun"></i> Яркость</label>
                        <div class="range-wrapper">
                            <input type="range" id="el-brightness" min="0" max="200" value="${parseInt(computedStyle.filter.match(/brightness\((\d+)%\)/)?.[1] || 100)}" oninput="updateElementFilters()">
                            <span class="range-value" id="el-brightness-value">${parseInt(computedStyle.filter.match(/brightness\((\d+)%\)/)?.[1] || 100)}%</span>
                        </div>
                    </div>
                    <div class="property-item">
                        <label><i class="fas fa-adjust"></i> Контраст</label>
                        <div class="range-wrapper">
                            <input type="range" id="el-contrast" min="0" max="200" value="${parseInt(computedStyle.filter.match(/contrast\((\d+)%\)/)?.[1] || 100)}" oninput="updateElementFilters()">
                            <span class="range-value" id="el-contrast-value">${parseInt(computedStyle.filter.match(/contrast\((\d+)%\)/)?.[1] || 100)}%</span>
                        </div>
                    </div>
                    <div class="property-item">
                        <label><i class="fas fa-palette"></i> Насыщенность</label>
                        <div class="range-wrapper">
                            <input type="range" id="el-saturate" min="0" max="200" value="${parseInt(computedStyle.filter.match(/saturate\((\d+)%\)/)?.[1] || 100)}" oninput="updateElementFilters()">
                            <span class="range-value" id="el-saturate-value">${parseInt(computedStyle.filter.match(/saturate\((\d+)%\)/)?.[1] || 100)}%</span>
                        </div>
                    </div>
                    <div class="property-item">
                        <label><i class="fas fa-droplet"></i> Сепия</label>
                        <div class="range-wrapper">
                            <input type="range" id="el-sepia" min="0" max="100" value="${parseInt(computedStyle.filter.match(/sepia\((\d+)%\)/)?.[1] || 0)}" oninput="updateElementFilters()">
                            <span class="range-value" id="el-sepia-value">${parseInt(computedStyle.filter.match(/sepia\((\d+)%\)/)?.[1] || 0)}%</span>
                        </div>
                    </div>
                    <div class="property-item">
                        <label><i class="fas fa-circle-half-stroke"></i> Инверсия</label>
                        <div class="range-wrapper">
                            <input type="range" id="el-invert" min="0" max="100" value="${parseInt(computedStyle.filter.match(/invert\((\d+)%\)/)?.[1] || 0)}" oninput="updateElementFilters()">
                            <span class="range-value" id="el-invert-value">${parseInt(computedStyle.filter.match(/invert\((\d+)%\)/)?.[1] || 0)}%</span>
                        </div>
                    </div>
                    <div class="property-item">
                        <label><i class="fas fa-magic"></i> Размытие</label>
                        <div class="range-wrapper">
                            <input type="range" id="el-blur" min="0" max="10" value="${parseInt(computedStyle.filter.match(/blur\((\d+)px\)/)?.[1] || 0)}" step="0.5" oninput="updateElementFilters()">
                            <span class="range-value" id="el-blur-value">${parseInt(computedStyle.filter.match(/blur\((\d+)px\)/)?.[1] || 0)}px</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        ` : ''}

        <!-- Иконки: библиотека с поиском -->
        ${isIcon ? `
        <div class="property-accordion">
            <div class="accordion-item" data-accordion="el-icon-library">
                <div class="accordion-item-header" onclick="togglePropertyAccordion('el-icon-library')">
                    <i class="fas fa-chevron-right"></i>
                    <i class="fas fa-icons" style="color:var(--primary-light);"></i>
                    <span>Библиотека иконок</span>
                </div>
                <div class="accordion-content" id="accordion-el-icon-library">
                    <div class="search-box" style="margin-bottom:12px;">
                        <i class="fas fa-search"></i>
                        <input type="text" id="icon-search-input" placeholder="Поиск иконок..." oninput="renderIconLibrary(this.value)">
                    </div>
                    <div class="icon-library-grid" id="icon-library-grid" style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;max-height:300px;overflow-y:auto;">
                        ${renderIconLibraryItems()}
                    </div>
                </div>
            </div>
        </div>
        ` : ''}

        <!-- Действия -->
        <div class="property-accordion">
            <div class="accordion-item" data-accordion="el-actions">
                <div class="accordion-item-header" onclick="togglePropertyAccordion('el-actions')">
                    <i class="fas fa-chevron-right"></i>
                    <i class="fas fa-check-circle" style="color:var(--success);"></i>
                    <span>Действия</span>
                </div>
                <div class="accordion-content" id="accordion-el-actions">
                    <button class="btn btn-primary" onclick="saveToHistory(); showToast('Изменения сохранены', 'success')" style="width:calc(100% - 40px);margin:12px 20px;">
                        <i class="fas fa-save"></i> Сохранить изменения
                    </button>
                    <button class="btn btn-outline" onclick="deleteElement('${state.selectedSection.id}', '${element.id}')" style="width:calc(100% - 40px);margin:0 20px 12px;">
                        <i class="fas fa-trash"></i> Удалить элемент
                    </button>
                </div>
            </div>
        </div>
    `;

    setupColorPicker('el-color', 'el-color-text');
    setupColorPicker('el-bg-color', 'el-bg-color-text');
    setupColorPicker('el-border-color', 'el-border-color-text');
}

function renderIconLibraryItems(searchQuery = '') {
    const query = searchQuery.toLowerCase();
    const filtered = ICON_LIBRARY.filter(icon => 
        icon.name.toLowerCase().includes(query) || 
        icon.tags.some(tag => tag.toLowerCase().includes(query))
    );
    
    return filtered.slice(0, 50).map(icon => `
        <div class="icon-item" onclick="selectIcon('${icon.icon}')" style="display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(255,255,255,0.03);border:1px solid var(--glass-border);border-radius:8px;cursor:pointer;" title="${icon.name}">
            <i class="fas ${icon.icon}" style="font-size:20px;color:var(--light);"></i>
        </div>
    `).join('');
}

window.renderIconLibrary = function(searchQuery) {
    const grid = document.getElementById('icon-library-grid');
    if (grid) {
        grid.innerHTML = renderIconLibraryItems(searchQuery);
    }
};

window.selectIcon = function(iconClass) {
    if (state.selectedElement && state.selectedElement.element) {
        const el = state.selectedElement.element;
        el.className = '';
        el.classList.add('fas', iconClass);
        saveToHistory();
        showToast(`Иконка "${iconClass}" применена`, 'success');
    }
};

window.togglePropertyAccordion = function(name) {
    const item = document.querySelector(`.accordion-item[data-accordion="${name}"]`);
    if (!item) return;

    const content = document.getElementById(`accordion-${name}`);
    const chevron = item.querySelector('.accordion-item-header i:first-child');
    const isExpanded = content.classList.contains('expanded');

    if (isExpanded) {
        content.classList.remove('expanded');
        content.style.maxHeight = '0';
        chevron.classList.remove('fa-chevron-down');
        chevron.classList.add('fa-chevron-right');
    } else {
        content.classList.add('expanded');
        content.style.maxHeight = content.scrollHeight + 'px';
        chevron.classList.remove('fa-chevron-right');
        chevron.classList.add('fa-chevron-down');
    }
};
