import QRCode from 'qrcode';

export class QRCodeGenerator {
  public generateQR(content: string, canvas: HTMLCanvasElement): void {
    QRCode.toCanvas(canvas, content, (error) => {
      if (error) {
        console.error('Error generating QR code:', error);
      }
    });
  }
}
