import { ViewportManager } from "./modules/viewportManager.js";
import { DrawingManager } from "./modules/drawingManager.js";

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // SPA & VIEW ROUTING ELEMENTS
  // ==========================================
  const viewLanding = document.getElementById("landing-view");
  const viewWhiteboard = document.getElementById("whiteboard-view");
  const viewFifthGrade = document.getElementById("fifth-grade-view");

  const btnNav5th = document.getElementById("btn-nav-5th");
  const btnNavWhiteboard = document.getElementById("btn-nav-whiteboard");
  const btnExitWhiteboard = document.getElementById("btn-exit-whiteboard");

  const timerDisplay = document.getElementById("timer-display");
  const btnAdminUnlock = document.getElementById("btn-admin-unlock");

  // ==========================================
  // EXISTING WHITEBOARD ELEMENTS
  // ==========================================
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

  // ==========================================
  // SPA NAVIGATION & LOCKDOWN LOGIC
  // ==========================================
  let drawer = null; // Declare early so SPA can resize it
  let timerInterval = null;

  const switchView = (viewName) => {
    // Hide all
    [viewLanding, viewWhiteboard, viewFifthGrade].forEach((v) => {
      if (v) {
        v.classList.remove("active");
        v.classList.add("hidden");
      }
    });

    // Show Target
    if (viewName === "landing" && viewLanding) {
      viewLanding.classList.remove("hidden");
      viewLanding.classList.add("active");
    } else if (viewName === "whiteboard" && viewWhiteboard) {
      viewWhiteboard.classList.remove("hidden");
      viewWhiteboard.classList.add("active");
      // Give the DOM a tiny fraction of a second to render 'display: flex' before resizing canvas
      if (drawer) {
        setTimeout(() => drawer.resizeCanvas(), 50);
      }
    } else if (viewName === "fifthGrade" && viewFifthGrade) {
      viewFifthGrade.classList.remove("hidden");
      viewFifthGrade.classList.add("active");
    }
  };

  if (btnNavWhiteboard) {
    btnNavWhiteboard.addEventListener("click", () => switchView("whiteboard"));
  }

  if (btnExitWhiteboard) {
    btnExitWhiteboard.addEventListener("click", () => switchView("landing"));
  }

  // 5th Grade Lock & Timer
  if (btnNav5th) {
    btnNav5th.addEventListener("click", () => {
      switchView("fifthGrade");

      // 1. Force Fullscreen
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch((err) => console.log("Fullscreen denied", err));
      }

      // 2. Start 25 Minute Timer
      let timeRemaining = 25 * 60; // 1500 seconds
      if (timerDisplay) timerDisplay.textContent = "25:00";

      clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        timeRemaining--;
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        
        if (timerDisplay) {
          timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
        }

        if (timeRemaining <= 0) {
          clearInterval(timerInterval);
          if (timerDisplay) timerDisplay.textContent = "TIME UP";
        }
      }, 1000);
    });
  }

  // Admin Unlock (Invisible top-right corner)
  if (btnAdminUnlock) {
    btnAdminUnlock.addEventListener("click", () => {
      const code = prompt("Enter Admin Code to exit lockdown:");
      if (code === "0801") {
        clearInterval(timerInterval);
        if (document.exitFullscreen && document.fullscreenElement) {
          document.exitFullscreen();
        }
        switchView("landing");
      } else if (code !== null) {
        alert("Incorrect code.");
      }
    });
  }


  // ==========================================
  // EXISTING WHITEBOARD MANAGERS & LOGIC
  // ==========================================
  const viewport = new ViewportManager(
    stage,
    viewTitle,
    viewDimensions,
    telemetryPreset,
    telemetryFs
  );

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
