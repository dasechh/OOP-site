import { BaseEditor } from "./baseEditor";
import { ElementData } from "../element";
import { IElementEditor } from "../ui";

export class TextEditor extends BaseEditor implements IElementEditor {
  constructor(rightPanel: HTMLDivElement) {
    super(rightPanel);
  }

  render(focusedElement: ElementData): void {
    this.rightPanel.innerHTML = "";

    const input = this.createTextArea(focusedElement);
    const fontSelect = this.createFontSelect(focusedElement);
    const fontSizeInput = this.createFontSizeInput(focusedElement);
    const alignmentPanel = this.createAlignmentPanel(focusedElement);
    const colorPicker = this.createColorPicker(focusedElement);
    const shadowControls = this.createShadowControls(
      focusedElement,
      focusedElement.element.id
    );
    const deleteButton = this.createDeleteButton(focusedElement);

    this.rightPanel.append(
      input,
      fontSelect,
      fontSizeInput,
      alignmentPanel,
      colorPicker.label,
      colorPicker.input,
      shadowControls.label,
      shadowControls.checkbox,
      shadowControls.container,
      deleteButton
    );
  }

  private createTextArea(focusedElement: ElementData): HTMLTextAreaElement {
    const input = document.createElement("textarea");
    input.value = focusedElement.element
      ? focusedElement.element.textContent || ""
      : "";
    input.placeholder = "Измените текст";
    input.style.resize = "none";
    input.addEventListener("input", (event) => {
      const target = event.target as HTMLTextAreaElement;
      if (focusedElement.element && target) {
        focusedElement.element.textContent = target.value;
      }
    });
    return input;
  }

  private createFontSelect(focusedElement: ElementData): HTMLSelectElement {
    const fontSelect = document.createElement("select");
    const fonts = [
      "Arial",
      "Verdana",
      "Times New Roman",
      "Georgia",
      "Courier New",
      "Tahoma",
      "Trebuchet MS",
      "Impact",
      "Comic Sans MS",
      "Lucida Console",
    ];
    fonts.forEach((font) => {
      const option = document.createElement("option");
      option.value = font;
      option.textContent = font;
      fontSelect.appendChild(option);
    });

    if (focusedElement.element) {
      fontSelect.value = window
        .getComputedStyle(focusedElement.element)
        .fontFamily.split(",")[0];
    }
    fontSelect.addEventListener("change", (event) => {
      const target = event.target as HTMLSelectElement;
      if (focusedElement.element && target) {
        focusedElement.element.style.fontFamily = target.value;
      }
    });
    return fontSelect;
  }

  private createFontSizeInput(focusedElement: ElementData): HTMLInputElement {
    const fontSizeInput = document.createElement("input");
    fontSizeInput.type = "number";
    if (focusedElement.element) {
      fontSizeInput.value = parseInt(
        window.getComputedStyle(focusedElement.element).fontSize
      ).toString();
    }
    fontSizeInput.placeholder = "Размер шрифта";
    fontSizeInput.addEventListener("input", (event) => {
      const target = event.target as HTMLInputElement;
      if (focusedElement.element && target) {
        const originalWidth = focusedElement.element.offsetWidth;
        const originalHeight = focusedElement.element.offsetHeight;

        focusedElement.element.style.fontSize = target.value + "px";

        focusedElement.element.style.width = `${originalWidth}px`;
        focusedElement.element.style.height = `${originalHeight}px`;
      }
    });
    return fontSizeInput;
  }

  private createAlignmentPanel(focusedElement: ElementData): HTMLDivElement {
    const alignmentPanel = document.createElement("div");
    const alignmentLabel = document.createElement("label");
    alignmentLabel.textContent = "Выравнивание текста";
    alignmentPanel.appendChild(alignmentLabel);
    const leftAlignButton = this.createAlignButton(
      focusedElement,
      "left",
      "По левому краю"
    );
    const centerAlignButton = this.createAlignButton(
      focusedElement,
      "center",
      "По центру"
    );
    const rightAlignButton = this.createAlignButton(
      focusedElement,
      "right",
      "По правому краю"
    );
    alignmentPanel.append(leftAlignButton, centerAlignButton, rightAlignButton);
    return alignmentPanel;
  }

