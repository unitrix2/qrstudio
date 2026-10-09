# 🎨 QR Studio Pro — Ultimate Designer QR Code Generator

A professional, feature-packed QR code designer that lets you create stunning, fully customizable QR codes right in your browser. No server required — everything runs client-side.

![QR Studio Pro](https://img.shields.io/badge/QR_Studio-Pro-blueviolet?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Vite](https://img.shields.io/badge/Built_with-Vite-646CFF?style=for-the-badge&logo=vite)

---

## ✨ Features

### 🎯 QR Code Types
- **Text/URL** — Any text, website, or link
- **vCard** — Contact cards with name, phone, email, etc.
- **WiFi** — Share WiFi credentials instantly
- **Email** — Pre-filled email with subject/body
- **Phone** — Click-to-call numbers
- **SMS** — Pre-composed text messages
- **Location** — GPS coordinates on a map

### 🖌️ Full Customization
- **Dot Styles** — Square, Rounded, Dots, Classy, Classy Rounded, Extra Rounded
- **Corner Styles** — Square, Dot, Extra Rounded, and more
- **Colors** — Foreground, background, gradient support (linear/radial)
- **Corner Colors** — Independent inner/outer corner dot colors
- **Logo/Image** — Upload and embed a logo in the center
- **Frames** — Add decorative frames around QR codes
- **Error Correction** — L, M, Q, H levels for scan reliability
- **Size** — 200px to 4096px resolution

### 🎭 Design Presets
- Midnight Galaxy, Ocean Breeze, Sunset Glow, Forest Depth
- Neon Cyberpunk, Rose Gold, Arctic Frost, and more

### 📥 Export Formats
- **PNG** — High quality raster
- **SVG** — Scalable vector
- **JPEG** — Compressed raster
- **WebP** — Modern format
- **PDF** — Print-ready

### 🛠️ Advanced Features
- **Batch Generator** — Create multiple QR codes at once from a list
- **QR Scanner** — Scan QR codes via camera or image upload
- **History** — Auto-saves recent QR codes for quick access
- **Dark Mode** — Full dark theme support

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ installed

### Development
```bash
git clone https://github.com/YOUR_USERNAME/QR-Designer-Pro.git
cd QR-Designer-Pro
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 🌐 Deploy to GitHub Pages

This project includes a GitHub Actions workflow for automatic deployment:

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/QR-Designer-Pro.git
   git branch -M main
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repo → **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**

3. **Automatic Deploy:**
   - Every push to `main` triggers an automatic build & deploy
   - Your site will be live at: `https://YOUR_USERNAME.github.io/QR-Designer-Pro/`

---

## 📁 Project Structure

```
QR-Designer-Pro/
├── index.html              # Main HTML
├── vite.config.js          # Vite configuration
├── package.json
├── src/
│   ├── main.js             # App controller & UI logic
│   ├── qrEngine.js         # QR generation & export engine
│   ├── scanner.js          # QR scanner (camera + image)
│   ├── batch.js            # Batch QR generator
│   ├── history.js          # QR history manager
│   ├── downloadHelper.js   # Cross-browser download utility
│   └── style.css           # Complete styling
├── public/
│   ├── favicon.svg
│   └── icons.svg
└── .github/
    └── workflows/
        └── deploy.yml      # GitHub Pages auto-deploy
```

---

## 🛡️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Vite** | Build tool & dev server |
| **qr-code-styling** | QR code rendering engine |
| **jsPDF** | PDF export |
| **JSZip** | Batch ZIP packaging |
| **jsQR** | QR code scanning |
| **Lucide Icons** | UI icons |
| **Canvas Confetti** | Celebration effects |

---

## 📄 License

MIT License — Feel free to use, modify, and distribute.

---

<p align="center">Built with ❤️ using Vite & qr-code-styling</p>
