import { ViewportManager } from "./modules/viewportManager.js";
import { DrawingManager } from "./modules/drawingManager.js";

document.addEventListener("DOMContentLoaded", () => {
  const stage = document.getElementById("stage");
  const contentFrame = document.getElementById("content-frame");
  const canvas = document.getElementById("draw-canvas");
  const placeholderText = document.getElementById("placeholder-text");
  const gridOverlay = document.getElementById("grid-overlay");

  const viewTitle = document.getElementById("view-title");
  const viewDimensions = document.getElementById("view-dimensions");
  const telemetryPreset = document.getElementById("telemetry-preset");
  const telemetryFs = document.getElementById("telemetry-fs");

  const toggleMac = document.getElementById("toggle-mac");
  const toggleSmartboard = document.getElementById("toggle-smartboard");
  const btnFullscreen = document.getElementById("btn-fullscreen");

  const toolDraw = document.getElementById("tool-draw");
  const toolErase = document.getElementById("tool-erase");
  const btnClear = document.getElementById("btn-clear");
  const btnToggleContent = document.getElementById("btn-toggle-content");
  const penColor = document.getElementById("pen-color");

  const toggleMultiTouch = document.getElementById("toggle-multitouch");
  const btnToggleGrid = document.getElementById("btn-toggle-grid");
  const selectGridSize = document.getElementById("select-grid-size");

  const viewport = new ViewportManager(
    stage,
    viewTitle,
    viewDimensions,
    telemetryPreset,
    telemetryFs
  );

  let drawer = null;
  if (canvas && contentFrame) {
    drawer = new DrawingManager(canvas, contentFrame);
  }

  const handlePresetChange = (preset) => {
    viewport.setPreset(preset);
    if (drawer) {
      setTimeout(() => drawer.resizeCanvas(), 350);
    }
  };

  // Viewport bindings
  if (toggleMac) {
    toggleMac.addEventListener("click", () => {
      handlePresetChange("MAC");
      toggleMac.classList.add("active");
      if (toggleSmartboard) toggleSmartboard.classList.remove("active");
    });
  }

  if (toggleSmartboard) {
    toggleSmartboard.addEventListener("click", () => {
      handlePresetChange("SMARTBOARD");
      toggleSmartboard.classList.add("active");
      if (toggleMac) toggleMac.classList.remove("active");
    });
  }

  // Drawing tools
  if (toolDraw) {
    toolDraw.addEventListener("click", () => {
      if (drawer) drawer.setMode("draw");
      toolDraw.classList.add("active");
      if (toolErase) toolErase.classList.remove("active");
    });
  }

  if (toolErase) {
    toolErase.addEventListener("click", () => {
      if (drawer) drawer.setMode("erase");
      toolErase.classList.add("active");
      if (toolDraw) toolDraw.classList.remove("active");
    });
  }

  if (penColor && drawer) {
    penColor.addEventListener("input", (e) => drawer.setColor(e.target.value));
  }

  if (btnClear && drawer) {
    btnClear.addEventListener("click", () => drawer.clearCanvas());
  }

  // Multi touch toggle
  let isMultiTouchActive = false;
  if (toggleMultiTouch) {
    toggleMultiTouch.addEventListener("click", () => {
      isMultiTouchActive = !isMultiTouchActive;
      if (drawer) drawer.setMultiTouch(isMultiTouchActive);

      toggleMultiTouch.textContent = `Multi Touch: ${isMultiTouchActive ? "ON" : "OFF"}`;
      toggleMultiTouch.classList.toggle("active-mode", isMultiTouchActive);
    });
  }

  // Grid toggle and size selection
  let isGridActive = false;
  const updateGridStyle = () => {
    if (!gridOverlay || !selectGridSize) return;
    const size = selectGridSize.value;
    gridOverlay.style.backgroundSize = `${size}px ${size}px`;
  };

  if (btnToggleGrid) {
    btnToggleGrid.addEventListener("click", () => {
      isGridActive = !isGridActive;
      if (gridOverlay) gridOverlay.classList.toggle("hidden", !isGridActive);
      btnToggleGrid.textContent = `Grid: ${isGridActive ? "ON" : "OFF"}`;
      btnToggleGrid.classList.toggle("active", isGridActive);
      updateGridStyle();
    });
  }

  if (selectGridSize) {
    selectGridSize.addEventListener("change", () => {
      updateGridStyle();
    });
  }

  // Toggle placeholder text
  if (btnToggleContent) {
    btnToggleContent.addEventListener("click", () => {
      if (placeholderText) placeholderText.classList.toggle("hidden");
    });
  }

  // Fullscreen binding & state styling
  if (btnFullscreen) {
    btnFullscreen.addEventListener("click", () => viewport.toggleFullscreen());
  }

  document.addEventListener("fullscreenchange", () => {
    const isFs = !!document.fullscreenElement;
    viewport.updateFullscreenState(isFs);

    if (btnFullscreen) {
      btnFullscreen.classList.toggle("btn-danger", isFs);
    }

    if (drawer) {
      setTimeout(() => drawer.resizeCanvas(), 350);
    }
  });
});
