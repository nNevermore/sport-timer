# Pro Simple Timer

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.0-blue)
![Tauri](https://img.shields.io/badge/Tauri-2.0-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

A modern, highly customizable desktop interval timer built with [Tauri](https://tauri.app/), [React](https://reactjs.org/), and [TypeScript](https://www.typescriptlang.org/). Designed specifically for focused interval training, Pomodoro sessions, and workouts, it features a sleek dark UI, custom sound profiles, Text-to-Speech (TTS) announcements, and a native-feeling "Mini Mode".

## 🚀 Features

- **Interval Training & Pomodoro**: Configure work time, rest time, cycles, and warm-ups with second-level precision.
- **Dynamic Mini Mode**: Easily switch to a floating, borderless widget in the top-right corner of your screen—perfect for tracking time while working or watching a video. The widget can be dragged by clicking and holding anywhere on its body.
- **Audio Profiles & Countdown**: Choose between Retro Beep, Soft Pip, or Digital Alert. Customize the number of countdown warning beeps (from 0 to 5) played before a phase ends.
- **Text-to-Speech (TTS)**: Voice announcements for phase changes and cycle progress.
- **Auto-Closing Panels**: Sidebar settings panels (Timer Settings & Sound Settings) close automatically when clicking anywhere outside of them.
- **Persistent Settings**: All configurations are automatically saved and restored when the application is reopened.
- **Resource Efficient**: Uses a dedicated Web Worker for accurate, drift-free background ticking, powered by Tauri's lightweight Rust backend.

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Pure CSS with a modern glassmorphism and neon-glow dark theme
- **State Management**: Zustand
- **Icons**: Lucide React
- **Backend / Desktop runtime**: Rust & Tauri v2

## 📦 Installation & Build

### Prerequisites

Make sure you have installed all necessary dependencies for Tauri development:

- [Node.js](https://nodejs.org/) (v18 or newer)
- [Rust](https://www.rust-lang.org/)
- OS-specific build tools (C++ build tools on Windows, `build-essential` on Linux, etc.)

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/pro-simple-timer.git
   cd pro-simple-timer
   ```

2. Install NPM dependencies:
   ```bash
   npm install
   ```

### Development

To run the app in development mode with Hot-Module Replacement (HMR):

```bash
npm run tauri dev
```

### 🧹 Code Quality & Formatting

The project uses modern, extremely fast tools for linting, formatting, type checking, and dependency verification:

- **Check all code quality** (linter, types, formatting, dependencies):
  ```bash
  npm run check
  ```
- **Automatically fix styling & formatting issues** (uses `ultracite`):
  ```bash
  npm run fix
  ```
- **Lint files** (uses Rust-powered `oxlint`):
  ```bash
  npm run lint:oxlint
  ```
- **Type-check TypeScript**:
  ```bash
  npm run check:types
  ```
- **Analyze unused dependencies** (uses `knip`):
  ```bash
  npm run check:deps
  ```

### Building for Production

To compile and build the installer (e.g., `.msix` on Windows):

```bash
npm run build:msix
```

_Note: The project uses a custom Node script to bypass default bundling and manually generate an MSIX package for a cleaner start-menu footprint._

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Bartosz Wójtowicz**
