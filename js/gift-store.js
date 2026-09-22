/**
 * Persists gift ideas / plans on this device.
 */
window.JapaGiftStore = {
  KEY: "japa-gift-list-v1",

  STATUSES: [
    { value: "planned", label: "📝 Planned" },
    { value: "to-buy", label: "🛒 To Buy" },
    { value: "purchased", label: "🟡 Purchased" },
    { value: "gifted", label: "🎁 Gifted" },
    { value: "cancelled", label: "❌ Cancelled" },
  ],

  statusLabel(value) {
    const match = this.STATUSES.find(function (item) {
      return item.value === value;
    });
    return match ? match.label : "📝 Planned";
  },

  normalizeStatus(value) {
    const allowed = this.STATUSES.map(function (item) {
      return item.value;
    });
    return allowed.indexOf(value) !== -1 ? value : "planned";
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
              giftName: String(item.giftName || "").trim(),
              forWhom: String(item.forWhom || "").trim(),
              occasion: String(item.occasion || "").trim(),
              budget: String(item.budget || "").trim(),
              giftDate: String(item.giftDate || "").trim(),
              status: this.normalizeStatus(item.status),
              createdAt:
                typeof item.createdAt === "number"
                  ? item.createdAt
                  : Date.now(),
            };
          }.bind(this)
        )
        .filter(function (item) {
          return item.giftName && item.giftDate;
        })
        .sort(function (a, b) {
          if (a.giftDate === b.giftDate) {
            return a.createdAt - b.createdAt;
          }
          return a.giftDate < b.giftDate ? -1 : 1;
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
    return "gift-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  },
};
