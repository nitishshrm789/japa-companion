/**
 * Saves / loads main + extra japa sessions on this device.
 */
window.JapaSessionStore = {
  KEY: "japa-chanting-session-v2",

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) {
        return this.loadLegacy();
      }

      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.rounds)) {
        return null;
      }

      function cleanRounds(list, max) {
        const cleaned = (list || []).filter(function (round) {
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
        mainRunning: Boolean(data.mainRunning),
        mainStartedAt:
          typeof data.mainStartedAt === "number" ? data.mainStartedAt : 0,
        extraRounds: cleanRounds(data.extraRounds),
        extraElapsedMs:
          typeof data.extraElapsedMs === "number" && data.extraElapsedMs > 0
            ? data.extraElapsedMs
            : 0,
        extraRunning: Boolean(data.extraRunning),
        extraStartedAt:
          typeof data.extraStartedAt === "number" ? data.extraStartedAt : 0,
      };
    } catch (error) {
      return null;
    }
  },

  loadLegacy() {
    try {
      const raw = localStorage.getItem("japa-chanting-session-v1");
      if (!raw) {
        return null;
      }
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.rounds)) {
        return null;
      }
      return {
        rounds: data.rounds,
        currentElapsedMs: data.currentElapsedMs || 0,
        mainRunning: false,
        mainStartedAt: 0,
        extraRounds: data.extraRounds || [],
        extraElapsedMs: data.extraElapsedMs || 0,
        extraRunning: false,
        extraStartedAt: 0,
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
          mainRunning: Boolean(payload.mainRunning),
          mainStartedAt: Math.max(0, payload.mainStartedAt || 0),
          extraRounds: payload.extraRounds || [],
          extraElapsedMs: Math.max(0, payload.extraElapsedMs || 0),
          extraRunning: Boolean(payload.extraRunning),
          extraStartedAt: Math.max(0, payload.extraStartedAt || 0),
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
      localStorage.removeItem("japa-chanting-session-v1");
    } catch (error) {
      // Ignore.
    }
  },
};
