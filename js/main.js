import { ViewportManager } from "./modules/viewportManager.js";
import { DrawingManager } from "./modules/drawingManager.js";

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const stage = document.getElementById("stage");
  const contentFrame = document.getElementById("content-frame");
  const canvas = document.getElementById("draw-canvas");
  const placeholderText = document.getElementById("placeholder-text");

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

  // Init Viewport Manager
  const viewport = new ViewportManager(
    stage,
    viewTitle,
    viewDimensions,
    telemetryPreset,
    telemetryFs
  );

  // Init Drawing Manager safely
  let drawer = null;
  if (canvas && contentFrame) {
    drawer = new DrawingManager(canvas, contentFrame);
  } else {
    console.warn("Canvas or contentFrame element not found in DOM.");
  }

  // Preset switch handler
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

  // Drawing tool bindings
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

  // Toggle placeholder text
  if (btnToggleContent) {
    btnToggleContent.addEventListener("click", () => {
      if (placeholderText) placeholderText.classList.toggle("hidden");
    });
  }

  // Fullscreen binding
  if (btnFullscreen) {
    btnFullscreen.addEventListener("click", () => viewport.toggleFullscreen());
  }

  document.addEventListener("fullscreenchange", () => {
    const isFs = !!document.fullscreenElement;
    viewport.updateFullscreenState(isFs);
    if (drawer) {
      setTimeout(() => drawer.resizeCanvas(), 350);
    }
  });
});
