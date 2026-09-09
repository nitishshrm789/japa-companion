/**
 * Persists Srila Prabhupada book-reading bookmarks on this device.
 */
window.JapaBookStore = {
  KEY: "japa-book-reading-v1",

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) {
        return this.defaultEntries();
      }
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) {
        return this.defaultEntries();
      }
      return data
        .filter(function (entry) {
          return entry && typeof entry.id === "string";
        })
        .map(function (entry, index) {
          return {
            id: entry.id,
            bookName: String(entry.bookName || "").trim(),
            chapter: String(entry.chapter || "").trim(),
            link: String(entry.link || "").trim(),
            para: String(entry.para || "").trim(),
            order: typeof entry.order === "number" ? entry.order : index + 1,
          };
        })
        .sort(function (a, b) {
          return a.order - b.order;
        });
    } catch (error) {
      return this.defaultEntries();
    }
  },

  defaultEntries() {
    return [
      {
        id: "book-1",
        order: 1,
        bookName: "SP Lilamrita",
        chapter: '4: "How Shall I Serve You?"',
        link: "https://vedabase.io/en/library/spl/1/4/",
        para: "This transcendental knowledge, Abhay explained",
      },
      {
        id: "book-2",
        order: 2,
        bookName: "Bhagavad-gita As It Is",
        chapter: '6: "Dhyana-yoga" Text 7',
        link: "https://vedabase.io/en/library/bg/6/7/",
        para: "Actually, every living entity is intended",
      },
    ];
  },

  save(entries) {
    try {
      const normalized = entries.map(function (entry, index) {
        return {
          id: entry.id,
          order: index + 1,
          bookName: entry.bookName,
          chapter: entry.chapter,
          link: entry.link,
          para: entry.para,
        };
      });
      localStorage.setItem(this.KEY, JSON.stringify(normalized));
      return normalized;
    } catch (error) {
      return entries;
    }
  },

  createId() {
    return "book-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  },
};
