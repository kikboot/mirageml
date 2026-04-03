window.updateSectionName = function(value) {
    if (state.selectedSection) {
        state.selectedSection.name = value;
        updateElementsCount();
    }
};

window.updateSectionSizeWithFormula = function(width, height) {
    if (!state.selectedSection) return;
    
    const widthResult = parseValueWithFormula(width);
    const heightResult = parseValueWithFormula(height);
    
    const widthValue = typeof widthResult === 'object' ? widthResult.value : widthResult;
    const heightValue = typeof heightResult === 'object' ? heightResult.value : heightResult;
    
    state.selectedSection.element.style.width = `${widthValue}px`;
    state.selectedSection.element.style.height = `${heightValue}px`;
    saveToHistory();
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

window.updateSectionPaddingWithFormula = function(side, value) {
    if (!state.selectedSection) return;
    
    const result = parseValueWithFormula(value);
    const pixelValue = typeof result === 'object' ? result.value : result;
    
    if (side === 'top') state.selectedSection.element.style.paddingTop = `${pixelValue}px`;
    if (side === 'bottom') state.selectedSection.element.style.paddingBottom = `${pixelValue}px`;
    if (side === 'left') state.selectedSection.element.style.paddingLeft = `${pixelValue}px`;
    if (side === 'right') state.selectedSection.element.style.paddingRight = `${pixelValue}px`;
    
    saveToHistory();
};

window.updateSectionPadding = function(side, value) {
    if (state.selectedSection) {
        if (side === 'top') state.selectedSection.element.style.paddingTop = `${value}px`;
        if (side === 'bottom') state.selectedSection.element.style.paddingBottom = `${value}px`;
        if (side === 'left') state.selectedSection.element.style.paddingLeft = `${value}px`;
        if (side === 'right') state.selectedSection.element.style.paddingRight = `${value}px`;
    }
};

window.updateSectionBgColor = function(value) {
    if (state.selectedSection) {
        const opacity = document.getElementById('bg-opacity')?.value || 100;
        const hex = value.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        state.selectedSection.element.style.background = `rgba(${r}, ${g}, ${b}, ${opacity/100})`;

        const colorInput = document.getElementById('prop-bg-color');
        const colorText = document.getElementById('prop-bg-color-text');
        if (colorInput && colorText) {
            if (colorInput.value !== value) colorInput.value = value;
            if (colorText.value !== value) colorText.value = value;
        }
    }
};

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
    document.getElementById('bg-video-panel').style.display = type === 'video' ? 'block' : 'none';

    if (type === 'gradient' && !state.selectedSection.element.style.background.includes('gradient')) {
        updateGradient();
    }
    if (type === 'image' && !state.selectedSection.element.style.backgroundImage) {
        const input = document.getElementById('bg-image-url');
        if (input && input.value) {
            updateBgImage(input.value);
        }
    }
    if (type === 'video') {
        const input = document.getElementById('bg-video-url');
        if (input && input.value) {
            updateBgVideo(input.value);
        }
    }
};

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
    document.getElementById('gradient-angle-value').textContent = `${angle}°`;
    updateGradientPreview();
};

function updateGradientPreview() {
    const preview = document.getElementById('gradient-preview');
    if (!preview) return;

    const type = document.getElementById('gradient-type')?.value || 'linear';
    const angle = document.getElementById('gradient-angle')?.value || 90;
    const color1 = document.getElementById('gradient-color-1')?.value || '#6366f1';
    const color2 = document.getElementById('gradient-color-2')?.value || '#a855f7';

    let gradient;
    if (type === 'linear') {
        gradient = `linear-gradient(${angle}deg, ${color1}, ${color2})`;
    } else if (type === 'radial') {
        gradient = `radial-gradient(circle, ${color1}, ${color2})`;
    } else if (type === 'conic') {
        gradient = `conic-gradient(from ${angle}deg, ${color1}, ${color2})`;
    }

    preview.style.background = gradient;
}

window.addGradientStop = function() {
    showToast('Функция в разработке', 'info');
};

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

