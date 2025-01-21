import { ElementManager } from './element';
import { toJpeg } from 'html-to-image';
class TextEditor {
    rightPanel;
    constructor(rightPanel) {
        this.rightPanel = rightPanel;
    }
    render(focusedElement) {
        this.rightPanel.innerHTML = '';
        const container = focusedElement.element;
        const originalWidth = container ? container.offsetWidth : 0;
        const originalHeight = container ? container.offsetHeight : 0;
        const input = document.createElement('textarea');
        input.value = focusedElement.element ? focusedElement.element.textContent || '' : '';
        input.placeholder = 'Измените текст';
        input.style.resize = 'none';
        input.addEventListener('input', (event) => {
            const target = event.target;
            if (focusedElement.element && target) {
                focusedElement.element.textContent = target.value;
            }
        });
        const fontSelect = document.createElement('select');
        const fonts = [
            'Arial', 'Verdana', 'Times New Roman', 'Georgia', 'Courier New',
            'Tahoma', 'Trebuchet MS', 'Impact', 'Comic Sans MS', 'Lucida Console'
        ];
        fonts.forEach(font => {
            const option = document.createElement('option');
            option.value = font;
            option.textContent = font;
            fontSelect.appendChild(option);
        });
        if (focusedElement.element) {
            fontSelect.value = window.getComputedStyle(focusedElement.element).fontFamily.split(',')[0];
        }
        fontSelect.addEventListener('change', (event) => {
            const target = event.target;
            if (focusedElement.element && target) {
                focusedElement.element.style.fontFamily = target.value;
            }
        });
        const fontSizeInput = document.createElement('input');
        fontSizeInput.type = 'number';
        if (focusedElement.element) {
            fontSizeInput.value = parseInt(window.getComputedStyle(focusedElement.element).fontSize).toString();
        }
        fontSizeInput.placeholder = 'Размер шрифта';
        fontSizeInput.addEventListener('input', (event) => {
            const target = event.target;
            if (focusedElement.element && target) {
                focusedElement.element.style.fontSize = target.value + 'px';
                focusedElement.element.style.width = `${originalWidth}px`;
                focusedElement.element.style.height = `${originalHeight}px`;
            }
        });
        const alignmentPanel = document.createElement('div');
        const alignmentLabel = document.createElement('label');
        alignmentLabel.textContent = 'Выравнивание текста';
        alignmentPanel.appendChild(alignmentLabel);
        const leftAlignButton = this.createAlignButton('left', 'По левому краю');
        const centerAlignButton = this.createAlignButton('center', 'По центру');
        const rightAlignButton = this.createAlignButton('right', 'По правому краю');
        alignmentPanel.appendChild(leftAlignButton);
        alignmentPanel.appendChild(centerAlignButton);
        alignmentPanel.appendChild(rightAlignButton);
        const colorPickerLabel = document.createElement('label');
        colorPickerLabel.textContent = 'Цвет текста';
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        if (focusedElement.element) {
            colorPicker.value = this.rgbToHex(window.getComputedStyle(focusedElement.element).color);
        }
        colorPicker.addEventListener('input', (event) => {
            const target = event.target;
            if (focusedElement.element && target) {
                focusedElement.element.style.color = target.value; // Используем значение в формате RGB
            }
        });
        const enableShadowCheckbox = document.createElement('input');
        enableShadowCheckbox.type = 'checkbox';
        enableShadowCheckbox.checked = localStorage.getItem('enableShadow') === 'true'; // Загружаем состояние чекбокса из localStorage
        const enableShadowLabel = document.createElement('label');
        enableShadowLabel.textContent = 'Тень';
        enableShadowCheckbox.addEventListener('change', () => {
            localStorage.setItem('enableShadow', enableShadowCheckbox.checked ? 'true' : 'false'); // Сохраняем состояние чекбокса в localStorage
            textShadowPanel.style.display = enableShadowCheckbox.checked ? 'block' : 'none';
        });
        // Панель для редактирования тени текста
        const textShadowPanel = document.createElement('div');
        textShadowPanel.style.display = enableShadowCheckbox.checked ? 'block' : 'none'; // Если тень включена, показываем панель
        const textShadowColorLabel = document.createElement('label');
        textShadowColorLabel.textContent = 'Цвет тени:';
        const textShadowColor = document.createElement('input');
        textShadowColor.type = 'color';
        if (focusedElement.element) {
            textShadowColor.value = this.rgbToHex(window.getComputedStyle(focusedElement.element).textShadow);
        }
        textShadowColor.addEventListener('input', (event) => {
            const target = event.target;
            if (focusedElement.element && target) {
                focusedElement.element.style.textShadow = `${target.value} ${focusedElement.element.style.textShadow.split(' ')[3]} ${focusedElement.element.style.textShadow.split(' ')[4]} ${focusedElement.element.style.textShadow.split(' ')[5]}`;
            }
        });
        const textShadowOffsetXLabel = document.createElement('label');
        textShadowOffsetXLabel.textContent = 'Смещение тени по горизонтали';
        const textShadowOffsetX = document.createElement('input');
        textShadowOffsetX.type = 'range';
        textShadowOffsetX.min = '0';
        textShadowOffsetX.max = '50';
        textShadowOffsetX.value = '0';
        textShadowOffsetX.step = '1';
        if (focusedElement.element) {
            textShadowOffsetX.value = this.extractShadowValue(window.getComputedStyle(focusedElement.element).textShadow, 'offsetX') || '0';
        }
        textShadowOffsetX.addEventListener('input', (event) => {
            const target = event.target;
            if (focusedElement.element && target) {
                focusedElement.element.style.textShadow = `${textShadowColor.value} ${target.value}px ${textShadowOffsetY.value}px ${textShadowBlur.value}px`;
            }
        });
        const textShadowOffsetYLabel = document.createElement('label');
        textShadowOffsetYLabel.textContent = 'Смещение тени по вертикали';
        const textShadowOffsetY = document.createElement('input');
        textShadowOffsetY.type = 'range';
        textShadowOffsetY.min = '0';
        textShadowOffsetY.max = '50';
        textShadowOffsetY.value = '0';
        textShadowOffsetY.step = '1';
        if (focusedElement.element) {
            textShadowOffsetY.value = this.extractShadowValue(window.getComputedStyle(focusedElement.element).textShadow, 'offsetY') || '0';
        }
        textShadowOffsetY.addEventListener('input', (event) => {
            const target = event.target;
            if (focusedElement.element && target) {
                focusedElement.element.style.textShadow = `${textShadowColor.value} ${textShadowOffsetX.value}px ${target.value}px ${textShadowBlur.value}px`;
            }
        });
        const textShadowBlurLabel = document.createElement('label');
        textShadowBlurLabel.textContent = 'Размытие тени';
        const textShadowBlur = document.createElement('input');
        textShadowBlur.type = 'range';
        textShadowBlur.min = '0';
        textShadowBlur.max = '20';
        textShadowBlur.value = '0';
        textShadowBlur.step = '1';
        if (focusedElement.element) {
            textShadowBlur.value = this.extractShadowValue(window.getComputedStyle(focusedElement.element).textShadow, 'blurRadius') || '0';
        }
        textShadowBlur.addEventListener('input', (event) => {
            const target = event.target;
            if (focusedElement.element && target) {
                focusedElement.element.style.textShadow = `${textShadowColor.value} ${textShadowOffsetX.value}px ${textShadowOffsetY.value}px ${target.value}px`;
            }
        });
        this.rightPanel.appendChild(input);
        this.rightPanel.appendChild(fontSelect);
        this.rightPanel.appendChild(fontSizeInput);
        this.rightPanel.appendChild(alignmentPanel);
        this.rightPanel.appendChild(colorPickerLabel);
        this.rightPanel.appendChild(colorPicker);
        this.rightPanel.appendChild(enableShadowLabel);
        this.rightPanel.appendChild(enableShadowCheckbox);
        this.rightPanel.appendChild(textShadowPanel);
        textShadowPanel.appendChild(textShadowColorLabel);
        textShadowPanel.appendChild(textShadowColor);
        textShadowPanel.appendChild(textShadowOffsetXLabel);
        textShadowPanel.appendChild(textShadowOffsetX);
        textShadowPanel.appendChild(textShadowOffsetYLabel);
        textShadowPanel.appendChild(textShadowOffsetY);
        textShadowPanel.appendChild(textShadowBlurLabel);
        textShadowPanel.appendChild(textShadowBlur);
        const deleteButton = this.createDeleteButton(focusedElement);
        this.rightPanel.appendChild(deleteButton);
    }
    createAlignButton(align, title) {
        const button = document.createElement('button');
        button.textContent = title;
        button.onclick = () => {
            const element = this.rightPanel.previousElementSibling;
            if (element) {
                element.style.textAlign = align;
            }
        };
        return button;
    }
    createDeleteButton(focusedElement) {
        const button = document.createElement('button');
        button.textContent = 'Удалить';
        button.onclick = () => {
            if (focusedElement.element) {
                focusedElement.element.remove();
                this.rightPanel.innerHTML = ''; // Очистка правой панели
            }
        };
        return button;
    }
    rgbToHex(rgb) {
        const result = rgb.match(/\d+/g);
        if (result) {
            const r = parseInt(result[0]).toString(16).padStart(2, '0');
            const g = parseInt(result[1]).toString(16).padStart(2, '0');
            const b = parseInt(result[2]).toString(16).padStart(2, '0');
            return `#${r}${g}${b}`;
        }
        return '#000000'; // Если не удалось определить цвет, возвращаем черный
    }
    extractShadowValue(shadow, type) {
        const match = shadow.match(/(rgb\(\d+, \d+, \d+\)|#\w{6}|#\w{3}|\d+px)/g);
        if (!match)
            return null;
        switch (type) {
            case 'color':
                return match[0];
            case 'offsetX':
                return match[1]?.replace('px', '') || '0';
            case 'offsetY':
                return match[2]?.replace('px', '') || '0';
            case 'blurRadius':
                return match[3]?.replace('px', '') || '0';
            default:
                return null;
        }
    }
}
class QREditor {
    qrGenerator;
    rightPanel;
    blurValue = 0;
    borderRadius = 0;
    constructor(qrGenerator, rightPanel) {
        this.qrGenerator = qrGenerator;
        this.rightPanel = rightPanel;
    }
    render(focusedElement) {
        this.rightPanel.innerHTML = '';
        const elementId = focusedElement.element.id;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = focusedElement.element.getAttribute('data-content') || '';
        input.placeholder = 'Измените текст QR';
        input.addEventListener('input', (event) => {
            const newValue = event.target.value;
            focusedElement.element.setAttribute('data-content', newValue);
            const canvas = focusedElement.element;
            const { width, height } = canvas.getBoundingClientRect();
            this.qrGenerator.generateQR(newValue, canvas);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            localStorage.setItem(`${elementId}_content`, newValue);
        });
        input.value = localStorage.getItem(`${elementId}_content`) || input.value;
        this.rightPanel.appendChild(input);
        const blurLabel = document.createElement('label');
        blurLabel.textContent = 'Размытие:';
        const blurInput = document.createElement('input');
        blurInput.type = 'range';
        blurInput.min = '0';
        blurInput.max = '10';
        blurInput.value = this.getBlurValue(focusedElement.element).toString();
        blurInput.addEventListener('input', () => {
            this.blurValue = Number(blurInput.value);
            this.updateBlur(focusedElement.element);
            localStorage.setItem(`${elementId}_blur`, blurInput.value);
        });
        blurInput.value = localStorage.getItem(`${elementId}_blur`) || blurInput.value;
        this.rightPanel.appendChild(blurLabel);
        this.rightPanel.appendChild(blurInput);
        const borderRadiusLabel = document.createElement('label');
        borderRadiusLabel.textContent = 'Скругление углов:';
        const borderRadiusInput = document.createElement('input');
        borderRadiusInput.type = 'range';
        borderRadiusInput.min = '0';
        borderRadiusInput.max = '50';
        borderRadiusInput.value = this.getBorderRadius(focusedElement.element).toString();
        borderRadiusInput.addEventListener('input', () => {
            this.borderRadius = Number(borderRadiusInput.value);
            focusedElement.element.style.borderRadius = `${this.borderRadius}px`;
            localStorage.setItem(`${elementId}_borderRadius`, borderRadiusInput.value);
        });
        borderRadiusInput.value = localStorage.getItem(`${elementId}_borderRadius`) || borderRadiusInput.value;
        this.rightPanel.appendChild(borderRadiusLabel);
        this.rightPanel.appendChild(borderRadiusInput);
        const aspectCheckbox = document.createElement('input');
        aspectCheckbox.type = 'checkbox';
        aspectCheckbox.checked = !focusedElement.element.classList.contains('non-aspected');
        const aspectLabel = document.createElement('label');
        aspectLabel.textContent = 'Изначальные пропорции';
        aspectLabel.appendChild(aspectCheckbox);
        aspectCheckbox.addEventListener('change', () => {
            if (aspectCheckbox.checked) {
                focusedElement.element.classList.remove('non-aspected');
            }
            else {
                focusedElement.element.classList.add('non-aspected');
            }
            localStorage.setItem(`${elementId}_aspectRatio`, aspectCheckbox.checked ? 'true' : 'false');
        });
        if (localStorage.getItem(`${elementId}_aspectRatio`) === 'false') {
            aspectCheckbox.checked = false;
            focusedElement.element.classList.add('non-aspected');
        }
        this.rightPanel.appendChild(aspectLabel);
        const shadowCheckbox = document.createElement('input');
        shadowCheckbox.type = 'checkbox';
        shadowCheckbox.checked = focusedElement.element.style.boxShadow !== '';
        const shadowLabel = document.createElement('label');
        shadowLabel.textContent = 'Добавить тень';
        shadowLabel.appendChild(shadowCheckbox);
        const shadowControlsContainer = document.createElement('div');
        shadowControlsContainer.style.display = shadowCheckbox.checked ? 'block' : 'none';
        shadowCheckbox.addEventListener('change', () => {
            shadowControlsContainer.style.display = shadowCheckbox.checked ? 'block' : 'none';
            if (!shadowCheckbox.checked) {
                focusedElement.element.style.boxShadow = '';
            }
            localStorage.setItem(`${elementId}_shadow`, shadowCheckbox.checked ? 'true' : 'false');
        });
        if (localStorage.getItem(`${elementId}_shadow`) === 'false') {
            shadowCheckbox.checked = false;
            focusedElement.element.style.boxShadow = '';
        }
        this.rightPanel.appendChild(shadowLabel);
        this.rightPanel.appendChild(shadowControlsContainer);
        const shadowXInput = document.createElement('input');
        shadowXInput.type = 'range';
        shadowXInput.min = '-50';
        shadowXInput.max = '50';
        shadowXInput.value = localStorage.getItem(`${elementId}_shadowX`) || '0';
        const shadowYInput = document.createElement('input');
        shadowYInput.type = 'range';
        shadowYInput.min = '-50';
        shadowYInput.max = '50';
        shadowYInput.value = localStorage.getItem(`${elementId}_shadowY`) || '0';
        const shadowBlurInput = document.createElement('input');
        shadowBlurInput.type = 'range';
        shadowBlurInput.min = '0';
        shadowBlurInput.max = '50';
        shadowBlurInput.value = localStorage.getItem(`${elementId}_shadowBlur`) || '0';
        const shadowColorInput = document.createElement('input');
        shadowColorInput.type = 'color';
        shadowColorInput.value = localStorage.getItem(`${elementId}_shadowColor`) || '#000000';
        const boxShadowLabel = document.createElement('label');
        boxShadowLabel.textContent = ' Смещение X: ';
        boxShadowLabel.appendChild(shadowXInput);
        boxShadowLabel.appendChild(document.createTextNode(' Смещение Y: '));
        boxShadowLabel.appendChild(shadowYInput);
        boxShadowLabel.appendChild(document.createTextNode(' Размытие: '));
        boxShadowLabel.appendChild(shadowBlurInput);
        boxShadowLabel.appendChild(document.createTextNode(' Цвет: '));
        boxShadowLabel.appendChild(shadowColorInput);
        const updateBoxShadow = () => {
            const x = shadowXInput.value;
            const y = shadowYInput.value;
            const blur = shadowBlurInput.value;
            const color = shadowColorInput.value;
            focusedElement.element.style.boxShadow = `${x}px ${y}px ${blur}px ${color}`;
            localStorage.setItem(`${elementId}_shadowX`, x);
            localStorage.setItem(`${elementId}_shadowY`, y);
            localStorage.setItem(`${elementId}_shadowBlur`, blur);
            localStorage.setItem(`${elementId}_shadowColor`, color);
        };
        shadowXInput.addEventListener('input', updateBoxShadow);
        shadowYInput.addEventListener('input', updateBoxShadow);
        shadowBlurInput.addEventListener('input', updateBoxShadow);
        shadowColorInput.addEventListener('input', updateBoxShadow);
        shadowControlsContainer.appendChild(boxShadowLabel);
        const borderCheckbox = document.createElement('input');
        borderCheckbox.type = 'checkbox';
        borderCheckbox.checked = focusedElement.element.style.border !== '';
        const borderLabel = document.createElement('label');
        borderLabel.textContent = 'Добавить обводку';
        borderLabel.appendChild(borderCheckbox);
        const borderControlsContainer = document.createElement('div');
        borderControlsContainer.style.display = borderCheckbox.checked ? 'block' : 'none';
        borderCheckbox.addEventListener('change', () => {
            borderControlsContainer.style.display = borderCheckbox.checked ? 'block' : 'none';
            if (!borderCheckbox.checked) {
                focusedElement.element.style.border = '';
            }
            localStorage.setItem(`${elementId}_border`, borderCheckbox.checked ? 'true' : 'false');
        });
        if (localStorage.getItem(`${elementId}_border`) === 'false') {
            borderCheckbox.checked = false;
            focusedElement.element.style.border = '';
        }
        this.rightPanel.appendChild(borderLabel);
        this.rightPanel.appendChild(borderControlsContainer);
        const borderWidthInput = document.createElement('input');
        borderWidthInput.type = 'range';
        borderWidthInput.min = '0';
        borderWidthInput.max = '20';
        borderWidthInput.value = localStorage.getItem(`${elementId}_borderWidth`) || '0';
        const borderColorInput = document.createElement('input');
        borderColorInput.type = 'color';
        borderColorInput.value = localStorage.getItem(`${elementId}_borderColor`) || '#000000';
        const borderThicknessLabel = document.createElement('label');
        borderThicknessLabel.textContent = 'Толщина: ';
        borderThicknessLabel.appendChild(borderWidthInput);
        const borderColorLabel = document.createElement('label');
        borderColorLabel.textContent = 'Цвет: ';
        borderColorLabel.appendChild(borderColorInput);
        const updateBorder = () => {
            const width = borderWidthInput.value;
            const color = borderColorInput.value;
            focusedElement.element.style.border = `${width}px solid ${color}`;
            localStorage.setItem(`${elementId}_borderWidth`, width);
            localStorage.setItem(`${elementId}_borderColor`, color);
        };
        borderWidthInput.addEventListener('input', updateBorder);
        borderColorInput.addEventListener('input', updateBorder);
        const deleteButton = this.createDeleteButton(focusedElement);
        this.rightPanel.appendChild(deleteButton);
        borderControlsContainer.appendChild(borderThicknessLabel);
        borderControlsContainer.appendChild(borderColorLabel);
    }
    createDeleteButton(focusedElement) {
        const button = document.createElement('button');
        button.textContent = 'Удалить';
        button.onclick = () => {
            if (focusedElement.element) {
                focusedElement.element.remove();
                this.rightPanel.innerHTML = ''; // Очистка правой панели
            }
        };
        return button;
    }
    getBlurValue(element) {
        const filter = element.style.filter;
        const blurMatch = filter.match(/blur\((\d+)px\)/);
        return blurMatch ? Number(blurMatch[1]) : 0;
    }
    updateBlur(element) {
        const previousOutline = element.style.outline;
        element.style.filter = `blur(${this.blurValue}px)`;
        element.style.outline = previousOutline;
    }
    getBorderRadius(element) {
        const borderRadius = element.style.borderRadius;
        return borderRadius ? parseInt(borderRadius, 10) : 0;
    }
}
class ImageEditor {
    rightPanel;
    constructor(rightPanel) {
        this.rightPanel = rightPanel;
    }
    render(focusedElement) {
        this.rightPanel.innerHTML = '';
        const aspectCheckbox = document.createElement('input');
        aspectCheckbox.type = 'checkbox';
        const elementId = focusedElement.element.id;
        aspectCheckbox.checked = !focusedElement.element.classList.contains('non-aspected');
        const aspectLabel = document.createElement('label');
        aspectLabel.textContent = 'Изначальные пропорции';
        aspectLabel.appendChild(aspectCheckbox);
        aspectCheckbox.addEventListener('change', () => {
            if (aspectCheckbox.checked) {
                focusedElement.element.classList.remove('non-aspected');
            }
            else {
                focusedElement.element.classList.add('non-aspected');
            }
            localStorage.setItem(`${elementId}_aspectRatio`, aspectCheckbox.checked ? 'true' : 'false');
        });
        if (localStorage.getItem(`${elementId}_aspectRatio`) === 'false') {
            aspectCheckbox.checked = false;
            focusedElement.element.classList.add('non-aspected');
        }
        this.rightPanel.appendChild(aspectLabel);
        const styleContainer = document.createElement('div');
        styleContainer.classList.add('style-editor');
        const borderRadiusInput = document.createElement('input');
        borderRadiusInput.type = 'range';
        borderRadiusInput.min = '0';
        borderRadiusInput.max = '50';
        borderRadiusInput.value = focusedElement.element.style.borderRadius.replace('%', '') || '0';
        const borderRadiusLabel = document.createElement('label');
        borderRadiusLabel.textContent = 'Скругление углов';
        borderRadiusLabel.appendChild(borderRadiusInput);
        borderRadiusInput.addEventListener('input', () => {
            focusedElement.element.style.borderRadius = `${borderRadiusInput.value}%`;
            localStorage.setItem(`${elementId}_borderRadius`, borderRadiusInput.value);
        });
        const savedBorderRadius = localStorage.getItem(`${elementId}_borderRadius`);
        if (savedBorderRadius) {
            borderRadiusInput.value = savedBorderRadius;
            focusedElement.element.style.borderRadius = `${savedBorderRadius}%`;
        }
        styleContainer.appendChild(borderRadiusLabel);
        const shadowCheckbox = document.createElement('input');
        shadowCheckbox.type = 'checkbox';
        shadowCheckbox.checked = focusedElement.element.style.boxShadow !== '';
        const shadowLabel = document.createElement('label');
        shadowLabel.textContent = 'Добавить тень';
        shadowLabel.appendChild(shadowCheckbox);
        const shadowControlsContainer = document.createElement('div');
        shadowControlsContainer.style.display = shadowCheckbox.checked ? 'block' : 'none';
        shadowCheckbox.addEventListener('change', () => {
            shadowControlsContainer.style.display = shadowCheckbox.checked ? 'block' : 'none';
            if (!shadowCheckbox.checked) {
                focusedElement.element.style.boxShadow = '';
            }
            localStorage.setItem(`${elementId}_shadow`, shadowCheckbox.checked ? 'true' : 'false');
        });
        if (localStorage.getItem(`${elementId}_shadow`) === 'false') {
            shadowCheckbox.checked = false;
            focusedElement.element.style.boxShadow = '';
        }
        styleContainer.appendChild(shadowLabel);
        styleContainer.appendChild(shadowControlsContainer);
        const shadowXInput = document.createElement('input');
        shadowXInput.type = 'range';
        shadowXInput.min = '-50';
        shadowXInput.max = '50';
        shadowXInput.value = localStorage.getItem(`${elementId}_shadowX`) || '0';
        const shadowYInput = document.createElement('input');
        shadowYInput.type = 'range';
        shadowYInput.min = '-50';
        shadowYInput.max = '50';
        shadowYInput.value = localStorage.getItem(`${elementId}_shadowY`) || '0';
        const shadowBlurInput = document.createElement('input');
        shadowBlurInput.type = 'range';
        shadowBlurInput.min = '0';
        shadowBlurInput.max = '50';
        shadowBlurInput.value = localStorage.getItem(`${elementId}_shadowBlur`) || '10';
        const shadowColorInput = document.createElement('input');
        shadowColorInput.type = 'color';
        shadowColorInput.value = localStorage.getItem(`${elementId}_shadowColor`) || '#000000';
        const boxShadowLabel = document.createElement('label');
        boxShadowLabel.appendChild(document.createTextNode(' Смещение тени по горизонтали '));
        boxShadowLabel.appendChild(shadowXInput);
        boxShadowLabel.appendChild(document.createTextNode(' Смещение тени по вертикали '));
        boxShadowLabel.appendChild(shadowYInput);
        boxShadowLabel.appendChild(document.createTextNode(' Размытие тени'));
        boxShadowLabel.appendChild(shadowBlurInput);
        boxShadowLabel.appendChild(document.createTextNode(' Цвет тени'));
        boxShadowLabel.appendChild(shadowColorInput);
        const updateBoxShadow = () => {
            const x = shadowXInput.value;
            const y = shadowYInput.value;
            const blur = shadowBlurInput.value;
            const color = shadowColorInput.value;
            focusedElement.element.style.boxShadow = `${x}px ${y}px ${blur}px ${color}`;
            localStorage.setItem(`${elementId}_shadowX`, x);
            localStorage.setItem(`${elementId}_shadowY`, y);
            localStorage.setItem(`${elementId}_shadowBlur`, blur);
            localStorage.setItem(`${elementId}_shadowColor`, color);
        };
        shadowXInput.addEventListener('input', updateBoxShadow);
        shadowYInput.addEventListener('input', updateBoxShadow);
        shadowBlurInput.addEventListener('input', updateBoxShadow);
        shadowColorInput.addEventListener('input', updateBoxShadow);
        shadowControlsContainer.appendChild(boxShadowLabel);
        const borderCheckbox = document.createElement('input');
        borderCheckbox.type = 'checkbox';
        borderCheckbox.checked = focusedElement.element.style.border !== '';
        const borderLabel = document.createElement('label');
        borderLabel.textContent = 'Добавить обводку';
        borderLabel.appendChild(borderCheckbox);
        const borderControlsContainer = document.createElement('div');
        borderControlsContainer.style.display = borderCheckbox.checked ? 'block' : 'none';
        borderCheckbox.addEventListener('change', () => {
            borderControlsContainer.style.display = borderCheckbox.checked ? 'block' : 'none';
            if (!borderCheckbox.checked) {
                focusedElement.element.style.border = '';
            }
            localStorage.setItem(`${elementId}_border`, borderCheckbox.checked ? 'true' : 'false');
        });
        if (localStorage.getItem(`${elementId}_border`) === 'false') {
            borderCheckbox.checked = false;
            focusedElement.element.style.border = '';
        }
        styleContainer.appendChild(borderLabel);
        styleContainer.appendChild(borderControlsContainer);
        const borderWidthInput = document.createElement('input');
        borderWidthInput.type = 'range';
        borderWidthInput.min = '0';
        borderWidthInput.max = '20';
        borderWidthInput.value = localStorage.getItem(`${elementId}_borderWidth`) || '0';
        const borderColorInput = document.createElement('input');
        borderColorInput.type = 'color';
        borderColorInput.value = localStorage.getItem(`${elementId}_borderColor`) || '#000000';
        const borderThicknessLabel = document.createElement('label');
        borderThicknessLabel.textContent = 'Толщина обводки';
        borderThicknessLabel.appendChild(borderWidthInput);
        const borderColorLabel = document.createElement('label');
        borderColorLabel.textContent = 'Цвет обводки';
        borderColorLabel.appendChild(borderColorInput);
        const updateBorder = () => {
            const width = borderWidthInput.value;
            const color = borderColorInput.value;
            focusedElement.element.style.border = `${width}px solid ${color}`;
            localStorage.setItem(`${elementId}_borderWidth`, width);
            localStorage.setItem(`${elementId}_borderColor`, color);
        };
        borderWidthInput.addEventListener('input', updateBorder);
        borderColorInput.addEventListener('input', updateBorder);
        borderControlsContainer.appendChild(borderThicknessLabel);
        borderControlsContainer.appendChild(borderColorLabel);
        this.rightPanel.appendChild(styleContainer);
        const deleteButton = this.createDeleteButton(focusedElement);
        this.rightPanel.appendChild(deleteButton);
    }
    createDeleteButton(focusedElement) {
        const button = document.createElement('button');
        button.textContent = 'Удалить';
        button.onclick = () => {
            if (focusedElement.element) {
                focusedElement.element.remove();
                this.rightPanel.innerHTML = ''; // Очистка правой панели
            }
        };
        return button;
    }
}
export class UI {
    canvas;
    qrGenerator;
    elementManager;
    rightPanel;
    currentEditor = null;
    constructor(canvas, qrGenerator) {
        this.canvas = canvas;
        this.qrGenerator = qrGenerator;
        this.elementManager = new ElementManager(canvas, qrGenerator);
        this.rightPanel = this.createRightPanel();
        document.body.appendChild(this.rightPanel);
        this.addFocusListeners();
    }
    render() {
        const panel = this.createControlPanel();
        document.body.appendChild(panel);
    }
    createControlPanel() {
        const panel = document.createElement('div');
        panel.classList.add('panel');
        panel.appendChild(this.createButton('Добавить текст', () => this.addElement('user-text')));
        panel.appendChild(this.createButton('Добавить изображение', () => this.addElement('user-image')));
        panel.appendChild(this.createButton('Добавить QR код', () => this.elementManager.createNewQR('Текст')));
        const downloadButton = this.createButton('Скачать изображение', () => this.downloadCanvasAsImage());
        downloadButton.classList.add('download-button'); // Дополнительный класс для кнопки "Выйти"
        panel.appendChild(downloadButton);
        panel.appendChild(this.createButton('Скачать изображение', () => this.downloadCanvasAsImage()));
        const exitButton = this.createButton('Выйти', () => this.exitApplication());
        exitButton.classList.add('exit-button'); // Дополнительный класс для кнопки "Выйти"
        panel.appendChild(exitButton);
        const saveButton = this.createButton('Сохранить', () => this.saveToDatabase());
        saveButton.classList.add('save-button'); // Дополнительный класс для кнопки "Сохранить"
        panel.appendChild(saveButton);
        return panel;
    }
    downloadCanvasAsImage() {
        const canvasContainer = this.canvas;
        if (!canvasContainer) {
            console.error('Ошибка: элемент canvasContainer не найден.');
            return;
        }
        const elements = canvasContainer.querySelectorAll('*');
        elements.forEach((element) => {
            element.style.outline = 'none';
        });
        toJpeg(canvasContainer, {
            quality: 0.95,
            backgroundColor: 'white',
        })
            .then((dataUrl) => {
            const link = document.createElement('a');
            link.download = 'canvas-image.jpg';
            link.href = dataUrl;
            link.click();
            elements.forEach((element) => {
                element.style.outline = '';
            });
        })
            .catch((error) => {
            console.error('Ошибка при создании изображения:', error);
        });
    }
    exitApplication() {
        console.log('Выход из приложения'); // Пока выполняет только логирование
        // Здесь можно добавить логику перенаправления на главную страницу, если потребуется
    }
    saveToDatabase() {
        console.log('Сохранение в БД'); // Пока выполняет только логирование
        // Здесь можно реализовать логику сохранения данных в БД
    }
    createRightPanel() {
        const panel = document.createElement('div');
        panel.classList.add('right-panel');
        return panel;
    }
    createButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.onclick = onClick;
        return button;
    }
    handleFocus(event) {
        const element = event.target;
        const elementData = this.elementManager.getElementData(element);
        if (elementData) {
            this.updateRightPanel(elementData);
            this.addFocus(element);
        }
    }
    addFocusListeners() {
        document.addEventListener('focus', (event) => {
            const element = event.target;
            if (element && (element.classList.contains('user-text') || element.classList.contains('user-image') || element.classList.contains('user-qr'))) {
                this.handleFocus(event);
            }
        }, true);
    }
    updateRightPanel(focusedElement) {
        this.rightPanel.innerHTML = '';
        switch (focusedElement.type) {
            case 'user-text':
                this.currentEditor = new TextEditor(this.rightPanel);
                break;
            case 'user-qr':
                this.currentEditor = new QREditor(this.qrGenerator, this.rightPanel);
                break;
            case 'user-image':
                this.currentEditor = new ImageEditor(this.rightPanel);
                break;
        }
        if (this.currentEditor) {
            this.currentEditor.render(focusedElement);
        }
    }
    addElement(type) {
        this.elementManager.addElement(type);
    }
    addFocus(element) {
        // Удаляем анимацию с предыдущего элемента, если таковой был
        const previousFocusedElement = document.querySelector('.focused');
        if (previousFocusedElement) {
            previousFocusedElement.classList.remove('focused');
        }
        // Добавляем анимацию для текущего элемента
        element.classList.add('focused');
        // Находим кнопку с классом .download-button и добавляем обработчик события
        const downloadButton = document.querySelector('.download-button');
        if (downloadButton) {
            downloadButton.addEventListener('click', () => {
                const focusedElement = document.querySelector('.focused');
                if (focusedElement) {
                    focusedElement.classList.remove('focused');
                }
            });
        }
    }
}
//# sourceMappingURL=ui.js.map