/**
 * Persists My Progress goals on this device.
 */
window.JapaProgressStore = {
  KEY: "japa-my-progress-v1",

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
        .filter(function (item) {
          return item && typeof item.id === "string";
        })
        .map(function (item) {
          const totalParts = Math.max(
            1,
            Number(item.totalParts) || 1
          );
          const partsRead = Math.max(
            0,
            Math.min(totalParts, Number(item.partsRead) || 0)
          );
          return {
            id: item.id,
            name: String(item.name || "").trim(),
            totalParts: totalParts,
            completeDateKey: String(item.completeDateKey || "").trim(),
            partsRead: partsRead,
            createdAt:
              typeof item.createdAt === "number" ? item.createdAt : Date.now(),
          };
        })
        .filter(function (item) {
          return item.name && item.completeDateKey;
        })
        .sort(function (a, b) {
          if (a.completeDateKey === b.completeDateKey) {
            return a.createdAt - b.createdAt;
          }
          return a.completeDateKey < b.completeDateKey ? -1 : 1;
        });
    } catch (error) {
      return [];
    }
  },

  save(items) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(items || []));
      return items;
    } catch (error) {
      return items;
    }
  },

  createId() {
    return "progress-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  },
};
