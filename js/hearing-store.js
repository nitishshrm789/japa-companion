/**
 * Persists lecture / class hearing bookmarks on this device.
 */
window.JapaHearingStore = {
  KEY: "japa-hearing-v1",

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) {
        return this.defaultEntries();
      }
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) {
        return this.defaultEntries();
      }
      return data
        .filter(function (entry) {
          return entry && typeof entry.id === "string";
        })
        .map(function (entry, index) {
          return {
            id: entry.id,
            lectureName: String(entry.lectureName || "").trim(),
            link: String(entry.link || "").trim(),
            timeStamp: String(entry.timeStamp || "").trim(),
            order: typeof entry.order === "number" ? entry.order : index + 1,
          };
        })
        .sort(function (a, b) {
          return a.order - b.order;
        });
    } catch (error) {
      return this.defaultEntries();
    }
  },

  defaultEntries() {
    return [
      {
        id: "hear-1",
        order: 1,
        lectureName: "Srila Prabhupada — Perfect Questions, Perfect Answers",
        link: "https://vedabase.io/en/library/pqpa/",
        timeStamp: "12:45",
      },
      {
        id: "hear-2",
        order: 2,
        lectureName: "Bg 7.1 — Knowledge of the Absolute",
        link: "https://vedabase.io/en/library/bg/7/1/",
        timeStamp: "05:20",
      },
      {
        id: "hear-3",
        order: 3,
        lectureName: "SB 1.1.1 — Invocation class",
        link: "https://vedabase.io/en/library/sb/1/1/1/",
        timeStamp: "23:10",
      },
    ];
  },

  save(entries) {
    try {
      const normalized = entries.map(function (entry, index) {
        return {
          id: entry.id,
          order: index + 1,
          lectureName: entry.lectureName,
          link: entry.link,
          timeStamp: entry.timeStamp,
        };
      });
      localStorage.setItem(this.KEY, JSON.stringify(normalized));
      return normalized;
    } catch (error) {
      return entries;
    }
  },

  createId() {
    return "hear-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  },
};
