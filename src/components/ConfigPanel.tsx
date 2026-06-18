import type { RefObject } from "react";

import type { TimerSettings } from "../stores/useTimerStore";

interface ConfigPanelProps {
  isOpen: boolean;
  panelRef: RefObject<HTMLDivElement | null>;
  settings: TimerSettings;
  updateSettings: (newSettings: Partial<TimerSettings>) => void;
}

export function ConfigPanel({
  isOpen,
  panelRef,
  settings,
  updateSettings,
}: ConfigPanelProps) {
  return (
    <div className={`config-panel ${isOpen ? "open" : ""}`} ref={panelRef}>
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
          style={{ accentColor: "var(--neon-blue)" }}
        />
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
          style={{ accentColor: "var(--neon-red)" }}
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
          style={{ accentColor: "var(--neon-green)" }}
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
              <span>Set Rest (sec)</span> <span>{settings.setRest}s</span>
            </label>
            <input
              type="range"
              min="5"
              max="600"
              step="5"
              value={settings.setRest}
              onChange={(e) =>
                updateSettings({
                  setRest: Number.parseInt(e.target.value, 10),
                })
              }
              style={{ accentColor: "var(--neon-green)" }}
            />
          </div>
        </>
      )}

      <div style={{ marginTop: "auto" }}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>
          * Settings are saved automatically.
        </p>
      </div>
    </div>
  );
}
