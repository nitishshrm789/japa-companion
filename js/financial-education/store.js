(function createFinancialEducationStore() {
  "use strict";

  const STORAGE_KEY = "japa-financial-education-checklists-v1";

  function loadAll() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return value && typeof value === "object" && !Array.isArray(value)
        ? value
        : {};
    } catch (error) {
      return {};
    }
  }

  function saveAll(value) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  window.JapaFinancialEducationStore = {
    STORAGE_KEY: STORAGE_KEY,

    load(topicId) {
      const saved = loadAll()[topicId];
      return Array.isArray(saved) ? saved.slice() : [];
    },

    setChecked(topicId, itemIndex, checked) {
      const all = loadAll();
      const current = Array.isArray(all[topicId]) ? all[topicId].slice() : [];
      const key = String(itemIndex);
      const position = current.indexOf(key);

      if (checked && position === -1) {
        current.push(key);
      } else if (!checked && position !== -1) {
        current.splice(position, 1);
      }

      if (current.length) {
        all[topicId] = current;
      } else {
        delete all[topicId];
      }
      return saveAll(all);
    },

    clear(topicId) {
      const all = loadAll();
      delete all[topicId];
      return saveAll(all);
    },
  };
})();
