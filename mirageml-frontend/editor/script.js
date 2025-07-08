document.addEventListener('DOMContentLoaded', function() {
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
            type: document.getElementById('element-type'),
            id: document.getElementById('element-id'),
            classes: document.getElementById('element-classes'),
            text: document.getElementById('element-text'),
            width: document.getElementById('element-width'),
            height: document.getElementById('element-height'),
            bgColor: document.getElementById('element-bg-color'),
            textColor: document.getElementById('element-text-color'),
            fontSize: document.getElementById('element-font-size'),
            padding: document.getElementById('element-padding'),
            border: document.getElementById('element-border'),
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
            direction: null,
            startX: 0,
            startY: 0,
            startWidth: 0,
            startHeight: 0,
            startLeft: 0,
            startTop: 0
        },
        imageUpload: {
            file: null,
            url: null
        }
    };

    function init() {
        setupDragAndDrop();
        setupEventListeners();
        setupElementTemplates();
        setupHelpSystem();
        setupImageUpload();
        console.log('Sketch2HTML initialized');
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

        DOM.inputs.imageUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            if (!file.type.match('image.*')) {
                alert('Пожалуйста, выберите файл изображения (JPEG, PNG, GIF)');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                state.imageUpload.file = file;
                state.imageUpload.url = e.target.result;
                
                DOM.inputs.imagePreview.innerHTML = '';
                DOM.inputs.imagePreview.style.backgroundImage = `url(${e.target.result})`;
                DOM.inputs.imagePreview.style.backgroundSize = 'contain';
                DOM.inputs.imagePreview.style.backgroundRepeat = 'no-repeat';
                DOM.inputs.imagePreview.style.backgroundPosition = 'center';
                
                const img = new Image();
                img.onload = function() {
                    DOM.inputs.imageWidth.value = this.width;
                    DOM.inputs.imageHeight.value = this.height;
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });

        DOM.buttons.confirmImageUpload.addEventListener('click', function() {
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
        // Добавляем явное указание фона для прозрачности
        backgroundColor: type === 'line' || type === 'arrow' ? 'transparent' : ''
    });

    // Особый случай для линии и стрелки - убираем любые текстовые узлы
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
        height: parseInt(element.style.height) || (type === 'line' ? 2 : 20)
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
            text: 'Блок',
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
            text: '[Изображение]',
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
                transform: 'rotate(0deg)',
                transformOrigin: 'left center',
                cursor: 'move',
                // Убираем маркеры для линии
                resize: 'none',
                overflow: 'visible'
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
                <div data-arrow-part="line" style="position:absolute; width:80%; height:2px; background:#000; top:50%; left:0; transform:translateY(-50%);"></div>
                <div data-arrow-part="head" style="position:absolute; width:0; height:0; border-left:10px solid #000; border-top:5px solid transparent; border-bottom:5px solid transparent; right:0; top:50%; transform:translateY(-50%);"></div>
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

    // Применяем текст, если он указан
    if (template.text !== undefined) {
        element.textContent = template.text;
    }

    // Применяем атрибуты
    if (template.attributes) {
        for (const [attr, value] of Object.entries(template.attributes)) {
            element.setAttribute(attr, value);
        }
    }

    // Применяем стили
    if (template.styles) {
        Object.assign(element.style, template.styles);
    }

    // Особые случаи для сложных фигур
    if (template.markup) {
        element.innerHTML = template.markup;
    }

    // Для линии добавляем специальный класс
    if (type === 'line') {
        element.classList.add('line-element');
    }
}
    

