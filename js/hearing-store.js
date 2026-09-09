/**
 * Persists lecture / class hearing bookmarks on this device.
 */
window.JapaHearingStore = {
  KEY: "japa-hearing-v2",

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
      return [];
    }
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
