let timerId: ReturnType<typeof setInterval> | null = null;
let lastTickTime = 0;

self.addEventListener("message", (e) => {
  if (e.data === "start") {
    if (!timerId) {
      lastTickTime = performance.now();
      // Check every 100ms
      timerId = setInterval(() => {
        const now = performance.now();
        const deltaMs = now - lastTickTime;
        lastTickTime = now;
        self.postMessage({ deltaMs, type: "tick" });
      }, 100);
    }
  } else if (e.data === "stop") {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }
});
