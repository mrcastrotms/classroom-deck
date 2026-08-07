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

  // Init Managers
  const viewport = new ViewportManager(
    stage,
    viewTitle,
    viewDimensions,
    telemetryPreset,
    telemetryFs
  );

  const drawer = new DrawingManager(canvas, contentFrame);

  // Resize canvas when switching device resolutions
  const handlePresetChange = (preset) => {
    viewport.setPreset(preset);
    setTimeout(() => drawer.resizeCanvas(), 350); // wait for CSS scaling transition
  };

  toggleMac.addEventListener("click", () => {
    handlePresetChange("MAC");
    toggleMac.classList.add("active");
    toggleSmartboard.classList.remove("active");
  });

  toggleSmartboard.addEventListener("click", () => {
    handlePresetChange("SMARTBOARD");
    toggleSmartboard.classList.add("active");
    toggleMac.classList.remove("active");
  });

  // Tool bindings
  toolDraw.addEventListener("click", () => {
    drawer.setMode("draw");
    toolDraw.classList.add("active");
    toolErase.classList.remove("active");
  });

  toolErase.addEventListener("click", () => {
    drawer.setMode("erase");
    toolErase.classList.add("active");
    toolDraw.classList.remove("active");
  });

  penColor.addEventListener("input", (e) => drawer.setColor(e.target.value));
  btnClear.addEventListener("click", () => drawer.clearCanvas());

  // Hide placeholder content toggle
  btnToggleContent.addEventListener("click", () => {
    placeholderText.classList.toggle("hidden");
  });

  // Fullscreen toggle
  btnFullscreen.addEventListener("click", () => viewport.toggleFullscreen());

  document.addEventListener("fullscreenchange", () => {
    const isFs = !!document.fullscreenElement;
    viewport.updateFullscreenState(isFs);
    setTimeout(() => drawer.resizeCanvas(), 350);
  });
});
