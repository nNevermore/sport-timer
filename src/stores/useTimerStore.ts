import { create } from "zustand";

import {
  initAudio,
  playPhaseStartBeep,
  playCountdownBeep,
  speak,
} from "../utils/audio";

export type Phase = "warmup" | "work" | "rest" | "cooldown" | "idle";

export interface TimerSettings {
  warmup: number;
  work: number;
  rest: number;
  cycles: number; // e.g. 8 cycles per set
  sets: number;
  cooldown: number;
  ttsEnabled: boolean;
  beepsEnabled: boolean;
  volume: number;
  soundProfile: "retro" | "soft" | "digital";
  ttsVolume: number;
  warningBeeps: number;
}

export interface TimerState {
  settings: TimerSettings;
  currentPhase: Phase;
  timeRemaining: number;
  currentCycle: number;
  currentSet: number;
  isRunning: boolean;
  isPaused: boolean;
  nextPhaseText: string;

  // Actions
  updateSettings: (newSettings: Partial<TimerSettings>) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: (deltaMs: number) => void;
}

const defaultSettings: TimerSettings = {
  beepsEnabled: true,
  cooldown: 0,
  cycles: 8,
  rest: 10,
  sets: 1,
  soundProfile: "retro",
  ttsEnabled: true,
  ttsVolume: 80,
  volume: 80,
  warmup: 10,
  work: 20,
  warningBeeps: 3,
};

const LOCAL_STORAGE_KEY = "sport_timer_settings";

const loadSavedSettings = (): TimerSettings => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error("Failed to load settings from localStorage", error);
  }
  return defaultSettings;
};

export const useTimerStore = create<TimerState>((set, get) => ({
  currentCycle: 1,
  currentPhase: "idle",
  currentSet: 1,
  isPaused: false,
  isRunning: false,
  nextPhaseText: "Ready to start",
  pause: () => set({ isPaused: true }),
  reset: () =>
    set({
      currentCycle: 1,
      currentPhase: "idle",
      currentSet: 1,
      isPaused: false,
      isRunning: false,
      nextPhaseText: "Ready to start",
      timeRemaining: 0,
    }),
  settings: loadSavedSettings(),
  start: () => {
    const state = get();
    initAudio(); // Initialize audio context on first user interaction

    if (state.currentPhase === "idle" || !state.isRunning) {
      let initialPhase: Phase = "work";
      let initialTime = state.settings.work;

      if (state.settings.warmup > 0) {
        initialPhase = "warmup";
        initialTime = state.settings.warmup;
      }

      set({
        currentCycle: 1,
        currentPhase: initialPhase,
        currentSet: 1,
        isPaused: false,
        isRunning: true,
        nextPhaseText: initialPhase === "warmup" ? "Next: Work" : "Next: Rest",
        timeRemaining: initialTime * 1000,
      });

      if (state.settings.beepsEnabled) {
        playPhaseStartBeep(
          state.settings.volume / 100,
          state.settings.soundProfile
        );
      }
      speak(
        `${initialPhase} started`,
        state.settings.ttsEnabled,
        state.settings.ttsVolume / 100
      );
    } else if (state.isPaused) {
      set({ isPaused: false });
    }
  },
  tick: (deltaMs) => {
    const state = get();
    if (!state.isRunning || state.isPaused) {
      return;
    }

    const oldTimeSec = Math.ceil(state.timeRemaining / 1000);
    const newTime = state.timeRemaining - deltaMs;
    const newTimeSec = Math.ceil(newTime / 1000);

    // Play countdown beeps based on settings (0 to 5 beeps)
    if (
      newTimeSec > 0 &&
      newTimeSec <= state.settings.warningBeeps &&
      newTimeSec < oldTimeSec
    ) {
      if (state.settings.beepsEnabled) {
        playCountdownBeep(
          state.settings.volume / 100,
          state.settings.soundProfile
        );
      }
    }

    if (newTime <= 0) {
      const { settings, currentPhase, currentCycle, currentSet } = state;

      let nextPhase: Phase = "idle";
      let nextTime = 0;
      let nextCycle = currentCycle;
      let nextSet = currentSet;
      let nextText = "";

      if (currentPhase === "warmup") {
        nextPhase = "work";
        nextTime = settings.work;
        nextText = "Next: Rest";
      } else if (currentPhase === "work") {
        if (currentCycle < settings.cycles) {
          nextPhase = "rest";
          nextTime = settings.rest;
          nextText = "Next: Work";
        } else if (currentSet < settings.sets) {
          nextPhase = "rest";
          nextTime = settings.rest;
          nextText = `Next: Set ${currentSet + 1}`;
        } else if (settings.cooldown > 0) {
          nextPhase = "cooldown";
          nextTime = settings.cooldown;
          nextText = "Almost done!";
        } else {
          nextPhase = "idle";
          nextTime = 0;
          nextText = "Workout Complete!";
        }
      } else if (currentPhase === "rest") {
        if (currentCycle < settings.cycles) {
          nextPhase = "work";
          nextTime = settings.work;
          nextCycle++;
          nextText = "Next: Rest";
        } else if (currentSet < settings.sets) {
          nextPhase = "work";
          nextTime = settings.work;
          nextCycle = 1;
          nextSet++;
          nextText = "Next: Rest";
        }
      } else if (currentPhase === "cooldown") {
        nextPhase = "idle";
        nextTime = 0;
        nextText = "Workout Complete!";
      }

      if (nextPhase === "idle") {
        set({
          currentPhase: nextPhase,
          isPaused: false,
          isRunning: false,
          nextPhaseText: nextText,
          timeRemaining: 0,
        });
        speak(
          "Workout complete. Great job!",
          settings.ttsEnabled,
          settings.ttsVolume / 100
        );
      } else {
        set({
          currentCycle: nextCycle,
          currentPhase: nextPhase,
          currentSet: nextSet,
          nextPhaseText: nextText,
          timeRemaining: nextTime * 1000 + newTime,
        });
        if (settings.beepsEnabled) {
          playPhaseStartBeep(settings.volume / 100, settings.soundProfile);
        }
        speak(nextPhase, settings.ttsEnabled, settings.ttsVolume / 100);
      }
    } else {
      set({ timeRemaining: newTime });
    }
  },
  timeRemaining: 0,
  updateSettings: (newSettings) =>
    set((state) => {
      const updatedSettings = { ...state.settings, ...newSettings };
      try {
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify(updatedSettings)
        );
      } catch (error) {
        console.error("Failed to save settings to localStorage", error);
      }
      return { settings: updatedSettings };
    }),
}));
