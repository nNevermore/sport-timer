import { X } from "lucide-react";

import type { TimerSettings } from "../stores/useTimerStore";

interface GlobalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TimerSettings;
  updateSettings: (newSettings: Partial<TimerSettings>) => void;
}

export function GlobalSettingsModal({
  isOpen,
  onClose,
  settings,
  updateSettings,
}: GlobalSettingsModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fullscreen-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Global Settings</h2>
          <button className="icon-btn" onClick={onClose} title="Close">
            <X size={24} />
          </button>
        </div>
        <div className="modal-body">
          <div
            className="setting-group"
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: "15px",
              justifyContent: "flex-start",
              border: "1px solid var(--glass-border)",
              padding: "20px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <input
              type="checkbox"
              id="premium-checkbox"
              checked={settings.isPremium}
              onChange={(e) => updateSettings({ isPremium: e.target.checked })}
              style={{
                width: "24px",
                height: "24px",
                cursor: "pointer",
                accentColor: "var(--neon-green)",
              }}
            />
            <label
              htmlFor="premium-checkbox"
              style={{
                fontSize: "1.2rem",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span>Premium Edition</span>
              <span
                style={{
                  fontSize: "0.85rem",
                  color: "rgba(255, 255, 255, 0.5)",
                  marginTop: "4px",
                }}
              >
                Save your configurations persistently. Free version clears
                settings on exit.
              </span>
            </label>
          </div>
          <p
            style={{
              marginTop: "40px",
              color: "rgba(255, 255, 255, 0.4)",
              textAlign: "center",
            }}
          >
            More advanced settings, themes, and special effects will be added
            here in the future.
          </p>
        </div>
      </div>
    </div>
  );
}
