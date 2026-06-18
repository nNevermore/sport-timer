import { Play, Pause, Square, SkipForward } from "lucide-react";

interface ControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  isWait: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  nextPhase: () => void;
}

export function Controls({
  isRunning,
  isPaused,
  isWait,
  start,
  pause,
  reset,
  nextPhase,
}: ControlsProps) {
  if (!isRunning) {
    return (
      <div className="controls">
        <button className="btn-primary" onClick={start}>
          START
        </button>
      </div>
    );
  }

  if (isWait) {
    return (
      <div className="controls">
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
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
            title="Stop Timer"
          >
            <Square fill="#fff" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="controls">
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <button
          className="btn-primary"
          onClick={isPaused ? start : pause}
          style={{ padding: "12px 20px" }}
          title={isPaused ? "Resume" : "Pause"}
        >
          {isPaused ? <Play fill="#000" /> : <Pause fill="#000" />}
        </button>

        <button
          className="btn-primary"
          onClick={nextPhase}
          style={{
            background: "rgba(255,255,255,0.8)",
            color: "#000",
            padding: "12px 20px",
          }}
          title="Skip to Next Phase"
        >
          <SkipForward fill="#000" />
        </button>

        <button
          className="btn-primary"
          onClick={reset}
          style={{
            background: "rgba(255,255,255,0.1)",
            color: "#fff",
            padding: "12px 20px",
          }}
          title="Stop Timer"
        >
          <Square fill="#fff" />
        </button>
      </div>
    </div>
  );
}
