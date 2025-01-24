import { ElementData } from '../../elements/element';
import { enableDragging } from '../../elements/moveElement';
import { enableResizeForElements } from '../../elements/resize';

export class TextGenerator {
  private canvas: HTMLDivElement;
  private elements: ElementData[];

  constructor(canvas: HTMLDivElement, elements: ElementData[]) {
    this.canvas = canvas;
    this.elements = elements;
  }

  createTextElement(): HTMLElement {
    const textElement = this.createElement('div', 'user-text', this.generateUniqueId());
    textElement.textContent = 'Новый текст';
    this.positionElementInCenter(textElement);
    textElement.setAttribute('tabindex', '0');
    textElement.focus();
    enableDragging(textElement, this.canvas);
    enableResizeForElements(textElement, this.canvas);
    return textElement;
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
    const left = (rect.width - element.offsetWidth) / 2;
    const top = (rect.height - element.offsetHeight) / 2;

    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
  }

  private generateUniqueId(): string {
    return 'text-' + crypto.getRandomValues(new Uint32Array(8)).join('');
  }
}