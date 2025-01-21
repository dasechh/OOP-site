import { QRCodeGenerator } from './qrGenerator';
import { enableDragging } from '../elements/moveElement';
import { enableResizeForElements } from '../elements/resize';

export interface ElementData {
  type: 'user-image' | 'user-qr' | 'user-text';
  element: HTMLElement;
}

export class ElementManager {
  private canvas: HTMLDivElement;
  private qrGenerator: QRCodeGenerator;
  private elements: ElementData[] = [];
  private textCounter = 0;
  private focusedElement: ElementData | null = null;

  constructor(canvas: HTMLDivElement, qrGenerator: QRCodeGenerator) {
    this.canvas = canvas;
    this.qrGenerator = qrGenerator;
  }

  public addElement(type: 'user-image' | 'user-qr' | 'user-text'): HTMLElement | null {
    let element: HTMLElement | null = null;

    if (type === 'user-text') {
        element = this.createElement('div', 'user-text', this.generateUniqueId());
        element.textContent = `Введите ваш текст в панели справа\n\n\n`;
        element.style.whiteSpace = 'pre-line';
        element.setAttribute('tabindex', '0');
        element.focus();
    } else if (type === 'user-image') {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.addEventListener('change', this.handleImageInput.bind(this));
        fileInput.click();
    } else if (type === 'user-qr') {
        // Для QR-кодов мы будем создавать их отдельно
        return null;
    }

    if (element) {
        // Добавляем элемент в коллекцию
        this.elements.push({ element, type });
        this.positionElementInCenter(element);
        enableDragging(element, this.canvas);
        enableResizeForElements(element, this.canvas);
    }

    return element; // Возвращаем элемент для дальнейшей работы
}

  // Метод для получения данных об элементе
  public getElementData(element: HTMLElement): ElementData | undefined {
    return this.elements.find(e => e.element === element);
  }

  public createNewQR(qrContent: string): void {
    const qrCanvas = this.createElement('canvas', 'user-qr', this.generateUniqueId()) as HTMLCanvasElement;
    qrCanvas.setAttribute('tabindex', '0');
    qrCanvas.setAttribute('data-content', qrContent);

    this.qrGenerator.generateQR(qrContent, qrCanvas);
    this.positionElementInCenter(qrCanvas);
    enableDragging(qrCanvas, this.canvas);
    enableResizeForElements(qrCanvas, this.canvas);
    this.elements.push({ type: 'user-qr', element: qrCanvas });
    qrCanvas.focus();
  }

  private createElement(tag: string, className: string, id: string): HTMLElement {
    const element = document.createElement(tag);
    element.id = id;
    element.classList.add(className);
  
    if (className === 'user-text') {
      element.classList.add('non-aspected');
    }
  
    element.style.position = 'absolute';
    this.canvas.appendChild(element);
    this.elements.push({ type: className as 'user-text' | 'user-image' | 'user-qr', element });
    return element;
  }

  private positionElementInCenter(element: HTMLElement): void {
    const rect = this.canvas.getBoundingClientRect();
    const containerStyle = getComputedStyle(this.canvas);
    const left = (rect.width - element.offsetWidth) / 2;
    const top = (rect.height - element.offsetHeight) / 2;
  
    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
  }

  private handleImageInput(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const imageElement = this.createElement('img', 'user-image', this.generateUniqueId()) as HTMLImageElement;
        const { width, height } = this.scaleToFit(img, this.canvas.getBoundingClientRect().width, this.canvas.getBoundingClientRect().height);
        imageElement.src = reader.result as string;
        imageElement.style.width = `${width}px`;
        imageElement.style.height = `${height}px`;
        this.positionElementInCenter(imageElement);
        imageElement.setAttribute('tabindex', '0');
        imageElement.focus();
        enableDragging(imageElement, this.canvas);
        enableResizeForElements(imageElement, this.canvas);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  private scaleToFit(img: HTMLImageElement, maxWidth: number, maxHeight: number): { width: number; height: number } {
    let { width, height } = img;
    if (width > maxWidth || height > maxHeight) {
      const scale = Math.min(maxWidth / width, maxHeight / height);
      width *= scale;
      height *= scale;
    }
    return { width, height };
  }

  private generateUniqueId(): string {
    return 'image-' + crypto.getRandomValues(new Uint32Array(8)).join('');
  }
}
