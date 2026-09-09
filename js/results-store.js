/**
 * Rolling 7-day daily japa results (one entry per calendar date).
 * Stores main rounds (1-16) and optional extra rounds (17+).
 */
window.JapaResultsStore = {
  KEY: "japa-chanting-results-v1",
  MAX_DAYS: 7,

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) {
        return [];
      }
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) {
        return [];
      }
      return data
        .filter(function (day) {
          return (
            day &&
            typeof day.dateKey === "string" &&
            Array.isArray(day.rounds) &&
            (day.rounds.length > 0 ||
              (Array.isArray(day.extraRounds) && day.extraRounds.length > 0))
          );
        })
        .sort(function (a, b) {
          return a.dateKey < b.dateKey ? 1 : a.dateKey > b.dateKey ? -1 : 0;
        })
        .slice(0, this.MAX_DAYS);
    } catch (error) {
      return [];
    }
  },

  saveAll(days) {
    try {
      localStorage.setItem(
        this.KEY,
        JSON.stringify(days.slice(0, this.MAX_DAYS))
      );
    } catch (error) {
      // Ignore quota / private-mode write failures.
    }
  },

  /**
   * Save or replace today's day. Keeps only the newest 7 dates.
   */
  upsertToday(mainRounds, extraRounds) {
    const main = Array.isArray(mainRounds) ? mainRounds : [];
    const extra = Array.isArray(extraRounds) ? extraRounds : [];

    if (main.length === 0 && extra.length === 0) {
      return { ok: false, reason: "empty" };
    }

    const dateKey = window.JapaTime.getLocalDateKey();
    const allForTotal = main.concat(extra);
    const snapshot = {
      dateKey: dateKey,
      savedAt: Date.now(),
      roundCount: main.length,
      extraCount: extra.length,
      totalMs: window.JapaTime.sumElapsed(allForTotal),
      rounds: main.map(function (round) {
        return { elapsedMs: round.elapsedMs };
      }),
      extraRounds: extra.map(function (round) {
        return { elapsedMs: round.elapsedMs };
      }),
    };

    const days = this.load().filter(function (day) {
      return day.dateKey !== dateKey;
    });

    days.unshift(snapshot);
    days.sort(function (a, b) {
      return a.dateKey < b.dateKey ? 1 : a.dateKey > b.dateKey ? -1 : 0;
    });

    const trimmed = days.slice(0, this.MAX_DAYS);
    this.saveAll(trimmed);

    return { ok: true, day: snapshot, days: trimmed, replaced: true };
  },
};
