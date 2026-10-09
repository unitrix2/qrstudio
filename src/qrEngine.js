import QRCodeStyling from 'qr-code-styling';
import { jsPDF } from 'jspdf';
import { downloadFile } from './downloadHelper.js';

export class QREngine {
  constructor() {
    this.qrCode = new QRCodeStyling({
      width: 400,
      height: 400,
      type: 'canvas',
      data: 'https://antigravity.dev',
      dotsOptions: {
        type: 'rounded',
        color: '#0f172a'
      },
      cornersSquareOptions: {
        type: 'extra-rounded',
        color: '#0f172a'
      },
      cornersDotOptions: {
        type: 'dot',
        color: '#0f172a'
      },
      backgroundOptions: {
        color: '#ffffff'
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.35,
        margin: 6,
        crossOrigin: 'anonymous'
      },
      qrOptions: {
        errorCorrectionLevel: 'H'
      }
    });

    this.currentOptions = null;
  }

  // Format the raw user payload depending on content type
  static buildPayload(type, values) {
    switch (type) {
      case 'url': {
        let url = (values.url || '').trim();
        if (url && !/^https?:\/\//i.test(url) && !url.startsWith('//')) {
          url = 'https://' + url;
        }
        return url || 'https://google.com';
      }
      case 'text':
        return values.text || 'Antigravity Designer QR Code';

      case 'wifi': {
        const ssid = (values.ssid || '').trim();
        const pass = values.password || '';
        const enc = values.encryption || 'WPA';
        const hidden = values.hidden ? 'H:true;' : '';
        // Format: WIFI:T:WPA;S:MyNetwork;P:mypassword;H:false;;
        return `WIFI:T:${enc};S:${ssid};P:${pass};${hidden};`;
      }

      case 'upi': {
        // Indian UPI Payment URI: upi://pay?pa=...&pn=...&am=...&cu=INR&tn=...
        const pa = (values.upiId || '').trim();
        const pn = encodeURIComponent(values.payeeName || 'Merchant');
        const am = values.amount ? `&am=${encodeURIComponent(values.amount)}` : '';
        const tn = values.note ? `&tn=${encodeURIComponent(values.note)}` : '';
        const cu = values.currency || 'INR';
        return `upi://pay?pa=${pa}&pn=${pn}&cu=${cu}${am}${tn}`;
      }

      case 'vcard': {
        const fn = values.fullName || '';
        const org = values.org || '';
        const title = values.title || '';
        const tel = values.phone || '';
        const email = values.email || '';
        const url = values.url || '';
        const adr = values.address || '';
        return [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `FN:${fn}`,
          org ? `ORG:${org}` : '',
          title ? `TITLE:${title}` : '',
          tel ? `TEL;TYPE=CELL:${tel}` : '',
          email ? `EMAIL:${email}` : '',
          url ? `URL:${url}` : '',
          adr ? `ADR;TYPE=WORK:;;${adr};;;;` : '',
          'END:VCARD'
        ].filter(Boolean).join('\n');
      }

      case 'whatsapp': {
        const phone = (values.phone || '').replace(/[^\d+]/g, '');
        const text = encodeURIComponent(values.message || '');
        return `https://wa.me/${phone}${text ? `?text=${text}` : ''}`;
      }

      case 'email': {
        const to = values.email || '';
        const sub = encodeURIComponent(values.subject || '');
        const body = encodeURIComponent(values.body || '');
        return `mailto:${to}?subject=${sub}&body=${body}`;
      }

      case 'phone': {
        const phone = (values.phone || '').replace(/[^\d+]/g, '');
        return `tel:${phone}`;
      }

      case 'sms': {
        const phone = (values.phone || '').replace(/[^\d+]/g, '');
        const msg = encodeURIComponent(values.message || '');
        return `sms:${phone}${msg ? `?body=${msg}` : ''}`;
      }

      case 'event': {
        const summary = values.title || 'Event';
        const loc = values.location || '';
        const desc = values.desc || '';
        const start = (values.start || '').replace(/[-:]/g, '');
        const end = (values.end || '').replace(/[-:]/g, '');
        return [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'BEGIN:VEVENT',
          `SUMMARY:${summary}`,
          loc ? `LOCATION:${loc}` : '',
          desc ? `DESCRIPTION:${desc}` : '',
          start ? `DTSTART:${start}T000000Z` : '',
          end ? `DTEND:${end}T000000Z` : '',
          'END:VEVENT',
          'END:VCALENDAR'
        ].filter(Boolean).join('\n');
      }

      case 'crypto': {
        const coin = values.cryptoType || 'bitcoin';
        const addr = values.address || '';
        const amount = values.amount ? `?amount=${values.amount}` : '';
        return `${coin}:${addr}${amount}`;
      }

      case 'social': {
        return values.socialUrl || 'https://instagram.com';
      }

      default:
        return 'https://antigravity.dev';
    }
  }

