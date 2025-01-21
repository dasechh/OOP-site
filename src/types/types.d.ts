export interface DraggableElement {
    id: string;
    type: 'image' | 'text' | 'qr' ;
    x: number;
    y: number;
    width?: number;
    height?: number;
    content?: string; // для текста
    imageSrc?: string; // для изображения
  }
  