import { ViewportManager } from "./modules/viewportManager.js";
import { DrawingManager } from "./modules/drawingManager.js";
// Keeping your imports so the app doesn't break, but we will use the dynamic Study Guides below
import { assignment122, assignment123 } from "./modules/assignments.js";

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // SPA & VIEW ROUTING ELEMENTS
  // ==========================================
  const viewLanding = document.getElementById("landing-view");
  const viewWhiteboard = document.getElementById("whiteboard-view");
  const viewFifthGrade = document.getElementById("fifth-grade-view");
  const viewFourthGrade = document.getElementById("fourth-grade-view"); 

  const btnNav4th = document.getElementById("btn-nav-4th"); 
  const btnNav5th = document.getElementById("btn-nav-5th");
  const btnNavWhiteboard = document.getElementById("btn-nav-whiteboard");
  
  const btnExitWhiteboard = document.getElementById("btn-exit-whiteboard");
  const btnExit4th = document.getElementById("btn-exit-4th"); 
  const btnExit5th = document.getElementById("btn-exit-5th"); 

  const timerDisplay = document.getElementById("fifth-timer-display"); // Updated ID
  const btnStart5thTimer = document.getElementById("btn-start-5th-timer"); // New Start Button
  const btnAdminUnlock = document.getElementById("btn-admin-unlock");

  // ESC Modal Elements
  const adminModal = document.getElementById("admin-modal");
  const pinInput = document.getElementById("admin-pin-input");
  const btnSubmitPin = document.getElementById("btn-submit-pin");
  const btnReturnFullscreen = document.getElementById("btn-return-fullscreen");
  const pinError = document.getElementById("pin-error");

  // Strict Lockdown Overlay Elements
  const strictLockdownOverlay = document.getElementById("strict-lockdown-overlay");
  const strictUnlockPin = document.getElementById("strict-unlock-pin");
  const btnStrictUnlock = document.getElementById("btn-strict-unlock");
  const strictLockdownError = document.getElementById("strict-lockdown-error");

  // 5th Grade Content Elements
  const fifthGradeContent = document.getElementById("fifth-grade-content");
  const btnLoad122 = document.getElementById("btn-load-122");
  const btnLoad123 = document.getElementById("btn-load-123");

  // Language Elements
  const btnLangToggle = document.getElementById("btn-lang-toggle");
  const landingTitle = document.getElementById("landing-title");
  const landingSubtitle = document.getElementById("landing-subtitle");

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
  // LANGUAGE TOGGLE LOGIC
  // ==========================================
  let currentLang = "ENG";
  
  if (btnLangToggle) {
    btnLangToggle.addEventListener("click", () => {
      if (currentLang === "ENG") {
        currentLang = "ESP";
        landingTitle.textContent = "Bienvenido";
        landingSubtitle.textContent = "Seleccione su espacio de trabajo";
        if(btnNav4th) btnNav4th.textContent = "4to Grado";
        if(btnNav5th) btnNav5th.textContent = "5to Grado";
        if(btnNavWhiteboard) btnNavWhiteboard.textContent = "Pizarra Interactiva";
      } else {
        currentLang = "ENG";
        landingTitle.textContent = "Welcome";
        landingSubtitle.textContent = "Select your workspace";
        if(btnNav4th) btnNav4th.textContent = "4th Grade";
        if(btnNav5th) btnNav5th.textContent = "5th Grade";
        if(btnNavWhiteboard) btnNavWhiteboard.textContent = "Whiteboard";
      }
    });
  }

  // ==========================================
  // SPA NAVIGATION 
  // ==========================================
  let drawer = null; 
  let timerInterval = null;
  let isFifthGradeLocked = false; 

  const switchView = (viewName) => {
    localStorage.setItem("activeWorkspace", viewName);

    // Hide all
    [viewLanding, viewWhiteboard, viewFifthGrade, viewFourthGrade].forEach((v) => {
      if (v) {
        v.classList.remove("active");
        v.classList.add("hidden");
      }
    });

    // Show Target
    if (viewName === "landing" && viewLanding) {
      viewLanding.classList.remove("hidden");
      viewLanding.classList.add("active");
      
      // Clear security states if they return home
      isFifthGradeLocked = false;
      clearInterval(timerInterval);
      if (btnStart5thTimer) {
        btnStart5thTimer.innerText = "Start 30:00 Lockdown";
        btnStart5thTimer.style.backgroundColor = "#3b82f6";
        btnStart5thTimer.disabled = false;
      }
      
    } else if (viewName === "whiteboard" && viewWhiteboard) {
      viewWhiteboard.classList.remove("hidden");
      viewWhiteboard.classList.add("active");
      if (drawer) setTimeout(() => drawer.resizeCanvas(), 50);
      
    } else if (viewName === "fifthGrade" && viewFifthGrade) {
      viewFifthGrade.classList.remove("hidden");
      viewFifthGrade.classList.add("active");
      
    } else if (viewName === "fourthGrade" && viewFourthGrade) {
      viewFourthGrade.classList.remove("hidden");
      viewFourthGrade.classList.add("active");
    }
  };

  // Basic Nav Listeners
  if (btnNavWhiteboard) btnNavWhiteboard.addEventListener("click", () => switchView("whiteboard"));
  if (btnExitWhiteboard) btnExitWhiteboard.addEventListener("click", () => switchView("landing"));
  if (btnNav4th) btnNav4th.addEventListener("click", () => switchView("fourthGrade"));
  if (btnExit4th) btnExit4th.addEventListener("click", () => switchView("landing"));
  if (btnExit5th) btnExit5th.addEventListener("click", () => switchView("landing"));

  // ==========================================
  // 5TH GRADE: STUDY GUIDE CONTENT & INJECTION
  // ==========================================
  const studyGuide1 = `
    <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); max-width: 800px; margin: 0 auto; color: #334155;">
      <h1 style="color: #0ea5e9; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Study Guide 1</h1>
      <h3 style="margin-top: 20px;">Basic Operations Review</h3>
      
      <div style="margin-top: 30px;">
        <h4 style="color: #475569;">Part 1: Find each sum or difference. Show your procedure.</h4>
        <ol style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; line-height: 2;">
          <li>3,683 + 2,784</li>
          <li>3,450 + 14,853</li>
          <li>987 + 63,489</li>
          <li>4,773 + 3,480</li>
          <li>877,213 - 473,436</li>
          <li>96,291 - 87,454</li>
          <li>95,000 - 47,698</li>
          <li>85,400 - 86</li>
          <li>874,566 - 989</li>
        </ol>
      </div>

      <div style="margin-top: 40px;">
        <h4 style="color: #475569;">Part 2: Find each product. Show your procedure.</h4>
        <ol style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; line-height: 2;">
          <li>438 &times; 7</li>
          <li>949 &times; 24</li>
          <li>4,596 &times; 71</li>
          <li>9,807 &times; 78</li>
          <li>784 &times; 68</li>
          <li>7,457 &times; 65</li>
        </ol>
      </div>

      <div style="margin-top: 40px;">
        <h4 style="color: #475569;">Part 3: Find each quotient. Show your procedure.</h4>
        <ol style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; line-height: 2;">
          <li>448 &divide; 6</li>
          <li>33,856 &divide; 7</li>
          <li>20,016 &divide; 8</li>
          <li>154 &divide; 5</li>
          <li>785,626 &divide; 8</li>
          <li>87,653 &divide; 9</li>
        </ol>
      </div>
    </div>
  `;

  const studyGuide2 = `
    <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); max-width: 800px; margin: 0 auto; color: #334155;">
      <h1 style="color: #0ea5e9; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Study Guide 2</h1>
      <h3 style="margin-top: 20px;">Expanded form & Standard form</h3>
      
      <div style="margin-top: 30px;">
        <h4 style="color: #475569;">B. Write the following numbers in expanded form using powers of 10.</h4>
        <ol style="display: grid; grid-template-columns: 1fr; gap: 20px; line-height: 2;">
          <li>418.053</li>
          <li>62.8</li>
          <li>9.41</li>
          <li>730.592</li>
          <li>5.168</li>
        </ol>
      </div>

      <div style="margin-top: 40px;">
        <h4 style="color: #475569;">C. Write the following numbers in standard form.</h4>
        <ol style="display: grid; grid-template-columns: 1fr; gap: 20px; line-height: 2;">
          <li>200 + 10 + 6 + 0.3</li>
          <li>4 + 0.9 + 0.008</li>
          <li>(7 &times; 10) + (2 &times; 1/10) + (8 &times; 1/100) + (6 &times; 1/1000)</li>
          <li>(4 &times; 100) + (2 &times; 10) + (6 &times; 1) + (1 &times; 1/100)</li>
          <li>500 + 40 + 3 + 0.8</li>
        </ol>
      </div>
    </div>
  `;

  const loadAssignment = (assignmentHtml, activeBtn) => {
    if (fifthGradeContent) {
      fifthGradeContent.innerHTML = assignmentHtml;
    }
    // Manage active states
    if (btnLoad122) btnLoad122.classList.remove("active");
    if (btnLoad123) btnLoad123.classList.remove("active");
    if (activeBtn) activeBtn.classList.add("active");
  };

  if (btnLoad122) btnLoad122.addEventListener("click", () => loadAssignment(studyGuide1, btnLoad122));
  if (btnLoad123) btnLoad123.addEventListener("click", () => loadAssignment(studyGuide2, btnLoad123));

  if (btnNav5th) {
    btnNav5th.addEventListener("click", () => {
      switchView("fifthGrade");
      loadAssignment(studyGuide1, btnLoad122);
      
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch((err) => console.log("Fullscreen denied", err));
      }
    });
  }

  // ==========================================
  // 5TH GRADE: TIMER & STRICT LOCKDOWN LOGIC
  // ==========================================
  if (btnStart5thTimer) {
    btnStart5thTimer.addEventListener('click', (e) => {
      isFifthGradeLocked = true;
      e.target.innerText = "Session Active";
      e.target.style.backgroundColor = "#10b981"; // Green
      e.target.disabled = true;
  
      clearInterval(timerInterval);
      let timeRemaining = 1800; // 30 minutes
      if (timerDisplay) timerDisplay.textContent = "30:00";
  
      timerInterval = setInterval(() => {
        if (timeRemaining <= 0) {
          clearInterval(timerInterval);
          if (timerDisplay) timerDisplay.textContent = "00:00";
          isFifthGradeLocked = false; 
          alert("Time is up!");
          return;
        }
        
        timeRemaining--;
        let m = Math.floor(timeRemaining / 60);
        let s = timeRemaining % 60;
        if (timerDisplay) {
            timerDisplay.textContent = (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
        }
      }, 1000);
    });
  }

  const triggerStrictLockdown = () => {
    if (isFifthGradeLocked && strictLockdownOverlay) {
      strictLockdownOverlay.style.display = 'flex';
    }
  };

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === 'hidden') triggerStrictLockdown();
  });

  window.addEventListener("blur", () => {
    triggerStrictLockdown();
  });

  if (btnStrictUnlock) {
    btnStrictUnlock.addEventListener('click', () => {
      if (strictUnlockPin && strictUnlockPin.value === "0801") {
        if (strictLockdownOverlay) strictLockdownOverlay.style.display = 'none';
        strictUnlockPin.value = ''; 
        if (strictLockdownError) strictLockdownError.style.display = 'none';
      } else {
        if (strictLockdownError) strictLockdownError.style.display = 'block';
      }
    });
  }

  // ==========================================
  // ESC MODAL LOGIC (For exiting fullscreen)
  // ==========================================
  const triggerUnlockModal = () => {
    if (!adminModal) return;
    adminModal.classList.remove("hidden");
    if (pinInput) {
      pinInput.value = "";
      pinInput.focus();
    }
    if (pinError) pinError.classList.add("hidden");
  };

  if (btnAdminUnlock) {
    btnAdminUnlock.addEventListener("click", triggerUnlockModal);
  }

  const attemptUnlock = () => {
    if (pinInput && pinInput.value === "0801") {
      isFifthGradeLocked = false;
      if (adminModal) adminModal.classList.add("hidden");
      clearInterval(timerInterval);
      
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.log(err));
      }
      switchView("landing");
    } else if (pinInput && pinError) {
      pinError.classList.remove("hidden");
      pinInput.value = "";
      pinInput.focus();
    }
  };

  if (btnSubmitPin) btnSubmitPin.addEventListener("click", attemptUnlock);
  if (pinInput) {
    pinInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") attemptUnlock();
    });
  }

  if (btnReturnFullscreen) {
    btnReturnFullscreen.addEventListener("click", () => {
      if (adminModal) adminModal.classList.add("hidden");
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch((err) => console.log("Fullscreen denied", err));
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

  let isMultiTouchActive = false;
  if (toggleMultiTouch) {
    toggleMultiTouch.addEventListener("click", () => {
      isMultiTouchActive = !isMultiTouchActive;
      if (drawer) drawer.setMultiTouch(isMultiTouchActive);
      toggleMultiTouch.textContent = `Multi Touch: ${isMultiTouchActive ? "ON" : "OFF"}`;
      toggleMultiTouch.classList.toggle("active-mode", isMultiTouchActive);
    });
  }

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

  if (btnToggleContent) {
    btnToggleContent.addEventListener("click", () => {
      if (placeholderText) placeholderText.classList.toggle("hidden");
    });
  }

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

    // Catch Esc key during 5th grade lockdown
    if (!isFs && isFifthGradeLocked) {
      triggerUnlockModal();
    }
  });

  // ==========================================
  // RESTORE SESSION ON REFRESH
  // ==========================================
  const savedView = localStorage.getItem("activeWorkspace") || "landing";

  if (savedView === "fourthGrade") {
    switchView("fourthGrade");
  } else if (savedView === "whiteboard") {
    switchView("whiteboard");
  } else if (savedView === "fifthGrade") {
    switchView("fifthGrade");
    loadAssignment(studyGuide1, btnLoad122);
  } else {
    switchView("landing");
  }
});
