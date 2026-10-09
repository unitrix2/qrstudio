import jsQR from 'jsqr';

export class QRScanner {
  constructor(videoElement, canvasElement, resultCallback) {
    this.video = videoElement;
    this.canvas = canvasElement;
    this.ctx = canvasElement ? canvasElement.getContext('2d') : null;
    this.onResult = resultCallback;
    this.stream = null;
    this.isScanning = false;
    this.animationFrame = null;
  }

  // Start live camera stream
  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      this.video.srcObject = this.stream;
      this.video.setAttribute('playsinline', true);
      await this.video.play();
      this.isScanning = true;
      this.tick();
      return true;
    } catch (err) {
      console.error('Camera access error:', err);
      return false;
    }
  }

  // Stop camera stream
  stopCamera() {
    this.isScanning = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.video) {
      this.video.srcObject = null;
    }
  }

  // Frame processing loop
  tick() {
    if (!this.isScanning) return;

    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      this.canvas.height = this.video.videoHeight;
      this.canvas.width = this.video.videoWidth;
      this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data) {
        this.onResult(code.data);
        this.stopCamera();
        return;
      }
    }

    this.animationFrame = requestAnimationFrame(() => this.tick());
  }

  // Decode from an image file / blob / dataUrl
  static async decodeImage(fileOrDataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth'
        });

        if (code && code.data) {
          resolve(code.data);
        } else {
          reject(new Error('No QR code detected in this image. Try an image with higher contrast or resolution.'));
        }
      };
      img.onerror = () => reject(new Error('Failed to load image file.'));

      if (typeof fileOrDataUrl === 'string') {
        img.src = fileOrDataUrl;
      } else {
        const reader = new FileReader();
        reader.onload = (e) => { img.src = e.target.result; };
        reader.onerror = reject;
        reader.readAsDataURL(fileOrDataUrl);
      }
    });
  }
}
