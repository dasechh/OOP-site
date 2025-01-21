import { QRCodeGenerator } from '../src/scripts/qrGenerator';
import { UI } from '../src/scripts/ui';

class App {
  private canvasContainer: HTMLDivElement;
  private qrGenerator: QRCodeGenerator;
  private ui: UI;

  constructor() {
    this.canvasContainer = this.createCanvas();  // Создаем div контейнер для канваса
    this.qrGenerator = new QRCodeGenerator();
    this.ui = new UI(this.canvasContainer, this.qrGenerator);  // Передаем div вместо канваса
    this.initialize();
  }

  private createCanvas(): HTMLDivElement {
    const div = document.createElement('div');
    div.classList.add('canvas-container');  // Применим стили через CSS
    
    // Добавляем div в тело документа
    document.body.appendChild(div);
    return div;
  }
  

  private initialize(): void {
    // Отображаем интерфейс с кнопками и другим функционалом
    this.ui.render();
  }
}

// Запуск приложения
new App();
