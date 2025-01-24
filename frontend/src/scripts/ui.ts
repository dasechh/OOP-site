import { ElementData, ElementManager } from "../elements/element";
import { toJpeg } from "html-to-image";
import { TextEditor } from "./editors/textEditor";
import { QREditor } from "./editors/qrEditor";
import { ImageEditor } from "./editors/imageEditor";

declare global {
  interface Window {
    currentUserEmail: string;
  }
}

export interface IElementEditor {
  render(focusedElement: ElementData): void;
}

export class UI {
  private canvas: HTMLDivElement;
  public elementManager: ElementManager;
  private rightPanel: HTMLDivElement;
  private currentEditor: IElementEditor | null = null;

  constructor(canvas: HTMLDivElement) {
    this.canvas = canvas;
    this.elementManager = new ElementManager(canvas);
    this.rightPanel = this.createRightPanel();
    document.body.appendChild(this.rightPanel);
    this.addFocusListeners();
    this.loadElementsFromDatabase();
  }

  public render(): void {
    const panel = this.createControlPanel();
    document.body.appendChild(panel);
  }

  private createControlPanel(): HTMLDivElement {
    const panel = document.createElement("div");
    panel.classList.add("panel");

    panel.appendChild(
      this.createButton("Добавить текст", () => this.addElement("user-text"))
    );
    panel.appendChild(
      this.createButton("Добавить изображение", () =>
        this.addElement("user-image")
      )
    );
    panel.appendChild(
      this.createButton("Добавить QR код", () =>
        this.elementManager.createNewQR("Текст")
      )
    );

    const downloadButton = this.createButton("Скачать изображение", () =>
      this.downloadCanvasAsImage()
    );
    downloadButton.classList.add("download-button");
    panel.appendChild(downloadButton);

    const exitButton = this.createButton("Главное меню", () => this.exitApplication());
    exitButton.classList.add("exit-button");
    panel.appendChild(exitButton);

    const saveButton = this.createButton("Сохранить", () =>
      this.saveToDatabase()
    );
    saveButton.classList.add("save-button");
    panel.appendChild(saveButton);

    return panel;
  }

