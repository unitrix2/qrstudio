import confetti from 'canvas-confetti';
import { QREngine } from './qrEngine.js';
import { BRAND_ICONS, svgToDataUrl } from './icons.js';
import { PRESETS } from './presets.js';
import { QRScanner } from './scanner.js';
import { BatchGenerator } from './batch.js';
import { DesignStorage } from './history.js';

// Global Application State
const state = {
  contentType: 'url',
  contentValues: {
    url: 'https://antigravity.dev',
    text: 'Scan with Antigravity Designer QR Studio',
    // WiFi
    ssid: 'MyHome_5G',
    password: '',
    encryption: 'WPA',
    hidden: false,
    // UPI
    upiId: 'merchant@upi',
    payeeName: 'Studio Store',
    amount: '',
    note: 'Payment',
    currency: 'INR',
    // vCard
    fullName: 'Alex Vance',
    org: 'Apex Creative Studio',
    title: 'Lead Product Designer',
    phone: '+91 98765 43210',
    email: 'alex@example.com',
    address: 'Mumbai, India',
    // WhatsApp
    waPhone: '+919876543210',
    waMessage: 'Hi! I saw your designer QR code.',
    // Email
    emailTo: 'hello@example.com',
    emailSubject: 'Inquiry via QR Code',
    emailBody: 'Hello, I would like to get in touch.',
    // Phone & SMS
    callPhone: '+919876543210',
    smsPhone: '+919876543210',
    smsMessage: 'Hello there!',
    // Event
    eventTitle: 'Product Launch 2026',
    eventLocation: 'Convention Center',
    eventStart: '2026-10-15',
    eventEnd: '2026-10-15',
    eventDesc: 'VIP Exclusive Launch',
    // Crypto
    cryptoType: 'bitcoin',
    cryptoAddr: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    cryptoAmount: '0.005',
    // Social
    socialUrl: 'https://instagram.com/designer'
  },

  // Shapes & Dots
  dotsType: 'rounded',
  cornersSquareType: 'extra-rounded',
  cornersDotType: 'dot',
  margin: 12,
  errorCorrectionLevel: 'H',

  // Colors
  dotsColorMode: 'gradient',
  dotsGradientType: 'linear',
  dotsGradientAngle: 45,
  dotsColor1: '#06b6d4',
  dotsColor2: '#ec4899',

  customEyeColors: false,
  cornersSquareColor1: '#06b6d4',
  cornersDotColor1: '#ec4899',

  bgColor: '#0f172a',
  bgTransparent: false,

  // Logo
  logoMode: 'none', // 'none' | 'preset' | 'custom'
  presetLogoId: '',
  presetLogoSvg: '',
  customLogoUrl: '',
  customLogoName: '',
  logoSize: 0.32,
  logoMargin: 6,
  hideDotsBehindLogo: true,

  // Frames & Badges
  frameType: 'none',
  frameText: 'SCAN ME',
  frameColor: '#111827',
  frameTextColor: '#ffffff'
};

// Initialize QREngine
const engine = new QREngine();
const qrContainer = document.getElementById('qr-target-container');

