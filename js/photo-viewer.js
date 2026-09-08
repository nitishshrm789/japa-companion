/**
 * Full-screen photo viewer with zoom in / zoom out.
 */
window.JapaPhotoViewer = {
  MIN_ZOOM: 1,
  MAX_ZOOM: 4,
  ZOOM_STEP: 0.25,

  init() {
    this.overlay = document.getElementById("photo-fullscreen");
    this.titleEl = document.getElementById("photo-fullscreen-title");
    this.imgEl = document.getElementById("photo-fullscreen-img");
    this.stageEl = document.getElementById("photo-fullscreen-stage");
    this.closeBtn = document.getElementById("photo-fullscreen-close");
    this.zoomInBtn = document.getElementById("photo-zoom-in");
    this.zoomOutBtn = document.getElementById("photo-zoom-out");
    this.zoomResetBtn = document.getElementById("photo-zoom-reset");
    this.zoom = 1;

    this.closeBtn.addEventListener("click", () => this.close());
    this.zoomInBtn.addEventListener("click", () => this.zoomBy(this.ZOOM_STEP));
    this.zoomOutBtn.addEventListener("click", () =>
      this.zoomBy(-this.ZOOM_STEP)
    );
    this.zoomResetBtn.addEventListener("click", () => this.setZoom(1));

    this.stageEl.addEventListener(
      "wheel",
      (event) => {
        if (this.overlay.hidden) {
          return;
        }
        event.preventDefault();
        this.zoomBy(event.deltaY < 0 ? this.ZOOM_STEP : -this.ZOOM_STEP);
      },
      { passive: false }
    );

    document.addEventListener("keydown", (event) => {
      if (this.overlay.hidden) {
        return;
      }
      if (event.key === "Escape") {
        this.close();
      } else if (event.key === "+" || event.key === "=") {
        this.zoomBy(this.ZOOM_STEP);
      } else if (event.key === "-") {
        this.zoomBy(-this.ZOOM_STEP);
      } else if (event.key === "0") {
        this.setZoom(1);
      }
    });
  },

  applyZoom() {
    this.imgEl.style.transform = "scale(" + this.zoom + ")";
    this.zoomResetBtn.textContent = Math.round(this.zoom * 100) + "%";
    this.zoomOutBtn.disabled = this.zoom <= this.MIN_ZOOM;
    this.zoomInBtn.disabled = this.zoom >= this.MAX_ZOOM;
  },

  setZoom(value) {
    this.zoom = Math.min(this.MAX_ZOOM, Math.max(this.MIN_ZOOM, value));
    this.applyZoom();
  },

  zoomBy(delta) {
    this.setZoom(this.zoom + delta);
  },

  open(photo) {
    this.titleEl.textContent = photo.name;
    this.imgEl.src = photo.src;
    this.imgEl.alt = photo.name;
    this.setZoom(1);
    this.overlay.hidden = false;
    document.body.classList.add("is-photo-fullscreen");
    this.closeBtn.focus();
  },

  close() {
    this.overlay.hidden = true;
    this.imgEl.removeAttribute("src");
    this.setZoom(1);
    document.body.classList.remove("is-photo-fullscreen");
  },
};
