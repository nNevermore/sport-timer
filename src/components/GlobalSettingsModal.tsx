import { X } from "lucide-react";

interface GlobalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSettingsModal({
  isOpen,
  onClose,
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
          <p>
            Advanced settings, themes, and special effects will be added here in
            the future.
          </p>
        </div>
      </div>
    </div>
  );
}
