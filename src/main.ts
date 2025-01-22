import { UI } from './scripts/ui';

class App {
  private canvasContainer: HTMLDivElement;
  private ui: UI;

  constructor() {
    this.canvasContainer = this.createCanvas();
    this.ui = new UI(this.canvasContainer);
    this.initialize();
  }

  private createCanvas(): HTMLDivElement {
    const div = document.createElement('div');
    div.classList.add('canvas-container');
    
    // Добавляем div в тело документа
    document.body.appendChild(div);
    return div;
  }

  private initialize(): void {
    this.ui.render();
  }
}

new App();