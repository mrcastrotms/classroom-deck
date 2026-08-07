export class DrawingManager {
  constructor(canvasEl, containerEl) {
    this.canvas = canvasEl;
    this.container = containerEl;
    this.ctx = canvasEl.getContext("2d");

    this.isDrawing = false;
    this.mode = "draw"; // 'draw' or 'erase'
    this.color = "#38bdf8";
    this.lineWidth = 4;
    this.eraserRadius = 24;

    this.multiTouchEnabled = false;
    this.activeTouches = new Map();

    this.init();
  }

  init() {
    this.resizeCanvas();
    this.bindEvents();
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
  }

  resizeCanvas() {
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // High DPI Canvas Backing Store
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    // Re-apply stroke properties after context resize
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
  }

  // Precise coordinate translation considering canvas scale & offsets
  getPointerPos(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / (rect.width * (window.devicePixelRatio || 1));
    const scaleY = this.canvas.height / (rect.height * (window.devicePixelRatio || 1));

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  // --- Mouse Pointer Events ---
  startDrawing(e) {
    e.preventDefault();
    this.isDrawing = true;
    const pos = this.getPointerPos(e.clientX, e.clientY);
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
  }

  draw(e) {
    if (!this.isDrawing) return;
    e.preventDefault();

    const pos = this.getPointerPos(e.clientX, e.clientY);

    if (this.mode === "erase") {
      this.ctx.globalCompositeOperation = "destination-out";
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, this.eraserRadius, 0, Math.PI * 2, false);
      this.ctx.fill();
    } else {
      this.ctx.globalCompositeOperation = "source-over";
      this.ctx.strokeStyle = this.color;
      this.ctx.lineWidth = this.lineWidth;
      this.ctx.lineTo(pos.x, pos.y);
      this.ctx.stroke();
    }
  }

  stopDrawing() {
    this.isDrawing = false;
    this.ctx.closePath();
  }

  // --- Touch Pointer Handling (Multi-touch robust) ---
  handleTouchStart(e) {
    e.preventDefault();

    const touchesToProcess = this.multiTouchEnabled
      ? Array.from(e.changedTouches).slice(0, 4)
      : [e.changedTouches[0]];

    touchesToProcess.forEach((touch) => {
      const pos = this.getPointerPos(touch.clientX, touch.clientY);
      this.activeTouches.set(touch.identifier, pos);

      if (this.mode === "erase") {
        this.ctx.globalCompositeOperation = "destination-out";
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, this.eraserRadius, 0, Math.PI * 2, false);
        this.ctx.fill();
      }
    });
  }

  handleTouchMove(e) {
    e.preventDefault();

    const touchesToProcess = this.multiTouchEnabled
      ? Array.from(e.changedTouches)
      : [e.changedTouches[0]];

    touchesToProcess.forEach((touch) => {
      const lastPos = this.activeTouches.get(touch.identifier);
      const currentPos = this.getPointerPos(touch.clientX, touch.clientY);

      if (this.mode === "erase") {
        this.ctx.globalCompositeOperation = "destination-out";
        this.ctx.beginPath();
        this.ctx.arc(currentPos.x, currentPos.y, this.eraserRadius, 0, Math.PI * 2, false);
        this.ctx.fill();
      } else {
        this.ctx.globalCompositeOperation = "source-over";
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.lineWidth;

        this.ctx.beginPath();
        if (lastPos) {
          this.ctx.moveTo(lastPos.x, lastPos.y);
        } else {
          this.ctx.moveTo(currentPos.x, currentPos.y);
        }
        this.ctx.lineTo(currentPos.x, currentPos.y);
        this.ctx.stroke();
      }

      this.activeTouches.set(touch.identifier, currentPos);
    });
  }

  handleTouchEnd(e) {
    Array.from(e.changedTouches).forEach((touch) => {
      this.activeTouches.delete(touch.identifier);
    });
  }

  bindEvents() {
    this.canvas.addEventListener("mousedown", (e) => this.startDrawing(e));
    this.canvas.addEventListener("mousemove", (e) => this.draw(e));
    this.canvas.addEventListener("mouseup", () => this.stopDrawing());
    this.canvas.addEventListener("mouseleave", () => this.stopDrawing());

    this.canvas.addEventListener("touchstart", (e) => this.handleTouchStart(e), { passive: false });
    this.canvas.addEventListener("touchmove", (e) => this.handleTouchMove(e), { passive: false });
    this.canvas.addEventListener("touchend", (e) => this.handleTouchEnd(e));
    this.canvas.addEventListener("touchcancel", (e) => this.handleTouchEnd(e));
  }

  setMultiTouch(enabled) {
    this.multiTouchEnabled = enabled;
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