window.updateBgSize = function(value) {
    if (state.selectedSection) {
        state.selectedSection.element.style.backgroundSize = value;
        state.selectedSection.element.style.backgroundRepeat = value === 'repeat' ? 'repeat' : 'no-repeat';
    }
};

window.updateBgPosition = function(value) {
    if (state.selectedSection) {
        state.selectedSection.element.style.backgroundPosition = value;
    }
};

window.updateBgImageOpacity = function(value) {
    if (state.selectedSection) {
        document.getElementById('bg-image-opacity-value').textContent = `${value}%`;
        state.selectedSection.element.style.opacity = value / 100;
    }
};

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

window.updateBgVideo = function(url) {
    if (!state.selectedSection) return;

    const section = state.selectedSection.element;
    let video = section.querySelector('video');
    let overlay = section.querySelector('.video-overlay');

    if (url) {
        if (!video) {
            section.style.background = '';

            video = document.createElement('video');
            video.autoplay = true;
            video.muted = true;
            video.loop = true;
            video.style.cssText = 'position: absolute; top: 50%; left: 50%; min-width: 100%; min-height: 100%; width: auto; height: auto; transform: translate(-50%, -50%); z-index: 0;';

            const source = document.createElement('source');
            source.src = url;
            source.type = 'video/mp4';
            video.appendChild(source);

            section.style.position = 'relative';
            section.style.overflow = 'hidden';
            section.insertBefore(video, section.firstChild);

            overlay = document.createElement('div');
            overlay.className = 'video-overlay';
            overlay.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1; pointer-events: none;';
            section.insertBefore(overlay, video.nextSibling);
        } else {
            const source = video.querySelector('source');
            if (source) source.src = url;
            video.load();
            video.play();
        }
    } else {
        if (video) video.remove();
        if (overlay) overlay.remove();
    }

    saveToHistory();
};

window.setBgVideo = function(url) {
    if (!state.selectedSection) {
        showToast('Выберите секцию', 'error');
        return;
    }

    const input = document.getElementById('bg-video-url');
    if (input) {
        input.value = url;
        updateBgVideo(url);
        showToast('Видео фон установлен', 'success');
    }
};

window.updateVideoOverlay = function() {
    if (!state.selectedSection) return;

    const section = state.selectedSection.element;
    const overlay = section.querySelector('.video-overlay');

    if (overlay) {
        const color = document.getElementById('video-overlay-color')?.value || '#000000';
        const opacity = document.getElementById('video-overlay-opacity')?.value || 50;

        document.getElementById('video-overlay-opacity-value').textContent = `${opacity}%`;
        overlay.style.background = `rgba(${hexToRgb(color)}, ${opacity/100})`;
    }

    saveToHistory();
};

window.updateBgFilter = function() {
    if (state.selectedSection) {
        const blur = document.getElementById('bg-blur')?.value || 0;
        const brightness = document.getElementById('bg-brightness')?.value || 100;
        const contrast = document.getElementById('bg-contrast')?.value || 100;
        const saturate = document.getElementById('bg-saturate')?.value || 100;
        const sepia = document.getElementById('bg-sepia')?.value || 0;
        const invert = document.getElementById('bg-invert')?.value || 0;

        document.getElementById('bg-blur-value').textContent = `${blur}px`;
        document.getElementById('bg-brightness-value').textContent = `${brightness}%`;
        document.getElementById('bg-contrast-value').textContent = `${contrast}%`;
        document.getElementById('bg-saturate-value').textContent = `${saturate}%`;
        document.getElementById('bg-sepia-value').textContent = `${sepia}%`;
        document.getElementById('bg-invert-value').textContent = `${invert}%`;

        applyBgFilters();
    }
};

function applyBgFilters() {
    if (!state.selectedSection) return;

    const blur = document.getElementById('bg-blur')?.value || 0;
    const brightness = document.getElementById('bg-brightness')?.value || 100;
    const contrast = document.getElementById('bg-contrast')?.value || 100;
    const saturate = document.getElementById('bg-saturate')?.value || 100;
    const sepia = document.getElementById('bg-sepia')?.value || 0;
    const invert = document.getElementById('bg-invert')?.value || 0;

    state.selectedSection.element.style.filter = `blur(${blur}px) brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) sepia(${sepia}%) invert(${invert}%)`;
}

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

