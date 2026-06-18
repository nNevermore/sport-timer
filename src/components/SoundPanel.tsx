import type { RefObject } from "react";

import type { Phase } from "../stores/types";
import type { TimerSettings } from "../stores/useTimerStore";

interface SoundPanelProps {
  isOpen: boolean;
  panelRef: RefObject<HTMLDivElement | null>;
  settings: TimerSettings;
  updateSettings: (newSettings: Partial<TimerSettings>) => void;
}

export function SoundPanel({
  isOpen,
  panelRef,
  settings,
  updateSettings,
}: SoundPanelProps) {
  return (
    <div className={`config-panel ${isOpen ? "open" : ""}`} ref={panelRef}>
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

      {["work", "rest", "warmup", "cooldown"].map((phase) => (
        <div className="setting-group" key={phase}>
          <label>
            <span style={{ textTransform: "capitalize" }}>{phase} Sound</span>
          </label>
          <select
            value={settings.soundProfiles[phase as Phase]}
            onChange={(e) =>
              updateSettings({
                soundProfiles: {
                  ...settings.soundProfiles,
                  [phase]: e.target.value as any,
                },
              })
            }
            className="sound-select"
          >
            <option value="retro">Retro Beep</option>
            <option value="soft">Soft Pip</option>
            <option value="digital">Digital Alert</option>
          </select>
        </div>
      ))}

      <div style={{ marginTop: "auto" }}>
        <div className="setting-group">
          <label>
            <span>Text-to-Speech</span>
            <input
              type="checkbox"
              checked={settings.ttsEnabled}
              onChange={(e) => updateSettings({ ttsEnabled: e.target.checked })}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
