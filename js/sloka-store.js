/**
 * Persists personal sloka collection on this device.
 */
window.JapaSlokaStore = {
  KEY: "japa-slokas-v1",

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
            sloka: String(item.sloka || "").trim(),
            purport: String(item.purport || "").trim(),
            link: String(item.link || "").trim(),
            createdAt:
              typeof item.createdAt === "number" ? item.createdAt : Date.now(),
          };
        })
        .filter(function (item) {
          return item.name && item.sloka;
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
    return "sloka-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  },
};
