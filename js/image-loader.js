// Auto-populate and enhance images site-wide using SGS_IMAGES manifest
(function(){
  function setImg(el, url) {
    if (!el || !url) return;
    if (el.tagName.toLowerCase() !== 'img') return;
    if (el.src && el.getAttribute('data-lock-src') === 'true') return; // allow opt-out
    el.src = url;
    el.loading = el.getAttribute('loading') || 'lazy';
    el.decoding = el.getAttribute('decoding') || 'async';
    el.setAttribute('fetchpriority', el.getAttribute('fetchpriority') || 'auto');
    if (!el.width) el.width = 600;
    if (!el.height) el.height = 400;
  }

  function byKey(key) {
    return window.SGS_IMAGES ? window.SGS_IMAGES[key] : undefined;
  }

  function populateDataKeyImages() {
    document.querySelectorAll('img[data-image-key]').forEach(img => {
      const key = img.getAttribute('data-image-key');
      setImg(img, byKey(key));
    });
  }

  function populateServices() {
    const cards = document.querySelectorAll('.services-grid .service-card');
    if (!cards.length) return;
    cards.forEach(card => {
      const h3 = card.querySelector('h3');
      const img = card.querySelector('img');
      if (!h3 || !img) return;
      const name = h3.textContent.trim().toLowerCase();
      let key = null;
      if (name.includes('gold')) key = 'services_gold';
      else if (name.includes('silver')) key = 'services_silver';
      else if (name.includes('jewelry')) key = 'services_jewelry';
      else if (name.includes('collect')) key = 'services_collectibles';
      else if (name.includes('other') || name.includes('platinum') || name.includes('palladium')) key = 'services_other_metals';
      else if (name.includes('estate')) key = 'services_estate';
      if (key) setImg(img, byKey(key));
    });
  }

  function populateGallery() {
    const container = document.querySelector('.gallery-container');
    if (!container) return;
    const existing = container.querySelectorAll('.gallery-item');
    if (existing.length >= 6) return; // assume already filled

    const candidates = ['gallery_1','gallery_2','gallery_3'];
    const frag = document.createDocumentFragment();
    candidates.forEach((key, idx) => {
      const url = byKey(key);
      if (!url) return;
      const item = document.createElement('div');
      item.className = 'gallery-item';
      const img = document.createElement('img');
      img.alt = `Gallery image ${idx+1}`;
      setImg(img, url);
      const cap = document.createElement('div');
      cap.className = 'gallery-caption';
      cap.textContent = 'Example item';
      item.appendChild(img);
      item.appendChild(cap);
      frag.appendChild(item);
    });
    container.appendChild(frag);
  }

  function enhanceAllImages() {
    document.querySelectorAll('img').forEach(img => {
      if (!img.getAttribute('loading')) img.setAttribute('loading','lazy');
      if (!img.getAttribute('decoding')) img.setAttribute('decoding','async');
    });
  }

  // Attach error fallbacks for images that fail to load (e.g., missing Cloudinary assets)
  function attachErrorFallbacks() {
    const mapByClass = [
      { cls: 'hero-img', key: 'hero_main' },
      { cls: 'feature-icon-img', key: 'gallery_1' },
      { cls: 'step-icon-img', key: 'gallery_2' }
    ];

    const mapByAlt = [
      { k: 'quote', key: 'gallery_1' },
      { k: 'evaluate', key: 'gallery_2' },
      { k: 'payment', key: 'gallery_3' },
      { k: 'gold', key: 'services_gold' },
      { k: 'silver', key: 'services_silver' },
      { k: 'jewel', key: 'services_jewelry' }
    ];

    document.querySelectorAll('img').forEach(img => {
      // Do not override explicitly locked images
      if (img.getAttribute('data-lock-src') === 'true') return;

      img.addEventListener('error', () => {
        try {
          // Only intervene for Cloudinary or empty src
          const src = img.currentSrc || img.src || '';
          const isCloud = src.includes('res.cloudinary.com');
          if (!isCloud && src) return;

          // Try class-based mapping first
          for (const m of mapByClass) {
            if (img.classList.contains(m.cls)) {
              const u = byKey(m.key);
              if (u) { setImg(img, u); return; }
            }
          }

          // Try alt-keyword mapping
          const alt = (img.getAttribute('alt') || '').toLowerCase();
          for (const m of mapByAlt) {
            if (alt.includes(m.k)) {
              const u = byKey(m.key);
              if (u) { setImg(img, u); return; }
            }
          }

          // Generic fallback
          const generic = byKey('gallery_1') || byKey('hero_bg') || byKey('services_gold');
          if (generic) setImg(img, generic);
        } catch (e) {
          console.warn('img fallback error', e);
        }
      }, { once: true });
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    try {
      populateDataKeyImages();
      populateServices();
      populateGallery();
      enhanceAllImages();
      attachErrorFallbacks();
    } catch (e) {
      console.warn('image-loader error:', e);
    }
  });
})();