// Toast Helper
function showToast(message, icon = '✨') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Contrast ratio calculator for Scanability score
function calculateContrast(hex1, hex2) {
  function getLuminance(hex) {
    if (!hex || hex === 'transparent') return 1;
    const c = hex.replace('#', '');
    const r = parseInt(c.substr(0, 2), 16) / 255;
    const g = parseInt(c.substr(2, 2), 16) / 255;
    const b = parseInt(c.substr(4, 2), 16) / 255;
    const a = [r, g, b].map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  return parseFloat(ratio.toFixed(1));
}

// Update live scanability badge & card
function updateDiagnostics() {
  const fg = state.dotsColor1;
  const bg = state.bgTransparent ? '#ffffff' : state.bgColor;
  const contrast = calculateContrast(fg, bg);

  const diagContrast = document.getElementById('diag-contrast');
  const diagEc = document.getElementById('diag-ec');
  const diagScore = document.getElementById('diag-score');
  const healthBadge = document.getElementById('health-badge');
  const healthText = document.getElementById('health-text');

  diagContrast.textContent = `${contrast} : 1`;
  diagEc.textContent = `Level ${state.errorCorrectionLevel}`;

  if (contrast >= 4.5) {
    diagContrast.className = 'diag-value safe';
    diagScore.textContent = '100% Guaranteed';
    diagScore.className = 'diag-value safe';
    healthBadge.className = 'health-badge';
    healthText.textContent = '100% Scan Safe';
  } else if (contrast >= 2.5) {
    diagContrast.className = 'diag-value warning';
    diagScore.textContent = 'Good (Moderate)';
    diagScore.className = 'diag-value warning';
    healthBadge.className = 'health-badge warning';
    healthText.textContent = 'Moderate Contrast';
  } else {
    diagContrast.className = 'diag-value danger';
    diagScore.textContent = 'Low (Risk of failure)';
    diagScore.className = 'diag-value danger';
    healthBadge.className = 'health-badge danger';
    healthText.textContent = 'Low Contrast Warning';
  }
}

// Render dynamic form based on content type
function renderContentForm() {
  const container = document.getElementById('dynamic-content-form');
  const type = state.contentType;
  const cv = state.contentValues;

  let html = '';

  switch (type) {
    case 'url':
      html = `
        <div class="form-group">
          <label class="group-label" for="inp-url">Website URL</label>
          <input type="url" id="inp-url" class="text-input" value="${cv.url || ''}" placeholder="https://yourwebsite.com">
        </div>
      `;
      break;

    case 'text':
      html = `
        <div class="form-group">
          <label class="group-label" for="inp-text">Plain Text / Message</label>
          <textarea id="inp-text" class="textarea-input" rows="4" placeholder="Enter text to encode...">${cv.text || ''}</textarea>
        </div>
      `;
      break;

    case 'wifi':
      html = `
        <div class="form-group">
          <label class="group-label" for="inp-wifi-ssid">Network Name (SSID)</label>
          <input type="text" id="inp-wifi-ssid" class="text-input" value="${cv.ssid || ''}" placeholder="e.g. Office_WiFi_5G">
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="group-label" for="inp-wifi-pass">Password</label>
            <input type="text" id="inp-wifi-pass" class="text-input" value="${cv.password || ''}" placeholder="WPA Key">
          </div>
          <div class="form-group">
            <label class="group-label" for="inp-wifi-enc">Encryption</label>
            <select id="inp-wifi-enc" class="select-input">
              <option value="WPA" ${cv.encryption === 'WPA' ? 'selected' : ''}>WPA / WPA2 / WPA3</option>
              <option value="WEP" ${cv.encryption === 'WEP' ? 'selected' : ''}>WEP</option>
              <option value="nopass" ${cv.encryption === 'nopass' ? 'selected' : ''}>None (Open)</option>
            </select>
          </div>
        </div>
      `;
      break;

    case 'upi':
      html = `
        <div class="form-grid-2">
          <div class="form-group">
            <label class="group-label" for="inp-upi-id">UPI ID / VPA</label>
            <input type="text" id="inp-upi-id" class="text-input" value="${cv.upiId || ''}" placeholder="e.g. shop@okaxis">
          </div>
          <div class="form-group">
            <label class="group-label" for="inp-upi-name">Payee / Store Name</label>
            <input type="text" id="inp-upi-name" class="text-input" value="${cv.payeeName || ''}" placeholder="Merchant Name">
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="group-label" for="inp-upi-amount">Amount (Optional INR)</label>
            <input type="number" id="inp-upi-amount" class="text-input" value="${cv.amount || ''}" placeholder="e.g. 500">
          </div>
          <div class="form-group">
            <label class="group-label" for="inp-upi-note">Payment Note</label>
            <input type="text" id="inp-upi-note" class="text-input" value="${cv.note || ''}" placeholder="e.g. Invoice #102">
          </div>
        </div>
      `;
      break;

    case 'vcard':
      html = `
        <div class="form-grid-2">
          <div class="form-group">
            <label class="group-label" for="inp-vcard-name">Full Name</label>
            <input type="text" id="inp-vcard-name" class="text-input" value="${cv.fullName || ''}" placeholder="John Doe">
          </div>
          <div class="form-group">
            <label class="group-label" for="inp-vcard-phone">Phone Number</label>
            <input type="tel" id="inp-vcard-phone" class="text-input" value="${cv.phone || ''}" placeholder="+1 234 567 8900">
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="group-label" for="inp-vcard-email">Email Address</label>
            <input type="email" id="inp-vcard-email" class="text-input" value="${cv.email || ''}" placeholder="john@company.com">
          </div>
          <div class="form-group">
            <label class="group-label" for="inp-vcard-org">Company / Brand</label>
            <input type="text" id="inp-vcard-org" class="text-input" value="${cv.org || ''}" placeholder="Acme Studios">
          </div>
        </div>
        <div class="form-group">
          <label class="group-label" for="inp-vcard-title">Job Title</label>
          <input type="text" id="inp-vcard-title" class="text-input" value="${cv.title || ''}" placeholder="Creative Director">
        </div>
      `;
      break;

    case 'whatsapp':
      html = `
        <div class="form-group">
          <label class="group-label" for="inp-wa-phone">Phone (with country code)</label>
          <input type="text" id="inp-wa-phone" class="text-input" value="${cv.waPhone || ''}" placeholder="e.g. +919876543210">
        </div>
        <div class="form-group">
          <label class="group-label" for="inp-wa-msg">Pre-filled Message</label>
          <input type="text" id="inp-wa-msg" class="text-input" value="${cv.waMessage || ''}" placeholder="Hello! I would like to inquire about...">
        </div>
      `;
      break;

    case 'email':
      html = `
        <div class="form-group">
          <label class="group-label" for="inp-email-to">Recipient Email</label>
          <input type="email" id="inp-email-to" class="text-input" value="${cv.emailTo || ''}" placeholder="support@domain.com">
        </div>
        <div class="form-group">
          <label class="group-label" for="inp-email-sub">Subject Line</label>
          <input type="text" id="inp-email-sub" class="text-input" value="${cv.emailSubject || ''}" placeholder="Quick Inquiry">
        </div>
        <div class="form-group">
          <label class="group-label" for="inp-email-body">Email Body</label>
          <textarea id="inp-email-body" class="textarea-input" rows="3" placeholder="Write message...">${cv.emailBody || ''}</textarea>
        </div>
      `;
      break;

    case 'phone':
      html = `
        <div class="form-group">
          <label class="group-label" for="inp-call-phone">Telephone Number</label>
          <input type="tel" id="inp-call-phone" class="text-input" value="${cv.callPhone || ''}" placeholder="+1 800 555 0199">
        </div>
      `;
      break;

    case 'sms':
      html = `
        <div class="form-group">
          <label class="group-label" for="inp-sms-phone">Recipient Phone</label>
          <input type="tel" id="inp-sms-phone" class="text-input" value="${cv.smsPhone || ''}" placeholder="+1 555 019 2834">
        </div>
        <div class="form-group">
          <label class="group-label" for="inp-sms-msg">SMS Text</label>
          <input type="text" id="inp-sms-msg" class="text-input" value="${cv.smsMessage || ''}" placeholder="Message text">
        </div>
      `;
      break;

    case 'event':
      html = `
        <div class="form-group">
          <label class="group-label" for="inp-ev-title">Event Title</label>
          <input type="text" id="inp-ev-title" class="text-input" value="${cv.eventTitle || ''}" placeholder="Grand Gala 2026">
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="group-label" for="inp-ev-start">Start Date</label>
            <input type="date" id="inp-ev-start" class="text-input" value="${cv.eventStart || ''}">
          </div>
          <div class="form-group">
            <label class="group-label" for="inp-ev-end">End Date</label>
            <input type="date" id="inp-ev-end" class="text-input" value="${cv.eventEnd || ''}">
          </div>
        </div>
        <div class="form-group">
          <label class="group-label" for="inp-ev-loc">Location</label>
          <input type="text" id="inp-ev-loc" class="text-input" value="${cv.eventLocation || ''}" placeholder="Hall A, Convention Center">
        </div>
      `;
      break;

    case 'crypto':
      html = `
        <div class="form-grid-2">
          <div class="form-group">
            <label class="group-label" for="inp-crypto-coin">Cryptocurrency</label>
            <select id="inp-crypto-coin" class="select-input">
              <option value="bitcoin" ${cv.cryptoType === 'bitcoin' ? 'selected' : ''}>Bitcoin (BTC)</option>
              <option value="ethereum" ${cv.cryptoType === 'ethereum' ? 'selected' : ''}>Ethereum (ETH)</option>
              <option value="solana" ${cv.cryptoType === 'solana' ? 'selected' : ''}>Solana (SOL)</option>
              <option value="usdt" ${cv.cryptoType === 'usdt' ? 'selected' : ''}>Tether (USDT)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="group-label" for="inp-crypto-amt">Amount (Optional)</label>
            <input type="text" id="inp-crypto-amt" class="text-input" value="${cv.cryptoAmount || ''}" placeholder="0.05">
          </div>
        </div>
        <div class="form-group">
          <label class="group-label" for="inp-crypto-addr">Wallet Address</label>
          <input type="text" id="inp-crypto-addr" class="text-input" value="${cv.cryptoAddr || ''}" placeholder="Wallet Public Key">
        </div>
      `;
      break;

    case 'social':
      html = `
        <div class="form-group">
          <label class="group-label" for="inp-social-url">Social Profile Link</label>
          <input type="url" id="inp-social-url" class="text-input" value="${cv.socialUrl || ''}" placeholder="https://instagram.com/yourhandle">
        </div>
      `;
      break;
  }

  container.innerHTML = html;
  bindDynamicInputs();
}

// Debounce helper
let renderDebounceTimer = null;
function triggerRender() {
  clearTimeout(renderDebounceTimer);
  renderDebounceTimer = setTimeout(() => {
    engine.render(qrContainer, state);
    updateDiagnostics();
  }, 40);
}

// Bind live changes from dynamic inputs
function bindDynamicInputs() {
  const type = state.contentType;
  const cv = state.contentValues;

  if (type === 'url') {
    const el = document.getElementById('inp-url');
    if (el) el.addEventListener('input', (e) => { cv.url = e.target.value; triggerRender(); });
  } else if (type === 'text') {
    const el = document.getElementById('inp-text');
    if (el) el.addEventListener('input', (e) => { cv.text = e.target.value; triggerRender(); });
  } else if (type === 'wifi') {
    const ssid = document.getElementById('inp-wifi-ssid');
    const pass = document.getElementById('inp-wifi-pass');
    const enc = document.getElementById('inp-wifi-enc');
    if (ssid) ssid.addEventListener('input', (e) => { cv.ssid = e.target.value; triggerRender(); });
    if (pass) pass.addEventListener('input', (e) => { cv.password = e.target.value; triggerRender(); });
    if (enc) enc.addEventListener('change', (e) => { cv.encryption = e.target.value; triggerRender(); });
  } else if (type === 'upi') {
    const id = document.getElementById('inp-upi-id');
    const name = document.getElementById('inp-upi-name');
    const amt = document.getElementById('inp-upi-amount');
    const note = document.getElementById('inp-upi-note');
    if (id) id.addEventListener('input', (e) => { cv.upiId = e.target.value; triggerRender(); });
    if (name) name.addEventListener('input', (e) => { cv.payeeName = e.target.value; triggerRender(); });
    if (amt) amt.addEventListener('input', (e) => { cv.amount = e.target.value; triggerRender(); });
    if (note) note.addEventListener('input', (e) => { cv.note = e.target.value; triggerRender(); });
  } else if (type === 'vcard') {
    const name = document.getElementById('inp-vcard-name');
    const phone = document.getElementById('inp-vcard-phone');
    const email = document.getElementById('inp-vcard-email');
    const org = document.getElementById('inp-vcard-org');
    const title = document.getElementById('inp-vcard-title');
    if (name) name.addEventListener('input', (e) => { cv.fullName = e.target.value; triggerRender(); });
    if (phone) phone.addEventListener('input', (e) => { cv.phone = e.target.value; triggerRender(); });
    if (email) email.addEventListener('input', (e) => { cv.email = e.target.value; triggerRender(); });
    if (org) org.addEventListener('input', (e) => { cv.org = e.target.value; triggerRender(); });
    if (title) title.addEventListener('input', (e) => { cv.title = e.target.value; triggerRender(); });
  } else if (type === 'whatsapp') {
    const phone = document.getElementById('inp-wa-phone');
    const msg = document.getElementById('inp-wa-msg');
    if (phone) phone.addEventListener('input', (e) => { cv.waPhone = e.target.value; triggerRender(); });
    if (msg) msg.addEventListener('input', (e) => { cv.waMessage = e.target.value; triggerRender(); });
  } else if (type === 'email') {
    const to = document.getElementById('inp-email-to');
    const sub = document.getElementById('inp-email-sub');
    const body = document.getElementById('inp-email-body');
    if (to) to.addEventListener('input', (e) => { cv.emailTo = e.target.value; triggerRender(); });
    if (sub) sub.addEventListener('input', (e) => { cv.emailSubject = e.target.value; triggerRender(); });
    if (body) body.addEventListener('input', (e) => { cv.emailBody = e.target.value; triggerRender(); });
  } else if (type === 'phone') {
    const p = document.getElementById('inp-call-phone');
    if (p) p.addEventListener('input', (e) => { cv.callPhone = e.target.value; triggerRender(); });
  } else if (type === 'sms') {
    const p = document.getElementById('inp-sms-phone');
    const msg = document.getElementById('inp-sms-msg');
    if (p) p.addEventListener('input', (e) => { cv.smsPhone = e.target.value; triggerRender(); });
    if (msg) msg.addEventListener('input', (e) => { cv.smsMessage = e.target.value; triggerRender(); });
  } else if (type === 'event') {
    const title = document.getElementById('inp-ev-title');
    const start = document.getElementById('inp-ev-start');
    const end = document.getElementById('inp-ev-end');
    const loc = document.getElementById('inp-ev-loc');
    if (title) title.addEventListener('input', (e) => { cv.eventTitle = e.target.value; triggerRender(); });
    if (start) start.addEventListener('input', (e) => { cv.eventStart = e.target.value; triggerRender(); });
    if (end) end.addEventListener('input', (e) => { cv.eventEnd = e.target.value; triggerRender(); });
    if (loc) loc.addEventListener('input', (e) => { cv.eventLocation = e.target.value; triggerRender(); });
  } else if (type === 'crypto') {
    const coin = document.getElementById('inp-crypto-coin');
    const amt = document.getElementById('inp-crypto-amt');
    const addr = document.getElementById('inp-crypto-addr');
    if (coin) coin.addEventListener('change', (e) => { cv.cryptoType = e.target.value; triggerRender(); });
    if (amt) amt.addEventListener('input', (e) => { cv.cryptoAmount = e.target.value; triggerRender(); });
    if (addr) addr.addEventListener('input', (e) => { cv.cryptoAddr = e.target.value; triggerRender(); });
  } else if (type === 'social') {
    const s = document.getElementById('inp-social-url');
    if (s) s.addEventListener('input', (e) => { cv.socialUrl = e.target.value; triggerRender(); });
  }
}

// Populate Built-in Brand Icons in Tab 4
function populatePresetIcons() {
  const container = document.getElementById('preset-icons-grid');
  container.innerHTML = '';

  BRAND_ICONS.forEach(icon => {
    const btn = document.createElement('div');
    btn.className = `icon-badge ${state.presetLogoId === icon.id ? 'active' : ''}`;
    btn.dataset.id = icon.id;
    btn.innerHTML = `
      ${icon.svg || '<span style="font-size: 20px;">🚫</span>'}
      <span class="icon-badge-name">${icon.name}</span>
    `;

    btn.addEventListener('click', () => {
      document.querySelectorAll('.icon-badge').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (icon.id === 'none') {
        state.logoMode = 'none';
        state.presetLogoId = '';
        state.presetLogoSvg = '';
      } else {
        state.logoMode = 'preset';
        state.presetLogoId = icon.id;
        state.presetLogoSvg = svgToDataUrl(icon.svg);
      }
      triggerRender();
    });

    container.appendChild(btn);
  });
}

// Populate Presets in Drawer
function populatePresetsDrawer() {
  const grid = document.getElementById('presets-gallery-grid');
  grid.innerHTML = '';

  PRESETS.forEach(preset => {
    const card = document.createElement('div');
    card.className = 'preset-card';
    card.innerHTML = `
      <div class="preset-card-header">
        <span class="preset-title">${preset.name}</span>
        <span class="preset-tag">${preset.tag}</span>
      </div>
      <p class="preset-desc">${preset.desc}</p>
      <div class="preset-swatch-bar" style="background: linear-gradient(90deg, ${preset.config.dotsColor1}, ${preset.config.dotsColor2});"></div>
    `;

    card.addEventListener('click', () => {
      applyPreset(preset);
      document.getElementById('modal-presets').classList.remove('open');
      showToast(`Applied preset: ${preset.name}`, '✨');
    });

    grid.appendChild(card);
  });
}

// Apply a preset config to state
function applyPreset(preset) {
  const cfg = preset.config;
  state.dotsType = cfg.dotsType;
  state.dotsColorMode = cfg.dotsColorMode;
  state.dotsGradientType = cfg.dotsGradientType;
  state.dotsGradientAngle = cfg.dotsGradientAngle;
  state.dotsColor1 = cfg.dotsColor1;
  state.dotsColor2 = cfg.dotsColor2;

  state.cornersSquareType = cfg.cornersSquareType;
  state.cornersSquareColor1 = cfg.cornersSquareColor1;

  state.cornersDotType = cfg.cornersDotType;
  state.cornersDotColor1 = cfg.cornersDotColor1;

  state.bgColor = cfg.bgColor;
  state.bgTransparent = cfg.bgTransparent;

  state.frameType = cfg.frameType;
  state.frameText = cfg.frameText;
  state.frameColor = cfg.frameColor;
  state.frameTextColor = cfg.frameTextColor;

  syncControlsFromState();
  triggerRender();
}

// Synchronize UI Controls with current state
function syncControlsFromState() {
  // Dots Type
  document.querySelectorAll('#dots-type-selector .shape-card').forEach(c => {
    c.classList.toggle('active', c.dataset.val === state.dotsType);
  });

  // Corners Square
  document.querySelectorAll('#corners-square-selector .shape-card').forEach(c => {
    c.classList.toggle('active', c.dataset.val === state.cornersSquareType);
  });

  // Corners Dot
  document.querySelectorAll('#corners-dot-selector .shape-card').forEach(c => {
    c.classList.toggle('active', c.dataset.val === state.cornersDotType);
  });

  // Margin & EC
  document.getElementById('slider-margin').value = state.margin;
  document.getElementById('label-margin').textContent = `${state.margin}px`;
  document.getElementById('select-ec').value = state.errorCorrectionLevel;

  // Dots Color
  document.getElementById('input-dots-c1').value = state.dotsColor1;
  document.getElementById('input-dots-c1-text').value = state.dotsColor1;
  document.getElementById('input-dots-c2').value = state.dotsColor2;
  document.getElementById('input-dots-c2-text').value = state.dotsColor2;

  document.querySelectorAll('#dots-color-mode-toggle .toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.val === state.dotsColorMode);
  });
  document.getElementById('wrap-dots-c2').style.display = state.dotsColorMode === 'gradient' ? 'block' : 'none';
  document.getElementById('dots-gradient-options').style.display = state.dotsColorMode === 'gradient' ? 'flex' : 'none';

  // Eye Colors
  document.getElementById('check-custom-eye-colors').checked = state.customEyeColors;
  document.getElementById('wrap-custom-eye-controls').style.display = state.customEyeColors ? 'flex' : 'none';
  document.getElementById('input-eye-frame-c').value = state.cornersSquareColor1;
  document.getElementById('input-eye-frame-c-text').value = state.cornersSquareColor1;
  document.getElementById('input-eye-dot-c').value = state.cornersDotColor1;
  document.getElementById('input-eye-dot-c-text').value = state.cornersDotColor1;

  // Background
  document.getElementById('check-bg-transparent').checked = state.bgTransparent;
  document.getElementById('wrap-bg-color-field').style.display = state.bgTransparent ? 'none' : 'flex';
  document.getElementById('input-bg-c').value = state.bgColor;
  document.getElementById('input-bg-c-text').value = state.bgColor;

  // Frames
  document.querySelectorAll('#frame-selector-grid .frame-card').forEach(c => {
    c.classList.toggle('active', c.dataset.val === state.frameType);
  });
  document.getElementById('wrap-frame-options').style.display = state.frameType !== 'none' ? 'block' : 'none';
  document.getElementById('input-frame-text').value = state.frameText;
  document.getElementById('input-frame-color').value = state.frameColor;
  document.getElementById('input-frame-color-text').value = state.frameColor;
  document.getElementById('input-frame-text-color').value = state.frameTextColor;
  document.getElementById('input-frame-text-color-text').value = state.frameTextColor;
}

