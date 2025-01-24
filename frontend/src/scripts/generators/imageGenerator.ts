import { ElementData } from "../../elements/element";
import { enableDragging } from "../../elements/moveElement";
import { enableResizeForElements } from "../../elements/resize";

export class ImageGenerator {
  private canvas: HTMLDivElement;
  private elements: ElementData[];

  constructor(canvas: HTMLDivElement, elements: ElementData[]) {
    this.canvas = canvas;
    this.elements = elements;
  }

  handleImageInput(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const imageElement = this.createElement(
          "img",
          "user-image",
          this.generateUniqueId()
        ) as HTMLImageElement;
        const { width, height } = this.scaleToFit(
          img,
          this.canvas.getBoundingClientRect().width,
          this.canvas.getBoundingClientRect().height
        );
        imageElement.src = reader.result as string;
        imageElement.style.width = `${width}px`;
        imageElement.style.height = `${height}px`;
        this.positionElementInCenter(imageElement);
        imageElement.setAttribute("tabindex", "0");
        imageElement.focus();
        enableDragging(imageElement, this.canvas);
        enableResizeForElements(imageElement, this.canvas);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  private createElement(
    tag: string,
    className: string,
    id: string
  ): HTMLElement {
    const element = document.createElement(tag);
    element.id = id;
    element.classList.add(className);

    element.style.position = "absolute";
    this.canvas.appendChild(element);
    this.elements.push({
      type: className as "user-text" | "user-image" | "user-qr",
      element,
    });
    return element;
  }

  private positionElementInCenter(element: HTMLElement): void {
    const rect = this.canvas.getBoundingClientRect();
    const left = (rect.width - element.offsetWidth) / 2;
    const top = (rect.height - element.offsetHeight) / 2;

    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
  }

  private scaleToFit(
    img: HTMLImageElement,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = img;
    if (width > maxWidth || height > maxHeight) {
      const scale = Math.min(maxWidth / width, maxHeight / height);
      width *= scale;
      height *= scale;
    }
    return { width, height };
  }

  private generateUniqueId(): string {
    return "image-" + crypto.getRandomValues(new Uint32Array(8)).join("");
  }
}
