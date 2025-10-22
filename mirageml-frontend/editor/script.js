document.addEventListener('DOMContentLoaded', function () {
    const DOM = {
        canvas: document.getElementById('canvas'),
        elementsPanel: document.querySelector('.elements-panel-modern'),
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
            cancelImageUpload: document.getElementById('cancel-image-upload'),
            applyCanvasSize: document.getElementById('apply-canvas-size'),
            backToMain: document.getElementById('back-to-main'),
            save: document.getElementById('save-btn'),
            zoomIn: document.getElementById('zoom-in'),
            zoomOut: document.getElementById('zoom-out'),
            resetZoom: document.getElementById('reset-zoom'),
            browseImages: document.getElementById('browse-images')
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
            imageHeight: document.getElementById('image-height'),
            canvasSizeSelect: document.getElementById('canvas-size-select'),
            canvasWidth: document.getElementById('canvas-width'),
            canvasHeight: document.getElementById('canvas-height')
        },
        outputs: {
            html: document.getElementById('export-html'),
            css: document.getElementById('export-css')
        },
        previewFrame: document.getElementById('preview-frame'),
        canvasContainer: document.querySelector('.canvas-container-modern'),
        canvasGrid: document.querySelector('.canvas-grid-modern'),
        canvasSizeDisplay: document.getElementById('canvas-size-display'),
        zoomLevel: document.getElementById('zoom-level'),
        uploadArea: document.getElementById('upload-area')
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
        },
        canvasSize: {
            width: 1024,
            height: 768
        },
        zoom: 1,
        currentProjectId: null
    };

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
        state.currentProjectId = urlParams.get('project');

        // Инициализация интерфейса
        setupDragAndDrop();
        setupEventListeners();
        setupElementTemplates();
        setupHelpSystem();
        setupImageUpload();
        setupCanvasSizeControls();
        setupZoomControls();
        setupTabs();

        // Устанавливаем размер холста по умолчанию
        setCanvasSize(state.canvasSize.width, state.canvasSize.height);

        // Загружаем проект если есть ID
        if (state.currentProjectId) {
            loadProject(state.currentProjectId)
                .catch(error => {
                    console.error('Ошибка загрузки проекта:', error);
                    showToast('Не удалось загрузить проект', 'error');
                });
        }

        // Адаптация для 1366x768
        adaptForSmallScreens();

        console.log('MirageML Editor initialized');
    }

    function adaptForSmallScreens() {
        // Проверяем размер экрана
        const isSmallScreen = window.innerWidth <= 1366 || window.innerHeight <= 768;
        
        if (isSmallScreen) {
            // Уменьшаем минимальные размеры холста
            DOM.canvasGrid.style.minWidth = '600px';
            DOM.canvasGrid.style.minHeight = '400px';
            
            // Адаптируем размеры для лучшего отображения
            document.documentElement.style.setProperty('--sidebar-width', '240px');
            document.documentElement.style.setProperty('--header-height', '60px');
            
            // Показываем подсказку об адаптации
            setTimeout(() => {
                showToast('Режим адаптации для вашего разрешения экрана', 'info');
            }, 1000);
        }
    }

    function setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                
                // Убираем активные классы
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Добавляем активные классы
                btn.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            });
        });
    }

    function setupZoomControls() {
        DOM.buttons.zoomIn.addEventListener('click', () => {
            state.zoom = Math.min(state.zoom + 0.1, 2);
            applyZoom();
        });

        DOM.buttons.zoomOut.addEventListener('click', () => {
            state.zoom = Math.max(state.zoom - 0.1, 0.5);
            applyZoom();
        });

        DOM.buttons.resetZoom.addEventListener('click', () => {
            state.zoom = 1;
            applyZoom();
        });
    }

    function applyZoom() {
        DOM.canvasGrid.style.transform = `scale(${state.zoom})`;
        DOM.zoomLevel.textContent = `${Math.round(state.zoom * 100)}%`;
        
        // Обновляем позиции элементов при зуме
        state.elements.forEach(el => {
            const element = el.element;
            element.style.transform = `rotate(${el.rotation || 0}deg) scale(${1/state.zoom})`;
        });
    }

    function setupCanvasSizeControls() {
        // Обработчик изменения выбора размера холста
        DOM.inputs.canvasSizeSelect.addEventListener('change', function() {
            const value = this.value;
            
            if (value === 'custom') {
                DOM.inputs.canvasWidth.value = state.canvasSize.width;
                DOM.inputs.canvasHeight.value = state.canvasSize.height;
                document.querySelector('.custom-size-inputs-modern').classList.add('active');
                return;
            } else {
                document.querySelector('.custom-size-inputs-modern').classList.remove('active');
            }

            const [width, height] = value.split('x').map(Number);
            setCanvasSize(width, height);
        });

        // Обработчик кнопки применения размера холста
        DOM.buttons.applyCanvasSize.addEventListener('click', function() {
            const width = parseInt(DOM.inputs.canvasWidth.value);
            const height = parseInt(DOM.inputs.canvasHeight.value);
            
            if (isNaN(width) || isNaN(height) || width < 100 || height < 100) {
                showToast('Введите корректные размеры (мин. 100×100)', 'error');
                return;
            }
            
            if (width > 2000 || height > 2000) {
                showToast('Максимальный размер холста: 2000×2000', 'error');
                return;
            }
            
            setCanvasSize(width, height);
        });
    }

    function setCanvasSize(width, height) {
        state.canvasSize = { width, height };
        DOM.canvasGrid.style.width = `${width}px`;
        DOM.canvasGrid.style.height = `${height}px`;
        DOM.canvasSizeDisplay.textContent = `${width}×${height}`;
        
        // Обновляем селектор размера
        updateCanvasSizeSelector(width, height);
        
        // Обновляем позиции элементов относительно нового размера холста
        state.elements.forEach(el => {
            const element = el.element;
            const rect = element.getBoundingClientRect();
            
            // Проверяем, чтобы элемент не выходил за границы холста
            let left = parseInt(element.style.left) || 0;
            let top = parseInt(element.style.top) || 0;
            
            if (left + rect.width > width) {
                left = Math.max(0, width - rect.width);
                element.style.left = `${left}px`;
            }
            
            if (top + rect.height > height) {
                top = Math.max(0, height - rect.height);
                element.style.top = `${top}px`;
            }
            
            el.x = left;
            el.y = top;
        });

        showToast(`Размер холста изменен на ${width}×${height}`, 'success');
    }

    function updateCanvasSizeSelector(width, height) {
        const sizeString = `${width}x${height}`;
        const select = DOM.inputs.canvasSizeSelect;
        const customInputs = document.querySelector('.custom-size-inputs-modern');
        
        // Проверяем, есть ли такой размер в options
        let found = false;
        for (let option of select.options) {
            if (option.value === sizeString) {
                select.value = sizeString;
                customInputs.classList.remove('active');
                found = true;
                break;
            }
        }
        
        if (!found) {
            select.value = 'custom';
            customInputs.classList.add('active');
            DOM.inputs.canvasWidth.value = width;
            DOM.inputs.canvasHeight.value = height;
        }
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

            // Устанавливаем размер холста из проекта, если есть
            if (project.canvasSize) {
                setCanvasSize(project.canvasSize.width, project.canvasSize.height);
            }

            // Восстанавливаем элементы
            if (project.elements && Object.keys(project.elements).length > 0) {
                Object.values(project.elements).forEach(elData => {
                    const element = createElement(elData.type, elData.x, elData.y);

                    // Восстанавливаем свойства
                    element.element.style.width = `${elData.width}px`;
                    element.element.style.height = `${elData.height}px`;
                    element.element.style.left = `${elData.x}px`;
                    element.element.style.top = `${elData.y}px`;
                    element.element.style.backgroundColor = elData.backgroundColor || '';
                    element.element.style.color = elData.textColor || '';
                    element.element.style.fontSize = elData.fontSize || '';
                    element.element.style.padding = elData.padding || '';
                    element.element.style.border = elData.border || '';
                    
                    if (elData.rotation) {
                        element.element.style.transform = `rotate(${elData.rotation}deg)`;
                        element.rotation = elData.rotation;
                    }

                    if (elData.text) {
                        element.element.textContent = elData.text;
                    }

                    if (elData.type === 'img' && elData.imageUrl) {
                        element.element.style.backgroundImage = `url(${elData.imageUrl})`;
                        element.element.style.backgroundSize = 'contain';
                        element.element.style.backgroundRepeat = 'no-repeat';
                        element.element.style.backgroundPosition = 'center';
                        element.imageUrl = elData.imageUrl;
                    }

                    // Обновляем данные элемента
                    element.x = elData.x;
                    element.y = elData.y;
                    element.width = elData.width;
                    element.height = elData.height;
                });
            }

            showToast('Проект успешно загружен', 'success');
            return project;
        } catch (error) {
            console.error('Ошибка загрузки проекта:', error);
            showToast(error.message, 'error');
        }
    }

    async function saveProject() {
        if (!state.currentProjectId) {
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
            const projectData = {
                elements: elementsData,
                canvasSize: state.canvasSize
            };

            // Собираем данные всех элементов
            state.elements.forEach(el => {
                const rect = el.element.getBoundingClientRect();
                
                const layerItem = document.querySelector(`.layer-item-modern[data-id="${el.id}"]`);
                const layerName = layerItem ?
                    (layerItem.querySelector('.layer-rename')?.value ||
                        layerItem.querySelector('.layer-name-modern')?.textContent) :
                    el.name;

                elementsData[el.id] = {
                    id: el.id,
                    type: el.type,
                    name: layerName || el.type,
                    x: parseInt(el.element.style.left) || 0,
                    y: parseInt(el.element.style.top) || 0,
                    width: rect.width,
                    height: rect.height,
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
            const response = await fetch(`http://localhost:3001/api/projects/${state.currentProjectId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(projectData)
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
        // Удаляем старые уведомления
        document.querySelectorAll('.toast').forEach(toast => toast.remove());
        
        const toast = document.createElement('div');
        toast.className = `toast ${type} fade-in`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function setupImageUpload() {
        DOM.buttons.uploadImage.addEventListener('click', () => {
            showModal('image-upload-modal');
        });

        DOM.buttons.browseImages.addEventListener('click', () => {
            DOM.inputs.imageUpload.click();
        });

        DOM.uploadArea.addEventListener('click', () => {
            DOM.inputs.imageUpload.click();
        });

        DOM.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            DOM.uploadArea.style.borderColor = 'var(--primary)';
            DOM.uploadArea.style.background = 'rgba(99, 102, 241, 0.1)';
        });

        DOM.uploadArea.addEventListener('dragleave', () => {
            DOM.uploadArea.style.borderColor = 'var(--glass-border)';
            DOM.uploadArea.style.background = 'rgba(255, 255, 255, 0.02)';
        });

        DOM.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            DOM.uploadArea.style.borderColor = 'var(--glass-border)';
            DOM.uploadArea.style.background = 'rgba(255, 255, 255, 0.02)';
            
            const file = e.dataTransfer.files[0];
            if (file) {
                handleImageFile(file);
            }
        });

        DOM.buttons.cancelImageUpload.addEventListener('click', () => {
            hideModal('image-upload-modal');
        });

        DOM.inputs.imageUpload.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (!file) return;
            handleImageFile(file);
        });

        DOM.buttons.confirmImageUpload.addEventListener('click', function () {
            if (!state.imageUpload.url) {
                showToast('Пожалуйста, выберите изображение', 'error');
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

            hideModal('image-upload-modal');
            selectElement(elementData);
        });
    }

    function handleImageFile(file) {
        if (!file.type.match('image.*')) {
            showToast('Пожалуйста, выберите файл изображения (JPEG, PNG, GIF)', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            state.imageUpload.file = file;
            state.imageUpload.url = e.target.result;

            DOM.inputs.imagePreview.innerHTML = `
                <img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 180px; border-radius: 8px;">
            `;

            const img = new Image();
            img.onload = function () {
                DOM.inputs.imageWidth.value = this.width;
                DOM.inputs.imageHeight.value = this.height;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function setupElementTemplates() {
        document.querySelectorAll('.element-card').forEach(item => {
            const type = item.dataset.type;
            if (type) {
                item.addEventListener('click', () => createElement(type));
            }
        });
    }

    function createElement(type, x, y) {
        const template = getElementTemplate(type);
        const element = document.createElement(template.tag);
        const id = `element-${Date.now()}`;

        element.className = 'canvas-element';
        element.id = id;
        element.draggable = false;

        const canvasRect = DOM.canvasGrid.getBoundingClientRect();
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

        DOM.canvasGrid.appendChild(element);

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
            showModal('help-modal');
        });
        DOM.buttons.backToMain.addEventListener('click', () => {
            window.location.href = '../main/index.html';
        });
        DOM.buttons.save.addEventListener('click', async () => {
            const saveBtn = DOM.buttons.save;
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
                    hideModal(modal.id);
                });
            });
        });

        window.addEventListener('click', (e) => {
            Object.values(DOM.modals).forEach(modal => {
                if (e.target === modal) {
                    hideModal(modal.id);
                }
            });
        });

        DOM.canvasGrid.addEventListener('mousedown', (e) => {
            if (e.target === DOM.canvasGrid) {
                deselectElement();
            }
        });

        // Автосохранение при изменении
        setupAutoSave();
    }

    function setupAutoSave() {
        let saveTimeout;
        
        function scheduleSave() {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                if (state.currentProjectId && state.elements.length > 0) {
                    saveProject().catch(console.error);
                }
            }, 2000);
        }
        
        // Слушаем изменения элементов
        const observer = new MutationObserver(scheduleSave);
        observer.observe(DOM.canvasGrid, {
            childList: true,
            attributes: true,
            subtree: true
        });
    }

    function setupHelpSystem() {
        DOM.buttons.showHelp.addEventListener('click', () => {
            showModal('help-modal');
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

            // Проверяем границы холста
            const canvasRect = DOM.canvasGrid.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            
            let boundedLeft = newLeft;
            let boundedTop = newTop;
            
            if (newLeft < 0) boundedLeft = 0;
            if (newTop < 0) boundedTop = 0;
            if (newLeft + elementRect.width > canvasRect.width) boundedLeft = canvasRect.width - elementRect.width;
            if (newTop + elementRect.height > canvasRect.height) boundedTop = canvasRect.height - elementRect.height;

            element.style.left = `${boundedLeft}px`;
            element.style.top = `${boundedTop}px`;

            state.selectedElement.x = boundedLeft;
            state.selectedElement.y = boundedTop;

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

            // Проверяем границы холста
            const canvasRect = DOM.canvasGrid.getBoundingClientRect();
            
            if (newLeft + newWidth > canvasRect.width) {
                newWidth = canvasRect.width - newLeft;
            }
            
            if (newTop + newHeight > canvasRect.height) {
                newHeight = canvasRect.height - newTop;
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
        const elementItems = document.querySelectorAll('.element-card');

        elementItems.forEach(item => {
            item.addEventListener('dragstart', function (e) {
                e.dataTransfer.setData('text/plain', this.dataset.type);
            });
        });

        DOM.canvasGrid.addEventListener('dragover', function (e) {
            e.preventDefault();
        });

        DOM.canvasGrid.addEventListener('drop', function (e) {
            e.preventDefault();
            const type = e.dataTransfer.getData('text/plain');
            const rect = DOM.canvasGrid.getBoundingClientRect();
            createElement(type, e.clientX - rect.left, e.clientY - rect.top);
        });
    }

    function selectElement(elementData) {
        document.querySelectorAll('.canvas-element').forEach(el => {
            el.classList.remove('selected');
        });

        elementData.element.classList.add('selected');
        state.selectedElement = elementData;

        document.querySelectorAll('.layer-item-modern').forEach(el => {
            el.classList.remove('active');
        });

        const layerItem = document.querySelector(`.layer-item-modern[data-id="${elementData.id}"]`);
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

        document.querySelectorAll('.layer-item-modern').forEach(el => {
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

        showToast('Свойства применены', 'success');
    }

    function deleteSelectedElement() {
        if (!state.selectedElement) return;

        if (confirm('Удалить выбранный элемент?')) {
            state.selectedElement.element.remove();
            state.elements = state.elements.filter(el => el.id !== state.selectedElement.id);

            const layerItem = document.querySelector(`.layer-item-modern[data-id="${state.selectedElement.id}"]`);
            if (layerItem) {
                layerItem.remove();
            }

            deselectElement();
            showToast('Элемент удален', 'success');
        }
    }

    function addToLayersList(elementData) {
        // Убираем пустое состояние
        const emptyState = DOM.layersList.querySelector('.empty-layers-state');
        if (emptyState) {
            emptyState.remove();
        }

        const layerItem = document.createElement('div');
        layerItem.className = 'layer-item-modern';
        layerItem.dataset.id = elementData.id;
        layerItem.innerHTML = `
            <div class="layer-icon-modern">
                <i class="fas fa-${getIconForType(elementData.type)}"></i>
            </div>
            <div class="layer-info-modern">
                <div class="layer-name-modern">${elementData.name || elementData.type}</div>
                <div class="layer-type-modern">${elementData.type}</div>
            </div>
            <div class="layer-actions-modern">
                <button class="btn btn-ghost small" title="Переименовать">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;

        layerItem.addEventListener('click', (e) => {
            if (!e.target.closest('.layer-actions-modern')) {
                bringToFront(elementData.element);
                selectElement(elementData);
            }
        });

        const renameBtn = layerItem.querySelector('.layer-actions-modern button');
        renameBtn.addEventListener('click', () => {
            const newName = prompt('Введите новое название:', elementData.name || elementData.type);
            if (newName !== null) {
                elementData.name = newName;
                layerItem.querySelector('.layer-name-modern').textContent = newName;
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
        DOM.canvasGrid.appendChild(element);
        updateLayersOrder();
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

    function showExportModal() {
        showModal('export-modal');
        generateExportCode();
    }

    function showPreviewModal() {
        showModal('preview-modal');
        generatePreview();
    }

    function generateExportCode() {
        let htmlCode = `<!DOCTYPE html>\n<html lang="ru">\n<head>\n`;
        htmlCode += `    <meta charset="UTF-8">\n`;
        htmlCode += `    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n`;
        htmlCode += `    <title>Мой сайт</title>\n`;
        htmlCode += `    <link rel="stylesheet" href="styles.css">\n`;
        htmlCode += `</head>\n<body>\n`;
        htmlCode += `    <div class="container" style="width:${state.canvasSize.width}px; height:${state.canvasSize.height}px; position:relative; margin:0 auto;">\n`;

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
        cssCode += `body {\n    margin: 0;\n    padding: 0;\n    font-family: Arial, sans-serif;\n    background: #f5f5f5;\n}\n\n`;
        cssCode += `.container {\n    position: relative;\n    margin: 0 auto;\n    background: white;\n    box-shadow: 0 4px 20px rgba(0,0,0,0.1);\n}\n\n`;

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

        previewHtml += `body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; }`;
        previewHtml += `.container { 
            position: relative; 
            width: ${state.canvasSize.width}px;
            height: ${state.canvasSize.height}px;
            background-color: white;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
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
            while (DOM.canvasGrid.firstChild) {
                DOM.canvasGrid.removeChild(DOM.canvasGrid.firstChild);
            }

            state.elements = [];
            state.selectedElement = null;
            DOM.layersList.innerHTML = `
                <div class="empty-layers-state">
                    <i class="fas fa-layer-group"></i>
                    <p>Нет элементов</p>
                    <span>Добавьте элементы на холст</span>
                </div>
            `;
            clearPropertiesForm();
            showToast('Холст очищен', 'success');
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
        showToast('HTML скопирован в буфер обмена!', 'success');
    }

    function copyCss() {
        DOM.outputs.css.select();
        document.execCommand('copy');
        showToast('CSS скопирован в буфер обмена!', 'success');
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

            showToast('ZIP архив скачан', 'success');
        });
    }

    // Добавляем обработчики для перетаскивания слоев
    DOM.layersList.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const draggingItem = document.querySelector('.layer-item-modern.dragging');
        if (!draggingItem) return;

        const afterElement = getDragAfterElement(DOM.layersList, e.clientY);
        if (afterElement) {
            DOM.layersList.insertBefore(draggingItem, afterElement);
        } else {
            DOM.layersList.appendChild(draggingItem);
        }
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.layer-item-modern:not(.dragging)')];

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

    // Автосохранение при закрытии
    window.addEventListener('beforeunload', (e) => {
        if (state.currentProjectId && state.elements.length > 0) {
            saveProject().catch(console.error);
            e.preventDefault();
            e.returnValue = '';
        }
    });

    init();
});