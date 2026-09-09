/**
 * Persists personality notes on this device.
 * Each entry: name + ordered list of points.
 */
window.JapaPersonalitiesStore = {
  KEY: "japa-personalities-v1",

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
          const points = Array.isArray(entry.points)
            ? entry.points
                .map(function (point) {
                  return String(point || "").trim();
                })
                .filter(Boolean)
            : [];
          return {
            id: entry.id,
            name: String(entry.name || "").trim(),
            points: points,
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
          name: entry.name,
          points: Array.isArray(entry.points)
            ? entry.points
                .map(function (point) {
                  return String(point || "").trim();
                })
                .filter(Boolean)
            : [],
        };
      });
      localStorage.setItem(this.KEY, JSON.stringify(normalized));
      return normalized;
    } catch (error) {
      return entries;
    }
  },

  createId() {
    return "person-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  },
};
