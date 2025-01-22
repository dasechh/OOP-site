import { ElementData, ElementManager } from "../elements/element";
import { toJpeg } from "html-to-image";
import { TextEditor } from "./editors/textEditor";
import { QREditor } from "./editors/qrEditor";
import { ImageEditor } from "./editors/imageEditor";

export interface IElementEditor {
  render(focusedElement: ElementData): void;
}

export class UI {
  private canvas: HTMLDivElement;
  private elementManager: ElementManager;
  private rightPanel: HTMLDivElement;
  private currentEditor: IElementEditor | null = null;

  constructor(canvas: HTMLDivElement) {
    this.canvas = canvas;
    this.elementManager = new ElementManager(canvas);
    this.rightPanel = this.createRightPanel();
    document.body.appendChild(this.rightPanel);
    this.addFocusListeners();
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

    const exitButton = this.createButton("Выйти", () => this.exitApplication());
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
    // Здесь можно добавить логику перенаправления на главную страницу
  }

  private saveToDatabase(): void {
    console.log("Сохранение в БД");
    // Здесь можно реализовать логику сохранения данных в БД
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

  private handleFocus(event: FocusEvent): void {
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

  private addElement(type: "user-image" | "user-qr" | "user-text"): void {
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
}
