/**
 * Persists To Do List tasks on this device.
 * Tasks are always kept ORDER BY date, start time ASC.
 */
window.JapaTodoStore = {
  KEY: "japa-todo-list-v1",

  compare(a, b) {
    if (a.dateKey !== b.dateKey) {
      return a.dateKey < b.dateKey ? -1 : 1;
    }
    const aTime = String(a.startTime || "");
    const bTime = String(b.startTime || "");
    if (aTime !== bTime) {
      if (!aTime) {
        return 1;
      }
      if (!bTime) {
        return -1;
      }
      return aTime < bTime ? -1 : 1;
    }
    const aEnd = String(a.endTime || "");
    const bEnd = String(b.endTime || "");
    if (aEnd !== bEnd) {
      if (!aEnd) {
        return 1;
      }
      if (!bEnd) {
        return -1;
      }
      return aEnd < bEnd ? -1 : 1;
    }
    return (a.createdAt || 0) - (b.createdAt || 0);
  },

  sortTasks(tasks) {
    return (tasks || []).slice().sort(this.compare);
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
      return this.sortTasks(
        data
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
                typeof task.createdAt === "number"
                  ? task.createdAt
                  : Date.now(),
            };
          })
          .filter(function (task) {
            return task.text && task.dateKey;
          })
      );
    } catch (error) {
      return [];
    }
  },

  save(tasks) {
    try {
      const sorted = this.sortTasks(tasks);
      localStorage.setItem(this.KEY, JSON.stringify(sorted));
      return sorted;
    } catch (error) {
      return this.sortTasks(tasks);
    }
  },

  createId() {
    return "todo-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  },
};