function setupElementEvents(element, elementData) {
    // Обработчик двойного клика (только для элементов с текстом)
    element.addEventListener('dblclick', function(e) {
        e.stopPropagation();
        
        // Для этих типов элементов редактирование текста не предусмотрено
        const nonTextElements = ['img', 'line', 'arrow', 'ellipse', 'input'];
        if (nonTextElements.includes(elementData.type)) return;
        
        const currentText = elementData.type === 'button' ? 
            (element.textContent || 'Кнопка') : 
            (element.textContent || 'Текст');
            
        const text = prompt('Введите текст:', currentText);
        if (text !== null) {
            element.textContent = text;
            updatePropertiesForm(elementData);
        }
    });
    
    // Обработчик клика для выделения элемента
    element.addEventListener('mousedown', function(e) {
        e.stopPropagation();
        selectElement(elementData);
        
        // Проверяем, кликнули ли на маркер изменения размера
        const handle = e.target.closest('.resize-handle');
        if (handle) {
            state.dragState.isResizing = true;
            state.dragState.direction = handle.dataset.direction;
        } 
        // Для линий и стрелок проверяем, что клик был на самом элементе
        else if (e.target === element || 
                (elementData.type === 'arrow' && e.target.closest('[data-arrow-part]'))) {
            state.dragState.isDragging = true;
        }
        
        // Сохраняем начальные параметры
        state.dragState.startX = e.clientX;
        state.dragState.startY = e.clientY;
        state.dragState.startWidth = element.offsetWidth;
        state.dragState.startHeight = element.offsetHeight;
        state.dragState.startLeft = parseInt(element.style.left) || 0;
        state.dragState.startTop = parseInt(element.style.top) || 0;
        
        bringToFront(element);
    });
    
    // Создаем маркеры изменения размера (кроме линий)
    if (elementData.type !== 'line') {
        createResizeHandles(element);
    }
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
        
        DOM.inputs.bgColor.addEventListener('input', function() {
            if (state.selectedElement) {
                state.selectedElement.element.style.backgroundColor = this.value;
            }
        });
        
        DOM.inputs.textColor.addEventListener('input', function() {
            if (state.selectedElement) {
                state.selectedElement.element.style.color = this.value;
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
            
            switch(state.dragState.direction) {
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
    }

    function handleMouseUp() {
        state.dragState.isDragging = false;
        state.dragState.isResizing = false;
        state.dragState.direction = null;
    }

    function setupDragAndDrop() {
        const elementItems = document.querySelectorAll('.element-item');
        
        elementItems.forEach(item => {
            item.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('text/plain', this.dataset.type);
            });
        });
        
        DOM.canvas.addEventListener('dragover', function(e) {
            e.preventDefault();
        });
        
        DOM.canvas.addEventListener('drop', function(e) {
            e.preventDefault();
            const type = e.dataTransfer.getData('text/plain');
            const rect = DOM.canvas.getBoundingClientRect();
            createElement(type, e.clientX - rect.left, e.clientY - rect.top);
        });
    }

    // Работа с выделенным элементом
    function selectElement(elementData) {
        document.querySelectorAll('.canvas-element').forEach(el => {
            el.classList.remove('selected');
            el.style.zIndex = parseInt(el.style.zIndex || '0');
        });
        
        elementData.element.style.zIndex = 1000;
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
        
        DOM.inputs.type.value = elementData.type;
        DOM.inputs.id.value = element.id;
        DOM.inputs.classes.value = element.className.replace('canvas-element', '').trim();
        
        if (elementData.type !== 'img') {
            DOM.inputs.text.value = element.textContent;
        } else {
            DOM.inputs.text.value = '';
        }
        
        DOM.inputs.width.value = element.style.width || '';
        DOM.inputs.height.value = element.style.height || '';
        DOM.inputs.bgColor.value = rgbToHex(element.style.backgroundColor) || '#ffffff';
        
        DOM.inputs.textColor.value = rgbToHex(element.style.color) || '#000000';
        DOM.inputs.fontSize.value = element.style.fontSize || '';
        DOM.inputs.padding.value = element.style.padding || '';
        DOM.inputs.border.value = element.style.border || '';
    }

    function clearPropertiesForm() {
        Object.values(DOM.inputs).forEach(input => {
            if (input) input.value = '';
        });
    }

    function applyProperties() {
        if (!state.selectedElement) return;
        
        const element = state.selectedElement.element;
        const elementData = state.selectedElement;
        
        element.id = DOM.inputs.id.value || element.id;
        element.className = 'canvas-element ' + (DOM.inputs.classes.value || '');
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
        
        layerItem.addEventListener('click', (e) => {
            if (!e.target.classList.contains('layer-rename')) {
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
            finishRenaming(layerName, layerRename, elementData);
        });
        
        layerRename.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                finishRenaming(layerName, layerRename, elementData);
            }
        });
        
        DOM.layersList.appendChild(layerItem);
    }

    function finishRenaming(layerName, layerRename, elementData) {
        layerName.style.display = 'inline-block';
        layerRename.style.display = 'none';
        layerName.textContent = layerRename.value;
        elementData.name = layerRename.value;
    }

    function updateLayersList() {
        if (!state.selectedElement) return;
        
        const layerItem = document.querySelector(`.layer-item[data-id="${state.selectedElement.id}"]`);
        if (layerItem) {
            const nameSpan = layerItem.querySelector('.layer-name');
            const renameInput = layerItem.querySelector('.layer-rename');
            
            nameSpan.textContent = state.selectedElement.name || state.selectedElement.type;
            renameInput.value = state.selectedElement.name || state.selectedElement.type;
        }
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
    }

    // Экспорт и предпросмотр
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
            const tag = el.type === 'img' || el.type === 'triangle' ? 'div' : el.type;
            
            htmlCode += `        <${tag} id="${element.id}" class="${element.className.replace('canvas-element', '').trim()}">`;
            
            if (el.type !== 'img' && el.type !== 'triangle') {
                htmlCode += element.textContent;
            }
            
            htmlCode += `</${tag}>\n`;
        });
        
        htmlCode += `        <footer class="footer">\n`;
        htmlCode += `            <p>Создано с помощью Sketch2HTML</p>\n`;
        htmlCode += `            <p>© ${new Date().getFullYear()}</p>\n`;
        htmlCode += `        </footer>\n`;
        htmlCode += `    </div>\n</body>\n</html>`;
        
        DOM.outputs.html.value = htmlCode;
        
        let cssCode = `/* Основные стили */\n`;
        cssCode += `body {\n    margin: 0;\n    padding: 0;\n    font-family: Arial, sans-serif;\n}\n\n`;
        cssCode += `.container {\n    position: relative;\n    width: 100%;\n    min-height: 100vh;\n    padding-bottom: 60px;\n}\n\n`;
        cssCode += `.footer {\n    position: absolute;\n    bottom: 0;\n    left: 0;\n    right: 0;\n    height: 50px;\n    background-color: #f5f5f5;\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    padding: 0 20px;\n    box-sizing: border-box;\n}\n\n`;
        
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
            
            cssCode += `}\n\n`;
        });
        
        DOM.outputs.css.value = cssCode;
    }

    function generatePreview() {
        let previewHtml = `<!DOCTYPE html><html><head><style>`;
        
        previewHtml += `body { margin: 0; padding: 0; font-family: Arial, sans-serif; }`;
        previewHtml += `.container { position: relative; width: 100%; min-height: 100vh; padding-bottom: 60px; }`;
        previewHtml += `.footer { position: absolute; bottom: 0; left: 0; right: 0; height: 50px; background-color: #f5f5f5; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; box-sizing: border-box; }`;
        
        state.elements.forEach(el => {
            const element = el.element;
            previewHtml += `#${element.id} { ${getElementStyles(element)} `;
            
            if (el.type === 'img' && el.imageUrl) {
                previewHtml += `background-image: url(${el.imageUrl}); `;
                previewHtml += `background-size: contain; `;
                previewHtml += `background-repeat: no-repeat; `;
                previewHtml += `background-position: center; `;
            }
            
            previewHtml += `}`;
        });
        
        previewHtml += `</style></head><body><div class="container">`;
        
        state.elements.forEach(el => {
            const element = el.element;
            const tag = el.type === 'img' || el.type === 'triangle' ? 'div' : el.type;
            
            previewHtml += `<${tag} id="${element.id}" class="${element.className.replace('canvas-element', '').trim()}">`;
            
            if (el.type !== 'img' && el.type !== 'triangle') {
                previewHtml += element.textContent;
            }
            
            previewHtml += `</${tag}>`;
        });
        
        previewHtml += `<footer class="footer"><p>Создано с помощью Sketch2HTML</p><p>© ${new Date().getFullYear()}</p></footer>`;
        previewHtml += `</div></body></html>`;
        
        DOM.previewFrame.srcdoc = previewHtml;
    }

    function getElementStyles(element) {
        const style = window.getComputedStyle(element);
        const ignoreProps = [
            'position', 'left', 'top', 'width', 'height', 'margin', 
            'margin-top', 'margin-left', 'margin-right', 'margin-bottom',
            'z-index', 'cursor', 'user-select', 'pointer-events'
        ];
        
        let styleStr = '';
        
        styleStr += `position: absolute; `;
        styleStr += `left: ${element.style.left || '0'}; `;
        styleStr += `top: ${element.style.top || '0'}; `;
        styleStr += `width: ${element.style.width || 'auto'}; `;
        styleStr += `height: ${element.style.height || 'auto'}; `;
        
        for (let i = 0; i < style.length; i++) {
            const prop = style[i];
            
            if (!ignoreProps.includes(prop) && !prop.startsWith('-webkit')) {
                const value = style.getPropertyValue(prop);
                if (value && !value.includes('canvas-element')) {
                    styleStr += `${prop}: ${value}; `;
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
        
        zip.generateAsync({type:"blob"}).then(function(content) {
            const a = document.createElement("a");
            const url = URL.createObjectURL(content);
            
            a.href = url;
            a.download = "mirageML-project.zip";
            document.body.appendChild(a);
            a.click();
            
            setTimeout(function() {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 0);
        });
    }

    init();
});