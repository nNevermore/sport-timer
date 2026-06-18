import { Settings2, Volume2, Settings, Layers } from "lucide-react";
import type { RefObject } from "react";

interface SidebarProps {
  configOpen: boolean;
  soundOpen: boolean;
  setConfigOpen: (val: boolean) => void;
  setSoundOpen: (val: boolean) => void;
  openGlobalSettings: () => void;
  openSchemaEditor: () => void;
  sidebarRef: RefObject<HTMLDivElement | null>;
}

export function Sidebar({
  configOpen,
  soundOpen,
  setConfigOpen,
  setSoundOpen,
  openGlobalSettings,
  openSchemaEditor,
  sidebarRef,
}: SidebarProps) {
  return (
    <div className="sidebar" ref={sidebarRef}>
      <div
        className={`icon-btn ${configOpen ? "active" : ""}`}
        onClick={() => {
          setConfigOpen(!configOpen);
          setSoundOpen(false);
        }}
        title="Timer Setup"
      >
        <Settings2 size={24} />
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

      <div className="sidebar-bottom-group">
        <div
          className="icon-btn"
          onClick={() => {
            setConfigOpen(false);
            setSoundOpen(false);
            openSchemaEditor();
          }}
          title="Schema Editor"
        >
          <Layers size={24} />
        </div>
        <div
          className="icon-btn"
          onClick={() => {
            setConfigOpen(false);
            setSoundOpen(false);
            openGlobalSettings();
          }}
          title="Global Settings"
        >
          <Settings size={24} />
        </div>
      </div>
    </div>
  );
}
