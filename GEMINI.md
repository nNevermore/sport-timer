# Pro Simple Timer - Project Goals & Guidelines

## Platform Support

This project aims to support multiple platforms from a single codebase using Tauri and Vite.
The target platforms are:

- **Desktop** (Windows, macOS, Linux)
- **Mobile** (iOS, Android - via PWA or Tauri Mobile)
- **TV** (Large screens, 10-foot UI)

## UI/UX Guidelines

- **Responsive Design**: The application must look perfect on various screen resolutions, from small phone screens to 4K TVs.
- **Adaptive Inputs**: Support mouse, touch (mobile), and keyboard navigation (for TV and Desktop power users).
- **Graceful Degradation**: Features like window dragging (`getCurrentWindow().startDragging()`) are specific to desktop environments and must be handled carefully on web/mobile to prevent crashes.

## Architecture

- **Object-Oriented Schemas**: The timer is based on an object-oriented schema builder. It compiles nested composite blocks (Loops, Sequences, Phases, WaitBlocks) into a flat array of executable phases.
- **Wait Blocks**: Some phases are open-ended and will count up until user interaction (e.g., Spacebar/Enter) proceeds to the next block.
