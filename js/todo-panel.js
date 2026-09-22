/**
 * To Do List — add tasks with date, complete via checkbox, remove or re-add overdue.
 */
window.JapaTodoPanel = {
  render(rootElement) {
    this.root = rootElement;
    this.tasks = window.JapaTodoStore.load();
    this.ensureFormScreen();
    this.drawList();
  },

  ensureFormScreen() {
    if (document.getElementById("todo-form-screen")) {
      this.formScreen = document.getElementById("todo-form-screen");
      return;
    }

    const screen = document.createElement("div");
    screen.id = "todo-form-screen";
    screen.className = "todo-form-screen";
    screen.hidden = true;
    screen.setAttribute("role", "dialog");
    screen.setAttribute("aria-modal", "true");
    screen.setAttribute("aria-labelledby", "todo-form-title");
    document.body.append(screen);
    this.formScreen = screen;
  },

  persist() {
    this.tasks = window.JapaTodoStore.save(this.tasks);
  },

  isOverdue(dateKey) {
    const today = window.JapaTime.getLocalDateKey();
    return dateKey < today;
  },

  formatTime(timeValue) {
    const parts = String(timeValue || "").split(":");
    if (parts.length !== 2) {
      return timeValue;
    }

    const date = new Date();
    date.setHours(Number(parts[0]), Number(parts[1]), 0, 0);
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  },

  drawList() {
    const root = this.root;
    root.replaceChildren();

    const list = document.createElement("div");
    list.className = "todo-list";

    if (this.tasks.length === 0) {
      const empty = document.createElement("p");
      empty.className = "todo-empty box";
      empty.textContent = "No tasks yet. Tap + to add one.";
      list.append(empty);
    } else {
      this.tasks.forEach(
        function (task) {
          list.append(this.buildCard(task));
        }.bind(this)
      );
    }

    root.append(list);

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "todo-fab";
    addBtn.setAttribute("aria-label", "Add task");
    addBtn.innerHTML = "<span aria-hidden=\"true\">+</span>";
    addBtn.addEventListener(
      "click",
      function () {
        this.openForm();
      }.bind(this)
    );
    root.append(addBtn);
  },

  buildCard(task) {
    const overdue = this.isOverdue(task.dateKey);
    const card = document.createElement("article");
    card.className = "todo-card box" + (overdue ? " is-overdue" : "");

    const dateLabel = document.createElement("p");
    dateLabel.className = "todo-card__date";
    dateLabel.textContent =
      "Date: " + window.JapaTime.formatDateLabel(task.dateKey);
    if (task.startTime && task.endTime) {
      dateLabel.textContent +=
        " · Time: " +
        this.formatTime(task.startTime) +
        " – " +
        this.formatTime(task.endTime);
    }

    const row = document.createElement("div");
    row.className = "todo-card__row";

    const check = document.createElement("button");
    check.type = "button";
    check.className = "todo-check";
    check.setAttribute("aria-label", "Mark task completed");
    check.addEventListener(
      "click",
      function () {
        this.completeTask(task.id);
      }.bind(this)
    );

    const text = document.createElement("p");
    text.className = "todo-card__text";
    text.textContent = task.text;

    row.append(check, text);
    card.append(dateLabel, row);

    if (overdue) {
      const actions = document.createElement("div");
      actions.className = "todo-card__actions";

      const reAddBtn = document.createElement("button");
      reAddBtn.type = "button";
      reAddBtn.className = "todo-readd";
      reAddBtn.textContent = "Re-Add";
      reAddBtn.setAttribute("aria-label", "Re-add this task for today");
      reAddBtn.addEventListener(
        "click",
        function () {
          this.reAddTask(task.id);
        }.bind(this)
      );

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "todo-remove";
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener(
        "click",
        function () {
          this.removeTask(task.id);
        }.bind(this)
      );

      actions.append(reAddBtn, removeBtn);
      card.append(actions);
    }

    return card;
  },

  completeTask(id) {
    this.tasks = this.tasks.filter(function (task) {
      return task.id !== id;
    });
    this.persist();
    this.drawList();
  },

  removeTask(id) {
    this.tasks = this.tasks.filter(function (task) {
      return task.id !== id;
    });
    this.persist();
    this.drawList();
  },

  reAddTask(id) {
    const today = window.JapaTime.getLocalDateKey();
    this.tasks = this.tasks.map(function (task) {
      if (task.id !== id) {
        return task;
      }
      return {
        id: task.id,
        text: task.text,
        dateKey: today,
        startTime: task.startTime,
        endTime: task.endTime,
        createdAt: Date.now(),
      };
    });
    this.persist();
    this.drawList();
  },

  openForm() {
    this.drawFormScreen();
    this.formScreen.hidden = false;
    document.body.classList.add("is-todo-form-open");
    const firstInput = this.formScreen.querySelector("input[type='text']");
    if (firstInput) {
      firstInput.focus();
    }
  },

  closeForm() {
    this.formScreen.hidden = true;
    this.formScreen.replaceChildren();
    document.body.classList.remove("is-todo-form-open");
  },

  drawFormScreen() {
    const screen = this.formScreen;
    screen.replaceChildren();

    const bar = document.createElement("div");
    bar.className = "todo-form-screen__bar";

    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "todo-form-screen__back";
    backBtn.textContent = "Back";
    backBtn.addEventListener(
      "click",
      function () {
        this.closeForm();
      }.bind(this)
    );
    bar.append(backBtn);

    const form = document.createElement("form");
    form.className = "todo-form-screen__form";
    form.noValidate = true;

    const heading = document.createElement("h2");
    heading.id = "todo-form-title";
    heading.className = "todo-form-screen__title";
    heading.textContent = "New task";
    heading.hidden = true;

    const taskField = document.createElement("label");
    taskField.className = "todo-field";
    taskField.setAttribute("for", "todo-field-text");

    const taskLabel = document.createElement("span");
    taskLabel.textContent = "What is to be done?";

    const taskInput = document.createElement("input");
    taskInput.id = "todo-field-text";
    taskInput.name = "text";
    taskInput.type = "text";
    taskInput.autocomplete = "off";
    taskInput.placeholder = " ";
    taskField.append(taskLabel, taskInput);

    const dateField = document.createElement("label");
    dateField.className = "todo-field todo-field--date";
    dateField.setAttribute("for", "todo-field-date");

    const dateLabel = document.createElement("span");
    dateLabel.textContent = "Enter Date";

    const dateWrap = document.createElement("div");
    dateWrap.className = "todo-date-wrap";

    const dateInput = document.createElement("input");
    dateInput.id = "todo-field-date";
    dateInput.name = "dateKey";
    dateInput.type = "date";
    dateInput.min = window.JapaTime.getLocalDateKey();

    dateWrap.append(dateInput);
    dateField.append(dateLabel, dateWrap);

    function createTimeField(name, labelText) {
      const field = document.createElement("label");
      field.className = "todo-field todo-field--time";
      field.setAttribute("for", "todo-field-" + name);

      const label = document.createElement("span");
      label.textContent = labelText;

      const input = document.createElement("input");
      input.id = "todo-field-" + name;
      input.name = name;
      input.type = "time";
      input.step = "60";

      field.append(label, input);
      return { field: field, input: input };
    }

    const startTimeField = createTimeField("start-time", "Start Time");
    const endTimeField = createTimeField("end-time", "End Time");

    const confirmBtn = document.createElement("button");
    confirmBtn.type = "submit";
    confirmBtn.className = "todo-confirm";
    confirmBtn.hidden = true;
    confirmBtn.setAttribute("aria-label", "Save task");
    confirmBtn.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    function updateConfirmVisibility() {
      const text = String(taskInput.value || "").trim();
      const dateKey = String(dateInput.value || "").trim();
      const startTime = String(startTimeField.input.value || "").trim();
      const endTime = String(endTimeField.input.value || "").trim();
      confirmBtn.hidden = !(text && dateKey && startTime && endTime);
    }

    taskInput.addEventListener("input", updateConfirmVisibility);
    dateInput.addEventListener("change", updateConfirmVisibility);
    dateInput.addEventListener("input", updateConfirmVisibility);
    startTimeField.input.addEventListener("input", updateConfirmVisibility);
    endTimeField.input.addEventListener("input", updateConfirmVisibility);

    form.append(
      heading,
      taskField,
      dateField,
      startTimeField.field,
      endTimeField.field,
      confirmBtn
    );

    form.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();
        const text = String(taskInput.value || "").trim();
        const dateKey = String(dateInput.value || "").trim();
        const startTime = String(startTimeField.input.value || "").trim();
        const endTime = String(endTimeField.input.value || "").trim();
        const today = window.JapaTime.getLocalDateKey();

        if (!text || !dateKey || !startTime || !endTime) {
          return;
        }

        if (dateKey < today) {
          window.alert("Please choose the correct Date");
          dateInput.focus();
          return;
        }

        if (endTime <= startTime) {
          window.alert("End Time should be after Start Time.");
          endTimeField.input.focus();
          return;
        }

        this.tasks.push({
          id: window.JapaTodoStore.createId(),
          text: text,
          dateKey: dateKey,
          startTime: startTime,
          endTime: endTime,
          createdAt: Date.now(),
        });
        this.persist();
        this.closeForm();
        this.drawList();
      }.bind(this)
    );

    screen.append(bar, form);
    updateConfirmVisibility();
  },
};
