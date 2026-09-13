/**
 * Persists Financial planning items on this device.
 */
window.JapaFinancialStore = {
  KEY: "japa-financial-v1",

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
          const links = Array.isArray(item.links)
            ? item.links
                .map(function (link) {
                  return String(link || "").trim();
                })
                .filter(Boolean)
            : [];
          const details =
            item.details && typeof item.details === "object"
              ? {
                  startDateKey: String(item.details.startDateKey || "").trim(),
                  endDateKey: String(item.details.endDateKey || "").trim(),
                  dailyAmount: Math.max(0, Number(item.details.dailyAmount) || 0),
                  moreDetails: String(item.details.moreDetails || "").trim(),
                }
              : null;
          const hasDetails = Boolean(
            details &&
              details.startDateKey &&
              details.endDateKey &&
              details.dailyAmount > 0
          );
          return {
            id: item.id,
            financeType: String(item.financeType || "").trim(),
            name: String(item.name || "").trim(),
            links: links,
            notes: String(item.notes || "").trim(),
            details: hasDetails ? details : null,
            createdAt:
              typeof item.createdAt === "number" ? item.createdAt : Date.now(),
          };
        })
        .filter(function (item) {
          return item.financeType && item.name;
        })
        .sort(function (a, b) {
          if (a.financeType === b.financeType) {
            return a.createdAt - b.createdAt;
          }
          return a.financeType < b.financeType ? -1 : 1;
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
    return "fin-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  },
};
