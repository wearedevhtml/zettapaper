// ===== Mobile Menu Toggle =====
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const menuOverlay = document.getElementById('menuOverlay');

function toggleMenu() {
  if (!menuToggle || !navMenu || !menuOverlay) return;
  menuToggle.classList.toggle('open');
  navMenu.classList.toggle('open');
  menuOverlay.classList.toggle('open');
  document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
}

function closeMenu() {
  if (!menuToggle || !navMenu || !menuOverlay) return;
  menuToggle.classList.remove('open');
  navMenu.classList.remove('open');
  menuOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

if (menuToggle) {
  menuToggle.addEventListener('click', toggleMenu);
}

if (menuOverlay) {
  menuOverlay.addEventListener('click', closeMenu);
}

// Close menu when clicking a nav link
if (navMenu) {
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

// Close menu on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navMenu && navMenu.classList.contains('open')) {
    closeMenu();
  }
});

// Close menu on window resize (if open)
window.addEventListener('resize', () => {
  if (window.innerWidth > 900 && navMenu && navMenu.classList.contains('open')) {
    closeMenu();
  }
});

// ===== WebP preview mapping (display fast, download original) =====
const WEBP_PREVIEW_DIRS = new Set([
  'nsi',
  'phonensw',
  'phonenswmed',
  'pcnsw',
  'pcnswmed',
  'tabletnsw',
  'tabletnswmed'
]);

function buildWebpPreviewSrc(src) {
  if (!src) return null;

  const clean = src.split(/[?#]/)[0];
  const match = clean.match(/^(.+\/)?([^/]+)\/([^/]+)$/);
  if (!match) return null;

  const prefix = match[1] || '';
  const dir = match[2];
  const fileName = match[3];
  if (!WEBP_PREVIEW_DIRS.has(dir)) return null;

  const baseName = fileName.replace(/\.[^.]+$/, '');
  if (!baseName) return null;

  return `${prefix}webp/${baseName}.webp`;
}

function applyWebpPreviews(root = document) {
  const imgs = root.querySelectorAll('img[src]');
  imgs.forEach((img) => {
    if (!img.getAttribute('decoding')) {
      img.decoding = 'async';
    }

    if (img.loading === 'lazy' && !img.getAttribute('fetchpriority')) {
      img.fetchPriority = 'low';
    }

    // Allow specific images (like quality compare widgets) to keep original src.
    if (img.dataset.skipPreview === 'true' || img.hasAttribute('data-skip-preview')) {
      return;
    }

    const declaredSrc = img.getAttribute('src');
    const previewSrc = buildWebpPreviewSrc(declaredSrc);
    if (!previewSrc) return;

    const originalSrc = img.src;
    if (!img.dataset.originalSrc) img.dataset.originalSrc = originalSrc;
    if (!img.dataset.download) img.dataset.download = originalSrc;

    img.addEventListener(
      'error',
      () => {
        // Fallback keeps the original image visible if .webp isn't present.
        if (img.dataset.originalSrc) img.src = img.dataset.originalSrc;
      },
      { once: true }
    );

    img.src = previewSrc;
  });
}

// Expose for pages that may re-render images dynamically.
window.applyWebpPreviews = applyWebpPreviews;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => applyWebpPreviews());
} else {
  applyWebpPreviews();
}

// ===== Sticky header =====
let lastScroll = 0;
const header = document.querySelector(".header");

function syncHeaderOffset() {
  if (!header) return;
  const offset = header.offsetHeight + 16;
  document.documentElement.style.setProperty("--header-offset", `${offset}px`);
}

function adjustHeader() {
  if (!header) return;
  const currentScroll = window.scrollY;

  // Don't hide header if mobile menu is open
  if (navMenu && navMenu.classList.contains('open')) {
    return;
  }

  // Shrink when past 50px
  if (currentScroll > 50) {
    header.classList.add("small");
  } else {
    header.classList.remove("small");
  }

  // Hide on scroll down, show on scroll up
  if (currentScroll > lastScroll && currentScroll > 50) {
    header.classList.add("hide");
  } else {
    header.classList.remove("hide");
  }

  lastScroll = currentScroll;
  syncHeaderOffset();
}

