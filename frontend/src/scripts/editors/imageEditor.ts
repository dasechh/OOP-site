import { BaseEditor } from "./baseEditor";
import { ElementData } from "../../elements/element";
import { IElementEditor } from "../ui";

export class ImageEditor extends BaseEditor implements IElementEditor {
  constructor(rightPanel: HTMLDivElement) {
    super(rightPanel);
  }

  render(focusedElement: ElementData): void {
    this.rightPanel.innerHTML = "";

    const elementId = focusedElement.element.id;

    const aspectRatioControls = this.createAspectRatioControls(
      focusedElement,
      elementId
    );
    const borderRadiusControls = this.createBorderRadiusControls(
      focusedElement,
      elementId
    );
    const shadowControls = this.createShadowControls(focusedElement, elementId);
    const deleteButton = this.createDeleteButton(focusedElement);

    this.rightPanel.append(
      aspectRatioControls.label,
      aspectRatioControls.checkbox,
      borderRadiusControls.label,
      borderRadiusControls.input,
      shadowControls.label,
      shadowControls.checkbox,
      shadowControls.container,
      deleteButton
    );
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
}
