import { DEVICE_PRESETS } from "../config/devices.js";

export class ViewportManager {
  constructor(stageEl, titleEl, dimensionsEl, presetTelemetryEl, fsTelemetryEl) {
    this.stage = stageEl;
    this.title = titleEl;
    this.dimensions = dimensionsEl;
    this.presetTelemetry = presetTelemetryEl;
    this.fsTelemetry = fsTelemetryEl;

    this.activePresetKey = "SMARTBOARD";
    this.isFullscreen = false;
  }

  setPreset(presetKey) {
    if (!DEVICE_PRESETS[presetKey]) return;
    this.activePresetKey = presetKey;
    this.render();
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error entering fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }

  updateFullscreenState(active) {
    this.isFullscreen = active;
    this.render();
  }

  render() {
    const config = DEVICE_PRESETS[this.activePresetKey];

    // Apply Dimensions & Scale
    if (!this.isFullscreen) {
      this.stage.classList.remove("fullscreen-mode");
      this.stage.style.width = `${config.width}px`;
      this.stage.style.height = `${config.height}px`;
      this.stage.style.transform = `scale(${config.scale})`;
    } else {
      this.stage.classList.add("fullscreen-mode");
      this.stage.style.width = "";
      this.stage.style.height = "";
      this.stage.style.transform = "";
    }

    // Telemetry & UI Text Sync
    this.title.textContent = `${config.name} (${config.badgeLabel})`;
    this.dimensions.textContent = `${config.width} × ${config.height}`;
    this.presetTelemetry.textContent = `Preset: ${config.name} (${config.badgeLabel})`;
    this.fsTelemetry.textContent = `Fullscreen: ${this.isFullscreen ? "ACTIVE" : "OFF"}`;
  }
}
