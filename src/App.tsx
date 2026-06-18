import {
  getCurrentWindow,
  LogicalSize,
  PhysicalSize,
  PhysicalPosition,
  currentMonitor,
} from "@tauri-apps/api/window";

import "./App.css";
import { Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";

import { ConfigPanel } from "./components/ConfigPanel";
import { Controls } from "./components/Controls";
import { GlobalSettingsModal } from "./components/GlobalSettingsModal";
import { SchemaEditorModal } from "./components/SchemaEditorModal";
import { Sidebar } from "./components/Sidebar";
import { SoundPanel } from "./components/SoundPanel";
import { TimerDisplay } from "./components/TimerDisplay";
import type { Phase } from "./stores/types";
import { useTimerStore } from "./stores/useTimerStore";

function App() {
  const [configOpen, setConfigOpen] = useState(false);
  const [soundOpen, setSoundOpen] = useState(false);
  const [globalSettingsOpen, setGlobalSettingsOpen] = useState(false);
  const [schemaEditorOpen, setSchemaEditorOpen] = useState(false);
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

  const openGlobalSettings = () => {
    if (isRunning && !isPaused) {
      pause();
    }
    setGlobalSettingsOpen(true);
  };

  const openSchemaEditor = () => {
    if (isRunning && !isPaused) {
      pause();
    }
    setSchemaEditorOpen(true);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement).tagName === "INPUT" ||
        (e.target as HTMLElement).tagName === "SELECT"
      ) {
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (!isRunning) {
          start();
        } else if (isWait) {
          nextPhase();
        }
      } else if (e.key === " ") {
        e.preventDefault();
        if (!isRunning) {
          start();
        } else if (isWait) {
          nextPhase();
        } else {
          pause();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        if (globalSettingsOpen) {
          setGlobalSettingsOpen(false);
        } else if (schemaEditorOpen) {
          setSchemaEditorOpen(false);
        } else if (configOpen || soundOpen) {
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
  }, [
    isRunning,
    isWait,
    start,
    nextPhase,
    pause,
    reset,
    configOpen,
    soundOpen,
    globalSettingsOpen,
    schemaEditorOpen,
    isMini,
  ]);

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
        if (!(window as any).__TAURI_INTERNALS__) {
          return;
        }

        const win = getCurrentWindow() as any;

        if (isMini) {
          const pos = await win.outerPosition();
          const size = await win.outerSize();
          savedPosRef.current = pos;
          savedSizeRef.current = size;

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

  const getColorForPhase = (phase: Phase) => {
    switch (phase) {
      case "work": {
        return "var(--neon-red)";
      }
      case "rest": {
        return "var(--neon-green)";
      }
      case "warmup":
      case "cooldown": {
        return "var(--neon-blue)";
      }
      default: {
        return "var(--glass-border)";
      }
    }
  };

  const currentColor = getColorForPhase(currentPhase);
  const totalPhaseTime =
    currentExecPhase && !currentExecPhase.isWait
      ? currentExecPhase.durationSec * 1000
      : 1000;

  const bgClass =
    currentPhase === "work"
      ? "breathe-work"
      : (currentPhase === "rest"
        ? "breathe-rest"
        : "");

  return (
    <div
      className={`app-container ${bgClass} ${isMini ? "mini-mode" : ""}`}
      data-tauri-drag-region
    >
      <Sidebar
        configOpen={configOpen}
        soundOpen={soundOpen}
        setConfigOpen={setConfigOpen}
        setSoundOpen={setSoundOpen}
        openGlobalSettings={openGlobalSettings}
        openSchemaEditor={openSchemaEditor}
        sidebarRef={sidebarRef}
      />

      <ConfigPanel
        isOpen={configOpen}
        panelRef={configPanelRef}
        settings={settings}
        updateSettings={updateSettings}
      />

      <SoundPanel
        isOpen={soundOpen}
        panelRef={soundPanelRef}
        settings={settings}
        updateSettings={updateSettings}
      />

      <GlobalSettingsModal
        isOpen={globalSettingsOpen}
        onClose={() => setGlobalSettingsOpen(false)}
      />

      <SchemaEditorModal
        isOpen={schemaEditorOpen}
        onClose={() => setSchemaEditorOpen(false)}
      />

      <div className="main-content">
        <button
          className="restore-btn"
          onClick={() => setIsMini(!isMini)}
          title={isMini ? "Exit Mini Mode" : "Enter Mini Mode"}
        >
          {isMini ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
        </button>

        <TimerDisplay
          isMini={isMini}
          isRunning={isRunning}
          isPaused={isPaused}
          isWait={isWait}
          currentColor={currentColor}
          currentPhase={currentPhase}
          currentExecPhase={currentExecPhase}
          timeRemaining={timeRemaining}
          elapsedWaitTime={elapsedWaitTime}
          totalPhaseTime={totalPhaseTime}
          nextPhaseText={nextPhaseText}
          formatTime={formatTime}
          settingsWork={settings.work}
        />

        <Controls
          isRunning={isRunning}
          isPaused={isPaused}
          isWait={isWait}
          start={start}
          pause={pause}
          reset={reset}
          nextPhase={nextPhase}
        />
      </div>
    </div>
  );
}

export default App;