// Setup Event Listeners
function setupEventListeners() {
  // Tabs Navigation
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });

  // Content Type Pills
  document.querySelectorAll('.type-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.type-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.contentType = pill.dataset.type;
      renderContentForm();
      triggerRender();
    });
  });

  // Body Dots Shape Selector
  document.querySelectorAll('#dots-type-selector .shape-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('#dots-type-selector .shape-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.dotsType = card.dataset.val;
      triggerRender();
    });
  });

  // Corner Square Outer Shape
  document.querySelectorAll('#corners-square-selector .shape-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('#corners-square-selector .shape-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.cornersSquareType = card.dataset.val;
      triggerRender();
    });
  });

  // Corner Dot Pupil Shape
  document.querySelectorAll('#corners-dot-selector .shape-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('#corners-dot-selector .shape-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.cornersDotType = card.dataset.val;
      triggerRender();
    });
  });

  // Margin Slider
  const sliderMargin = document.getElementById('slider-margin');
  sliderMargin.addEventListener('input', (e) => {
    state.margin = parseInt(e.target.value, 10);
    document.getElementById('label-margin').textContent = `${state.margin}px`;
    triggerRender();
  });

  // Error Correction Select
  const selectEc = document.getElementById('select-ec');
  selectEc.addEventListener('change', (e) => {
    state.errorCorrectionLevel = e.target.value;
    triggerRender();
  });

  // Swatches Click
  document.querySelectorAll('#color-swatches-row .color-swatch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.dotsColor1 = btn.dataset.c1;
      state.dotsColor2 = btn.dataset.c2;
      state.dotsColorMode = btn.dataset.mode;
      syncControlsFromState();
      triggerRender();
    });
  });

  // Dots Color Mode Toggle (Solid vs Gradient)
  document.querySelectorAll('#dots-color-mode-toggle .toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#dots-color-mode-toggle .toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.dotsColorMode = btn.dataset.val;
      document.getElementById('wrap-dots-c2').style.display = state.dotsColorMode === 'gradient' ? 'block' : 'none';
      document.getElementById('dots-gradient-options').style.display = state.dotsColorMode === 'gradient' ? 'flex' : 'none';
      triggerRender();
    });
  });

  // Dots Colors Inputs
  const c1 = document.getElementById('input-dots-c1');
  const c1Text = document.getElementById('input-dots-c1-text');
  c1.addEventListener('input', (e) => {
    state.dotsColor1 = e.target.value;
    c1Text.value = e.target.value;
    triggerRender();
  });
  c1Text.addEventListener('input', (e) => {
    state.dotsColor1 = e.target.value;
    c1.value = e.target.value;
    triggerRender();
  });

  const c2 = document.getElementById('input-dots-c2');
  const c2Text = document.getElementById('input-dots-c2-text');
  c2.addEventListener('input', (e) => {
    state.dotsColor2 = e.target.value;
    c2Text.value = e.target.value;
    triggerRender();
  });
  c2Text.addEventListener('input', (e) => {
    state.dotsColor2 = e.target.value;
    c2.value = e.target.value;
    triggerRender();
  });

  // Gradient Type Toggle (Linear vs Radial)
  document.querySelectorAll('#dots-grad-type-toggle .toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#dots-grad-type-toggle .toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.dotsGradientType = btn.dataset.val;
      triggerRender();
    });
  });

  // Gradient Angle Slider
  const sliderDotsAngle = document.getElementById('slider-dots-angle');
  sliderDotsAngle.addEventListener('input', (e) => {
    state.dotsGradientAngle = parseInt(e.target.value, 10);
    document.getElementById('label-dots-angle').textContent = `${state.dotsGradientAngle}°`;
    triggerRender();
  });

  // Custom Eye Colors Checkbox
  const checkCustomEyes = document.getElementById('check-custom-eye-colors');
  checkCustomEyes.addEventListener('change', (e) => {
    state.customEyeColors = e.target.checked;
    document.getElementById('wrap-custom-eye-controls').style.display = state.customEyeColors ? 'flex' : 'none';
    if (!state.customEyeColors) {
      state.cornersSquareColor1 = state.dotsColor1;
      state.cornersDotColor1 = state.dotsColor1;
    }
    triggerRender();
  });

  const eyeFrameC = document.getElementById('input-eye-frame-c');
  const eyeFrameCText = document.getElementById('input-eye-frame-c-text');
  eyeFrameC.addEventListener('input', (e) => {
    state.cornersSquareColor1 = e.target.value;
    eyeFrameCText.value = e.target.value;
    triggerRender();
  });
  eyeFrameCText.addEventListener('input', (e) => {
    state.cornersSquareColor1 = e.target.value;
    eyeFrameC.value = e.target.value;
    triggerRender();
  });

  const eyeDotC = document.getElementById('input-eye-dot-c');
  const eyeDotCText = document.getElementById('input-eye-dot-c-text');
  eyeDotC.addEventListener('input', (e) => {
    state.cornersDotColor1 = e.target.value;
    eyeDotCText.value = e.target.value;
    triggerRender();
  });
  eyeDotCText.addEventListener('input', (e) => {
    state.cornersDotColor1 = e.target.value;
    eyeDotC.value = e.target.value;
    triggerRender();
  });

  // Background Settings
  const checkBgTrans = document.getElementById('check-bg-transparent');
  checkBgTrans.addEventListener('change', (e) => {
    state.bgTransparent = e.target.checked;
    document.getElementById('wrap-bg-color-field').style.display = state.bgTransparent ? 'none' : 'flex';
    triggerRender();
  });

  const bgC = document.getElementById('input-bg-c');
  const bgCText = document.getElementById('input-bg-c-text');
  bgC.addEventListener('input', (e) => {
    state.bgColor = e.target.value;
    bgCText.value = e.target.value;
    triggerRender();
  });
  bgCText.addEventListener('input', (e) => {
    state.bgColor = e.target.value;
    bgC.value = e.target.value;
    triggerRender();
  });

  // Custom Logo Upload
  const logoDropzone = document.getElementById('logo-dropzone');
  const inputLogoFile = document.getElementById('input-logo-file');
  const activeLogoBar = document.getElementById('active-custom-logo-bar');
  const customLogoThumb = document.getElementById('custom-logo-thumb');
  const customLogoName = document.getElementById('custom-logo-name');
  const btnRemoveLogo = document.getElementById('btn-remove-logo');

  logoDropzone.addEventListener('click', () => inputLogoFile.click());

  function handleLogoFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, SVG, JPG)', '⚠️');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      state.logoMode = 'custom';
      state.customLogoUrl = e.target.result;
      state.customLogoName = file.name;
      // Auto upgrade error correction to H so it's 100% scannable
      state.errorCorrectionLevel = 'H';
      document.getElementById('select-ec').value = 'H';

      customLogoThumb.src = state.customLogoUrl;
      customLogoName.textContent = file.name;
      activeLogoBar.style.display = 'flex';

      document.querySelectorAll('.icon-badge').forEach(b => b.classList.remove('active'));
      triggerRender();
      showToast('Custom logo applied to QR center!', '🖼️');
    };
    reader.readAsDataURL(file);
  }

  inputLogoFile.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleLogoFile(e.target.files[0]);
    }
  });

  logoDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    logoDropzone.classList.add('dragover');
  });
  logoDropzone.addEventListener('dragleave', () => logoDropzone.classList.remove('dragover'));
  logoDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    logoDropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoFile(e.dataTransfer.files[0]);
    }
  });

  btnRemoveLogo.addEventListener('click', (e) => {
    e.stopPropagation();
    state.logoMode = 'none';
    state.customLogoUrl = '';
    state.customLogoName = '';
    activeLogoBar.style.display = 'none';
    inputLogoFile.value = '';
    triggerRender();
    showToast('Custom logo removed', '🗑️');
  });

  // Logo Sliders
  const sliderLogoSize = document.getElementById('slider-logo-size');
  sliderLogoSize.addEventListener('input', (e) => {
    state.logoSize = parseFloat(e.target.value);
    document.getElementById('label-logo-size').textContent = `${Math.round(state.logoSize * 100)}%`;
    triggerRender();
  });

  const sliderLogoMargin = document.getElementById('slider-logo-margin');
  sliderLogoMargin.addEventListener('input', (e) => {
    state.logoMargin = parseInt(e.target.value, 10);
    document.getElementById('label-logo-margin').textContent = `${state.logoMargin}px`;
    triggerRender();
  });

  const checkHideDots = document.getElementById('check-hide-dots');
  checkHideDots.addEventListener('change', (e) => {
    state.hideDotsBehindLogo = e.target.checked;
    triggerRender();
  });

  // Frames Selection
  document.querySelectorAll('#frame-selector-grid .frame-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('#frame-selector-grid .frame-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.frameType = card.dataset.val;
      document.getElementById('wrap-frame-options').style.display = state.frameType !== 'none' ? 'block' : 'none';
      triggerRender();
    });
  });

  const inputFrameText = document.getElementById('input-frame-text');
  inputFrameText.addEventListener('input', (e) => {
    state.frameText = e.target.value;
    triggerRender();
  });

  const frameColor = document.getElementById('input-frame-color');
  const frameColorText = document.getElementById('input-frame-color-text');
  frameColor.addEventListener('input', (e) => {
    state.frameColor = e.target.value;
    frameColorText.value = e.target.value;
    triggerRender();
  });
  frameColorText.addEventListener('input', (e) => {
    state.frameColor = e.target.value;
    frameColor.value = e.target.value;
    triggerRender();
  });

  const frameTextColor = document.getElementById('input-frame-text-color');
  const frameTextColorText = document.getElementById('input-frame-text-color-text');
  frameTextColor.addEventListener('input', (e) => {
    state.frameTextColor = e.target.value;
    frameTextColorText.value = e.target.value;
    triggerRender();
  });
  frameTextColorText.addEventListener('input', (e) => {
    state.frameTextColor = e.target.value;
    frameTextColor.value = e.target.value;
    triggerRender();
  });

  // Backdrop switcher in Preview Stage
  document.querySelectorAll('.btn-backdrop').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-backdrop').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const stage = document.getElementById('canvas-stage');
      stage.className = `canvas-stage ${btn.dataset.mode}`;
    });
  });

  // Download Primary Button
  const btnDownload = document.getElementById('btn-download-qr');
  btnDownload.addEventListener('click', async () => {
    const format = document.getElementById('export-format').value;
    const res = parseInt(document.getElementById('export-res').value, 10);
    const filename = `QRCode_${state.contentType}_${Date.now()}`;

    btnDownload.disabled = true;
    btnDownload.innerHTML = `<span>⏳</span><span>Exporting ${format.toUpperCase()}...</span>`;

    try {
      await engine.exportFile(format, res, filename);
      confetti({ particleCount: 75, spread: 65, origin: { y: 0.8 } });
      showToast(`Exported ${format.toUpperCase()} at ${res}px!`, '🎉');
    } catch (err) {
      console.error(err);
      showToast('Export failed. Please try again.', '❌');
    } finally {
      btnDownload.disabled = false;
      btnDownload.innerHTML = `<span class="btn-icon-symbol">⬇️</span><span class="btn-text">Download QR Code</span>`;
    }
  });

  // Copy to Clipboard
  const btnCopy = document.getElementById('btn-copy-clipboard');
  btnCopy.addEventListener('click', async () => {
    try {
      await engine.copyToClipboard(1024);
      confetti({ particleCount: 40, spread: 45, origin: { y: 0.85 } });
      showToast('Image copied to clipboard! Paste into Figma or Docs.', '📋');
    } catch (err) {
      console.error(err);
      showToast('Failed to copy. Try downloading as PNG.', '⚠️');
    }
  });

  // Save Design
  const btnSave = document.getElementById('btn-save-design');
  btnSave.addEventListener('click', () => {
    const name = prompt('Enter a name for this QR Design:', `Style ${new Date().toLocaleTimeString()}`);
    if (name) {
      DesignStorage.saveDesign(name, state);
      showToast(`Design "${name}" saved to My Designs!`, '💾');
      renderSavedDesigns();
    }
  });

  // Export JSON
  const btnExportJson = document.getElementById('btn-export-json');
  btnExportJson.addEventListener('click', () => {
    DesignStorage.exportJSON(state);
    showToast('Exported QR configuration JSON!', '⚙️');
  });

  // Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    themeIcon.textContent = next === 'dark' ? '🌙' : '☀️';
  });

  // Modal Closers
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = document.getElementById(btn.dataset.close);
      if (modal) modal.classList.remove('open');
      if (scannerInstance) scannerInstance.stopCamera();
    });
  });

  // Close modals on clicking outside dialog
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('open');
        if (scannerInstance) scannerInstance.stopCamera();
      }
    });
  });

  // Modal Triggers
  document.getElementById('btn-open-presets').addEventListener('click', () => {
    document.getElementById('modal-presets').classList.add('open');
  });

  document.getElementById('btn-open-scanner').addEventListener('click', () => {
    document.getElementById('modal-scanner').classList.add('open');
  });

  document.getElementById('btn-open-batch').addEventListener('click', () => {
    document.getElementById('modal-batch').classList.add('open');
  });

  document.getElementById('btn-open-saved').addEventListener('click', () => {
    renderSavedDesigns();
    document.getElementById('modal-saved').classList.add('open');
  });

  // Setup Scanner
  setupScannerFeature();

  // Setup Batch Generator
  setupBatchFeature();

  // Setup Saved Designs Import
  setupSavedFeature();
}

