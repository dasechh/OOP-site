import interact from "interactjs";

export function enableDragging(element: HTMLElement, canvas: HTMLDivElement) {
  let offsetX = 0;
  let offsetY = 0;

  interact(element).draggable({
    listeners: {
      start(event) {
        document.body.style.userSelect = "none";

        const rect = element.getBoundingClientRect();

        offsetX = event.clientX - rect.left - window.scrollX;
        offsetY = event.clientY - rect.top - window.scrollY;
      },
      move(event) {
        const canvasRect = canvas.getBoundingClientRect();

        let left = event.clientX - canvasRect.left - offsetX;
        let top = event.clientY - canvasRect.top - offsetY;

        const elementRect = element.getBoundingClientRect();
        left = Math.max(
          0,
          Math.min(left, canvasRect.width - elementRect.width)
        );
        top = Math.max(
          0,
          Math.min(top, canvasRect.height - elementRect.height)
        );

        element.style.left = `${left}px`;
        element.style.top = `${top}px`;
      },
      end(event) {
        document.body.style.userSelect = "";
      },
    },
  });
}
