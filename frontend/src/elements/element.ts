import { TextGenerator } from "../scripts/generators/textGenerator";
import { ImageGenerator } from "../scripts/generators/imageGenerator";
import { QRCodeGenerator } from "../scripts/generators/qrGenerator";
import { enableDragging } from "./moveElement";
import { enableResizeForElements } from "./resize";

export interface ElementData {
  type: "user-text" | "user-image" | "user-qr";
  element: HTMLElement;
}

export class ElementManager {
  private canvas: HTMLDivElement;
  public elements: ElementData[] = [];
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

  createNewQR(content: string): HTMLCanvasElement {
    return this.qrGenerator.createNewQR(content);
  }

  addImageElementFromDatabase(elementData: any): void {
    const imgElement = document.createElement("img");
    imgElement.id = elementData.id;
    imgElement.src = elementData.base64_image;
    imgElement.classList.add("user-image");

    const allowedStyles = [
      "position",
      "left",
      "top",
      "width",
      "height",
      "box-sizing",
      "border-radius",
      "box-shadow",
    ];

    const styles = JSON.parse(elementData.styles);
    for (const [key, value] of Object.entries(styles)) {
      if (value && allowedStyles.includes(key)) {
        imgElement.style.setProperty(key, value as string);
      }
    }

    imgElement.setAttribute("tabindex", "0");
    imgElement.setAttribute("data-x", elementData["data-x"] || "0");
    imgElement.setAttribute("data-y", elementData["data-y"] || "0");

    this.canvas.appendChild(imgElement);

    this.elements.push({ type: "user-image", element: imgElement });
    enableDragging(imgElement, this.canvas);
    enableResizeForElements(imgElement, this.canvas);
    imgElement.focus();
  }

  getElementData(element: HTMLElement): ElementData | undefined {
    return this.elements.find((el) => el.element === element);
  }
}