// Scanner Logic
let scannerInstance = null;
function setupScannerFeature() {
  const video = document.getElementById('scanner-video');
  const canvas = document.getElementById('scanner-canvas');
  const resultCard = document.getElementById('scanner-result-card');
  const resultPayload = document.getElementById('scanner-result-payload');
  const btnStartCam = document.getElementById('btn-start-camera');
  const btnStopCam = document.getElementById('btn-stop-camera');
  const btnCopyScanned = document.getElementById('btn-copy-scanned');
  const btnOpenUrl = document.getElementById('btn-open-scanned-url');
  const btnLoadEditor = document.getElementById('btn-load-into-editor');

  function handleScanResult(text) {
    resultPayload.textContent = text;
    resultCard.style.display = 'block';

    if (/^https?:\/\//i.test(text)) {
      btnOpenUrl.href = text;
      btnOpenUrl.style.display = 'inline-flex';
    } else {
      btnOpenUrl.style.display = 'none';
    }
  }

  scannerInstance = new QRScanner(video, canvas, handleScanResult);

  btnStartCam.addEventListener('click', async () => {
    const ok = await scannerInstance.startCamera();
    if (ok) {
      btnStartCam.style.display = 'none';
      btnStopCam.style.display = 'inline-block';
    } else {
      showToast('Camera access denied or unavailable', '⚠️');
    }
  });

  btnStopCam.addEventListener('click', () => {
    scannerInstance.stopCamera();
    btnStartCam.style.display = 'inline-block';
    btnStopCam.style.display = 'none';
  });

  // Scanner Mode Switch (Camera vs Upload)
  document.querySelectorAll('.scanner-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.scanner-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.scanner-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const pane = tab.dataset.mode === 'camera' ? 'scanner-camera-pane' : 'scanner-upload-pane';
      document.getElementById(pane).classList.add('active');
      if (tab.dataset.mode !== 'camera' && scannerInstance) {
        scannerInstance.stopCamera();
        btnStartCam.style.display = 'inline-block';
        btnStopCam.style.display = 'none';
      }
    });
  });

  // Dropzone for scanning images
  const scanDropzone = document.getElementById('scan-dropzone');
  const inputScanFile = document.getElementById('input-scan-file');

  scanDropzone.addEventListener('click', () => inputScanFile.click());
  inputScanFile.addEventListener('change', async (e) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const text = await QRScanner.decodeImage(e.target.files[0]);
        handleScanResult(text);
        showToast('QR Code decoded successfully!', '✅');
      } catch (err) {
        showToast(err.message, '⚠️');
      }
    }
  });

  btnCopyScanned.addEventListener('click', () => {
    navigator.clipboard.writeText(resultPayload.textContent);
    showToast('Decoded text copied to clipboard!', '📋');
  });

  btnLoadEditor.addEventListener('click', () => {
    const txt = resultPayload.textContent;
    state.contentType = 'url';
    state.contentValues.url = txt;
    renderContentForm();
    triggerRender();
    document.getElementById('modal-scanner').classList.remove('open');
    showToast('Loaded scanned payload into editor!', '✏️');
  });
}

