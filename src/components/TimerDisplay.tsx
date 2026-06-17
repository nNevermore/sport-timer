import type { ExecutablePhase } from "../stores/timerSchema";
import type { Phase } from "../stores/types";

interface TimerDisplayProps {
  isMini: boolean;
  isRunning: boolean;
  isPaused: boolean;
  isWait: boolean;
  currentColor: string;
  currentPhase: Phase;
  currentExecPhase: ExecutablePhase | null;
  timeRemaining: number;
  elapsedWaitTime: number;
  totalPhaseTime: number;
  nextPhaseText: string;
  formatTime: (ms: number) => string;
  settingsWork: number;
}

export function TimerDisplay({
  isMini,
  isRunning,
  isPaused,
  isWait,
  currentColor,
  currentPhase,
  currentExecPhase,
  timeRemaining,
  elapsedWaitTime,
  totalPhaseTime,
  nextPhaseText,
  formatTime,
  settingsWork,
}: TimerDisplayProps) {
  // Calculate progress circle offset
  const size = isMini ? 260 : 400;
  const radius = isMini ? 110 : 180;
  const circumference = 2 * Math.PI * radius;

  let progress = 1;
  if (isRunning) {
    progress = isWait ? 1 : Math.max(0, timeRemaining / totalPhaseTime);
  }
  const strokeDashoffset = circumference - progress * circumference;

  const cycleText =
    currentExecPhase?.cycleStack
      ?.map((c) => `${c.name} ${c.current}/${c.total}`)
      .join(" • ") || "";

  return (
    <div className="timer-container">
      <svg
        className={`progress-ring ${
          isWait && isRunning && !isPaused ? "pulse-ring" : ""
        }`}
        width={size}
        height={size}
      >
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
        <div className="cycle-label">{cycleText || " "}</div>
        <div
          className="phase-label"
          style={{ color: isRunning ? currentColor : "#fff" }}
        >
          {currentPhase === "idle"
            ? "PRO SIMPLE TIMER"
            : currentExecPhase?.name || currentPhase}
        </div>

        <div className="time-display">
          {!isRunning
            ? formatTime(settingsWork * 1000)
            : (isWait
              ? formatTime(elapsedWaitTime)
              : formatTime(timeRemaining))}
        </div>
        <div className="next-up">
          {isRunning ? nextPhaseText : "Setup your workout"}
        </div>
      </div>
    </div>
  );
}
