// Pure client-side download — works on static hosting (GitHub Pages, Netlify, Vercel)
// Primary:   showSaveFilePicker (native OS "Save As" dialog — perfect filename)
// Fallback:  Blob URL anchor with delayed revocation (60s)

export async function downloadFile(source, filename, mimeType = 'application/octet-stream') {
  // Build a Blob from whatever we received
  const blob = await toBlob(source, mimeType);

  // === METHOD 1: Native File System "Save As" dialog ===
  if (typeof window.showSaveFilePicker === 'function') {
    try {
      const ext = (filename.split('.').pop() || 'bin').toLowerCase();
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: ext.toUpperCase() + ' File',
          accept: { [mimeType]: ['.' + ext] }
        }]
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return; // Done — file saved with exact name user chose
    } catch (e) {
      if (e.name === 'AbortError') return; // User cancelled the dialog
      // showSaveFilePicker failed (e.g. Firefox), fall through
    }
  }

  // === METHOD 2: Blob URL anchor with long revocation delay ===
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;           // Suggest filename
  a.type = mimeType;               // Hint MIME type
  a.style.display = 'none';
  document.body.appendChild(a);    // MUST be in DOM for Chrome
  a.click();

  // Give browser 60 seconds to finish writing to disk before cleanup
  setTimeout(() => {
    try { document.body.removeChild(a); } catch {}
    URL.revokeObjectURL(url);
  }, 60000);
}

// ─── Convert any source to Blob ─────────────────────────
async function toBlob(source, mimeType) {
  if (source instanceof Blob) return source;

  if (typeof source === 'string') {
    if (source.startsWith('data:')) {
      // data URL → blob
      const res = await fetch(source);
      return await res.blob();
    }
    // Plain text / SVG string
    return new Blob([source], { type: mimeType });
  }

  return new Blob([], { type: mimeType });
}
