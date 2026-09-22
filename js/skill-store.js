/**
 * Persists learning skills on this device.
 */
window.JapaSkillStore = {
  KEY: "japa-skills-v1",

  STATUSES: [
    { value: "not-started", label: "Not Started" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
  ],

  statusLabel(value) {
    const match = this.STATUSES.find(function (item) {
      return item.value === value;
    });
    return match ? match.label : "Not Started";
  },

  normalizeStatus(value) {
    const allowed = this.STATUSES.map(function (item) {
      return item.value;
    });
    return allowed.indexOf(value) !== -1 ? value : "not-started";
  },

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
        .map(
          function (item) {
            return {
              id: item.id,
              skillName: String(item.skillName || "").trim(),
              targetDate: String(item.targetDate || "").trim(),
              learningLink: String(item.learningLink || "").trim(),
              status: this.normalizeStatus(item.status),
              createdAt:
                typeof item.createdAt === "number"
                  ? item.createdAt
                  : Date.now(),
            };
          }.bind(this)
        )
        .filter(function (item) {
          return item.skillName && item.targetDate;
        })
        .sort(function (a, b) {
          if (a.targetDate === b.targetDate) {
            return a.createdAt - b.createdAt;
          }
          return a.targetDate < b.targetDate ? -1 : 1;
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
    return "skill-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  },
};
