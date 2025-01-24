import interact from 'interactjs';

export function enableResizeForElements(element: HTMLElement, canvas: HTMLDivElement) {
  const canvasRect = canvas.getBoundingClientRect();

  const paddingTop = parseInt(window.getComputedStyle(element).paddingTop || '0', 10);
  const paddingRight = parseInt(window.getComputedStyle(element).paddingRight || '0', 10);
  const paddingBottom = parseInt(window.getComputedStyle(element).paddingBottom || '0', 10);
  const paddingLeft = parseInt(window.getComputedStyle(element).paddingLeft || '0', 10);

  const imgWidth = parseFloat(element.style.width); // Используем реальные размеры изображения
  const imgHeight = parseFloat(element.style.height); // Используем реальные размеры изображения
  const aspectRatio = imgWidth / imgHeight; // Вычисляем aspect ratio

  let minWidth = paddingLeft + paddingRight;
  let minHeight = paddingTop + paddingBottom;

  if (element.classList.contains('user-text')) {
    const chWidth = parseFloat(window.getComputedStyle(element).fontSize || '16');
    minWidth += chWidth - 3;
    minHeight += chWidth - 3;
  }

  // Функция для обновления модификаторов
  const updateModifiers = () => {
    const isNonAspected = element.classList.contains('non-aspected');
    console.log('isNonAspected:', isNonAspected); // Логируем наличие класса

    // Обновляем модификаторы с учетом состояния класса
    interact(element).resizable({
      edges: { top: true, left: true, bottom: true, right: true },
      modifiers: [
        // Применяем aspect ratio только если элемент не имеет класс non-aspected
        ...(isNonAspected ? [] : [
          interact.modifiers.aspectRatio({
            ratio: aspectRatio, // Применяем aspect ratio
          }),
        ]),
        interact.modifiers.restrictEdges({
          outer: canvasRect, // Ограничиваем только пределами canvas
        }),
      ],
      listeners: {
        start() {
          document.body.style.userSelect = 'none';
        },

        move(event) {
          const { width, height } = event.rect;

          let { x, y } = event.target.dataset;
          x = (parseFloat(x) || 0) + event.deltaRect.left;
          y = (parseFloat(y) || 0) + event.deltaRect.top;

          Object.assign(event.target.dataset, { x, y });

          const newLeft = parseFloat(element.style.left || '0') + event.deltaRect.left;
          const newTop = parseFloat(element.style.top || '0') + event.deltaRect.top;

          // Обновляем стиль элемента
          Object.assign(event.target.style, {
            width: `${width}px`,
            height: `${height}px`,
            left: `${newLeft}px`,
            top: `${newTop}px`,
            boxSizing: 'border-box',
          });
        },

        end() {
          document.body.style.userSelect = '';
        },
      },
    });
  };

  // Инициализация при первой загрузке
  updateModifiers();

  // Перерегистрируем модификаторы при изменении класса
  const observer = new MutationObserver(() => {
    updateModifiers(); // Перезапуск модификаторов после изменения класса
  });

  observer.observe(element, {
    attributes: true, // Следим за изменениями атрибутов, включая класс
    attributeFilter: ['class'], // Фильтруем только изменения класса
  });
}
