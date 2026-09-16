(function createFinancialEducationRegistry() {
  "use strict";

  const topics = [];
  const ids = {};

  function normalizeList(values) {
    return Array.isArray(values)
      ? values.map(function (value) {
          return String(value).trim();
        }).filter(Boolean)
      : [];
  }

  window.JapaFinancialEducation = {
    register(topic) {
      if (!topic || !topic.id || ids[topic.id]) {
        throw new Error("Financial education topic needs a unique id.");
      }

      const entry = {
        id: String(topic.id),
        icon: String(topic.icon || "₹"),
        title: String(topic.title || ""),
        description: String(topic.description || ""),
        introduction: String(topic.introduction || ""),
        remember: normalizeList(topic.remember),
        why: String(topic.why || ""),
        mistakes: normalizeList(topic.mistakes),
        checklist: normalizeList(topic.checklist),
        extraTitle: topic.extraTitle ? String(topic.extraTitle) : "",
        extra: normalizeList(topic.extra),
        note: String(
          topic.note ||
            "This is general educational information, not personalized financial advice. Financial decisions depend on individual circumstances."
        ),
      };

      if (
        !entry.title ||
        !entry.description ||
        !entry.introduction ||
        entry.remember.length < 5 ||
        !entry.why ||
        entry.mistakes.length < 3 ||
        entry.checklist.length < 1
      ) {
        throw new Error("Incomplete financial education topic: " + entry.id);
      }

      ids[entry.id] = true;
      topics.push(entry);
      return entry;
    },

    getTopics() {
      return topics.slice();
    },

    getTopic(id) {
      return topics.find(function (topic) {
        return topic.id === id;
      }) || null;
    },
  };
})();
