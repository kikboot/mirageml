document.addEventListener('DOMContentLoaded', function () {
    const DOM = {
        canvas: document.getElementById('canvas'),
        elementsPanel: document.querySelector('.elements-panel'),
        propertiesForm: document.getElementById('properties-form'),
        layersList: document.getElementById('layers-list'),
        modals: {
            export: document.getElementById('export-modal'),
            preview: document.getElementById('preview-modal'),
            help: document.getElementById('help-modal'),
            imageUpload: document.getElementById('image-upload-modal')
        },
        buttons: {
            export: document.getElementById('export-btn'),
            preview: document.getElementById('preview-btn'),
            clear: document.getElementById('clear-btn'),
            applyProps: document.getElementById('apply-properties'),
            deleteEl: document.getElementById('delete-element'),
            copyHtml: document.getElementById('copy-html'),
            copyCss: document.getElementById('copy-css'),
            downloadZip: document.getElementById('download-zip'),
            showHelp: document.getElementById('show-help'),
            uploadImage: document.getElementById('upload-image-btn'),
            confirmImageUpload: document.getElementById('confirm-image-upload'),
            cancelImageUpload: document.getElementById('cancel-image-upload')
        },
        inputs: {
            text: document.getElementById('element-text'),
            width: document.getElementById('element-width'),
            height: document.getElementById('element-height'),
            bgColor: document.getElementById('element-bg-color'),
            textColor: document.getElementById('element-text-color'),
            fontSize: document.getElementById('element-font-size'),
            padding: document.getElementById('element-padding'),
            border: document.getElementById('element-border'),
            rotation: document.getElementById('element-rotation'),
            imageUpload: document.getElementById('image-upload-input'),
            imagePreview: document.getElementById('image-preview'),
            imageWidth: document.getElementById('image-width'),
            imageHeight: document.getElementById('image-height')
        },
        outputs: {
            html: document.getElementById('export-html'),
            css: document.getElementById('export-css')
        },
        previewFrame: document.getElementById('preview-frame')
    };

    const state = {
        elements: [],
        selectedElement: null,
        dragState: {
            isDragging: false,
            isResizing: false,
            isRotating: false,
            direction: null,
            startX: 0,
            startY: 0,
            startWidth: 0,
            startHeight: 0,
            startLeft: 0,
            startTop: 0,
            startAngle: 0
        },
        imageUpload: {
            file: null,
            url: null
        }
    };

    let currentProjectId = null;

    function init() {
        // Проверяем авторизацию
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Требуется авторизация', 'error');
            setTimeout(() => window.location.href = '../main/index.html', 1500);
            return;
        }

        // Получаем ID проекта из URL
        const urlParams = new URLSearchParams(window.location.search);
        currentProjectId = urlParams.get('project');

        // Инициализация интерфейса
        setupDragAndDrop();
        setupEventListeners();
        setupElementTemplates();
        setupHelpSystem();
        setupImageUpload();

        // Загружаем проект если есть ID
        if (currentProjectId) {
            loadProject(currentProjectId)
                .catch(error => {
                    console.error('Ошибка загрузки проекта:', error);
                    showToast('Не удалось загрузить проект', 'error');
                });
        }

        console.log('MirageML Editor initialized');
    }

    async function loadProject(projectId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/projects/${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Ошибка загрузки проекта');

            const project = await response.json();

            // Очищаем текущий холст
            clearCanvas();

            // Восстанавливаем элементы
            if (project.elements && Object.keys(project.elements).length > 0) {
                Object.values(project.elements).forEach(elData => {
                    const element = createElement(elData.type, elData.x, elData.y);

                    // Восстанавливаем свойства
                    element.element.style.width = `${elData.width}px`;
                    element.element.style.height = `${elData.height}px`;
                    element.element.style.backgroundColor = elData.backgroundColor;
                    element.element.style.color = elData.textColor;
                    element.element.style.fontSize = elData.fontSize;
                    element.element.style.padding = elData.padding;
                    element.element.style.border = elData.border;
                    element.element.style.transform = `rotate(${elData.rotation}deg)`;

                    if (elData.text) {
                        element.element.textContent = elData.text;
                    }

                    if (elData.type === 'img' && elData.imageUrl) {
                        element.element.style.backgroundImage = `url(${elData.imageUrl})`;
                        element.imageUrl = elData.imageUrl;
                    }

                    // Обновляем имя в данных элемента
                    element.name = elData.name || elData.type;

                    // Обновляем имя в интерфейсе слоёв
                    const layerItem = document.querySelector(`.layer-item[data-id="${element.id}"]`);
                    if (layerItem) {
                        const layerName = layerItem.querySelector('.layer-name');
                        const layerRename = layerItem.querySelector('.layer-rename');
                        if (layerName) layerName.textContent = element.name;
                        if (layerRename) layerRename.value = element.name;
                    }
                });
            }

            return project;
        } catch (error) {
            console.error('Ошибка загрузки проекта:', error);
            showToast(error.message, 'error');
        }
    }

    async function saveProject() {
        if (!currentProjectId) {
            showToast('Сначала создайте проект', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                showToast('Требуется авторизация', 'error');
                window.location.href = '../main/index.html';
                return;
            }

            const elementsData = {};

            // Собираем данные всех элементов
            state.elements.forEach(el => {
                // Находим соответствующий элемент в DOM слоёв
                const layerItem = document.querySelector(`.layer-item[data-id="${el.id}"]`);
                const layerName = layerItem ?
                    (layerItem.querySelector('.layer-rename')?.value ||
                        layerItem.querySelector('.layer-name')?.textContent) :
                    el.name;

                elementsData[el.id] = {
                    id: el.id,
                    type: el.type,
                    name: layerName || el.type, // Используем имя из слоёв
                    x: parseInt(el.element.style.left) || 0,
                    y: parseInt(el.element.style.top) || 0,
                    width: parseInt(el.element.style.width) || 100,
                    height: parseInt(el.element.style.height) || 100,
                    rotation: el.rotation || 0,
                    backgroundColor: el.element.style.backgroundColor || '',
                    textColor: el.element.style.color || '',
                    fontSize: el.element.style.fontSize || '',
                    padding: el.element.style.padding || '',
                    border: el.element.style.border || '',
                    text: el.element.textContent || '',
                    imageUrl: el.imageUrl || null
                };
            });

            // Отправляем на сервер
            const response = await fetch(`http://localhost:3001/api/projects/${currentProjectId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ elements: elementsData })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Ошибка сервера');
            }

            showToast('Проект успешно сохранён', 'success');
            return await response.json();
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            showToast(error.message, 'error');
            throw error;
        }
    }

    function showToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function setupImageUpload() {
        DOM.buttons.uploadImage.addEventListener('click', () => {
            DOM.modals.imageUpload.style.display = 'flex';
            DOM.modals.imageUpload.style.zIndex = '10000';
            DOM.inputs.imageUpload.value = '';
            DOM.inputs.imagePreview.innerHTML = 'Изображение не выбрано';
            DOM.inputs.imagePreview.style.backgroundImage = 'none';
            DOM.inputs.imageWidth.value = '';
            DOM.inputs.imageHeight.value = '';
            state.imageUpload.file = null;
            state.imageUpload.url = null;
        });

        DOM.buttons.cancelImageUpload.addEventListener('click', () => {
            DOM.modals.imageUpload.style.display = 'none';
        });

        DOM.inputs.imageUpload.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (!file) return;

            if (!file.type.match('image.*')) {
                alert('Пожалуйста, выберите файл изображения (JPEG, PNG, GIF)');
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                state.imageUpload.file = file;
                state.imageUpload.url = e.target.result;

                DOM.inputs.imagePreview.innerHTML = '';
                DOM.inputs.imagePreview.style.backgroundImage = `url(${e.target.result})`;
                DOM.inputs.imagePreview.style.backgroundSize = 'contain';
                DOM.inputs.imagePreview.style.backgroundRepeat = 'no-repeat';
                DOM.inputs.imagePreview.style.backgroundPosition = 'center';

                const img = new Image();
                img.onload = function () {
                    DOM.inputs.imageWidth.value = this.width;
                    DOM.inputs.imageHeight.value = this.height;
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });

        DOM.buttons.confirmImageUpload.addEventListener('click', function () {
            if (!state.imageUpload.url) {
                alert('Пожалуйста, выберите изображение');
                return;
            }

            const width = parseInt(DOM.inputs.imageWidth.value) || 200;
            const height = parseInt(DOM.inputs.imageHeight.value) || 200;

            const elementData = createElement('img');
            const element = elementData.element;

            element.style.backgroundImage = `url(${state.imageUpload.url})`;
            element.style.backgroundSize = 'contain';
            element.style.backgroundRepeat = 'no-repeat';
            element.style.backgroundPosition = 'center';
            element.style.width = `${width}px`;
            element.style.height = `${height}px`;

            elementData.width = width;
            elementData.height = height;
            elementData.imageUrl = state.imageUpload.url;
            elementData.imageFile = state.imageUpload.file;

            DOM.modals.imageUpload.style.display = 'none';
            selectElement(elementData);
        });
    }

    function setupElementTemplates() {
        document.querySelectorAll('.element-item').forEach(item => {
            const type = item.dataset.type;
            item.addEventListener('click', () => createElement(type));
        });
    }

    function createElement(type, x, y) {
        const template = getElementTemplate(type);
        const element = document.createElement(template.tag);
        const id = `element-${Date.now()}`;

        element.className = 'canvas-element';
        element.id = id;
        element.draggable = false;

        const canvasRect = DOM.canvas.getBoundingClientRect();
        x = x || canvasRect.width / 2 - 50;
        y = y || canvasRect.height / 2 - 25;

        Object.assign(element.style, {
            position: 'absolute',
            left: `${x}px`,
            top: `${y}px`,
            zIndex: state.elements.length + 1,
            backgroundColor: type === 'line' || type === 'arrow' ? 'transparent' : ''
        });

        if (type === 'line' || type === 'arrow') {
            element.textContent = '';
        }

        applyElementTemplate(element, type);

        DOM.canvas.appendChild(element);

        const elementData = {
            id,
            element,
            type,
            name: type,
            x,
            y,
            width: parseInt(element.style.width) || 100,
            height: parseInt(element.style.height) || (type === 'line' ? 2 : 20),
            rotation: 0
        };

        state.elements.push(elementData);
        addToLayersList(elementData);
        setupElementEvents(element, elementData);
        selectElement(elementData);

        return elementData;
    }

    function getElementTemplate(type) {
        const templates = {
            div: { tag: 'div' },
            button: { tag: 'button' },
            p: { tag: 'p' },
            img: { tag: 'div' },
            line: { tag: 'div' },
            arrow: { tag: 'div' },
            ellipse: { tag: 'div' }
        };
        return templates[type];
    }

    function applyElementTemplate(element, type) {
        const templates = {
            div: {
                text: '',
                styles: {
                    backgroundColor: '#f0f0f0',
                    width: '100px',
                    height: '100px',
                    cursor: 'move'
                }
            },
            button: {
                text: 'Кнопка',
                styles: {
                    backgroundColor: '#4a6bff',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    width: 'auto',
                    height: 'auto'
                }
            },
            p: {
                text: 'Текст абзаца',
                styles: {
                    margin: '0',
                    padding: '5px',
                    width: '200px',
                    cursor: 'text'
                }
            },
            img: {
                text: '',
                styles: {
                    backgroundColor: '#e0e0e0',
                    width: '150px',
                    height: '150px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'move'
                }
            },
            line: {
                text: '',
                styles: {
                    width: '100px',
                    height: '2px',
                    backgroundColor: '#000',
                    cursor: 'move'
                }
            },
            arrow: {
                text: '',
                styles: {
                    position: 'relative',
                    width: '100px',
                    height: '20px',
                    backgroundColor: 'transparent',
                    cursor: 'move'
                },
                markup: `
                    <div class="arrow-line" style="position:absolute; width:80%; height:2px; background:#000; top:50%; left:0; transform:translateY(-50%);"></div>
                    <div class="arrow-head" style="position:absolute; width:0; height:0; border-left:10px solid #000; border-top:5px solid transparent; border-bottom:5px solid transparent; right:0; top:50%; transform:translateY(-50%);"></div>
                `
            },
            ellipse: {
                text: '',
                styles: {
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: '#4a6bff',
                    cursor: 'move'
                }
            }
        };

        const template = templates[type];
        if (!template) return;

        if (template.text !== undefined) {
            element.textContent = template.text;
        }

        if (template.styles) {
            Object.assign(element.style, template.styles);
        }

        if (template.markup) {
            element.innerHTML = template.markup;
        }

        if (type === 'line') {
            element.classList.add('line-element');
        }
    }

    function setupElementEvents(element, elementData) {
        element.addEventListener('dblclick', function (e) {
            e.stopPropagation();

            const nonTextElements = ['img', 'line', 'arrow', 'ellipse'];
            if (nonTextElements.includes(elementData.type)) return;

            const currentText = element.textContent || '';
            const text = prompt('Введите текст:', currentText);
            if (text !== null) {
                element.textContent = text;
                updatePropertiesForm(elementData);
            }
        });

        element.addEventListener('mousedown', function (e) {
            e.stopPropagation();

            bringToFront(element);
            selectElement(elementData);

            const handle = e.target.closest('.resize-handle');
            const rotateHandle = e.target.closest('.rotate-handle');

            if (handle) {
                state.dragState.isResizing = true;
                state.dragState.direction = handle.dataset.direction;
                state.dragState.startWidth = element.offsetWidth;
                state.dragState.startHeight = element.offsetHeight;
            }
            else if (rotateHandle) {
                state.dragState.isRotating = true;
                state.dragState.startAngle = elementData.rotation || 0;

                // Получаем центр элемента
                const rect = element.getBoundingClientRect();
                state.dragState.centerX = rect.left + rect.width / 2;
                state.dragState.centerY = rect.top + rect.height / 2;
            }
            else if (e.target === element ||
                (elementData.type === 'arrow' &&
                    (e.target.classList.contains('arrow-line') ||
                        e.target.classList.contains('arrow-head')))) {
                state.dragState.isDragging = true;
            }

            state.dragState.startX = e.clientX;
            state.dragState.startY = e.clientY;
            state.dragState.startLeft = parseInt(element.style.left) || 0;
            state.dragState.startTop = parseInt(element.style.top) || 0;
        });

        createResizeHandles(element);
        createRotateHandle(element);
    }

    function createResizeHandles(element) {
        element.querySelectorAll('.resize-handle').forEach(handle => handle.remove());

        const directions = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];

        directions.forEach(dir => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${dir}`;
            handle.dataset.direction = dir;
            handle.title = `Resize (${dir.toUpperCase()})`;

            if (dir.length === 1) {
                handle.style.cursor = `${dir}-resize`;
            } else {
                handle.style.cursor = `${dir}-resize`;
            }

            element.appendChild(handle);
        });
    }

    function createRotateHandle(element) {
        element.querySelectorAll('.rotate-handle').forEach(handle => handle.remove());

        const handle = document.createElement('div');
        handle.className = 'rotate-handle';
        handle.title = 'Rotate';
        handle.style.cursor = 'grab';
        handle.style.position = 'absolute';
        handle.style.right = '-25px';
        handle.style.top = '50%';
        handle.style.transform = 'translateY(-50%)';
        handle.style.width = '20px';
        handle.style.height = '20px';
        handle.style.backgroundColor = '#4a6bff';
        handle.style.borderRadius = '50%';
        handle.style.display = 'flex';
        handle.style.alignItems = 'center';
        handle.style.justifyContent = 'center';
        handle.style.color = 'white';
        handle.innerHTML = '<i class="fas fa-sync-alt" style="font-size: 10px;"></i>';

        element.appendChild(handle);
    }

    function setupEventListeners() {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        DOM.buttons.export.addEventListener('click', showExportModal);
        DOM.buttons.preview.addEventListener('click', showPreviewModal);
        DOM.buttons.clear.addEventListener('click', clearCanvas);
        DOM.buttons.applyProps.addEventListener('click', applyProperties);
        DOM.buttons.deleteEl.addEventListener('click', deleteSelectedElement);
        DOM.buttons.copyHtml.addEventListener('click', copyHtml);
        DOM.buttons.copyCss.addEventListener('click', copyCss);
        DOM.buttons.downloadZip.addEventListener('click', downloadZip);
        DOM.buttons.showHelp.addEventListener('click', () => {
            DOM.modals.help.style.display = 'flex';
            DOM.modals.help.style.zIndex = '10000';
        });

        // Создаем кнопку сохранения (если её нет)
        if (!document.getElementById('save-btn')) {
            const saveBtn = document.createElement('button');
            saveBtn.id = 'save-btn';
            saveBtn.className = 'btn primary';
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Сохранить';
            document.querySelector('.header-controls').prepend(saveBtn);
        }

        // Обработчик клика по кнопке сохранения
        document.getElementById('save-btn').addEventListener('click', async () => {
            const saveBtn = document.getElementById('save-btn');
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';

            try {
                await saveProject();
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fas fa-save"></i> Сохранить';
            }
        });

        DOM.inputs.bgColor.addEventListener('input', function () {
            if (state.selectedElement) {
                state.selectedElement.element.style.backgroundColor = this.value;
            }
        });

        DOM.inputs.textColor.addEventListener('input', function () {
            if (state.selectedElement) {
                state.selectedElement.element.style.color = this.value;
            }
        });

        DOM.inputs.rotation.addEventListener('input', function () {
            if (state.selectedElement) {
                const angle = parseInt(this.value) || 0;
                state.selectedElement.element.style.transform = `rotate(${angle}deg)`;
                state.selectedElement.rotation = angle;
            }
        });

        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                Object.values(DOM.modals).forEach(modal => {
                    modal.style.display = 'none';
                });
            });
        });

        window.addEventListener('click', (e) => {
            Object.values(DOM.modals).forEach(modal => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });

        DOM.canvas.addEventListener('mousedown', (e) => {
            if (e.target === DOM.canvas) {
                deselectElement();
            }
        });
    }

    function setupHelpSystem() {
        DOM.buttons.showHelp.addEventListener('click', () => {
            DOM.modals.help.style.display = 'flex';
            DOM.modals.help.style.zIndex = '10000';
        });
    }

    function handleMouseMove(e) {
        if (!state.selectedElement) return;

        const element = state.selectedElement.element;
        const dx = e.clientX - state.dragState.startX;
        const dy = e.clientY - state.dragState.startY;

        if (state.dragState.isDragging) {
            const newLeft = state.dragState.startLeft + dx;
            const newTop = state.dragState.startTop + dy;

            element.style.left = `${newLeft}px`;
            element.style.top = `${newTop}px`;

            state.selectedElement.x = newLeft;
            state.selectedElement.y = newTop;

            updatePropertiesForm(state.selectedElement);
        }
        else if (state.dragState.isResizing) {
            let newWidth = state.dragState.startWidth;
            let newHeight = state.dragState.startHeight;
            let newLeft = state.dragState.startLeft;
            let newTop = state.dragState.startTop;

            switch (state.dragState.direction) {
                case 'nw':
                    newWidth = Math.max(20, state.dragState.startWidth - dx);
                    newHeight = Math.max(20, state.dragState.startHeight - dy);
                    newLeft = state.dragState.startLeft + dx;
                    newTop = state.dragState.startTop + dy;
                    break;
                case 'n':
                    newHeight = Math.max(20, state.dragState.startHeight - dy);
                    newTop = state.dragState.startTop + dy;
                    break;
                case 'ne':
                    newWidth = Math.max(20, state.dragState.startWidth + dx);
                    newHeight = Math.max(20, state.dragState.startHeight - dy);
                    newTop = state.dragState.startTop + dy;
                    break;
                case 'w':
                    newWidth = Math.max(20, state.dragState.startWidth - dx);
                    newLeft = state.dragState.startLeft + dx;
                    break;
                case 'e':
                    newWidth = Math.max(20, state.dragState.startWidth + dx);
                    break;
                case 'sw':
                    newWidth = Math.max(20, state.dragState.startWidth - dx);
                    newHeight = Math.max(20, state.dragState.startHeight + dy);
                    newLeft = state.dragState.startLeft + dx;
                    break;
                case 's':
                    newHeight = Math.max(20, state.dragState.startHeight + dy);
                    break;
                case 'se':
                    newWidth = Math.max(20, state.dragState.startWidth + dx);
                    newHeight = Math.max(20, state.dragState.startHeight + dy);
                    break;
            }

            element.style.width = `${newWidth}px`;
            element.style.height = `${newHeight}px`;
            element.style.left = `${newLeft}px`;
            element.style.top = `${newTop}px`;

            state.selectedElement.width = newWidth;
            state.selectedElement.height = newHeight;
            state.selectedElement.x = newLeft;
            state.selectedElement.y = newTop;

            updatePropertiesForm(state.selectedElement);
        }
        else if (state.dragState.isRotating) {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI + 90;
            const roundedAngle = Math.round(angle);

            element.style.transform = `rotate(${roundedAngle}deg)`;
            state.selectedElement.rotation = roundedAngle;
            DOM.inputs.rotation.value = roundedAngle;
        }
    }

    function handleMouseUp() {
        state.dragState.isDragging = false;
        state.dragState.isResizing = false;
        state.dragState.isRotating = false;
        state.dragState.direction = null;
    }

    function setupDragAndDrop() {
        const elementItems = document.querySelectorAll('.element-item');

        elementItems.forEach(item => {
            item.addEventListener('dragstart', function (e) {
                e.dataTransfer.setData('text/plain', this.dataset.type);
            });
        });

        DOM.canvas.addEventListener('dragover', function (e) {
            e.preventDefault();
        });

        DOM.canvas.addEventListener('drop', function (e) {
            e.preventDefault();
            const type = e.dataTransfer.getData('text/plain');
            const rect = DOM.canvas.getBoundingClientRect();
            createElement(type, e.clientX - rect.left, e.clientY - rect.top);
        });
    }

    function selectElement(elementData) {
        document.querySelectorAll('.canvas-element').forEach(el => {
            el.classList.remove('selected');
        });

        elementData.element.classList.add('selected');
        state.selectedElement = elementData;

        document.querySelectorAll('.layer-item').forEach(el => {
            el.classList.remove('active');
        });

        const layerItem = document.querySelector(`.layer-item[data-id="${elementData.id}"]`);
        if (layerItem) {
            layerItem.classList.add('active');
            layerItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        updatePropertiesForm(elementData);
    }

    function deselectElement() {
        if (state.selectedElement) {
            state.selectedElement.element.classList.remove('selected');
            state.selectedElement = null;
        }

        document.querySelectorAll('.layer-item').forEach(el => {
            el.classList.remove('active');
        });

        clearPropertiesForm();
    }

    function updatePropertiesForm(elementData) {
        const element = elementData.element;

        DOM.inputs.text.value = element.textContent || '';
        DOM.inputs.width.value = element.style.width || '';
        DOM.inputs.height.value = element.style.height || '';
        DOM.inputs.bgColor.value = rgbToHex(element.style.backgroundColor) || '#ffffff';
        DOM.inputs.textColor.value = rgbToHex(element.style.color) || '#000000';
        DOM.inputs.fontSize.value = element.style.fontSize || '';
        DOM.inputs.padding.value = element.style.padding || '';
        DOM.inputs.border.value = element.style.border || '';
        DOM.inputs.rotation.value = elementData.rotation || 0;
    }

    function clearPropertiesForm() {
        DOM.inputs.text.value = '';
        DOM.inputs.width.value = '';
        DOM.inputs.height.value = '';
        DOM.inputs.bgColor.value = '#ffffff';
        DOM.inputs.textColor.value = '#000000';
        DOM.inputs.fontSize.value = '';
        DOM.inputs.padding.value = '';
        DOM.inputs.border.value = '';
        DOM.inputs.rotation.value = '0';
    }

    function applyProperties() {
        if (!state.selectedElement) return;

        const element = state.selectedElement.element;
        const elementData = state.selectedElement;

        if (DOM.inputs.text.value !== undefined) {
            element.textContent = DOM.inputs.text.value;
        }

        if (DOM.inputs.width.value) {
            element.style.width = DOM.inputs.width.value;
            elementData.width = parseInt(DOM.inputs.width.value) || 100;
        }

        if (DOM.inputs.height.value) {
            element.style.height = DOM.inputs.height.value;
            elementData.height = parseInt(DOM.inputs.height.value) || 100;
        }

        if (DOM.inputs.bgColor.value) {
            element.style.backgroundColor = DOM.inputs.bgColor.value;
        }

        if (DOM.inputs.textColor.value) {
            element.style.color = DOM.inputs.textColor.value;
        }

        if (DOM.inputs.fontSize.value) {
            element.style.fontSize = DOM.inputs.fontSize.value;
        }

        if (DOM.inputs.padding.value) {
            element.style.padding = DOM.inputs.padding.value;
        }

        if (DOM.inputs.border.value) {
            element.style.border = DOM.inputs.border.value;
        }

        if (DOM.inputs.rotation.value) {
            const angle = parseInt(DOM.inputs.rotation.value) || 0;
            element.style.transform = `rotate(${angle}deg)`;
            elementData.rotation = angle;
        }
    }

    function deleteSelectedElement() {
        if (!state.selectedElement) return;

        if (confirm('Удалить выбранный элемент?')) {
            state.selectedElement.element.remove();
            state.elements = state.elements.filter(el => el.id !== state.selectedElement.id);

            const layerItem = document.querySelector(`.layer-item[data-id="${state.selectedElement.id}"]`);
            if (layerItem) {
                layerItem.remove();
            }

            deselectElement();
        }
    }

    function addToLayersList(elementData) {
        const layerItem = document.createElement('div');
        layerItem.className = 'layer-item';
        layerItem.dataset.id = elementData.id;
        layerItem.innerHTML = `
            <i class="fas fa-${getIconForType(elementData.type)}"></i>
            <span class="layer-name">${elementData.name || elementData.type}</span>
            <input type="text" class="layer-rename" value="${elementData.name || elementData.type}" style="display:none;">
        `;

        layerItem.addEventListener('mousedown', (e) => {
            if (!e.target.classList.contains('layer-rename')) {
                bringToFront(elementData.element);
                selectElement(elementData);
            }
        });

        const layerName = layerItem.querySelector('.layer-name');
        const layerRename = layerItem.querySelector('.layer-rename');

        layerName.addEventListener('dblclick', () => {
            layerName.style.display = 'none';
            layerRename.style.display = 'inline-block';
            layerRename.focus();
        });

        layerRename.addEventListener('blur', () => {
            elementData.name = layerRename.value; // Обновляем имя в данных элемента
            finishRenaming(layerName, layerRename, elementData);
        });

        layerRename.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                elementData.name = layerRename.value; // Обновляем имя в данных элемента
                finishRenaming(layerName, layerRename, elementData);
            }
        });

        layerItem.draggable = true;

        layerItem.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', elementData.id);
            e.dataTransfer.effectAllowed = 'move';
            layerItem.classList.add('dragging');
        });

        layerItem.addEventListener('dragend', () => {
            layerItem.classList.remove('dragging');
            updateLayersOrder();
        });

        DOM.layersList.appendChild(layerItem);
    }

    function finishRenaming(layerName, layerRename, elementData) {
        layerName.style.display = 'inline-block';
        layerRename.style.display = 'none';
        layerName.textContent = layerRename.value;
        elementData.name = layerRename.value;
    }

    function updateLayersOrder() {
        const layers = Array.from(DOM.layersList.children);
        layers.forEach((layer, index) => {
            const elementId = layer.dataset.id;
            const element = state.elements.find(el => el.id === elementId);
            if (element) {
                element.element.style.zIndex = layers.length - index;
            }
        });
    }

    function getIconForType(type) {
        const icons = {
            'div': 'square',
            'button': 'square',
            'p': 'paragraph',
            'img': 'image',
            'line': 'minus',
            'arrow': 'arrow-right',
            'ellipse': 'circle'
        };
        return icons[type] || 'square';
    }

    function bringToFront(element) {
        let maxZIndex = 0;
        document.querySelectorAll('.canvas-element').forEach(el => {
            const zIndex = parseInt(el.style.zIndex) || 0;
            if (zIndex > maxZIndex) {
                maxZIndex = zIndex;
            }
        });

        element.style.zIndex = maxZIndex + 1;
        DOM.canvas.appendChild(element);
        updateLayersOrder();
    }

    function showExportModal() {
        DOM.modals.export.style.display = 'flex';
        DOM.modals.export.style.zIndex = '10000';
        generateExportCode();
    }

    function showPreviewModal() {
        DOM.modals.preview.style.display = 'flex';
        DOM.modals.preview.style.zIndex = '10000';
        generatePreview();
    }

    function generateExportCode() {
        let htmlCode = `<!DOCTYPE html>\n<html lang="ru">\n<head>\n`;
        htmlCode += `    <meta charset="UTF-8">\n`;
        htmlCode += `    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n`;
        htmlCode += `    <title>Мой сайт</title>\n`;
        htmlCode += `    <link rel="stylesheet" href="styles.css">\n`;
        htmlCode += `</head>\n<body>\n`;
        htmlCode += `    <div class="container">\n`;

        state.elements.forEach(el => {
            const element = el.element;
            const tag = el.type === 'img' ? 'div' : el.type;

            htmlCode += `        <${tag} id="${element.id}" class="${element.className.replace('canvas-element', '').trim()}"`;

            if (el.rotation) {
                htmlCode += ` style="transform: rotate(${el.rotation}deg)"`;
            }

            htmlCode += `>`;

            if (el.type !== 'img') {
                htmlCode += escapeHtml(element.textContent);
            }

            htmlCode += `</${tag}>\n`;
        });

        htmlCode += `    </div>\n</body>\n</html>`;

        DOM.outputs.html.value = htmlCode;

        let cssCode = `/* Основные стили */\n`;
        cssCode += `body {\n    margin: 0;\n    padding: 0;\n    font-family: Arial, sans-serif;\n}\n\n`;
        cssCode += `.container {\n    position: relative;\n    width: 100%;\n    min-height: 100vh;\n}\n\n`;

        state.elements.forEach(el => {
            const element = el.element;
            const styles = getElementStyles(element);

            cssCode += `#${element.id} {\n`;
            styles.split(';').forEach(prop => {
                if (prop.trim()) {
                    cssCode += `    ${prop.trim()};\n`;
                }
            });

            if (el.type === 'img' && el.imageUrl) {
                cssCode += `    background-image: url(${el.imageUrl.includes('data:') ? el.imageUrl : 'images/' + el.imageFile.name});\n`;
                cssCode += `    background-size: contain;\n`;
                cssCode += `    background-repeat: no-repeat;\n`;
                cssCode += `    background-position: center;\n`;
            }

            if (el.type === 'arrow') {
                cssCode += `    position: relative;\n`;
                cssCode += `}\n\n`;
                cssCode += `#${element.id} .arrow-line {\n`;
                cssCode += `    position: absolute;\n`;
                cssCode += `    width: 80%;\n`;
                cssCode += `    height: 2px;\n`;
                cssCode += `    background: #000;\n`;
                cssCode += `    top: 50%;\n`;
                cssCode += `    left: 0;\n`;
                cssCode += `    transform: translateY(-50%);\n`;
                cssCode += `}\n\n`;
                cssCode += `#${element.id} .arrow-head {\n`;
                cssCode += `    position: absolute;\n`;
                cssCode += `    width: 0;\n`;
                cssCode += `    height: 0;\n`;
                cssCode += `    border-left: 10px solid #000;\n`;
                cssCode += `    border-top: 5px solid transparent;\n`;
                cssCode += `    border-bottom: 5px solid transparent;\n`;
                cssCode += `    right: 0;\n`;
                cssCode += `    top: 50%;\n`;
                cssCode += `    transform: translateY(-50%);\n`;
                cssCode += `}\n\n`;
            } else {
                cssCode += `}\n\n`;
            }
        });

        DOM.outputs.css.value = cssCode;
    }

    function generatePreview() {
        let previewHtml = `<!DOCTYPE html><html><head><style>`;

        previewHtml += `body { margin: 0; padding: 0; font-family: Arial, sans-serif; }`;
        previewHtml += `.container { 
            position: relative; 
            width: 100%; 
            min-height: 100vh; 
            background-color: white;
        }`;

        state.elements.forEach(el => {
            const element = el.element;
            previewHtml += `#${element.id} { 
                ${getElementStyles(element)} 
                ${element.style.cssText || ''}
            `;

            if (el.type === 'img' && el.imageUrl) {
                previewHtml += `background-image: url(${el.imageUrl}); `;
                previewHtml += `background-size: contain; `;
                previewHtml += `background-repeat: no-repeat; `;
                previewHtml += `background-position: center; `;
            }

            if (el.type === 'p' || el.type === 'button') {
                previewHtml += `display: block; `;
                previewHtml += `white-space: pre-wrap; `;
                previewHtml += `overflow: visible; `;
            }

            if (el.rotation) {
                previewHtml += `transform: rotate(${el.rotation}deg); `;
            }

            previewHtml += `}`;

            if (el.type === 'arrow') {
                previewHtml += `#${element.id} .arrow-line { 
                    position: absolute;
                    width: 80%;
                    height: 2px;
                    background: #000;
                    top: 50%;
                    left: 0;
                    transform: translateY(-50%);
                }`;
                previewHtml += `#${element.id} .arrow-head { 
                    position: absolute;
                    width: 0;
                    height: 0;
                    border-left: 10px solid #000;
                    border-top: 5px solid transparent;
                    border-bottom: 5px solid transparent;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                }`;
            }
        });

        previewHtml += `</style></head><body><div class="container">`;

        state.elements.forEach(el => {
            const element = el.element;
            const tag = el.type === 'img' ? 'div' : el.type;

            previewHtml += `<${tag} id="${element.id}" class="${element.className.replace('canvas-element', '').trim()}">`;

            if (el.type !== 'img') {
                previewHtml += escapeHtml(element.textContent);
            }

            previewHtml += `</${tag}>`;
        });

        previewHtml += `</div></body></html>`;

        DOM.previewFrame.srcdoc = previewHtml;
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getElementStyles(element) {
        const style = window.getComputedStyle(element);
        const ignoreProps = [
            'position', 'left', 'top', 'width', 'height', 'margin',
            'margin-top', 'margin-left', 'margin-right', 'margin-bottom',
            'z-index', 'cursor', 'user-select', 'pointer-events',
            'transform', 'transform-origin'
        ];

        let styleStr = '';

        styleStr += `position: absolute !important; `;
        styleStr += `left: ${element.style.left || '0'} !important; `;
        styleStr += `top: ${element.style.top || '0'} !important; `;
        styleStr += `width: ${element.style.width || 'auto'} !important; `;
        styleStr += `height: ${element.style.height || 'auto'} !important; `;

        styleStr += `opacity: 1 !important; `;
        styleStr += `visibility: visible !important; `;
        styleStr += `display: block !important; `;

        for (let i = 0; i < style.length; i++) {
            const prop = style[i];

            if (!ignoreProps.includes(prop) &&
                !prop.startsWith('-webkit') &&
                !prop.startsWith('moz')) {
                const value = style.getPropertyValue(prop);
                if (value && !value.includes('canvas-element')) {
                    styleStr += `${prop}: ${value} !important; `;
                }
            }
        }

        return styleStr;
    }

    function clearCanvas() {
        if (confirm('Очистить весь холст? Это действие нельзя отменить.')) {
            while (DOM.canvas.firstChild) {
                DOM.canvas.removeChild(DOM.canvas.firstChild);
            }

            state.elements = [];
            state.selectedElement = null;
            DOM.layersList.innerHTML = '';
            clearPropertiesForm();
        }
    }

    function rgbToHex(rgb) {
        if (!rgb) return '';
        if (rgb.startsWith('#')) return rgb;

        const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (!match) return '';

        const hex = (x) => ("0" + parseInt(x).toString(16)).slice(-2);
        return "#" + hex(match[1]) + hex(match[2]) + hex(match[3]);
    }

    function copyHtml() {
        DOM.outputs.html.select();
        document.execCommand('copy');
        alert('HTML скопирован в буфер обмена!');
    }

    function copyCss() {
        DOM.outputs.css.select();
        document.execCommand('copy');
        alert('CSS скопирован в буфер обмена!');
    }

    function downloadZip() {
        const zip = new JSZip();
        const htmlContent = DOM.outputs.html.value;
        const cssContent = DOM.outputs.css.value;

        zip.file("index.html", htmlContent);
        zip.file("styles.css", cssContent);

        const imgFolder = zip.folder("images");
        state.elements.forEach(el => {
            if (el.type === 'img' && el.imageFile) {
                imgFolder.file(el.imageFile.name, el.imageFile);
            }
        });

        zip.generateAsync({ type: "blob" }).then(function (content) {
            const a = document.createElement("a");
            const url = URL.createObjectURL(content);

            a.href = url;
            a.download = "mirageML-project.zip";
            document.body.appendChild(a);
            a.click();

            setTimeout(function () {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 0);
        });
    }

    // Добавляем обработчики для перетаскивания слоев
    DOM.layersList.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const draggingItem = document.querySelector('.layer-item.dragging');
        if (!draggingItem) return;

        const afterElement = getDragAfterElement(DOM.layersList, e.clientY);
        if (afterElement) {
            DOM.layersList.insertBefore(draggingItem, afterElement);
        } else {
            DOM.layersList.appendChild(draggingItem);
        }
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.layer-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Добавим обработчик перед закрытием страницы
    window.addEventListener('beforeunload', (e) => {
        if (currentProjectId && state.elements.length > 0) {
            saveProject();
            // Стандартное сообщение для браузера
            e.preventDefault();
            e.returnValue = '';
        }
    });

    init();
});