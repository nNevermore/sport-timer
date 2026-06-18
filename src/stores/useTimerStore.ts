import { create } from "zustand";

import {
  initAudio,
  playPhaseStartBeep,
  playCountdownBeep,
  speak,
} from "../utils/audio";
import type { ExecutablePhase } from "./timerSchema";
import {
  compileSchema,
  createDefaultSchema,
  createSetsSchema,
} from "./timerSchema";
import type { Phase } from "./types";

type SchemaMode = "default" | "sets" | "custom";

export type SoundProfile = "retro" | "soft" | "digital";

export interface TimerSettings {
  mode: SchemaMode;
  warmup: number;
  work: number;
  rest: number;
  cycles: number; // e.g. 8 cycles per set
  sets: number;
  setRest: number;
  cooldown: number;
  ttsEnabled: boolean;
  beepsEnabled: boolean;
  volume: number;
  soundProfiles: Record<Phase, SoundProfile>;
  ttsVolume: number;
  warningBeeps: number;
  isPremium: boolean;
}

export interface TimerState {
  settings: TimerSettings;
  currentPhase: Phase;
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  nextPhaseText: string;

  compiledPhases: ExecutablePhase[];
  currentPhaseIndex: number;
  elapsedWaitTime: number; // For WaitBlocks, counts up

  // Actions
  updateSettings: (newSettings: Partial<TimerSettings>) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: (deltaMs: number) => void;
  nextPhase: () => void; // Manual skip or proceed for WaitBlock
}

const defaultSettings: TimerSettings = {
  mode: "default",
  beepsEnabled: true,
  cooldown: 0,
  cycles: 8,
  rest: 10,
  sets: 1,
  setRest: 60,
  soundProfiles: {
    work: "digital",
    rest: "soft",
    warmup: "retro",
    cooldown: "soft",
    idle: "retro",
  },
  ttsEnabled: true,
  ttsVolume: 80,
  volume: 80,
  warmup: 10,
  work: 20,
  warningBeeps: 3,
  isPremium: true,
};

const LOCAL_STORAGE_KEY = "sport_timer_settings";

const loadSavedSettings = (): TimerSettings => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.isPremium === false) {
        return { ...defaultSettings, isPremium: false };
      }
      return { ...defaultSettings, ...parsed };
    }
  } catch (error) {
    console.error("Failed to load settings from localStorage", error);
  }
  return defaultSettings;
};

const buildPhases = (settings: TimerSettings): ExecutablePhase[] => {
  let schema;
  if (settings.mode === "default") {
    schema = createDefaultSchema(
      settings.warmup,
      settings.work,
      settings.rest,
      settings.cycles,
      settings.cooldown
    );
  } else if (settings.mode === "sets") {
    schema = createSetsSchema(
      settings.warmup,
      settings.work,
      settings.rest,
      settings.cycles,
      settings.sets,
      settings.setRest,
      settings.cooldown
    );
  } else {
    // Custom mode fallback to default for now
    schema = createDefaultSchema(
      settings.warmup,
      settings.work,
      settings.rest,
      settings.cycles,
      settings.cooldown
    );
  }
  return compileSchema(schema);
};

