/**
 * Full-screen photo viewer: buttons, wheel, pinch-zoom, and pan.
 * Mobile: two-finger pinch zoom; one-finger drag when zoomed (like gallery apps).
 */
window.JapaPhotoViewer = {
  MIN_ZOOM: 1,
  MAX_ZOOM: 5,
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
    this.panX = 0;
    this.panY = 0;

    this.pointers = new Map();
    this.pinchStartDistance = 0;
    this.pinchStartZoom = 1;
    this.panStartX = 0;
    this.panStartY = 0;
    this.panOriginX = 0;
    this.panOriginY = 0;
    this.isPanning = false;

    this.closeBtn.addEventListener("click", () => this.close());
    this.zoomInBtn.addEventListener("click", () => this.zoomBy(this.ZOOM_STEP));
    this.zoomOutBtn.addEventListener("click", () =>
      this.zoomBy(-this.ZOOM_STEP)
    );
    this.zoomResetBtn.addEventListener("click", () => this.resetView());

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

    this.stageEl.addEventListener(
      "pointerdown",
      (event) => this.onPointerDown(event),
      { passive: false }
    );
    this.stageEl.addEventListener(
      "pointermove",
      (event) => this.onPointerMove(event),
      { passive: false }
    );
    this.stageEl.addEventListener("pointerup", (event) =>
      this.onPointerUp(event)
    );
    this.stageEl.addEventListener("pointercancel", (event) =>
      this.onPointerUp(event)
    );
    this.stageEl.addEventListener("pointerleave", (event) => {
      if (this.pointers.has(event.pointerId)) {
        this.onPointerUp(event);
      }
    });

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
        this.resetView();
      }
    });
  },

  applyTransform() {
    if (this.zoom <= this.MIN_ZOOM) {
      this.panX = 0;
      this.panY = 0;
    }

    this.imgEl.style.transform =
      "translate(" +
      this.panX +
      "px, " +
      this.panY +
      "px) scale(" +
      this.zoom +
      ")";

    this.zoomResetBtn.textContent = Math.round(this.zoom * 100) + "%";
    this.zoomOutBtn.disabled = this.zoom <= this.MIN_ZOOM;
    this.zoomInBtn.disabled = this.zoom >= this.MAX_ZOOM;
    this.stageEl.classList.toggle("is-zoomed", this.zoom > this.MIN_ZOOM);
  },

  setZoom(value) {
    this.zoom = Math.min(this.MAX_ZOOM, Math.max(this.MIN_ZOOM, value));
    this.applyTransform();
  },

  zoomBy(delta) {
    this.setZoom(this.zoom + delta);
  },

  resetView() {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.applyTransform();
  },

  pointerDistance() {
    const points = Array.from(this.pointers.values());
    if (points.length < 2) {
      return 0;
    }
    const dx = points[0].x - points[1].x;
    const dy = points[0].y - points[1].y;
    return Math.hypot(dx, dy);
  },

  onPointerDown(event) {
    if (this.overlay.hidden) {
      return;
    }

    this.stageEl.setPointerCapture(event.pointerId);
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (this.pointers.size === 2) {
      this.isPanning = false;
      this.pinchStartDistance = this.pointerDistance();
      this.pinchStartZoom = this.zoom;
      event.preventDefault();
      return;
    }

    if (this.pointers.size === 1 && this.zoom > this.MIN_ZOOM) {
      this.isPanning = true;
      this.panStartX = event.clientX;
      this.panStartY = event.clientY;
      this.panOriginX = this.panX;
      this.panOriginY = this.panY;
      event.preventDefault();
    }
  },

  onPointerMove(event) {
    if (!this.pointers.has(event.pointerId)) {
      return;
    }

    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (this.pointers.size === 2) {
      event.preventDefault();
      const distance = this.pointerDistance();
      if (this.pinchStartDistance > 0) {
        const nextZoom =
          this.pinchStartZoom * (distance / this.pinchStartDistance);
        this.setZoom(nextZoom);
      }
      return;
    }

    if (this.isPanning && this.pointers.size === 1 && this.zoom > this.MIN_ZOOM) {
      event.preventDefault();
      this.panX = this.panOriginX + (event.clientX - this.panStartX);
      this.panY = this.panOriginY + (event.clientY - this.panStartY);
      this.applyTransform();
    }
  },

  onPointerUp(event) {
    if (!this.pointers.has(event.pointerId)) {
      return;
    }

    this.pointers.delete(event.pointerId);

    try {
      this.stageEl.releasePointerCapture(event.pointerId);
    } catch (error) {
      // Ignore if capture already released.
    }

    if (this.pointers.size === 1) {
      const remaining = this.pointers.values().next().value;
      this.isPanning = this.zoom > this.MIN_ZOOM;
      this.panStartX = remaining.x;
      this.panStartY = remaining.y;
      this.panOriginX = this.panX;
      this.panOriginY = this.panY;
      this.pinchStartDistance = 0;
      return;
    }

    if (this.pointers.size === 0) {
      this.isPanning = false;
      this.pinchStartDistance = 0;
    }
  },

  open(photo) {
    this.titleEl.textContent = photo.name;
    this.imgEl.src = photo.src;
    this.imgEl.alt = photo.name;
    this.pointers.clear();
    this.resetView();
    this.overlay.hidden = false;
    document.body.classList.add("is-photo-fullscreen");
    this.closeBtn.focus();
  },

  close() {
    this.overlay.hidden = true;
    this.imgEl.removeAttribute("src");
    this.pointers.clear();
    this.resetView();
    document.body.classList.remove("is-photo-fullscreen");
  },
};
