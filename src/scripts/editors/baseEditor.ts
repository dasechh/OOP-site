import { ElementData } from "../element";

export abstract class BaseEditor {
  protected rightPanel: HTMLDivElement;

  constructor(rightPanel: HTMLDivElement) {
    this.rightPanel = rightPanel;
  }

  abstract render(focusedElement: ElementData): void;

  protected createDeleteButton(focusedElement: ElementData): HTMLButtonElement {
    const button = document.createElement("button");
    button.textContent = "Удалить";
    button.onclick = () => {
      if (focusedElement.element) {
        focusedElement.element.remove();
        this.rightPanel.innerHTML = "";
      }
    };
    return button;
  }

  protected createShadowControls(
    focusedElement: ElementData,
    elementId: string
  ): {
    label: HTMLLabelElement;
    checkbox: HTMLInputElement;
    container: HTMLDivElement;
  } {
    const shadowCheckbox = document.createElement("input");
    shadowCheckbox.type = "checkbox";
    shadowCheckbox.checked =
      localStorage.getItem(`${elementId}_shadow`) === "true";
    const shadowLabel = document.createElement("label");
    shadowLabel.textContent = "Добавить тень";
    shadowLabel.appendChild(shadowCheckbox);
    const shadowControlsContainer = document.createElement("div");
    shadowControlsContainer.style.display = shadowCheckbox.checked
      ? "block"
      : "none";

    const shadowXInput = document.createElement("input");
    shadowXInput.type = "range";
    shadowXInput.min = "-50";
    shadowXInput.max = "50";
    shadowXInput.value = localStorage.getItem(`${elementId}_shadowX`) || "0";

    const shadowYInput = document.createElement("input");
    shadowYInput.type = "range";
    shadowYInput.min = "-50";
    shadowYInput.max = "50";
    shadowYInput.value = localStorage.getItem(`${elementId}_shadowY`) || "0";

    const shadowBlurInput = document.createElement("input");
    shadowBlurInput.type = "range";
    shadowBlurInput.min = "0";
    shadowBlurInput.max = "50";
    shadowBlurInput.value =
      localStorage.getItem(`${elementId}_shadowBlur`) || "0";

    const shadowColorInput = document.createElement("input");
    shadowColorInput.type = "color";
    shadowColorInput.value =
      localStorage.getItem(`${elementId}_shadowColor`) || "#000000";

    const boxShadowLabel = document.createElement("label");
    boxShadowLabel.textContent = " Смещение X: ";
    boxShadowLabel.appendChild(shadowXInput);
    boxShadowLabel.appendChild(document.createTextNode(" Смещение Y: "));
    boxShadowLabel.appendChild(shadowYInput);
    boxShadowLabel.appendChild(document.createTextNode(" Размытие: "));
    boxShadowLabel.appendChild(shadowBlurInput);
    boxShadowLabel.appendChild(document.createTextNode(" Цвет: "));
    boxShadowLabel.appendChild(shadowColorInput);

    const updateBoxShadow = () => {
      const x = shadowXInput.value;
      const y = shadowYInput.value;
      const blur = shadowBlurInput.value;
      const color = shadowColorInput.value;
      focusedElement.element.style.boxShadow = `${x}px ${y}px ${blur}px ${color}`;
      localStorage.setItem(`${elementId}_shadowX`, x);
      localStorage.setItem(`${elementId}_shadowY`, y);
      localStorage.setItem(`${elementId}_shadowBlur`, blur);
      localStorage.setItem(`${elementId}_shadowColor`, color);
    };

    shadowCheckbox.addEventListener("change", () => {
      shadowControlsContainer.style.display = shadowCheckbox.checked
        ? "block"
        : "none";
      if (!shadowCheckbox.checked) {
        focusedElement.element.style.boxShadow = "";
      } else {
        updateBoxShadow();
      }
      localStorage.setItem(
        `${elementId}_shadow`,
        shadowCheckbox.checked ? "true" : "false"
      );
    });

    if (shadowCheckbox.checked) {
      updateBoxShadow();
    }

    shadowXInput.addEventListener("input", updateBoxShadow);
    shadowYInput.addEventListener("input", updateBoxShadow);
    shadowBlurInput.addEventListener("input", updateBoxShadow);
    shadowColorInput.addEventListener("input", updateBoxShadow);

    shadowControlsContainer.appendChild(boxShadowLabel);

    return {
      label: shadowLabel,
      checkbox: shadowCheckbox,
      container: shadowControlsContainer,
    };
  }
}
