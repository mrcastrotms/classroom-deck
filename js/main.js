import { ViewportManager } from "./modules/viewportManager.js";

document.addEventListener("DOMContentLoaded", () => {
  // DOM References
  const stage = document.getElementById("stage");
  const viewTitle = document.getElementById("view-title");
  const viewDimensions = document.getElementById("view-dimensions");
  const telemetryPreset = document.getElementById("telemetry-preset");
  const telemetryFs = document.getElementById("telemetry-fs");

  const toggleMac = document.getElementById("toggle-mac");
  const toggleSmartboard = document.getElementById("toggle-smartboard");
  const btnFullscreen = document.getElementById("btn-fullscreen");

  // Initialize Manager
  const manager = new ViewportManager(
    stage,
    viewTitle,
    viewDimensions,
    telemetryPreset,
    telemetryFs
  );

  // Event Listeners
  toggleMac.addEventListener("click", () => {
    manager.setPreset("MAC");
    toggleMac.classList.add("active");
    toggleSmartboard.classList.remove("active");
  });

  toggleSmartboard.addEventListener("click", () => {
    manager.setPreset("SMARTBOARD");
    toggleSmartboard.classList.add("active");
    toggleMac.classList.remove("active");
  });

  btnFullscreen.addEventListener("click", () => {
    manager.toggleFullscreen();
  });

  document.addEventListener("fullscreenchange", () => {
    const isFs = !!document.fullscreenElement;
    manager.updateFullscreenState(isFs);
    btnFullscreen.classList.toggle("active", isFs);
    btnFullscreen.textContent = isFs ? "🗗 Exit Fullscreen" : "⛶ Fullscreen";
  });

  // Initial render
  manager.render();
});
