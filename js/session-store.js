/**
 * Saves / loads japa session on this device (survives leaving the page).
 */
window.JapaSessionStore = {
  KEY: "japa-chanting-session-v1",

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) {
        return null;
      }

      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.rounds)) {
        return null;
      }

      return {
        rounds: data.rounds
          .filter(function (round) {
            return (
              round &&
              typeof round.id === "string" &&
              typeof round.elapsedMs === "number" &&
              round.elapsedMs > 0
            );
          })
          .slice(0, window.JapaRounds.MAX_ROUNDS),
        currentElapsedMs:
          typeof data.currentElapsedMs === "number" && data.currentElapsedMs > 0
            ? data.currentElapsedMs
            : 0,
      };
    } catch (error) {
      return null;
    }
  },

  save(rounds, currentElapsedMs) {
    try {
      localStorage.setItem(
        this.KEY,
        JSON.stringify({
          rounds: rounds,
          currentElapsedMs: Math.max(0, currentElapsedMs || 0),
          updatedAt: Date.now(),
        })
      );
    } catch (error) {
      // Ignore quota / private-mode write failures.
    }
  },

  clear() {
    try {
      localStorage.removeItem(this.KEY);
    } catch (error) {
      // Ignore.
    }
  },
};
