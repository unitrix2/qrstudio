import { downloadFile } from './downloadHelper.js';

// Manages saved designs and history in LocalStorage
const STORAGE_KEY = 'qr_designer_pro_saved_designs';

export class DesignStorage {
  static getDesigns() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveDesign(name, state) {
    const designs = this.getDesigns();
    const newDesign = {
      id: 'design_' + Date.now(),
      name: name || `Design ${designs.length + 1}`,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      state: JSON.parse(JSON.stringify(state))
    };
    designs.unshift(newDesign);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(designs.slice(0, 50)));
    return newDesign;
  }

  static deleteDesign(id) {
    let designs = this.getDesigns();
    designs = designs.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
    return designs;
  }

  // Export a single design configuration as JSON
  static exportJSON(state, filenamePrefix = 'qr_config') {
    const exportData = {
      generator: 'QR Studio Pro',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      state: JSON.parse(JSON.stringify(state))
    };
    const jsonStr = JSON.stringify(exportData, null, 2);
    const filename = `${filenamePrefix}_${Date.now()}.json`;
    downloadFile(jsonStr, filename, 'application/json');
    return filename;
  }

  // Export all saved designs from history as a single backup JSON
  static exportAllJSON() {
    const designs = this.getDesigns();
    const exportData = {
      generator: 'QR Studio Pro',
      type: 'collection',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      designsCount: designs.length,
      designs: designs
    };
    const jsonStr = JSON.stringify(exportData, null, 2);
    const filename = `qr_designs_backup_${Date.now()}.json`;
    downloadFile(jsonStr, filename, 'application/json');
    return filename;
  }

  // Returns formatted sample template JSON string
  static getSampleJSON() {
    return JSON.stringify({
      generator: "QR Studio Pro",
      version: "1.0",
      state: {
        contentType: "url",
        contentValues: {
          url: "https://example.com"
        },
        dotsType: "rounded",
        cornersSquareType: "extra-rounded",
        cornersDotType: "dot",
        dotsColorMode: "single",
        dotsColor1: "#0f172a",
        bgColor: "#ffffff",
        margin: 12,
        errorCorrectionLevel: "H",
        logoMode: "none",
        frameType: "none"
      }
    }, null, 2);
  }
}