// Batch Generator Logic
function setupBatchFeature() {
  const btnStartBatch = document.getElementById('btn-start-batch');
  const textarea = document.getElementById('batch-textarea');
  const progressBox = document.getElementById('batch-progress-box');
  const progressBar = document.getElementById('batch-progress-bar');
  const progressText = document.getElementById('batch-progress-text');

  btnStartBatch.addEventListener('click', async () => {
    const lines = textarea.value.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) {
      showToast('Please enter at least one URL or text item', '⚠️');
      return;
    }

    btnStartBatch.disabled = true;
    progressBox.style.display = 'block';

    try {
      await BatchGenerator.generateZip(lines, state, (current, total) => {
        const percent = Math.round((current / total) * 100);
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `Processing ${current} / ${total} (${percent}%)...`;
      });

      confetti({ particleCount: 100, spread: 70 });
      showToast(`Generated and downloaded ${lines.length} QR codes in .ZIP!`, '⚡');
      document.getElementById('modal-batch').classList.remove('open');
    } catch (err) {
      console.error(err);
      showToast('Batch generation error.', '❌');
    } finally {
      btnStartBatch.disabled = false;
      progressBox.style.display = 'none';
      progressBar.style.width = '0%';
    }
  });
}

// Saved Designs Render & Import
function renderSavedDesigns() {
  const container = document.getElementById('saved-designs-list');
  const designs = DesignStorage.getDesigns();

  if (!designs.length) {
    container.innerHTML = '<p class="modal-desc">No saved designs yet. Click "Save Style" on any QR code you create!</p>';
    return;
  }

  container.innerHTML = '';
  designs.forEach(item => {
    const card = document.createElement('div');
    card.className = 'saved-item-card';
    card.innerHTML = `
      <div>
        <div class="saved-item-title">${item.name}</div>
        <div class="saved-item-date">${item.createdAt}</div>
      </div>
      <div class="saved-item-btns">
        <button class="btn-sm btn-accent btn-load-saved" data-id="${item.id}">Load Style</button>
        <button class="btn-sm btn-sm-danger btn-del-saved" data-id="${item.id}">Delete</button>
      </div>
    `;

    card.querySelector('.btn-load-saved').addEventListener('click', () => {
      Object.assign(state, JSON.parse(JSON.stringify(item.state)));
      syncControlsFromState();
      renderContentForm();
      triggerRender();
      document.getElementById('modal-saved').classList.remove('open');
      showToast(`Loaded "${item.name}" design!`, '🎨');
    });

    card.querySelector('.btn-del-saved').addEventListener('click', () => {
      DesignStorage.deleteDesign(item.id);
      renderSavedDesigns();
      showToast('Design deleted', '🗑️');
    });

    container.appendChild(card);
  });
}

function setupSavedFeature() {
  const btnTrigger = document.getElementById('btn-import-json-trigger');
  const inputImport = document.getElementById('input-import-json');

  btnTrigger.addEventListener('click', () => inputImport.click());
  inputImport.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target.result);
          Object.assign(state, imported);
          syncControlsFromState();
          renderContentForm();
          triggerRender();
          document.getElementById('modal-saved').classList.remove('open');
          showToast('Imported design configuration successfully!', '📥');
        } catch {
          showToast('Invalid JSON configuration file.', '⚠️');
        }
      };
      reader.readAsText(e.target.files[0]);
    }
  });
}

// INITIALIZATION
window.addEventListener('DOMContentLoaded', () => {
  renderContentForm();
  populatePresetIcons();
  populatePresetsDrawer();
  syncControlsFromState();
  setupEventListeners();

  // Initial QR Render
  engine.render(qrContainer, state);
  updateDiagnostics();
});
