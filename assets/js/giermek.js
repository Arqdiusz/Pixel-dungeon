/* Giermek: podmiana grafiki bez zmiany mechanik gry. */
(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const source = new URL('../images/characters/giermek.png', document.currentScript.src).href;
  const image = new Image();
  let spriteURL = source;
  let ratio = 0.65;
  let ready = false;
  let failed = false;

  function node(tag, attrs) {
    const el = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
    return el;
  }

  function draw(target, x, y, width, height) {
    target.appendChild(node('image', {
      href: spriteURL, x, y, width, height,
      preserveAspectRatio: 'xMidYMax meet',
      style: 'image-rendering:pixelated;pointer-events:none'
    }));
  }

  function refresh() {
    if (typeof player !== 'undefined' && player && typeof render === 'function') render();
  }

  // Obie funkcje istnieją w dotychczasowej wersji gry.
  if (typeof drawPlayer !== 'function' || typeof drawPreview !== 'function') {
    console.error('Giermek: skrypt należy umieścić PO głównym skrypcie gry.');
    return;
  }
  const oldDrawPlayer = drawPlayer;
  const oldDrawPreview = drawPreview;

  drawPlayer = function () {
    if (typeof player === 'undefined' || !player) return;
    if (!ready || failed) { oldDrawPlayer(); return; }
    const tile = typeof T === 'number' ? T : 32;
    const map = document.getElementById('svg');
    if (!map) return;
    const feetX = player.x * tile + tile / 2;
    const feetY = 44 + player.y * tile + tile - 2;
    const height = tile * 0.98;
    const width = height * ratio;
    map.appendChild(node('ellipse', {
      cx: feetX, cy: feetY - 1, rx: tile * 0.23, ry: tile * 0.075,
      fill: '#000', opacity: 0.32, 'pointer-events': 'none'
    }));
    draw(map, feetX - width / 2, feetY - height, width, height);
  };

  drawPreview = function () {
    if (!ready || failed) { oldDrawPreview(); return; }
    const target = document.getElementById('preview');
    if (!target) return;
    target.replaceChildren();
    target.setAttribute('viewBox', '0 0 160 200');
    target.setAttribute('aria-label', 'Podgląd giermka — bazowy strój');
    const height = 180;
    const width = height * ratio;
    draw(target, 80 - width / 2, 10, width, height);
  };

  image.onload = () => {
    ratio = image.naturalWidth / image.naturalHeight;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(image, 0, 0);
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let left = canvas.width, top = canvas.height, right = -1, bottom = -1;
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          if (data[(y * canvas.width + x) * 4 + 3] > 20) {
            left = Math.min(left, x); right = Math.max(right, x);
            top = Math.min(top, y); bottom = Math.max(bottom, y);
          }
        }
      }
      if (right >= left && bottom >= top) {
        const w = right - left + 1, h = bottom - top + 1;
        const cropped = document.createElement('canvas');
        cropped.width = w; cropped.height = h;
        cropped.getContext('2d').drawImage(image, left, top, w, h, 0, 0, w, h);
        spriteURL = cropped.toDataURL('image/png');
        ratio = w / h;
      }
    } catch (error) {
      console.warn('Giermek: używam obrazu bez przycinania marginesów.', error);
    }
    ready = true;
    refresh();
  };
  image.onerror = () => {
    failed = true;
    console.error('Nie znaleziono grafiki giermka:', source);
    const box = document.createElement('div');
    box.textContent = 'Nie wczytano giermka. Sprawdź plik assets/images/characters/giermek.png';
    Object.assign(box.style, {
      position: 'fixed', bottom: '8px', left: '8px', right: '8px',
      padding: '12px', background: '#7f1d1d', color: 'white', zIndex: '9999'
    });
    document.body.appendChild(box);
  };
  image.src = source;
})();
