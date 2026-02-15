(function () {
  "use strict";

  let currentImageSrc = "";
  let currentImageTitle = "Wallpaper";

  function emitToast(message) {
    if (typeof window.showToast === "function") {
      window.showToast(message);
      return;
    }

    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
  }

  function mapQualitySource(sourceUrl, quality) {
    let result = sourceUrl;
    const pairs = [
      ["phonensw", "phonenswmed"],
      ["pcnsw", "pcnswmed"],
      ["tabletnsw", "tabletnswmed"],
    ];

    pairs.forEach(([highDir, mediumDir]) => {
      if (quality === "medium") {
        result = result.replace(
          new RegExp(`(^|/)${highDir}/`, "i"),
          `$1${mediumDir}/`
        );
      } else {
        result = result.replace(
          new RegExp(`(^|/)${mediumDir}/`, "i"),
          `$1${highDir}/`
        );
      }
    });

    return result;
  }

  function hideQualityOptions() {
    const box = document.getElementById("qualityOptions");
    if (box) box.classList.remove("show");
  }

  function toggleQualityOptions() {
    const box = document.getElementById("qualityOptions");
    if (box) box.classList.toggle("show");
  }

  function openModal(img) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImg");
    const modalTitle = document.getElementById("modalTitle");
    const modalDesc = document.getElementById("modalDesc");
    if (!modal || !modalImg || !modalTitle || !modalDesc || !img) return;

    const originalSrc = img.dataset.originalSrc || img.dataset.download || img.src;
    currentImageSrc = originalSrc;
    currentImageTitle = img.dataset.title || img.alt || "Wallpaper";

    modalImg.src = img.currentSrc || img.src;
    modalTitle.textContent = currentImageTitle;
    modalDesc.textContent = img.dataset.desc || "";

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    const modal = document.getElementById("imageModal");
    if (modal) modal.classList.remove("active");
    document.body.style.overflow = "";
    hideQualityOptions();
  }

  async function downloadImage(quality) {
    if (!currentImageSrc) return;

    hideQualityOptions();

    const wanted = quality === "medium" ? "medium" : "high";
    let sourceToDownload = mapQualitySource(currentImageSrc, wanted);
    emitToast(`Starting ${wanted} quality download...`);

    try {
      let response = await fetch(sourceToDownload);
      if (!response.ok && sourceToDownload !== currentImageSrc) {
        sourceToDownload = currentImageSrc;
        response = await fetch(sourceToDownload);
        emitToast("Selected quality not found. Downloading original.");
      }

      if (!response.ok) {
        throw new Error(`File fetch failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentImageTitle.replace(/\s+/g, "_")}_${wanted}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
      emitToast(`Download complete (${wanted}).`);
    } catch (err) {
      console.error("Download failed:", err);
      emitToast("Download failed. Try right-click > Save image.");
    }
  }

  function quickFilter(evt, category) {
    const chips = document.querySelectorAll(".chip");
    chips.forEach((chip) => chip.classList.remove("active"));
    if (evt && evt.currentTarget) evt.currentTarget.classList.add("active");

    const select = document.getElementById("categoryFilter");
    if (!select) return;
    select.value = category;
    select.dispatchEvent(new Event("change"));
  }

  function shuffleGallery() {
    const grid = document.getElementById("mainGallery");
    if (!grid) return;

    const images = Array.from(grid.children);
    for (let i = images.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [images[i], images[j]] = [images[j], images[i]];
    }

    images.forEach((img) => grid.appendChild(img));
    emitToast("Gallery shuffled!");
  }

  function initGalleryPage() {
    const grid = document.getElementById("mainGallery");
    if (!grid) return;

    shuffleGallery();

    grid.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLImageElement)) return;
      openModal(target);
    });

    const modal = document.getElementById("imageModal");
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });
    }

    document.addEventListener("click", (e) => {
      const wrap = document.querySelector(".quality-wrap");
      if (!wrap) return;
      if (!wrap.contains(e.target)) hideQualityOptions();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  window.shuffleGallery = shuffleGallery;
  window.quickFilter = quickFilter;
  window.closeModal = closeModal;
  window.toggleQualityOptions = toggleQualityOptions;
  window.downloadImage = downloadImage;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGalleryPage, { once: true });
  } else {
    initGalleryPage();
  }
})();
