/**
 * Persists To Do List tasks on this device.
 */
window.JapaTodoStore = {
  KEY: "japa-todo-list-v1",

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
        .filter(function (task) {
          return (
            task &&
            typeof task.id === "string" &&
            typeof task.text === "string" &&
            typeof task.dateKey === "string"
          );
        })
        .map(function (task) {
          return {
            id: task.id,
            text: String(task.text || "").trim(),
            dateKey: String(task.dateKey || "").trim(),
            startTime: String(task.startTime || "").trim(),
            endTime: String(task.endTime || "").trim(),
            createdAt:
              typeof task.createdAt === "number" ? task.createdAt : Date.now(),
          };
        })
        .filter(function (task) {
          return task.text && task.dateKey;
        })
        .sort(function (a, b) {
          if (a.dateKey === b.dateKey) {
            if (a.startTime !== b.startTime) {
              return a.startTime < b.startTime ? -1 : 1;
            }
            return a.createdAt - b.createdAt;
          }
          return a.dateKey < b.dateKey ? -1 : 1;
        });
    } catch (error) {
      return [];
    }
  },

  save(tasks) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(tasks || []));
      return tasks;
    } catch (error) {
      return tasks;
    }
  },

  createId() {
    return "todo-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  },
};
