import {
  getCurrentWindow,
  LogicalSize,
  PhysicalSize,
  PhysicalPosition,
  currentMonitor,
} from "@tauri-apps/api/window";

import "./App.css";
import {
  Settings,
  Volume2,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Square,
  SkipForward,
} from "lucide-react";
import { useEffect, useState, useRef, useMemo } from "react";

import type { Phase } from "./stores/useTimerStore";
import { useTimerStore } from "./stores/useTimerStore";

function App() {
  const [configOpen, setConfigOpen] = useState(false);
  const [soundOpen, setSoundOpen] = useState(false);
  const [isMini, setIsMini] = useState(false);
  
  const {
    settings,
    currentPhase,
    timeRemaining,
    isRunning,
    isPaused,
    nextPhaseText,
    compiledPhases,
    currentPhaseIndex,
    elapsedWaitTime,
    start,
    pause,
    reset,
    tick,
    nextPhase,
    updateSettings,
  } = useTimerStore();

  const currentExecPhase =
    currentPhaseIndex >= 0 && currentPhaseIndex < compiledPhases.length
      ? compiledPhases[currentPhaseIndex]
      : null;

  const isWait = currentExecPhase?.isWait ?? false;

  // Initialize Worker
  useEffect(() => {
    const worker = new Worker(
      new URL("workers/timerWorker.ts", import.meta.url),
      { type: "module" }
    );

    worker.addEventListener("message", (e) => {
      if (e.data.type === "tick") {
        tick(e.data.deltaMs);
      }
    });

    if (isRunning && !isPaused) {
      worker.postMessage("start");
    } else {
      worker.postMessage("stop");
    }

    return () => {
      worker.postMessage("stop");
      worker.terminate();
    };
  }, [isRunning, isPaused, tick]);

  const savedPosRef = useRef<any>(null);
  const savedSizeRef = useRef<any>(null);
  const isInitialMount = useRef(true);
  const configPanelRef = useRef<HTMLDivElement>(null);
  const soundPanelRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close panels on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickInConfig = configPanelRef.current?.contains(
        event.target as Node
      );
      const clickInSound = soundPanelRef.current?.contains(
        event.target as Node
      );
      const clickInSidebar = sidebarRef.current?.contains(event.target as Node);

      if (!clickInConfig && !clickInSound && !clickInSidebar) {
        setConfigOpen(false);
        setSoundOpen(false);
      }
    };

    if (configOpen || soundOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [configOpen, soundOpen]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is interacting with inputs
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "SELECT") {
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (!isRunning) start();
        else if (isWait) nextPhase();
      } else if (e.key === " ") {
        e.preventDefault();
        if (!isRunning) start();
        else if (isWait) nextPhase();
        else pause();
      } else if (e.key === "Escape") {
        e.preventDefault();
        if (configOpen || soundOpen) {
          setConfigOpen(false);
          setSoundOpen(false);
        } else if (isMini) {
          setIsMini(false);
        } else {
          reset();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning, isWait, start, nextPhase, pause, reset, configOpen, soundOpen, isMini]);

  // Disable Context Menu globally
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  // Window Resize & Position effect for Mini Mode
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    let active = true;
    const updateGeometry = async () => {
      try {
        if (!active) {
          return;
        }
        
        // Safety check for web/mobile environments without Tauri window APIs
        if (!(window as any).__TAURI_INTERNALS__) return;

        const win = getCurrentWindow() as any;

        if (isMini) {
          // Save current position and size
          const pos = await win.outerPosition();
          const size = await win.outerSize();
          savedPosRef.current = pos;
          savedSizeRef.current = size;

          // Get monitor and move to top-right
          const monitor = await currentMonitor();
          if (monitor) {
            const { scaleFactor } = monitor;
            const miniWidth = 315 * scaleFactor;
            const miniHeight = 420 * scaleFactor;
            const padding = 30 * scaleFactor;

            const targetX =
              monitor.position.x + monitor.size.width - miniWidth - padding;
            const targetY = monitor.position.y + padding;

            await win.setSize(
              new PhysicalSize(Math.round(miniWidth), Math.round(miniHeight))
            );
            await win.setPosition(
              new PhysicalPosition(Math.round(targetX), Math.round(targetY))
            );
          } else {
            await win.setSize(new LogicalSize(315, 420));
          }
          await win.setAlwaysOnTop(true);
          await win.setDecorations(false);
        } else {
          // Restore previous position and size
          if (savedPosRef.current && savedSizeRef.current) {
            await win.setSize(savedSizeRef.current);
            await win.setPosition(savedPosRef.current);
          } else {
            await win.setSize(new LogicalSize(800, 600));
          }
          await win.setAlwaysOnTop(false);
          await win.setDecorations(true);
        }
      } catch (error) {
        console.warn("Tauri window API error:", error);
      }
    };

    updateGeometry();

    return () => {
      active = false;
    };
  }, [isMini]);

  // Formatting time
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    if (totalSeconds < 0) {
      return "00:00";
    }
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // UI Helpers
  const getColorForPhase = (phase: Phase) => {
    switch (phase) {
      case "work": {
        return "var(--neon-red)";
      }
      case "rest": {
        return "var(--neon-green)";
      }
      case "warmup": {
        return "var(--neon-blue)";
      }
      case "cooldown": {
        return "var(--neon-blue)";
      }
      default: {
        return "var(--glass-border)";
      }
    }
  };

  const currentColor = getColorForPhase(currentPhase);
  
  const totalPhaseTime = currentExecPhase && !currentExecPhase.isWait 
    ? currentExecPhase.durationSec * 1000 
    : 1000;

  // Calculate progress circle offset
  const size = isMini ? 260 : 400;
  const radius = isMini ? 110 : 180;
  const circumference = 2 * Math.PI * radius;
  
  let progress = 1;
  if (isRunning) {
    if (isWait) {
      // For WaitBlock, pulse the ring
      progress = 1; // Full ring, but we can add css pulse
    } else {
      progress = Math.max(0, timeRemaining / totalPhaseTime);
    }
  }
  const strokeDashoffset = circumference - progress * circumference;

  const bgClass =
    currentPhase === "work"
      ? "breathe-work"
      : (currentPhase === "rest"
        ? "breathe-rest"
        : "");

  const cycleText = currentExecPhase?.cycleStack
    ?.map((c) => `${c.name} ${c.current}/${c.total}`)
    .join(" • ") || "";

  return (
    <div
      className={`app-container ${bgClass} ${isMini ? "mini-mode" : ""}`}
      onMouseDown={(e: any) => {
        if (
          e.target.closest("button") ||
          e.target.closest(".icon-btn") ||
          e.target.closest(".config-panel") ||
          e.target.closest(".sound-select") ||
          e.target.closest(".volume-slider")
        ) {
          return;
        }
        
        // Only allow dragging on desktop environments (where window size makes sense and TAURI is present)
        if ((window as any).__TAURI_INTERNALS__ && window.innerWidth > 768) {
          try {
            getCurrentWindow().startDragging();
          } catch(e) {}
        }
      }}
    >
      {/* Sidebar */}
      <div className="sidebar" ref={sidebarRef}>
        <div
          className={`icon-btn ${configOpen ? "active" : ""}`}
          onClick={() => {
            setConfigOpen(!configOpen);
            setSoundOpen(false);
          }}
          title="Timer Settings"
        >
          <Settings size={24} />
        </div>
        <div
          className={`icon-btn ${soundOpen ? "active" : ""}`}
          onClick={() => {
            setSoundOpen(!soundOpen);
            setConfigOpen(false);
          }}
          title="Sound Settings"
        >
          <Volume2 size={24} />
        </div>
      </div>

      {/* Configuration Panel */}
      <div
        className={`config-panel ${configOpen ? "open" : ""}`}
        ref={configPanelRef}
      >
        <h2>Timer Settings</h2>
        
        <div className="setting-group">
          <label>
            <span>Schema Mode</span>
          </label>
          <select
            value={settings.mode}
            onChange={(e) => updateSettings({ mode: e.target.value as any })}
            className="sound-select"
          >
            <option value="default">Default</option>
            <option value="sets">Sets (Serie)</option>
          </select>
        </div>

        <div className="setting-group">
          <label>
            <span>Work (sec)</span> <span>{settings.work}s</span>
          </label>
          <input
            type="range"
            min="5"
            max="300"
            step="1"
            value={settings.work}
            onChange={(e) =>
              updateSettings({ work: Number.parseInt(e.target.value, 10) })
            }
          />
        </div>

        <div className="setting-group">
          <label>
            <span>Rest (sec)</span> <span>{settings.rest}s</span>
          </label>
          <input
            type="range"
            min="5"
            max="300"
            step="1"
            value={settings.rest}
            onChange={(e) =>
              updateSettings({ rest: Number.parseInt(e.target.value, 10) })
            }
          />
        </div>

        <div className="setting-group">
          <label>
            <span>Cycles</span> <span>{settings.cycles}</span>
          </label>
          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={settings.cycles}
            onChange={(e) =>
              updateSettings({ cycles: Number.parseInt(e.target.value, 10) })
            }
          />
        </div>
        
        {settings.mode === "sets" && (
          <>
            <div className="setting-group">
              <label>
                <span>Sets</span> <span>{settings.sets}</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={settings.sets}
                onChange={(e) =>
                  updateSettings({ sets: Number.parseInt(e.target.value, 10) })
                }
              />
            </div>
            
            <div className="setting-group">
              <label>
                <span>Set Rest Type</span>
              </label>
              <select
                value={settings.useWaitBlockForSetRest ? "wait" : "timed"}
                onChange={(e) => updateSettings({ useWaitBlockForSetRest: e.target.value === "wait" })}
                className="sound-select"
              >
                <option value="timed">Timed (sec)</option>
                <option value="wait">Wait for Input (WaitBlock)</option>
              </select>
            </div>
            
            {!settings.useWaitBlockForSetRest && (
              <div className="setting-group">
                <label>
                  <span>Set Rest (sec)</span> <span>{settings.setRest}s</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="600"
                  step="5"
                  value={settings.setRest}
                  onChange={(e) =>
                    updateSettings({ setRest: Number.parseInt(e.target.value, 10) })
                  }
                />
              </div>
            )}
          </>
        )}

        <div className="setting-group">
          <label>
            <span>Warmup (sec)</span> <span>{settings.warmup}s</span>
          </label>
          <input
            type="range"
            min="0"
            max="120"
            step="1"
            value={settings.warmup}
            onChange={(e) =>
              updateSettings({ warmup: Number.parseInt(e.target.value, 10) })
            }
          />
        </div>

        <div style={{ marginTop: "auto" }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>
            * Settings are saved automatically.
          </p>
        </div>
      </div>

      {/* Sound Panel */}
      <div
        className={`config-panel ${soundOpen ? "open" : ""}`}
        ref={soundPanelRef}
      >
        <h2>Sound Settings</h2>

        <div className="setting-group">
          <label>
            <span>Volume</span> <span>{settings.volume}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={settings.volume}
            onChange={(e) =>
              updateSettings({ volume: Number.parseInt(e.target.value, 10) })
            }
          />
        </div>

        <div className="setting-group">
          <label>
            <span>TTS Volume</span> <span>{settings.ttsVolume}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={settings.ttsVolume}
            onChange={(e) =>
              updateSettings({ ttsVolume: Number.parseInt(e.target.value, 10) })
            }
          />
        </div>

        <div className="setting-group">
          <label>
            <span>Countdown Beeps</span> <span>{settings.warningBeeps}</span>
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="1"
            value={settings.warningBeeps}
            onChange={(e) =>
              updateSettings({
                warningBeeps: Number.parseInt(e.target.value, 10),
              })
            }
          />
        </div>

        <div className="setting-group">
          <label>
            <span>Sound Type</span>
          </label>
          <select
            value={settings.soundProfile}
            onChange={(e) =>
              updateSettings({ soundProfile: e.target.value as any })
            }
            className="sound-select"
          >
            <option value="retro">Retro Beep</option>
            <option value="soft">Soft Pip</option>
            <option value="digital">Digital Alert</option>
          </select>
        </div>

        <div style={{ marginTop: "auto" }}>
          <div className="setting-group">
            <label>
              <span>Text-to-Speech</span>
              <input
                type="checkbox"
                checked={settings.ttsEnabled}
                onChange={(e) =>
                  updateSettings({ ttsEnabled: e.target.checked })
                }
              />
            </label>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <button
          className="restore-btn"
          onClick={() => setIsMini(!isMini)}
          title={isMini ? "Exit Mini Mode" : "Enter Mini Mode"}
        >
          {isMini ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
        </button>
        <div className="timer-container">
          <svg className={`progress-ring ${isWait && isRunning && !isPaused ? 'pulse-ring' : ''}`} width={size} height={size}>
            <circle
              className="progress-ring-bg"
              cx={size / 2}
              cy={size / 2}
              r={radius}
            />
            <circle
              className="progress-ring-fg"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              style={{
                stroke: isRunning ? currentColor : "rgba(255,255,255,0.2)",
                strokeDasharray: circumference,
                strokeDashoffset: isRunning ? strokeDashoffset : 0,
              }}
            />
          </svg>

          <div className="timer-text-container">
            <div className="cycle-label">
              {cycleText || " "}
            </div>
            <div
              className="phase-label"
              style={{ color: isRunning ? currentColor : "#fff" }}
            >
              {currentPhase === "idle" ? "PRO SIMPLE TIMER" : (currentExecPhase?.name || currentPhase)}
            </div>
            
            <div className="time-display">
              {!isRunning
                ? formatTime(settings.work * 1000)
                : isWait 
                  ? formatTime(elapsedWaitTime) 
                  : formatTime(timeRemaining)
              }
            </div>
            <div className="next-up">
              {isRunning ? nextPhaseText : "Setup your workout"}
            </div>
          </div>
        </div>

        <div className="start-overlay">
          {!isRunning ? (
            <button className="btn-primary" onClick={start}>
              START
            </button>
          ) : isWait ? (
            <div style={{ display: "flex", gap: "20px" }}>
              <button
                className="btn-primary pulse-btn"
                onClick={nextPhase}
                style={{ padding: "12px 20px" }}
              >
                 READY (NEXT)
              </button>
              <button
                className="btn-primary"
                onClick={reset}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  padding: "12px 20px",
                }}
              >
                <Square fill="#fff" />
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "20px" }}>
              <button
                className="btn-primary"
                onClick={isPaused ? start : pause}
                style={{ padding: "12px 20px" }}
              >
                {isPaused ? <Play fill="#000" /> : <Pause fill="#000" />}
              </button>
              <button
                className="btn-primary"
                onClick={reset}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  padding: "12px 20px",
                }}
              >
                <Square fill="#fff" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
