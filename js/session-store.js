/**
 * Saves / loads main + extra japa sessions on this device.
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

      function cleanRounds(list, max) {
        const cleaned = (list || [])
          .filter(function (round) {
            return (
              round &&
              typeof round.id === "string" &&
              typeof round.elapsedMs === "number" &&
              round.elapsedMs > 0
            );
          });
        return typeof max === "number" ? cleaned.slice(0, max) : cleaned;
      }

      return {
        rounds: cleanRounds(data.rounds, window.JapaRounds.MAX_ROUNDS),
        currentElapsedMs:
          typeof data.currentElapsedMs === "number" && data.currentElapsedMs > 0
            ? data.currentElapsedMs
            : 0,
        extraRounds: cleanRounds(data.extraRounds),
        extraElapsedMs:
          typeof data.extraElapsedMs === "number" && data.extraElapsedMs > 0
            ? data.extraElapsedMs
            : 0,
      };
    } catch (error) {
      return null;
    }
  },

  save(payload) {
    try {
      localStorage.setItem(
        this.KEY,
        JSON.stringify({
          rounds: payload.rounds || [],
          currentElapsedMs: Math.max(0, payload.currentElapsedMs || 0),
          extraRounds: payload.extraRounds || [],
          extraElapsedMs: Math.max(0, payload.extraElapsedMs || 0),
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
