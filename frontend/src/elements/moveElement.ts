import interact from 'interactjs';

export function enableDragging(element: HTMLElement, canvas: HTMLDivElement) {
  let offsetX = 0;
  let offsetY = 0;

  interact(element)
    .draggable({
      listeners: {
        start(event) {
          document.body.style.userSelect = 'none';  // Отключаем выделение текста

          // Получаем координаты элемента и канваса на экране
          const rect = element.getBoundingClientRect();

          // Правильное смещение относительно канваса
          offsetX = event.clientX -  rect.left - window.scrollX;
          offsetY = event.clientY -  rect.top - window.scrollY;
        },
        move(event) {
          const canvasRect = canvas.getBoundingClientRect();

          // Вычисляем новые координаты для перетаскиваемого элемента
          let left = event.clientX - canvasRect.left - offsetX;
          let top = event.clientY - canvasRect.top - offsetY;

          // Ограничиваем перемещение внутри канваса
          const elementRect = element.getBoundingClientRect();
          left = Math.max(0, Math.min(left, canvasRect.width - elementRect.width));
          top = Math.max(0, Math.min(top, canvasRect.height - elementRect.height));

          // Обновляем позицию элемента
          element.style.left = `${left}px`;
          element.style.top = `${top}px`;
        },
        end(event) {
          document.body.style.userSelect = '';  // Восстанавливаем выделение текста
        }
      }
    });
}
