/**
 * Persists Expense Manager cash-in / cash-out entries.
 */
window.JapaExpenseStore = {
  KEY: "japa-expense-manager-v1",

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
        .map(function (entry) {
          const type = entry.type === "out" ? "out" : "in";
          const amount = Math.max(0, Number(entry.amount) || 0);
          return {
            id: entry.id,
            type: type,
            dateKey: String(entry.dateKey || "").trim(),
            time: String(entry.time || "").trim(),
            amount: amount,
            notes: String(entry.notes || "").trim(),
            createdAt:
              typeof entry.createdAt === "number" ? entry.createdAt : Date.now(),
          };
        })
        .filter(function (entry) {
          return entry.dateKey && entry.amount > 0;
        })
        .sort(function (a, b) {
          if (a.dateKey !== b.dateKey) {
            return a.dateKey < b.dateKey ? 1 : -1;
          }
          if (a.time !== b.time) {
            return a.time < b.time ? 1 : -1;
          }
          return b.createdAt - a.createdAt;
        });
    } catch (error) {
      return [];
    }
  },

  save(entries) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(entries || []));
      return entries;
    } catch (error) {
      return entries;
    }
  },

  createId() {
    return "exp-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  },
};