window.addEventListener("scroll", adjustHeader);
window.addEventListener("load", () => {
  adjustHeader();
  syncHeaderOffset();
});
window.addEventListener("resize", syncHeaderOffset);



// ===== Text overlay rotator =====
(function () {
  function toMs(v, fallbackMs) {
    if (!v) return fallbackMs;
    v = v.trim();
    if (v.endsWith('ms')) return parseFloat(v);
    if (v.endsWith('s')) return parseFloat(v) * 1000;
    const n = parseFloat(v);
    return isNaN(n) ? fallbackMs : n;
  }

  document.querySelectorAll('.text-overlay').forEach(overlay => {
    const slides = Array.from(overlay.querySelectorAll('.text-slide'));
    if (slides.length === 0) return;

    const cs = getComputedStyle(overlay);
    const slot = toMs(cs.getPropertyValue('--slot'), 4000);
    const fade = toMs(cs.getPropertyValue('--fade'), 600);

    let i = 0;
    slides.forEach(s => s.classList.remove('active', 'leaving'));
    slides[i].classList.add('active');

    setInterval(() => {
      const current = slides[i];
      current.classList.remove('active');
      current.classList.add('leaving');

      setTimeout(() => {
        current.classList.remove('leaving');
        i = (i + 1) % slides.length;
        slides[i].classList.add('active');
      }, fade);
    }, slot);
  });
})();

// ===== Modal Gallery =====
const galleryImages = document.querySelectorAll('.gallery img');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalDownload = document.getElementById('modal-download');
const closeBtn = document.getElementById('close');

let currentDownloadLink = "";
let currentFileName = "";

// Only set up modal if elements exist
if (modal && galleryImages.length > 0) {
  // open modal
  galleryImages.forEach(img => {
    img.addEventListener('click', () => {
      modal.style.display = 'flex';
      document.body.classList.add("modal-open");

      if (modalImg) modalImg.src = img.dataset.preview || img.src;
      if (modalTitle) modalTitle.textContent = img.dataset.title || img.alt || "Wallpaper";
      if (modalDesc) modalDesc.textContent = img.dataset.desc || "";

      currentDownloadLink = img.dataset.download || img.src;
      currentFileName = (img.dataset.title || img.alt || "wallpaper").replace(/\s+/g, "_") + ".jpg";
    });
  });

  // close modal with button
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      document.body.classList.remove("modal-open");
    });
  }

  // close modal when clicking outside
  window.addEventListener('click', e => {
    if (e.target === modal) {
      modal.style.display = 'none';
      document.body.classList.remove("modal-open");
    }
  });

  // close modal with escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      modal.style.display = 'none';
      document.body.classList.remove("modal-open");
    }
  });

  // ===== Download button (with toast notifications) =====
  if (modalDownload) {
    modalDownload.addEventListener('click', async () => {
      if (currentDownloadLink) {
        showToast("Downloading...");
        try {
          const response = await fetch(currentDownloadLink);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);

          const a = document.createElement("a");
          a.href = url;
          a.download = currentFileName || "download.jpg";
          document.body.appendChild(a);
          a.click();
          a.remove();

          URL.revokeObjectURL(url);

          showToast("Download complete!");
        } catch (err) {
          console.error("Download failed:", err);
          showToast("Download failed. Please try again.");
        }
      }
    });
  }
}

// ===== Callout Close =====
function closeCallout() {
  const callout = document.getElementById("myCallout");
  if (callout) {
    callout.classList.add("closing");
    callout.addEventListener("animationend", () => {
      callout.style.display = "none";
    }, { once: true });
  }
}


// ===== Snackbar / Toast =====
function showToast(message, duration = 2500) {
  const toast = document.getElementById("toast");
  if (toast) {
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, duration);
  }
}


// ===== Button Shockwave Effect =====
const btn = document.querySelector('.btn');
if (btn) {
  btn.addEventListener('click', () => {
    const wave = document.createElement('span');
    wave.classList.add('shockwave');
    btn.appendChild(wave);

    // remove after animation
    setTimeout(() => wave.remove(), 600);
  });
}
	
	
	
	// main.js
