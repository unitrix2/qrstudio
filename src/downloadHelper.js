// Bulletproof file downloader helper ensuring correct filename and extension across all browsers
export function downloadFile(source, filename, mimeType = '') {
  let objectUrl = null;
  let href = '';

  if (source instanceof Blob) {
    objectUrl = URL.createObjectURL(source);
    href = objectUrl;
  } else if (typeof source === 'string') {
    if (source.startsWith('data:') || source.startsWith('http://') || source.startsWith('https://')) {
      href = source;
    } else {
      const blob = new Blob([source], { type: mimeType || 'text/plain;charset=utf-8' });
      objectUrl = URL.createObjectURL(blob);
      href = objectUrl;
    }
  }

  const link = document.createElement('a');
  link.style.display = 'none';
  link.setAttribute('href', href);
  link.setAttribute('download', filename);

  // Must append to body so Chromium / Edge does not ignore download attribute
  document.body.appendChild(link);
  link.click();

  // Delay revocation by 20 seconds so browser download manager can finish writing to disk
  setTimeout(() => {
    try {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    } catch {
      // Ignored
    }
  }, 20000);
}
