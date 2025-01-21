import { QRCodeGenerator } from '../src/scripts/qrGenerator';
import { UI } from '../src/scripts/ui';
class App {
    canvasContainer;
    qrGenerator;
    ui;
    constructor() {
        this.canvasContainer = this.createCanvas(); // Создаем div контейнер для канваса
        this.qrGenerator = new QRCodeGenerator();
        this.ui = new UI(this.canvasContainer, this.qrGenerator); // Передаем div вместо канваса
        this.initialize();
    }
    createCanvas() {
        const div = document.createElement('div');
        div.classList.add('canvas-container'); // Применим стили через CSS
        // Добавляем div в тело документа
        document.body.appendChild(div);
        return div;
    }
    initialize() {
        // Отображаем интерфейс с кнопками и другим функционалом
        this.ui.render();
    }
}
// Запуск приложения
new App();
//# sourceMappingURL=main.js.map