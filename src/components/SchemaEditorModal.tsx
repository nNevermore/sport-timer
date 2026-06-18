import { X } from "lucide-react";

interface SchemaEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SchemaEditorModal({ isOpen, onClose }: SchemaEditorModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fullscreen-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Schema Editor</h2>
          <button className="icon-btn" onClick={onClose} title="Close">
            <X size={24} />
          </button>
        </div>
        <div className="modal-body">
          <p>Visual Drag & Drop builder will be implemented here.</p>
        </div>
      </div>
    </div>
  );
}
