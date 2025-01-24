import { UI } from "./scripts/ui";
import { QRCodeGenerator } from "./scripts/generators/qrGenerator";

class App {
  private canvasContainer: HTMLDivElement;
  private ui: UI;
  private qrGenerator: QRCodeGenerator;

  constructor() {
    this.canvasContainer = this.createCanvas();
    this.ui = new UI(this.canvasContainer);
    this.qrGenerator = new QRCodeGenerator(this.canvasContainer, []);
    this.initialize();
  }

  private createCanvas(): HTMLDivElement {
    const div = document.createElement("div");
    div.classList.add("canvas-container");

    document.body.appendChild(div);
    return div;
  }

  private async initialize(): Promise<void> {
    const urlParams = new URLSearchParams(window.location.search);
    const canvasName = urlParams.get('canvas_name');
    const userEmail = localStorage.getItem('user_email');

    if (canvasName && userEmail) {
      try {
        const response = await fetch(`http://localhost:3000/canvas-elements?user_email=${userEmail}&canvas_name=${canvasName}`);
        const data = await response.json();

        if (data.status === "success") {
          data.elements.forEach((element: any) => {
            // Определение типа элемента на основании начала его id
            if (element.id.startsWith("image-")) {
              console.log("Image element:", element);
            } else if (element.id.startsWith("qr-")) {
              console.log("QR element:", element);
            } else if (element.id.startsWith("text-")) {
              console.log("Text element:", element);
            } else {
              console.error("Неизвестный тип элемента:", element.id);
            }
          });
        } else {
          console.error("Ошибка при получении элементов канваса:", data.message);
        }
      } catch (error) {
        console.error("Ошибка при получении элементов канваса:", error);
      }
    }
    this.ui.render();
  }
}

new App();