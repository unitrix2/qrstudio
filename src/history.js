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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(designs.slice(0, 30)));
    return newDesign;
  }

  static deleteDesign(id) {
    let designs = this.getDesigns();
    designs = designs.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
    return designs;
  }

  static exportJSON(state) {
    const jsonStr = JSON.stringify(state, null, 2);
    downloadFile(jsonStr, `qr_config_${Date.now()}.json`, 'application/json');
  }
}
