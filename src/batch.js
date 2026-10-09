import JSZip from 'jszip';
import QRCodeStyling from 'qr-code-styling';
import { downloadFile } from './downloadHelper.js';

export class BatchGenerator {
  static async generateZip(items, baseState, onProgress) {
    const zip = new JSZip();
    const folder = zip.folder('qr_codes');

    const total = items.length;
    for (let i = 0; i < total; i++) {
      const item = items[i];
      if (!item || !item.trim()) continue;

      const filename = `qr_${i + 1}_${item.substring(0, 15).replace(/[^a-z0-9_-]/gi, '_')}.png`;

      // Clone base state with this item's URL/text
      const itemState = {
        ...baseState,
        contentType: 'url',
        contentValues: { url: item.trim() }
      };

      // Compile and render
      const dotsOptions = {
        type: itemState.dotsType || 'rounded'
      };
      if (itemState.dotsColorMode === 'gradient') {
        dotsOptions.gradient = {
          type: itemState.dotsGradientType || 'linear',
          rotation: (itemState.dotsGradientAngle || 0) * (Math.PI / 180),
          colorStops: [
            { offset: 0, color: itemState.dotsColor1 || '#06b6d4' },
            { offset: 1, color: itemState.dotsColor2 || '#ec4899' }
          ]
        };
      } else {
        dotsOptions.color = itemState.dotsColor1 || '#0f172a';
      }

      const qr = new QRCodeStyling({
        width: 1024,
        height: 1024,
        type: 'canvas',
        data: item.trim(),
        margin: parseInt(itemState.margin, 10) || 12,
        dotsOptions,
        cornersSquareOptions: {
          type: itemState.cornersSquareType || 'extra-rounded',
          color: itemState.cornersSquareColor1 || itemState.dotsColor1 || '#0f172a'
        },
        cornersDotOptions: {
          type: itemState.cornersDotType || 'dot',
          color: itemState.cornersDotColor1 || itemState.dotsColor1 || '#0f172a'
        },
        backgroundOptions: {
          color: itemState.bgTransparent ? 'transparent' : (itemState.bgColor || '#ffffff')
        },
        image: itemState.customLogoUrl || itemState.presetLogoSvg || undefined,
        imageOptions: {
          hideBackgroundDots: itemState.hideDotsBehindLogo !== false,
          imageSize: parseFloat(itemState.logoSize) || 0.32,
          margin: parseInt(itemState.logoMargin, 10) || 5
        },
        qrOptions: {
          errorCorrectionLevel: itemState.errorCorrectionLevel || 'H'
        }
      });

      const blob = await qr.getRawData('png');
      folder.file(filename, blob);

      if (onProgress) {
        onProgress(i + 1, total);
      }
    }

    const zipContent = await zip.generateAsync({ type: 'blob' });
    downloadFile(zipContent, `Batch_QRCodes_${Date.now()}.zip`, 'application/zip');
  }
}