  private createAlignButton(
    focusedElement: ElementData,
    align: string,
    title: string
  ): HTMLButtonElement {
    const button = document.createElement("button");
    button.textContent = title;
    button.onclick = () => {
      if (focusedElement.element) {
        focusedElement.element.style.textAlign = align;
      }
    };
    return button;
  }

  private createColorPicker(focusedElement: ElementData): {
    label: HTMLLabelElement;
    input: HTMLInputElement;
  } {
    const colorPickerLabel = document.createElement("label");
    colorPickerLabel.textContent = "Цвет текста";
    const colorPicker = document.createElement("input");
    colorPicker.type = "color";
    if (focusedElement.element) {
      colorPicker.value = this.rgbToHex(
        window.getComputedStyle(focusedElement.element).color
      );
    }
    colorPicker.addEventListener("input", (event) => {
      const target = event.target as HTMLInputElement;
      if (focusedElement.element && target) {
        focusedElement.element.style.color = target.value;
      }
    });
    return { label: colorPickerLabel, input: colorPicker };
  }

  protected createShadowControls(
    focusedElement: ElementData,
    elementId: string
  ): {
    label: HTMLLabelElement;
    checkbox: HTMLInputElement;
    container: HTMLDivElement;
  } {
    const shadowLabel = document.createElement("label");
    shadowLabel.textContent = "Добавить тень";
    const shadowCheckbox = document.createElement("input");
    shadowCheckbox.type = "checkbox";
    shadowCheckbox.checked = focusedElement.element.style.textShadow !== "";
    const shadowControlsContainer = document.createElement("div");
    shadowControlsContainer.style.display = shadowCheckbox.checked
      ? "block"
      : "none";

    shadowCheckbox.addEventListener("change", () => {
      shadowControlsContainer.style.display = shadowCheckbox.checked
        ? "block"
        : "none";
      if (!shadowCheckbox.checked) {
        focusedElement.element.style.textShadow = "";
      }
      localStorage.setItem(
        `${elementId}_shadow`,
        shadowCheckbox.checked ? "true" : "false"
      );
    });

    if (localStorage.getItem(`${elementId}_shadow`) === "false") {
      shadowCheckbox.checked = false;
      focusedElement.element.style.textShadow = "";
    }

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

    const updateTextShadow = () => {
      const x = shadowXInput.value;
      const y = shadowYInput.value;
      const blur = shadowBlurInput.value;
      const color = shadowColorInput.value;
      focusedElement.element.style.textShadow = `${x}px ${y}px ${blur}px ${color}`;
      localStorage.setItem(`${elementId}_shadowX`, x);
      localStorage.setItem(`${elementId}_shadowY`, y);
      localStorage.setItem(`${elementId}_shadowBlur`, blur);
      localStorage.setItem(`${elementId}_shadowColor`, color);
    };

    shadowXInput.addEventListener("input", updateTextShadow);
    shadowYInput.addEventListener("input", updateTextShadow);
    shadowBlurInput.addEventListener("input", updateTextShadow);
    shadowColorInput.addEventListener("input", updateTextShadow);

    shadowControlsContainer.appendChild(boxShadowLabel);

    return {
      label: shadowLabel,
      checkbox: shadowCheckbox,
      container: shadowControlsContainer,
    };
  }

  private rgbToHex(rgb: string): string {
    const result = rgb.match(/\d+/g);
    if (result) {
      const r = parseInt(result[0]).toString(16).padStart(2, "0");
      const g = parseInt(result[1]).toString(16).padStart(2, "0");
      const b = parseInt(result[2]).toString(16).padStart(2, "0");
      return `#${r}${g}${b}`;
    }
    return "#000000";
  }
}
