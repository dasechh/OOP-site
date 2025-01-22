import { BaseEditor } from "./baseEditor";
import { QRCodeGenerator } from "../generators/qrGenerator";
import { ElementData } from "../element";
import { IElementEditor } from "../ui";

export class QREditor extends BaseEditor implements IElementEditor {
  private qrGenerator: QRCodeGenerator;

  constructor(qrGenerator: QRCodeGenerator, rightPanel: HTMLDivElement) {
    super(rightPanel);
    this.qrGenerator = qrGenerator;
  }

  render(focusedElement: ElementData): void {
    this.rightPanel.innerHTML = "";

    const elementId = focusedElement.element.id;

    const input = this.createTextInput(focusedElement, elementId);
    const borderRadiusControls = this.createBorderRadiusControls(
      focusedElement,
      elementId
    );
    const aspectRatioControls = this.createAspectRatioControls(
      focusedElement,
      elementId
    );
    const shadowControls = this.createShadowControls(focusedElement, elementId);
    const deleteButton = this.createDeleteButton(focusedElement);

    this.rightPanel.append(
      input,
      borderRadiusControls.label,
      borderRadiusControls.input,
      aspectRatioControls.label,
      aspectRatioControls.checkbox,
      shadowControls.label,
      shadowControls.checkbox,
      shadowControls.container,
      deleteButton
    );
  }

  private createTextInput(
    focusedElement: ElementData,
    elementId: string
  ): HTMLInputElement {
    const input = document.createElement("input");
    input.type = "text";
    input.value = focusedElement.element.getAttribute("data-content") || "";
    input.placeholder = "Измените текст QR";
    input.addEventListener("input", (event) => {
      const newValue = (event.target as HTMLInputElement).value;
      focusedElement.element.setAttribute("data-content", newValue);

      const canvas = focusedElement.element as HTMLCanvasElement;
      const { width, height } = canvas.getBoundingClientRect();
      this.qrGenerator.generateQR(newValue, canvas);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      localStorage.setItem(`${elementId}_content`, newValue);
    });

    input.value = localStorage.getItem(`${elementId}_content`) || input.value;
    return input;
  }

  private createBorderRadiusControls(
    focusedElement: ElementData,
    elementId: string
  ): { label: HTMLLabelElement; input: HTMLInputElement } {
    const borderRadiusLabel = document.createElement("label");
    borderRadiusLabel.textContent = "Скругление углов:";
    const borderRadiusInput = document.createElement("input");
    borderRadiusInput.type = "range";
    borderRadiusInput.min = "0";
    borderRadiusInput.max = "50";
    borderRadiusInput.value =
      focusedElement.element.style.borderRadius.replace("%", "") || "0";

    borderRadiusInput.addEventListener("input", () => {
      focusedElement.element.style.borderRadius = `${borderRadiusInput.value}%`;
      localStorage.setItem(
        `${elementId}_borderRadius`,
        borderRadiusInput.value
      );
    });

    const savedBorderRadius = localStorage.getItem(`${elementId}_borderRadius`);
    if (savedBorderRadius) {
      borderRadiusInput.value = savedBorderRadius;
      focusedElement.element.style.borderRadius = `${savedBorderRadius}%`;
    }

    return { label: borderRadiusLabel, input: borderRadiusInput };
  }

  private createAspectRatioControls(
    focusedElement: ElementData,
    elementId: string
  ): { label: HTMLLabelElement; checkbox: HTMLInputElement } {
    const aspectCheckbox = document.createElement("input");
    aspectCheckbox.type = "checkbox";
    aspectCheckbox.checked =
      !focusedElement.element.classList.contains("non-aspected");
    const aspectLabel = document.createElement("label");
    aspectLabel.textContent = "Изначальные пропорции";
    aspectLabel.appendChild(aspectCheckbox);
    aspectCheckbox.addEventListener("change", () => {
      if (aspectCheckbox.checked) {
        focusedElement.element.classList.remove("non-aspected");
      } else {
        focusedElement.element.classList.add("non-aspected");
      }
      localStorage.setItem(
        `${elementId}_aspectRatio`,
        aspectCheckbox.checked ? "true" : "false"
      );
    });

    if (localStorage.getItem(`${elementId}_aspectRatio`) === "false") {
      aspectCheckbox.checked = false;
      focusedElement.element.classList.add("non-aspected");
    }

    return { label: aspectLabel, checkbox: aspectCheckbox };
  }
}
