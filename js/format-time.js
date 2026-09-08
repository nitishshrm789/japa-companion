/**
 * Formats elapsed milliseconds as MM:SS (or H:MM:SS when needed).
 */
window.JapaTime = {
  formatElapsed(ms) {
    const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");

    if (hours > 0) {
      return `${hours}:${mm}:${ss}`;
    }

    return `${mm}:${ss}`;
  },

  formatRoundLabel(roundNumber, elapsedMs) {
    return `Round ${roundNumber} --> ${this.formatElapsed(elapsedMs)} min`;
  },
};
