import { TextGenerator } from './generators/textGenerator';
import { ImageGenerator } from './generators/imageGenerator';
import { QRCodeGenerator } from './generators/qrGenerator';

export interface ElementData {
  type: 'user-text' | 'user-image' | 'user-qr';
  element: HTMLElement;
}

export class ElementManager {
  private canvas: HTMLDivElement;
  private elements: ElementData[] = [];
  private textGenerator: TextGenerator;
  private imageGenerator: ImageGenerator;
  public qrGenerator: QRCodeGenerator;

  constructor(canvas: HTMLDivElement) {
    this.canvas = canvas;
    this.textGenerator = new TextGenerator(canvas, this.elements);
    this.imageGenerator = new ImageGenerator(canvas, this.elements);
    this.qrGenerator = new QRCodeGenerator(canvas, this.elements);
  }

  createTextElement(): HTMLElement {
    return this.textGenerator.createTextElement();
  }

  handleImageInput(event: Event): void {
    this.imageGenerator.handleImageInput(event);
  }

  createNewQR(content: string): void {
    this.qrGenerator.createNewQR(content);
  }

  getElementData(element: HTMLElement): ElementData | undefined {
    return this.elements.find(el => el.element === element);
  }
}