  // Convert state options into QRCodeStyling configuration
  compileOptions(state, resolution = 400) {
    const data = QREngine.buildPayload(state.contentType, state.contentValues);

    // Build Dots gradient or solid color
    const dotsOptions = {
      type: state.dotsType || 'rounded'
    };
    if (state.dotsColorMode === 'gradient') {
      dotsOptions.gradient = {
        type: state.dotsGradientType || 'linear',
        rotation: (state.dotsGradientAngle || 0) * (Math.PI / 180),
        colorStops: [
          { offset: 0, color: state.dotsColor1 || '#06b6d4' },
          { offset: 1, color: state.dotsColor2 || '#ec4899' }
        ]
      };
    } else {
      dotsOptions.color = state.dotsColor1 || '#0f172a';
    }

    // Build Corners Square
    const cornersSquareOptions = {
      type: state.cornersSquareType || 'extra-rounded'
    };
    if (state.cornersSquareColorMode === 'gradient') {
      cornersSquareOptions.gradient = {
        type: 'linear',
        rotation: 0,
        colorStops: [
          { offset: 0, color: state.cornersSquareColor1 || '#06b6d4' },
          { offset: 1, color: state.cornersSquareColor2 || '#ec4899' }
        ]
      };
    } else {
      cornersSquareOptions.color = state.cornersSquareColor1 || state.dotsColor1 || '#0f172a';
    }

    // Build Corners Dot
    const cornersDotOptions = {
      type: state.cornersDotType || 'dot'
    };
    if (state.cornersDotColorMode === 'gradient') {
      cornersDotOptions.gradient = {
        type: 'linear',
        rotation: 0,
        colorStops: [
          { offset: 0, color: state.cornersDotColor1 || '#06b6d4' },
          { offset: 1, color: state.cornersDotColor2 || '#ec4899' }
        ]
      };
    } else {
      cornersDotOptions.color = state.cornersDotColor1 || state.dotsColor1 || '#0f172a';
    }

    // Background
    const backgroundOptions = {
      color: state.bgTransparent ? 'transparent' : (state.bgColor || '#ffffff')
    };

    // Center Logo
    let image = '';
    if (state.logoMode === 'custom' && state.customLogoUrl) {
      image = state.customLogoUrl;
    } else if (state.logoMode === 'preset' && state.presetLogoSvg) {
      image = state.presetLogoSvg;
    }

    const imageOptions = {
      hideBackgroundDots: state.hideDotsBehindLogo !== false,
      imageSize: parseFloat(state.logoSize) || 0.32,
      margin: parseInt(state.logoMargin, 10) || 5,
      crossOrigin: 'anonymous'
    };

    // If logo is present, force at least error correction 'Q' or 'H' to preserve readability
    let ecLevel = state.errorCorrectionLevel || 'H';
    if (image && (ecLevel === 'L' || ecLevel === 'M')) {
      ecLevel = 'H';
    }

    return {
      width: resolution,
      height: resolution,
      type: 'canvas',
      data,
      margin: parseInt(state.margin, 10) || 12,
      dotsOptions,
      cornersSquareOptions,
      cornersDotOptions,
      backgroundOptions,
      image: image || undefined,
      imageOptions,
      qrOptions: {
        errorCorrectionLevel: ecLevel
      }
    };
  }

  // Render to a DOM container
  render(container, state) {
    this.currentOptions = state;
    const compiled = this.compileOptions(state, 420);
    this.qrCode.update(compiled);
    container.innerHTML = '';
    this.qrCode.append(container);
  }

