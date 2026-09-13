/**
 * Persists Health habits / check-ins on this device.
 * Completed items are removed from the active list.
 */
window.JapaHealthStore = {
  KEY: "japa-health-v1",

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
          return {
            id: item.id,
            name: String(item.name || "").trim(),
            dateKey: String(item.dateKey || "").trim(),
            type: item.type === "weekly" ? "weekly" : "daily",
            notes: String(item.notes || "").trim(),
            createdAt:
              typeof item.createdAt === "number" ? item.createdAt : Date.now(),
          };
        })
        .filter(function (item) {
          return item.name && item.dateKey;
        })
        .sort(function (a, b) {
          if (a.dateKey === b.dateKey) {
            return a.createdAt - b.createdAt;
          }
          return a.dateKey < b.dateKey ? -1 : 1;
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
    return "health-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  },
};
