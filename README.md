# 🎨 QR Studio Pro — Ultimate Designer QR Generator

> An ultra-modern, professional-grade QR code design studio web application crafted with high-performance real-time rendering, fine-grained shape customizations, radiant gradient engine, logo embedding, and scanability health diagnostics.

---

## 🌟 Key Features

### 1. 12+ Dynamic Content Payload Types
- **Website / URL**: Smart URL schema handling & quick testing
- **Plain Text / Notes**: Multiline custom payloads
- **Wi-Fi Connect**: Auto-join Wi-Fi with SSID, WPA/WEP/Open encryption & hidden network support
- **UPI Payment (Indian Payments)**: Direct UPI URI (`upi://pay`) with Payee Name, VPA, Amount (INR), and Note
- **vCard (Digital Business Card)**: Full contact cards with Phone, Email, Org, Job Title, Website, Address
- **WhatsApp**: Direct chat links with pre-filled greeting messages
- **Email**: Pre-filled recipient, subject line, and body
- **Phone Call**: One-tap phone dialer QR (`tel:`)
- **SMS Message**: Pre-filled SMS recipient and text body
- **Calendar Event**: vCalendar format with Event Title, Location, and Start/End dates
- **Crypto Payment**: Bitcoin (BTC), Ethereum (ETH), Solana (SOL), and USDT address + amount
- **Social Profile**: Direct deep link to social media profiles

### 2. Designer Shapes & Patterns
- **Body Modules**:
  - Rounded Dots
  - Circular Dots
  - Classy Leaf
  - Classy Smooth
  - Squircle (Extra Rounded)
  - Classic Square
- **Eye Outer Frames (Corner Squares)**:
  - Extra Rounded
  - Circular Ring
  - Sharp Square
- **Eye Inner Pupils (Corner Dots)**:
  - Circular Pupil Dot
  - Square Geometric Block
- **Quiet Zone / Margin**: Interactive slider (0px to 40px)
- **Error Correction Level**: L (7%), M (15%), Q (25%), H (30% - Auto-safeguard for logo embedding)

### 3. Colors & Radiant Gradients
- **Fill Modes**: Solid Color, Linear Gradient, or Radial Gradient
- **Interactive Angle Dial**: 0° to 360° gradient rotation
- **Eye Customization**: Inherit from body or assign independent colors to outer frames & inner pupils
- **Background Engine**: Solid Color, Dark Slate, Light Crisp, or Full Alpha Transparent PNG
- **One-Click Swatches**: Cyberpunk Neon, Champagne Gold, Emerald Fintech, Sunset Coral, Royal Amethyst, Ocean Breeze, Minimal Dark, Indigo Glow

### 4. Center Logo & Watermark Embedding
- **Custom Upload**: Drag & Drop any custom PNG, SVG, or JPG logo
- **Built-in Brand Vector Library**:
  - WhatsApp, Instagram, YouTube, X (Twitter), LinkedIn, Facebook, Telegram, GitHub
  - Wi-Fi, UPI / BharatPay, PhonePe, Google Pay, Spotify, PayPal
  - Mail, Phone, Website, Bitcoin, Star Badge
- **Fine Adjustment Sliders**: Logo scale (15% to 45%) and padding/margin (0 to 25px)
- **Background Dot Masking**: Clean cutouts behind logo to guarantee high contrast and 100% scan safety

### 5. Frames & Badges
- **None**: Clean, borderless minimalist QR
- **Bottom Banner**: Customizable "SCAN ME" / "SCAN TO PAY" pill banner
- **Top Banner**: Top CTA banner
- **Floating Bubble**: Sleek bubble pill badge
- **Polaroid Card**: Card presentation with headline & scan instructions
- **Phone Mockup**: Realistic smartphone device mockup frame

### 6. Live Scanability Diagnostic Analyzer
- Real-time **Contrast Ratio** calculator (WCAG AAA / AA compliant)
- Dynamic Scan Safety Health Score (e.g. `100% Scan Safe`)
- Contrast warning alerts if dark-on-dark or light-on-light color combinations are picked

### 7. Integrated QR Scanner & Reader
- **Webcam Scanner**: Live camera viewfinder with animated laser reticle
- **Image Upload Decoder**: Drag & drop or upload any screenshot/photo of a QR code
- **Instant Actions**: Copy text, open URL, or load scanned payload directly into the editor

### 8. Batch QR Generator (ZIP Export)
- Enter multiple URLs or payload lines
- Generates all QR codes with your current designer styling
- Bundles everything into a single downloadable `.zip` file

### 9. Export & Sharing Deck
- **Formats**: PNG (High Res), SVG (Infinite Vector Print), PDF (Print Certificate Sheet), JPEG, WebP
- **Resolutions**: 512px (Web), 1024px (HD), 2048px (2K Pro), 4000px (4K Print Ready 300 DPI)
- **Direct Copy to Clipboard**: Instant paste into Figma, Photoshop, WhatsApp, or Docs
- **Save to My Designs**: LocalStorage design presets manager + Export/Import JSON

---

## 🚀 Quick Start

### 1. Launch with 1-Click
Double click on:
```
Start-QR-Studio.bat
```

### 2. Or Launch via Command Line
```powershell
cd "C:\Users\CONTRACT CELL PC-1\Documents\AG Projects\QR-Designer-Pro"
npm run dev
```

Open your browser at **[http://localhost:5173/](http://localhost:5173/)**