  // Get raw canvas element from current render
  async getRawCanvas(resolution = 1000) {
    const compiled = this.compileOptions(this.currentOptions, resolution);
    const tempQR = new QRCodeStyling(compiled);
    const blob = await tempQR.getRawData('png');
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = resolution;
        canvas.height = resolution;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  }

  // Render composite canvas with Frame / Badge (e.g. "SCAN ME", Polaroid, Mockup)
  async getFramedCanvas(targetResolution = 1200) {
    const state = this.currentOptions;
    const frameType = state.frameType || 'none';
    const qrCanvas = await this.getRawCanvas(targetResolution);

    if (frameType === 'none') {
      return qrCanvas;
    }

    const frameText = state.frameText || 'SCAN ME';
    const frameColor = state.frameColor || '#111827';
    const frameTextColor = state.frameTextColor || '#ffffff';
    const bgCol = state.bgTransparent ? '#ffffff' : (state.bgColor || '#ffffff');

    const outCanvas = document.createElement('canvas');
    const ctx = outCanvas.getContext('2d');

    const qrSize = targetResolution;
    const padding = Math.round(qrSize * 0.08);

    switch (frameType) {
      case 'bottom-banner': {
        const bannerHeight = Math.round(qrSize * 0.18);
        outCanvas.width = qrSize + padding * 2;
        outCanvas.height = qrSize + padding * 2 + bannerHeight;

        // Draw card backing
        ctx.fillStyle = bgCol;
        this.drawRoundedRect(ctx, 0, 0, outCanvas.width, outCanvas.height, 28);
        ctx.fill();

        // Draw QR
        ctx.drawImage(qrCanvas, padding, padding);

        // Draw Bottom Banner Pill
        const bannerY = qrSize + padding + Math.round(padding * 0.2);
        const bannerW = qrSize;
        ctx.fillStyle = frameColor;
        this.drawRoundedRect(ctx, padding, bannerY, bannerW, bannerHeight - Math.round(padding * 0.2), 20);
        ctx.fill();

        // Banner Text
        ctx.fillStyle = frameTextColor;
        ctx.font = `bold ${Math.round(bannerHeight * 0.42)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(frameText, padding + bannerW / 2, bannerY + (bannerHeight - Math.round(padding * 0.2)) / 2);
        break;
      }

      case 'top-banner': {
        const bannerHeight = Math.round(qrSize * 0.18);
        outCanvas.width = qrSize + padding * 2;
        outCanvas.height = qrSize + padding * 2 + bannerHeight;

        // Card backing
        ctx.fillStyle = bgCol;
        this.drawRoundedRect(ctx, 0, 0, outCanvas.width, outCanvas.height, 28);
        ctx.fill();

        // Top Banner Pill
        const bannerW = qrSize;
        ctx.fillStyle = frameColor;
        this.drawRoundedRect(ctx, padding, padding, bannerW, bannerHeight - Math.round(padding * 0.2), 20);
        ctx.fill();

        // Banner Text
        ctx.fillStyle = frameTextColor;
        ctx.font = `bold ${Math.round(bannerHeight * 0.42)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(frameText, padding + bannerW / 2, padding + (bannerHeight - Math.round(padding * 0.2)) / 2);

        // QR
        ctx.drawImage(qrCanvas, padding, padding + bannerHeight);
        break;
      }

      case 'bubble': {
        const bubbleHeight = Math.round(qrSize * 0.14);
        outCanvas.width = qrSize + padding * 2;
        outCanvas.height = qrSize + padding * 2 + bubbleHeight;

        ctx.fillStyle = bgCol;
        this.drawRoundedRect(ctx, 0, bubbleHeight, outCanvas.width, outCanvas.height - bubbleHeight, 28);
        ctx.fill();

        // QR
        ctx.drawImage(qrCanvas, padding, padding + bubbleHeight);

        // Bubble Pill centered at top
        const pillW = Math.round(qrSize * 0.55);
        const pillX = (outCanvas.width - pillW) / 2;
        ctx.fillStyle = frameColor;
        this.drawRoundedRect(ctx, pillX, 6, pillW, bubbleHeight + 10, bubbleHeight);
        ctx.fill();

        ctx.fillStyle = frameTextColor;
        ctx.font = `bold ${Math.round(bubbleHeight * 0.45)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(frameText, outCanvas.width / 2, 6 + (bubbleHeight + 10) / 2);
        break;
      }

      case 'polaroid': {
        const bottomArea = Math.round(qrSize * 0.32);
        outCanvas.width = qrSize + padding * 2;
        outCanvas.height = qrSize + padding * 2 + bottomArea;

        // White / Slate card
        ctx.fillStyle = '#ffffff';
        this.drawRoundedRect(ctx, 0, 0, outCanvas.width, outCanvas.height, 24);
        ctx.fill();

        // Subtle frame border
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 4;
        ctx.stroke();

        // QR
        ctx.drawImage(qrCanvas, padding, padding);

        // Title Text
        ctx.fillStyle = frameColor;
        ctx.font = `bold ${Math.round(bottomArea * 0.3)}px 'Outfit', system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(frameText, outCanvas.width / 2, qrSize + padding + Math.round(bottomArea * 0.42));

        // Subtitle instruction
        ctx.fillStyle = '#64748b';
        ctx.font = `500 ${Math.round(bottomArea * 0.16)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
        ctx.fillText('Point your camera to scan instantly', outCanvas.width / 2, qrSize + padding + Math.round(bottomArea * 0.72));
        break;
      }

      case 'phone': {
        const topBezel = Math.round(qrSize * 0.22);
        const bottomBezel = Math.round(qrSize * 0.22);
        const phoneBorder = Math.round(qrSize * 0.06);

        outCanvas.width = qrSize + phoneBorder * 2;
        outCanvas.height = qrSize + topBezel + bottomBezel;

        // Phone body
        ctx.fillStyle = '#0f172a';
        this.drawRoundedRect(ctx, 0, 0, outCanvas.width, outCanvas.height, 60);
        ctx.fill();

        // Phone screen
        ctx.fillStyle = bgCol;
        this.drawRoundedRect(ctx, phoneBorder, topBezel, qrSize, qrSize, 20);
        ctx.fill();

        // QR
        ctx.drawImage(qrCanvas, phoneBorder, topBezel);

        // Speaker notch
        const notchW = Math.round(outCanvas.width * 0.26);
        ctx.fillStyle = '#334155';
        this.drawRoundedRect(ctx, (outCanvas.width - notchW) / 2, Math.round(topBezel * 0.35), notchW, 14, 7);
        ctx.fill();

        // Bottom text
        ctx.fillStyle = '#f8fafc';
        ctx.font = `bold ${Math.round(bottomBezel * 0.26)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(frameText, outCanvas.width / 2, outCanvas.height - bottomBezel / 2);
        break;
      }

      default:
        return qrCanvas;
    }

    return outCanvas;
  }

  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // Export method supporting PNG, SVG, JPEG, WEBP, PDF with exact extension
  async exportFile(format, resolution = 2048, filename = 'qr-designer-pro') {
    const cleanFilename = (filename || 'qr-code').replace(/[^a-z0-9_-]/gi, '_');

    // 1. SVG Vector Export
    if (format === 'svg') {
      if (!this.currentOptions.frameType || this.currentOptions.frameType === 'none') {
        const compiled = this.compileOptions(this.currentOptions, resolution);
        compiled.type = 'svg';
        const svgQR = new QRCodeStyling(compiled);
        const svgBlob = await svgQR.getRawData('svg');
        downloadFile(svgBlob, `${cleanFilename}.svg`, 'image/svg+xml');
      } else {
        const framedCanvas = await this.getFramedCanvas(resolution);
        const dataUri = framedCanvas.toDataURL('image/png');
        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${framedCanvas.width}" height="${framedCanvas.height}" viewBox="0 0 ${framedCanvas.width} ${framedCanvas.height}">
  <image href="${dataUri}" width="${framedCanvas.width}" height="${framedCanvas.height}"/>
</svg>`;
        downloadFile(svgContent, `${cleanFilename}.svg`, 'image/svg+xml');
      }
      return;
    }

    // Canvas composite export (PNG, JPEG, WEBP, PDF)
    const framedCanvas = await this.getFramedCanvas(resolution);

    // 2. PNG Export
    if (format === 'png') {
      try {
        framedCanvas.toBlob((blob) => {
          if (blob) {
            downloadFile(blob, `${cleanFilename}.png`, 'image/png');
          } else {
            downloadFile(framedCanvas.toDataURL('image/png'), `${cleanFilename}.png`, 'image/png');
          }
        }, 'image/png', 1.0);
      } catch {
        downloadFile(framedCanvas.toDataURL('image/png'), `${cleanFilename}.png`, 'image/png');
      }
      return;
    }

    // 3. JPEG Export (.jpg)
    if (format === 'jpeg' || format === 'jpg') {
      const jpegCanvas = document.createElement('canvas');
      jpegCanvas.width = framedCanvas.width;
      jpegCanvas.height = framedCanvas.height;
      const jctx = jpegCanvas.getContext('2d');
      jctx.fillStyle = this.currentOptions.bgTransparent ? '#ffffff' : (this.currentOptions.bgColor || '#ffffff');
      jctx.fillRect(0, 0, jpegCanvas.width, jpegCanvas.height);
      jctx.drawImage(framedCanvas, 0, 0);

      try {
        jpegCanvas.toBlob((blob) => {
          if (blob) {
            downloadFile(blob, `${cleanFilename}.jpg`, 'image/jpeg');
          } else {
            downloadFile(jpegCanvas.toDataURL('image/jpeg', 0.95), `${cleanFilename}.jpg`, 'image/jpeg');
          }
        }, 'image/jpeg', 0.95);
      } catch {
        downloadFile(jpegCanvas.toDataURL('image/jpeg', 0.95), `${cleanFilename}.jpg`, 'image/jpeg');
      }
      return;
    }

    // 4. WEBP Export
    if (format === 'webp') {
      try {
        framedCanvas.toBlob((blob) => {
          if (blob) {
            downloadFile(blob, `${cleanFilename}.webp`, 'image/webp');
          } else {
            downloadFile(framedCanvas.toDataURL('image/webp', 0.95), `${cleanFilename}.webp`, 'image/webp');
          }
        }, 'image/webp', 0.95);
      } catch {
        downloadFile(framedCanvas.toDataURL('image/webp', 0.95), `${cleanFilename}.webp`, 'image/webp');
      }
      return;
    }

    // 5. PDF Export
    if (format === 'pdf') {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = framedCanvas.toDataURL('image/png');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Title header
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(22);
      pdf.setTextColor(24, 24, 27);
      pdf.text('QR Code Studio', pageWidth / 2, 28, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(113, 113, 122);
      pdf.text('High-Resolution Scan Certificate & Print Sheet', pageWidth / 2, 36, { align: 'center' });

      // Calculate square centered placement
      const qrPrintSize = 130; // 130mm
      const qrX = (pageWidth - qrPrintSize) / 2;
      const qrY = 50;

      // Card border
      pdf.setDrawColor(228, 228, 231);
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(qrX - 8, qrY - 8, qrPrintSize + 16, qrPrintSize + 16, 6, 6, 'FD');

      pdf.addImage(imgData, 'PNG', qrX, qrY, qrPrintSize, qrPrintSize);

      // Footer details
      const payload = QREngine.buildPayload(this.currentOptions.contentType, this.currentOptions.contentValues);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(82, 82, 91);
      pdf.text('Target Payload:', pageWidth / 2, qrY + qrPrintSize + 18, { align: 'center' });

      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(9);
      pdf.setTextColor(113, 113, 122);
      const shortPayload = payload.length > 70 ? payload.substring(0, 67) + '...' : payload;
      pdf.text(shortPayload, pageWidth / 2, qrY + qrPrintSize + 24, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(161, 161, 170);
      pdf.text('Created with QR Studio Pro • 300 DPI Vector Print Ready', pageWidth / 2, pageHeight - 16, { align: 'center' });

      try {
        const pdfBlob = pdf.output('blob');
        downloadFile(pdfBlob, `${cleanFilename}.pdf`, 'application/pdf');
      } catch {
        pdf.save(`${cleanFilename}.pdf`);
      }
      return;
    }
  }

  // Copy PNG image directly to clipboard
  async copyToClipboard(resolution = 1024) {
    const framedCanvas = await this.getFramedCanvas(resolution);
    return new Promise((resolve, reject) => {
      framedCanvas.toBlob(async (blob) => {
        if (!blob) return reject(new Error('Failed to create blob'));
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          resolve();
        } catch (err) {
          reject(err);
        }
      }, 'image/png');
    });
  }
}
