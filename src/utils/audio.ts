// Simple wrapper for Web Speech API and Web Audio API

let audioCtx: AudioContext | null = null;

export function initAudio() {
  if (!audioCtx) {
    audioCtx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function playBeep(
  frequency = 440,
  type: OscillatorType = "sine",
  duration = 0.2,
  volume = 0.5
) {
  if (!audioCtx) {
    initAudio();
  } else if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  if (!audioCtx) {
    return;
  }

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioCtx.currentTime + duration
  );

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);

  // Disconnect nodes after playing to prevent WebKit audio engine leaks
  setTimeout(() => {
    try {
      oscillator.disconnect();
      gainNode.disconnect();
    } catch (e) {
      // Ignore errors if context was already closed
    }
  }, (duration + 0.1) * 1000);
}

interface BeepConfig {
  frequency: number;
  type: OscillatorType;
  duration: number;
}

function getBeepSettings(
  profile: "retro" | "soft" | "digital",
  type: "countdown" | "start"
): BeepConfig {
  if (profile === "soft") {
    return type === "countdown"
      ? { duration: 0.08, frequency: 800, type: "sine" }
      : { duration: 0.25, frequency: 800, type: "sine" };
  } else if (profile === "digital") {
    return type === "countdown"
      ? { duration: 0.12, frequency: 900, type: "triangle" }
      : { duration: 0.4, frequency: 1200, type: "triangle" };
  }
  // default/retro
  return type === "countdown"
    ? { duration: 0.1, frequency: 600, type: "square" }
    : { duration: 0.5, frequency: 1000, type: "square" };
}

export function playCountdownBeep(
  volume = 0.5,
  profile: "retro" | "soft" | "digital" = "retro"
) {
  const cfg = getBeepSettings(profile, "countdown");
  playBeep(cfg.frequency, cfg.type, cfg.duration, volume);
}

export function playPhaseStartBeep(
  volume = 0.8,
  profile: "retro" | "soft" | "digital" = "retro"
) {
  const cfg = getBeepSettings(profile, "start");
  playBeep(cfg.frequency, cfg.type, cfg.duration, volume);
}

export function speak(text: string, enabled: boolean, volume = 0.8) {
  if (!enabled || !window.speechSynthesis) {
    return;
  }

  try {
    // On Linux/WebKitGTK, speechSynthesis.cancel() is known to deadlock the media pipeline
    // due to issues in speech-dispatcher. We bypass cancel() on Linux.
    const isLinux = navigator.userAgent.toLowerCase().includes("linux");
    if (!isLinux) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1.1; // slightly faster for workouts
    utterance.volume = volume;

    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.warn("Speech synthesis failed:", error);
  }
}