window.updateElementHref = function(value) {
    if (state.selectedElement) {
        const el = state.selectedElement.element;
        if (value && value.trim() !== '') {
            // Для кнопок используем data-href (валидный HTML)
            // Для <a> используем обычный href
            if (state.selectedElement.tag === 'button') {
                el.setAttribute('data-href', value);
                el.removeAttribute('href');
            } else {
                el.setAttribute('href', value);
                el.setAttribute('target', '_blank');
                el.removeAttribute('data-href');
            }
        } else {
            el.removeAttribute('href');
            el.removeAttribute('data-href');
        }
    }
};

window.updateElementSrc = function(value) {
    if (state.selectedElement && state.selectedElement.tag === 'img') {
        state.selectedElement.element.src = value;
    }
};

window.updateElementStyleWithFormula = function(property, value) {
    if (!state.selectedElement) return;
    
    const result = parseValueWithFormula(value);
    const pixelValue = typeof result === 'object' ? result.value : result;
    
    state.selectedElement.element.style[property] = `${pixelValue}${typeof result === 'object' && result.unit ? result.unit : 'px'}`;
    saveToHistory();
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

window.updateElementOpacity = function(value) {
    if (state.selectedElement) {
        document.getElementById('el-opacity-value').textContent = `${value}%`;
        state.selectedElement.element.style.opacity = value / 100;
    }
};

window.updateElementBorder = function() {
    if (!state.selectedElement) return;
    
    const width = document.getElementById('el-border-width')?.value || '0';
    const style = document.getElementById('el-border-style')?.value || 'none';
    const color = document.getElementById('el-border-color')?.value || '#6366f1';
    
    state.selectedElement.element.style.border = `${width} ${style} ${color}`;
    
    const colorInput = document.getElementById('el-border-color');
    const colorText = document.getElementById('el-border-color-text');
    if (colorInput && colorText) {
        if (colorInput.value !== color) colorInput.value = color;
        if (colorText.value !== color) colorText.value = color;
    }
};

window.updateElementFilters = function() {
    if (!state.selectedElement) return;
    
    const brightness = document.getElementById('el-brightness')?.value || 100;
    const contrast = document.getElementById('el-contrast')?.value || 100;
    const saturate = document.getElementById('el-saturate')?.value || 100;
    const sepia = document.getElementById('el-sepia')?.value || 0;
    const invert = document.getElementById('el-invert')?.value || 0;
    const blur = document.getElementById('el-blur')?.value || 0;
    
    document.getElementById('el-brightness-value').textContent = `${brightness}%`;
    document.getElementById('el-contrast-value').textContent = `${contrast}%`;
    document.getElementById('el-saturate-value').textContent = `${saturate}%`;
    document.getElementById('el-sepia-value').textContent = `${sepia}%`;
    document.getElementById('el-invert-value').textContent = `${invert}%`;
    document.getElementById('el-blur-value').textContent = `${blur}px`;
    
    state.selectedElement.element.style.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) sepia(${sepia}%) invert(${invert}%) blur(${blur}px)`;
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

function getOpacityFromColor(color) {
    if (!color) return 100;
    if (color.includes('rgba')) {
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
        return match && match[4] ? Math.round(parseFloat(match[4]) * 100) : 100;
    }
    return 100;
}

function getBgImageUrl(bgStyle) {
    if (!bgStyle) return '';
    const match = bgStyle.match(/url\(['"]?(.*?)['"]?\)/);
    return match ? match[1] : '';
}

function getVideoUrl(element) {
    const video = element.querySelector('video');
    if (video) {
        const source = video.querySelector('source');
        return source ? source.src : '';
    }
    return '';
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ?
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
        '0, 0, 0';
}

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

function getElementIcon(tag) {
    const icons = { 
        h1:'fa-heading', h2:'fa-heading', h3:'fa-heading', 
        p:'fa-paragraph', button:'fa-square', img:'fa-image', 
        a:'fa-link', div:'fa-square', hr:'fa-minus',
        i:'fa-icons', svg:'fa-icons', video:'fa-video'
    };
    return icons[tag] || 'fa-square';
}
