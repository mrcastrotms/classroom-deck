export class DrawingManager {
  constructor(canvasEl, containerEl) {
    this.canvas = canvasEl;
    this.container = containerEl;
    this.ctx = canvasEl.getContext("2d");

    this.isDrawing = false;
    this.mode = "draw"; // 'draw' or 'erase'
    this.color = "#38bdf8"; // Default accent blue
    this.lineWidth = 4;
    this.eraserRadius = 24;

    // Long press detection for dynamic erase
    this.longPressTimer = null;
    this.longPressDuration = 500; // 500ms hold triggers temp erase mode
    this.isLongPressErase = false;

    this.init();
  }

  init() {
    this.resizeCanvas();
    this.bindEvents();
    
    // Smooth line joins for handwriting
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
  }

  resizeCanvas() {
    // Match exact pixel resolution of container frame
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
  }

  getPointerPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  startDrawing(e) {
    e.preventDefault();
    const pos = this.getPointerPos(e);

    // Long press setup for quick-erase
    this.longPressTimer = setTimeout(() => {
      this.isLongPressErase = true;
      this.canvas.style.cursor = "crosshair";
    }, this.longPressDuration);

    this.isDrawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
  }

  draw(e) {
    if (!this.isDrawing) return;
    e.preventDefault();

    const pos = this.getPointerPos(e);
    const activeErase = this.mode === "erase" || this.isLongPressErase;

    if (activeErase) {
      this.ctx.globalCompositeOperation = "destination-out";
      this.ctx.arc(pos.x, pos.y, this.eraserRadius, 0, Math.PI * 2, false);
      this.ctx.fill();
      this.ctx.beginPath();
    } else {
      this.ctx.globalCompositeOperation = "source-over";
      this.ctx.strokeStyle = this.color;
      this.ctx.lineWidth = this.lineWidth;
      this.ctx.lineTo(pos.x, pos.y);
      this.ctx.stroke();
    }
  }

  stopDrawing() {
    clearTimeout(this.longPressTimer);
    if (this.isLongPressErase) {
      this.isLongPressErase = false;
      this.canvas.style.cursor = "crosshair";
    }
    this.isDrawing = false;
    this.ctx.closePath();
  }

  bindEvents() {
    // Mouse events
    this.canvas.addEventListener("mousedown", (e) => this.startDrawing(e));
    this.canvas.addEventListener("mousemove", (e) => this.draw(e));
    this.canvas.addEventListener("mouseup", () => this.stopDrawing());
    this.canvas.addEventListener("mouseleave", () => this.stopDrawing());

    // Touch / Stylus events
    this.canvas.addEventListener("touchstart", (e) => this.startDrawing(e), { passive: false });
    this.canvas.addEventListener("touchmove", (e) => this.draw(e), { passive: false });
    this.canvas.addEventListener("touchend", () => this.stopDrawing());
  }

  setMode(mode) {
    this.mode = mode;
  }

  setColor(color) {
    this.color = color;
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
