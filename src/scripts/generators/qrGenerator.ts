import { ElementData } from '../element';
import { enableDragging } from '../../elements/moveElement';
import { enableResizeForElements } from '../../elements/resize';
import QRCode from 'qrcode';

export class QRCodeGenerator {
  private canvas: HTMLDivElement;
  private elements: ElementData[];

  constructor(canvas: HTMLDivElement, elements: ElementData[]) {
    this.canvas = canvas;
    this.elements = elements;
  }

  createNewQR(content: string): void {
    const canvas = this.createElement('canvas', 'user-qr', this.generateUniqueId()) as HTMLCanvasElement;
    this.generateQR(content, canvas);
    this.positionElementInCenter(canvas);
    enableDragging(canvas, this.canvas);
    enableResizeForElements(canvas, this.canvas);

    // Установка атрибута tabindex и фокусировка на элементе
    canvas.setAttribute('tabindex', '0');
    canvas.focus();
  }

  private createElement(tag: string, className: string, id: string): HTMLElement {
    const element = document.createElement(tag);
    element.id = id;
    element.classList.add(className);

    element.style.position = 'absolute';
    this.canvas.appendChild(element);
    
    this.elements.push({ type: className as 'user-text' | 'user-image' | 'user-qr', element });
    return element;
  }

  private positionElementInCenter(element: HTMLElement): void {
    const rect = this.canvas.getBoundingClientRect();
    const left = (rect.width - element.offsetWidth) / 2;
    const top = (rect.height - element.offsetHeight) / 2;

    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
  }

  public generateQR(content: string, canvas: HTMLCanvasElement): void {
    QRCode.toCanvas(canvas, content, (error) => {
      if (error) {
        console.error('Ошибка при генерации QR-кода:', error);
      } else {
        console.log('QR-код успешно сгенерирован');
      }
    });
  }

  private generateUniqueId(): string {
    return 'qr-' + crypto.getRandomValues(new Uint32Array(8)).join('');
  }
}