  private downloadCanvasAsImage(): void {
    const canvasContainer = this.canvas;

    if (!canvasContainer) {
      console.error("Ошибка: элемент canvasContainer не найден.");
      return;
    }

    const elements = canvasContainer.querySelectorAll<HTMLElement>("*");
    elements.forEach((element: HTMLElement) => {
      element.style.outline = "none";
    });

    toJpeg(canvasContainer, {
      quality: 0.95,
      backgroundColor: "white",
    })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = "canvas-image.jpg";
        link.href = dataUrl;
        link.click();

        elements.forEach((element: HTMLElement) => {
          element.style.outline = "";
        });
      })
      .catch((error) => {
        console.error("Ошибка при создании изображения:", error);
      });
  }

  private exitApplication(): void {
    console.log("Выход из приложения");
    window.location.href = "main-menu.html";
  }

  private saveToDatabase(): void {
    this.createSaveModal();

    const modal = document.getElementById("saveModal") as HTMLElement;
    const closeModal = document.getElementsByClassName("close")[0] as HTMLElement;
    const saveButton = document.getElementById("saveDesignButton") as HTMLButtonElement;
    const cancelButton = document.getElementById("cancelButton") as HTMLButtonElement;
    const designNameInput = document.getElementById("designName") as HTMLInputElement;

    modal.style.display = "block";

    closeModal.onclick = () => {
        modal.style.display = "none";
    };

    cancelButton.onclick = () => {
        modal.style.display = "none";
    };

    saveButton.onclick = () => {
        const canvasName = designNameInput.value;

        if (!canvasName) {
            console.error("Название дизайна не введено");
            return;
        }

        console.log("Сохранение в БД");

        const elements = document.querySelectorAll('.canvas-container *');
        const elementsData = Array.from(elements).map(element => {
            const styles = window.getComputedStyle(element);
            const styleObject: { [key: string]: string } = {};
            for (let i = 0; i < styles.length; i++) {
                styleObject[styles[i]] = styles.getPropertyValue(styles[i]);
            }

            let base64Image = "";
            if (element.tagName === "IMG") {
                const img = element as HTMLImageElement;
                base64Image = img.src;
            }

            const attributes: { [key: string]: string | null } = {};
            Array.from(element.attributes).forEach(attr => {
                attributes[attr.name] = attr.value;
            });

            return {
                id: element.id || null,
                tagName: element.tagName,
                styles: JSON.stringify(styleObject), // Сериализуем объект стилей в строку JSON
                innerHTML: element.innerHTML,
                base64Image: base64Image,
                dataContent: element.getAttribute("data-content") || null,
                attributes: attributes
            };
        });

        const user_email = localStorage.getItem('user_email');
        if (!user_email) {
            console.error("Ошибка: user_email не может быть пустым");
            return;
        }

        const payload = {
            user_email: user_email,
            canvasName: canvasName,
            elements: elementsData
        };

        fetch('http://localhost:3000/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            modal.style.display = "none";
        })
        .catch(error => {
            console.error('Error:', error);
            modal.style.display = "none";
        });
    };

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
  }

  private createSaveModal(): void {
    const modalHtml = `
        <div id="saveModal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Сохранить дизайн</h2>
                <label for="designName">Введите название для вашего дизайна:</label>
                <input type="text" id="designName" name="designName">
                <button id="saveDesignButton">Сохранить</button>
                <button id="cancelButton">Отмена</button>
            </div>
        </div>
    `;

    const modalElement = document.createElement('div');
    modalElement.innerHTML = modalHtml;
    document.body.appendChild(modalElement);
  }

  private createRightPanel(): HTMLDivElement {
    const panel = document.createElement("div");
    panel.classList.add("right-panel");
    return panel;
  }

  private createButton(text: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement("button");
    button.textContent = text;
    button.onclick = onClick;
    return button;
  }

   handleFocus(event: FocusEvent): void {
    const element = event.target as HTMLElement;
    const elementData = this.elementManager.getElementData(element);

    if (elementData) {
      this.updateRightPanel(elementData);
      this.addFocus(element);
    }
  }

  private addFocusListeners(): void {
    document.addEventListener(
      "focus",
      (event) => {
        const element = event.target as HTMLElement;
        if (
          element &&
          (element.classList.contains("user-text") ||
            element.classList.contains("user-image") ||
            element.classList.contains("user-qr"))
        ) {
          this.handleFocus(event);
        }
      },
      true
    );
  }

  private updateRightPanel(focusedElement: ElementData): void {
    this.rightPanel.innerHTML = "";

    switch (focusedElement.type) {
      case "user-text":
        this.currentEditor = new TextEditor(this.rightPanel);
        break;
      case "user-qr":
        this.currentEditor = new QREditor(
          this.elementManager.qrGenerator,
          this.rightPanel
        );
        break;
      case "user-image":
        this.currentEditor = new ImageEditor(this.rightPanel);
        break;
      default:
        this.currentEditor = null;
    }

    if (this.currentEditor) {
      this.currentEditor.render(focusedElement);
    }
  }

  public addElement(type: "user-image" | "user-qr" | "user-text"): void {
    switch (type) {
      case "user-text":
        this.elementManager.createTextElement();
        break;
      case "user-image":
        const imageInput = document.createElement("input");
        imageInput.type = "file";
        imageInput.accept = "image/*";

        imageInput.onchange = (event) =>
          this.elementManager.handleImageInput(event);
        imageInput.click();
        break;
      case "user-qr":
        this.elementManager.createNewQR("Текст");
        break;
    }
  }

  private addFocus(element: HTMLElement): void {
    this.removePreviousFocus();
    element.classList.add("focused");
    this.setupDownloadButton();
  }

  private removePreviousFocus(): void {
    const previousFocusedElement = document.querySelector(".focused");
    if (previousFocusedElement) {
      previousFocusedElement.classList.remove("focused");
    }
  }

  private setupDownloadButton(): void {
    const downloadButton = document.querySelector(
      ".download-button"
    ) as HTMLElement;
    if (downloadButton) {
      downloadButton.addEventListener("click", this.handleDownloadButtonClick);
    }
  }

  private handleDownloadButtonClick(): void {
    const focusedElement = document.querySelector(".focused");
    if (focusedElement) {
      focusedElement.classList.remove("focused");
    }
  }

  private async loadElementsFromDatabase(): Promise<void> {
    const user_email = localStorage.getItem('user_email');
    const urlParams = new URLSearchParams(window.location.search);
    const canvas_name = urlParams.get('canvas_name');

    if (!user_email) {
      console.error("Ошибка: user_email не найден в localStorage");
      return;
    }

    if (!canvas_name) {
      console.error("Ошибка: canvas_name не найден в localStorage");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/canvas-elements?user_email=${user_email}&canvas_name=${canvas_name}`);
      const data = await response.json();

      if (data.status === "success") {
        data.elements.forEach((elementData: any) => {
          if (elementData.id.startsWith("text")) {
            console.log('Создание текстового элемента:', elementData);
            const textElement = this.elementManager.createTextElement();
            if (!textElement) {
              console.error("Ошибка при создании текстового элемента");
              return;
            }
            textElement.id = elementData.id;
            textElement.innerHTML = elementData.inner_html;

            const allowedStyles = [
              'position', 'left', 'top', 'width', 'height', 'box-sizing',
              'color', 'text-shadow', 'text-align', 'font-size', 'font-family'
            ];

            const styles = JSON.parse(elementData.styles);
            for (const [key, value] of Object.entries(styles)) {
              if (value && allowedStyles.includes(key)) {
                textElement.style.setProperty(key, value as string);
              }
            }

            // Set necessary attributes
            textElement.setAttribute('tabindex', '0');
            textElement.setAttribute('data-x', elementData['data-x'] || '0');
            textElement.setAttribute('data-y', elementData['data-y'] || '0');

            // Добавить элемент в массив
            this.elementManager.elements.push({ type: 'user-text', element: textElement });

            // Update right panel
            const textElementData = this.elementManager.getElementData(textElement);
            if (textElementData) {
              this.updateRightPanel(textElementData);
            } else {
              console.error("Ошибка: данные текстового элемента не найдены");
            }
          } else if (elementData.id.startsWith("qr")) {
            console.log('Создание QR кода:', elementData);
            const qrElement = this.elementManager.createNewQR(elementData.data_content || 'текст');
            if (!qrElement) {
              console.error("Ошибка при создании QR кода");
              return;
            }
            qrElement.id = elementData.id;

            const allowedStyles = [
              'position', 'left', 'top', 'width', 'height', 'border-radius',
              'border-top-left-radius', 'border-top-right-radius',
              'border-bottom-left-radius', 'border-bottom-right-radius',
              'border-start-start-radius', 'border-start-end-radius',
              'border-end-start-radius', 'border-end-end-radius',
              'box-shadow'
            ];

            const styles = JSON.parse(elementData.styles);
            console.log('Styles:', styles);
            for (const [key, value] of Object.entries(styles)) {
              if (value && allowedStyles.includes(key)) {
                console.log('Setting style:', key, value);
                qrElement.style.setProperty(key, value as string);
              }
            }
            console.log('elementData:', elementData.data_content);
            qrElement.setAttribute('data-content', elementData.data_content || 'текст');
            // Set necessary attributes
            qrElement.setAttribute('tabindex', '0');


            // Добавить элемент в массив
            this.elementManager.elements.push({ type: 'user-qr', element: qrElement });

            // Update right panel
            const qrElementData = this.elementManager.getElementData(qrElement);
            if (qrElementData) {
              this.updateRightPanel(qrElementData);
            } else {
              console.error("Ошибка: данные элемента QR не найдены");
            }
          } else if (elementData.id.startsWith("image")) {
            console.log('Создание элемента изображения:', elementData);
            this.elementManager.addImageElementFromDatabase(elementData);

            // Update right panel
            const imgElement = document.getElementById(elementData.id) as HTMLElement;
            const imgElementData = this.elementManager.getElementData(imgElement);
            if (imgElementData) {
              this.updateRightPanel(imgElementData);
            } else {
              console.error("Ошибка: данные элемента изображения не найдены");
            }
          }
        });
      } else {
        console.error("Ошибка при получении данных элементов:", data.message);
      }
    } catch (error) {
      console.error("Ошибка при получении данных элементов:", error);
    }
  }
}