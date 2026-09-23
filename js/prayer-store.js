/**
 * Persists personal prayers on this device.
 */
window.JapaPrayerStore = {
  KEY: "japa-prayers-v1",

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
            prayer: String(item.prayer || "").trim(),
            link: String(item.link || "").trim(),
            createdAt:
              typeof item.createdAt === "number" ? item.createdAt : Date.now(),
          };
        })
        .filter(function (item) {
          return item.name && item.prayer;
        })
        .sort(function (a, b) {
          return a.createdAt - b.createdAt;
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
    return "prayer-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  },
};
