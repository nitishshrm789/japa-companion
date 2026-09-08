/**
 * Full-screen photo viewer with reliable mobile pinch + pan.
 * Uses Touch Events (best on phones) + mouse/wheel on desktop.
 */
window.JapaPhotoViewer = {
  MIN_ZOOM: 1,
  MAX_ZOOM: 5,
  ZOOM_STEP: 0.25,
  DOUBLE_TAP_MS: 280,
  DOUBLE_TAP_ZOOM: 2.5,

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

    this.pinchStartDistance = 0;
    this.pinchStartZoom = 1;
    this.panStartX = 0;
    this.panStartY = 0;
    this.panOriginX = 0;
    this.panOriginY = 0;
    this.activeTouches = 0;
    this.lastTapTime = 0;
    this.lastTapX = 0;
    this.lastTapY = 0;
    this.movedDuringTouch = false;

    this.mouseDragging = false;
    this.mouseStartX = 0;
    this.mouseStartY = 0;
    this.mouseOriginX = 0;
    this.mouseOriginY = 0;

    this.closeBtn.addEventListener("click", () => this.close());
    this.zoomInBtn.addEventListener("click", () => this.zoomBy(this.ZOOM_STEP));
    this.zoomOutBtn.addEventListener("click", () =>
      this.zoomBy(-this.ZOOM_STEP)
    );
    this.zoomResetBtn.addEventListener("click", () => this.resetView());

    this.bindWheel();
    this.bindTouch();
    this.bindMouse();
    this.bindKeys();
  },

  bindWheel() {
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
  },

  bindTouch() {
    const opts = { passive: false };

    this.stageEl.addEventListener(
      "touchstart",
      (event) => this.onTouchStart(event),
      opts
    );
    this.stageEl.addEventListener(
      "touchmove",
      (event) => this.onTouchMove(event),
      opts
    );
    this.stageEl.addEventListener(
      "touchend",
      (event) => this.onTouchEnd(event),
      opts
    );
    this.stageEl.addEventListener(
      "touchcancel",
      (event) => this.onTouchEnd(event),
      opts
    );
  },

  bindMouse() {
    this.stageEl.addEventListener("mousedown", (event) => {
      if (this.overlay.hidden || this.zoom <= this.MIN_ZOOM) {
        return;
      }
      event.preventDefault();
      this.mouseDragging = true;
      this.mouseStartX = event.clientX;
      this.mouseStartY = event.clientY;
      this.mouseOriginX = this.panX;
      this.mouseOriginY = this.panY;
    });

    window.addEventListener("mousemove", (event) => {
      if (!this.mouseDragging) {
        return;
      }
      this.panX = this.mouseOriginX + (event.clientX - this.mouseStartX);
      this.panY = this.mouseOriginY + (event.clientY - this.mouseStartY);
      this.applyTransform();
    });

    window.addEventListener("mouseup", () => {
      this.mouseDragging = false;
    });
  },

  bindKeys() {
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

  touchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  },

  onTouchStart(event) {
    if (this.overlay.hidden) {
      return;
    }

    event.preventDefault();
    this.activeTouches = event.touches.length;
    this.movedDuringTouch = false;

    if (event.touches.length === 2) {
      this.pinchStartDistance = this.touchDistance(event.touches);
      this.pinchStartZoom = this.zoom;
      return;
    }

    if (event.touches.length === 1) {
      const touch = event.touches[0];
      this.panStartX = touch.clientX;
      this.panStartY = touch.clientY;
      this.panOriginX = this.panX;
      this.panOriginY = this.panY;
    }
  },

  onTouchMove(event) {
    if (this.overlay.hidden) {
      return;
    }

    event.preventDefault();
    this.movedDuringTouch = true;

    if (event.touches.length === 2) {
      if (this.pinchStartDistance <= 0) {
        this.pinchStartDistance = this.touchDistance(event.touches);
        this.pinchStartZoom = this.zoom;
      }
      const distance = this.touchDistance(event.touches);
      const nextZoom =
        this.pinchStartZoom * (distance / this.pinchStartDistance);
      this.setZoom(nextZoom);
      return;
    }

    if (event.touches.length === 1 && this.zoom > this.MIN_ZOOM) {
      const touch = event.touches[0];
      this.panX = this.panOriginX + (touch.clientX - this.panStartX);
      this.panY = this.panOriginY + (touch.clientY - this.panStartY);
      this.applyTransform();
    }
  },

  onTouchEnd(event) {
    if (this.overlay.hidden) {
      return;
    }

    event.preventDefault();

    if (event.touches.length === 1) {
      const touch = event.touches[0];
      this.panStartX = touch.clientX;
      this.panStartY = touch.clientY;
      this.panOriginX = this.panX;
      this.panOriginY = this.panY;
      this.pinchStartDistance = 0;
      this.activeTouches = 1;
      return;
    }

    if (event.touches.length === 0) {
      const wasPinchOrPan = this.activeTouches >= 2 || this.movedDuringTouch;
      this.pinchStartDistance = 0;
      this.activeTouches = 0;

      if (!wasPinchOrPan && event.changedTouches.length === 1) {
        this.handlePossibleDoubleTap(event.changedTouches[0]);
      }
    }
  },

  handlePossibleDoubleTap(touch) {
    const now = Date.now();
    const dt = now - this.lastTapTime;
    const dx = touch.clientX - this.lastTapX;
    const dy = touch.clientY - this.lastTapY;
    const nearby = Math.hypot(dx, dy) < 40;

    if (dt > 0 && dt < this.DOUBLE_TAP_MS && nearby) {
      if (this.zoom > this.MIN_ZOOM + 0.05) {
        this.resetView();
      } else {
        this.setZoom(this.DOUBLE_TAP_ZOOM);
      }
      this.lastTapTime = 0;
      return;
    }

    this.lastTapTime = now;
    this.lastTapX = touch.clientX;
    this.lastTapY = touch.clientY;
  },

  applyTransform() {
    if (this.zoom <= this.MIN_ZOOM + 0.001) {
      this.zoom = this.MIN_ZOOM;
      this.panX = 0;
      this.panY = 0;
    }

    this.imgEl.style.transform =
      "translate3d(" +
      this.panX +
      "px, " +
      this.panY +
      "px, 0) scale(" +
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

  open(photo) {
    this.titleEl.textContent = photo.name;
    this.imgEl.src = photo.src;
    this.imgEl.alt = photo.name;
    this.pinchStartDistance = 0;
    this.activeTouches = 0;
    this.mouseDragging = false;
    this.resetView();
    this.overlay.hidden = false;
    document.body.classList.add("is-photo-fullscreen");
    this.closeBtn.focus();
  },

  close() {
    this.overlay.hidden = true;
    this.imgEl.removeAttribute("src");
    this.pinchStartDistance = 0;
    this.activeTouches = 0;
    this.mouseDragging = false;
    this.resetView();
    document.body.classList.remove("is-photo-fullscreen");
  },
};
