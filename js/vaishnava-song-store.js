/**
 * Persists Vaishnava songs on this device.
 */
window.JapaVaishnavaSongStore = {
  KEY: "japa-vaishnava-songs-v1",

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
            song: String(item.song || "").trim(),
            link: String(item.link || "").trim(),
            createdAt:
              typeof item.createdAt === "number" ? item.createdAt : Date.now(),
          };
        })
        .filter(function (item) {
          return item.name && item.song;
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
    return "vsong-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  },
};
