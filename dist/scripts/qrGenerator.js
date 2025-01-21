import QRCode from 'qrcode';
export class QRCodeGenerator {
    generateQR(content, canvas) {
        QRCode.toCanvas(canvas, content, (error) => {
            if (error) {
                console.error('Error generating QR code:', error);
            }
        });
    }
}
//# sourceMappingURL=qrGenerator.js.map