function likeImage(imageName, countElemId) {
  const counterEl = document.getElementById(countElemId);
  const storageKey = `local_like_count:${imageName}`;

  fetch('like.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: 'image_name=' + encodeURIComponent(imageName)
  })
  .then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then((data) => {
    if (data && !data.error && typeof data.likes !== 'undefined') {
      if (counterEl) counterEl.innerText = data.likes;
      return;
    }
    throw new Error('Invalid like response');
  })
  .catch(() => {
    // Cloudflare/static fallback when PHP endpoints are unavailable.
    const next = Number(localStorage.getItem(storageKey) || 0) + 1;
    localStorage.setItem(storageKey, String(next));
    if (counterEl) counterEl.innerText = String(next);
  });
}

function downloadImage(imageName, countElemId) {
  const counterEl = document.getElementById(countElemId);
  const storageKey = `local_download_count:${imageName}`;

  fetch('download_count.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: 'image_name=' + encodeURIComponent(imageName)
  })
  .then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then((data) => {
    if (data && !data.error && typeof data.downloads !== 'undefined') {
      if (counterEl) counterEl.innerText = data.downloads;
      return;
    }
    throw new Error('Invalid download response');
  })
  .catch(() => {
    // Cloudflare/static fallback when PHP endpoints are unavailable.
    const next = Number(localStorage.getItem(storageKey) || 0) + 1;
    localStorage.setItem(storageKey, String(next));
    if (counterEl) counterEl.innerText = String(next);
  })
  .finally(() => {
    // Trigger browser download (works on Cloudflare Pages static hosting).
    const a = document.createElement('a');
    a.href = imageName;
    a.download = (imageName.split('/').pop() || '');
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
}


// =====================================
// SEARCH + CATEGORY FILTER SYSTEM
// =====================================

document.addEventListener("DOMContentLoaded", () => {
  const categoryFilter = document.getElementById("categoryFilter");
  const searchInput = document.getElementById("searchInput");
  const gallery = document.getElementById("mainGallery");
  const noResults = document.getElementById("noResults");

  if (!categoryFilter || !searchInput || !gallery) return;

  const images = gallery.querySelectorAll("img[data-category]");
  const sectionHeaders = gallery.querySelectorAll("h2[data-section]");

  function filterImages() {
    const category = categoryFilter.value.toLowerCase();
    const searchText = searchInput.value.toLowerCase().trim();

    let visibleCount = 0;
    const visibleSections = new Set();

    // Filter images
    images.forEach(img => {
      const imgCategory = (img.dataset.category || "").toLowerCase();
      const title = (img.dataset.title || "").toLowerCase();
      const desc = (img.dataset.desc || "").toLowerCase();
      const alt = (img.alt || "").toLowerCase();

      // Category match
      const categoryMatch = category === "all" || imgCategory === category;

      // Search match (title, description, or alt text)
      const searchMatch = searchText === "" || 
        title.includes(searchText) || 
        desc.includes(searchText) || 
        alt.includes(searchText);

      // Show/hide image
      if (categoryMatch && searchMatch) {
        img.style.display = "";
        visibleCount++;
        visibleSections.add(imgCategory);
      } else {
        img.style.display = "none";
      }
    });

    // Show/hide section headers based on visible images
    sectionHeaders.forEach(header => {
      const section = (header.dataset.section || "").toLowerCase();
      if (category === "all") {
        // Show header if any images in that section are visible
        header.style.display = visibleSections.has(section) ? "" : "none";
      } else {
        // Show only the selected category header
        header.style.display = section === category && visibleSections.has(section) ? "" : "none";
      }
    });

    // Show/hide "no results" message
    if (noResults) {
      noResults.classList.toggle("show", visibleCount === 0);
    }
  }

  // Event listeners with debounce for search input
  categoryFilter.addEventListener("change", filterImages);
  
  let debounceTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(filterImages, 150);
  });

  // Initial filter (in case of browser back/forward with cached values)
  filterImages();
});

