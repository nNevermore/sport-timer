import { Settings, Volume2 } from "lucide-react";
import type { RefObject } from "react";

interface SidebarProps {
  configOpen: boolean;
  soundOpen: boolean;
  setConfigOpen: (val: boolean) => void;
  setSoundOpen: (val: boolean) => void;
  sidebarRef: RefObject<HTMLDivElement | null>;
}

export function Sidebar({
  configOpen,
  soundOpen,
  setConfigOpen,
  setSoundOpen,
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
  );
}