export const useTimerStore = create<TimerState>((set, get) => ({
  settings: loadSavedSettings(),
  currentPhase: "idle",
  timeRemaining: 0,
  isRunning: false,
  isPaused: false,
  nextPhaseText: "Ready to start",
  compiledPhases: [],
  currentPhaseIndex: -1,
  elapsedWaitTime: 0,

  pause: () => set((state) => ({ isPaused: !state.isPaused })),

  reset: () =>
    set({
      currentPhase: "idle",
      isPaused: false,
      isRunning: false,
      nextPhaseText: "Ready to start",
      timeRemaining: 0,
      compiledPhases: [],
      currentPhaseIndex: -1,
      elapsedWaitTime: 0,
    }),

  start: () => {
    const state = get();
    initAudio(); // Initialize audio context on first user interaction

    if (state.currentPhase === "idle" || !state.isRunning) {
      const phases = buildPhases(state.settings);

      if (phases.length === 0) {
        return;
      }

      const [firstPhase] = phases;
      const nextPhase = phases.length > 1 ? phases[1] : null;
      const nextText = nextPhase
        ? `Next: ${nextPhase.name}`
        : "Workout Complete!";

      set({
        compiledPhases: phases,
        currentPhaseIndex: 0,
        currentPhase: firstPhase.phaseType,
        isPaused: false,
        isRunning: true,
        nextPhaseText: nextText,
        timeRemaining: firstPhase.isWait ? 0 : firstPhase.durationSec * 1000,
        elapsedWaitTime: 0,
      });

      if (state.settings.beepsEnabled) {
        playPhaseStartBeep(
          state.settings.volume / 100,
          state.settings.soundProfiles[firstPhase.phaseType]
        );
      }
      speak(
        `${firstPhase.name} started`,
        state.settings.ttsEnabled,
        state.settings.ttsVolume / 100
      );
    } else if (state.isPaused) {
      set({ isPaused: false });
    }
  },

  nextPhase: () => {
    const state = get();
    if (!state.isRunning) {
      return;
    }

    const { settings, compiledPhases, currentPhaseIndex } = state;
    const nextIndex = currentPhaseIndex + 1;

    if (nextIndex < compiledPhases.length) {
      const nextPhase = compiledPhases[nextIndex];
      const upcomingPhase =
        nextIndex + 1 < compiledPhases.length
          ? compiledPhases[nextIndex + 1]
          : null;
      const nextText = upcomingPhase
        ? `Next: ${upcomingPhase.name}`
        : "Workout Complete!";

      set({
        currentPhaseIndex: nextIndex,
        currentPhase: nextPhase.phaseType,
        nextPhaseText: nextText,
        timeRemaining: nextPhase.isWait ? 0 : nextPhase.durationSec * 1000,
        elapsedWaitTime: 0,
      });

      if (settings.beepsEnabled) {
        playPhaseStartBeep(
          settings.volume / 100,
          settings.soundProfiles[nextPhase.phaseType]
        );
      }
      speak(nextPhase.name, settings.ttsEnabled, settings.ttsVolume / 100);
    } else {
      // Finished
      set({
        currentPhase: "idle",
        isPaused: false,
        isRunning: false,
        nextPhaseText: "Workout Complete!",
        timeRemaining: 0,
        currentPhaseIndex: -1,
        elapsedWaitTime: 0,
      });
      speak(
        "Workout complete. Great job!",
        settings.ttsEnabled,
        settings.ttsVolume / 100
      );
    }
  },

  tick: (deltaMs) => {
    const state = get();
    if (!state.isRunning || state.isPaused) {
      return;
    }

    const { compiledPhases, currentPhaseIndex } = state;
    if (currentPhaseIndex >= compiledPhases.length || currentPhaseIndex < 0) {
      return;
    }

    const currentExecPhase = compiledPhases[currentPhaseIndex];

    if (currentExecPhase.isWait) {
      // Wait block: count up
      set({ elapsedWaitTime: state.elapsedWaitTime + deltaMs });
      return;
    }

    // Normal countdown block
    const oldTimeSec = Math.ceil(state.timeRemaining / 1000);
    const newTime = state.timeRemaining - deltaMs;
    const newTimeSec = Math.ceil(newTime / 1000);

    // Play countdown beeps
    if (
      newTimeSec > 0 &&
      newTimeSec <= state.settings.warningBeeps &&
      newTimeSec < oldTimeSec
    ) {
      if (state.settings.beepsEnabled) {
        const nextIndex = state.currentPhaseIndex + 1;
        const upcomingPhase =
          nextIndex < state.compiledPhases.length
            ? state.compiledPhases[nextIndex]
            : null;
        const beepProfile = upcomingPhase
          ? state.settings.soundProfiles[upcomingPhase.phaseType]
          : state.settings.soundProfiles[state.currentPhase];

        playCountdownBeep(state.settings.volume / 100, beepProfile);
      }
    }

    if (newTime <= 0) {
      state.nextPhase();
    } else {
      set({ timeRemaining: newTime });
    }
  },

  updateSettings: (newSettings) =>
    set((state) => {
      const updatedSettings = { ...state.settings, ...newSettings };
      try {
        if (updatedSettings.isPremium) {
          localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify(updatedSettings)
          );
        } else {
          // Only save the premium flag so it remains false on next boot
          localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify({ isPremium: false })
          );
        }
      } catch (error) {
        console.error("Failed to save settings to localStorage", error);
      }
      return { settings: updatedSettings };
    }),
}));
