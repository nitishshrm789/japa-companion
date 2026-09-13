/**
 * Health — track daily/weekly health habits; completed items vanish.
 */
window.JapaHealthPanel = {
  render(rootElement) {
    this.root = rootElement;
    this.items = window.JapaHealthStore.load();
    this.filter = this.filter || "all";
    this.editingId = null;
    this.ensureFormScreen();
    this.drawList();
  },

  ensureFormScreen() {
    if (document.getElementById("health-form-screen")) {
      this.formScreen = document.getElementById("health-form-screen");
      return;
    }
    const screen = document.createElement("div");
    screen.id = "health-form-screen";
    screen.className = "health-form-screen";
    screen.hidden = true;
    screen.setAttribute("role", "dialog");
    screen.setAttribute("aria-modal", "true");
    screen.setAttribute("aria-labelledby", "health-form-title");
    document.body.append(screen);
    this.formScreen = screen;
  },

  persist() {
    this.items = window.JapaHealthStore.save(this.items);
  },

  weekdayName(dateKey) {
    const date = window.JapaTime.parseDateKey(dateKey);
    if (!date) {
      return "—";
    }
    return [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][date.getDay()];
  },

  isOverdue(dateKey) {
    return dateKey < window.JapaTime.getLocalDateKey();
  },

  filteredItems() {
    if (this.filter === "daily") {
      return this.items.filter(function (item) {
        return item.type === "daily";
      });
    }
    if (this.filter === "weekly") {
      return this.items.filter(function (item) {
        return item.type === "weekly";
      });
    }
    return this.items.slice();
  },

  drawList() {
    const root = this.root;
    root.replaceChildren();

    const help = document.createElement("p");
    help.className = "health-help";
    help.textContent =
      "Track health habits. Mark Completed to clear them from the list.";
    root.append(help);

    const filters = document.createElement("div");
    filters.className = "health-filters";
    ["all", "daily", "weekly"].forEach(
      function (key) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className =
          "health-filter-btn" + (this.filter === key ? " is-active" : "");
        btn.textContent =
          key === "all" ? "All" : key === "daily" ? "Daily" : "Weekly";
        btn.addEventListener(
          "click",
          function () {
            this.filter = key;
            this.drawList();
          }.bind(this)
        );
        filters.append(btn);
      }.bind(this)
    );
    root.append(filters);

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn btn--save-day health-add-btn";
    addBtn.textContent = "Add Health Item";
    addBtn.addEventListener(
      "click",
      function () {
        this.openForm(null);
      }.bind(this)
    );
    root.append(addBtn);

    const list = document.createElement("div");
    list.className = "health-list";
    const items = this.filteredItems();

    if (items.length === 0) {
      const empty = document.createElement("p");
      empty.className = "health-empty box";
      empty.textContent =
        this.items.length === 0
          ? "No health items yet. Tap Add Health Item to start."
          : "No items in this filter.";
      list.append(empty);
    } else {
      items.forEach(
        function (item) {
          list.append(this.buildCard(item));
        }.bind(this)
      );
    }
    root.append(list);

    if (this.items.length > 0) {
      const summary = document.createElement("p");
      summary.className = "health-summary";
      const overdue = this.items.filter(
        function (item) {
          return this.isOverdue(item.dateKey);
        }.bind(this)
      ).length;
      summary.textContent =
        this.items.length +
        " in progress" +
        (overdue > 0 ? " · " + overdue + " past due date" : "");
      root.append(summary);
    }
  },

  buildCard(item) {
    const overdue = this.isOverdue(item.dateKey);
    const card = document.createElement("article");
    card.className = "health-card box" + (overdue ? " is-overdue" : "");

    const top = document.createElement("div");
    top.className = "health-card__top";

    const title = document.createElement("h3");
    title.className = "health-card__title";
    title.textContent = item.name;

    const actions = document.createElement("div");
    actions.className = "health-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "health-action-btn";
    editBtn.textContent = "Edit";
    editBtn.addEventListener(
      "click",
      function () {
        this.openForm(item.id);
      }.bind(this)
    );

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "health-action-btn health-action-btn--danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener(
      "click",
      function () {
        if (!window.confirm("Delete this health item?")) {
          return;
        }
        this.items = this.items.filter(function (entry) {
          return entry.id !== item.id;
        });
        this.persist();
        this.drawList();
      }.bind(this)
    );

    actions.append(editBtn, deleteBtn);
    top.append(title, actions);

    const meta = document.createElement("dl");
    meta.className = "health-meta";

    const rows = [
      ["Date", window.JapaTime.formatDayMonthYear(item.dateKey)],
      ["Day", this.weekdayName(item.dateKey)],
      ["Type", item.type === "weekly" ? "Weekly" : "Daily"],
      ["Status", overdue ? "In-Progress (past date)" : "In-Progress"],
    ];

    rows.forEach(function (pair) {
      const dt = document.createElement("dt");
      dt.textContent = pair[0];
      const dd = document.createElement("dd");
      dd.textContent = pair[1];
      meta.append(dt, dd);
    });

    card.append(top, meta);

    if (item.notes) {
      const notes = document.createElement("p");
      notes.className = "health-card__notes";
      notes.textContent = item.notes;
      card.append(notes);
    }

    const completeBtn = document.createElement("button");
    completeBtn.type = "button";
    completeBtn.className = "btn btn--start health-complete-btn";
    completeBtn.textContent = "Mark Completed";
    completeBtn.addEventListener(
      "click",
      function () {
        this.completeItem(item.id);
      }.bind(this)
    );
    card.append(completeBtn);

    return card;
  },

  completeItem(id) {
    this.items = this.items.filter(function (item) {
      return item.id !== id;
    });
    this.persist();
    this.drawList();
  },

  openForm(entryId) {
    this.editingId = entryId;
    this.drawFormScreen();
    this.formScreen.hidden = false;
    document.body.classList.add("is-health-form-open");
    const first = this.formScreen.querySelector("input");
    if (first) {
      first.focus();
    }
  },

  closeForm() {
    this.editingId = null;
    this.formScreen.hidden = true;
    this.formScreen.replaceChildren();
    document.body.classList.remove("is-health-form-open");
  },

  field(name, labelText, value, type, attrs) {
    const label = document.createElement("label");
    label.className = "health-field";
    label.setAttribute("for", "health-field-" + name);

    const span = document.createElement("span");
    span.textContent = labelText;

    const input = document.createElement("input");
    input.id = "health-field-" + name;
    input.name = name;
    input.type = type || "text";
    input.value = value == null ? "" : String(value);
    input.autocomplete = "off";
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        input.setAttribute(key, attrs[key]);
      });
    }

    label.append(span, input);
    return label;
  },

  drawFormScreen() {
    const editing = this.items.find(
      function (item) {
        return item.id === this.editingId;
      }.bind(this)
    );

    const screen = this.formScreen;
    screen.replaceChildren();

    const bar = document.createElement("div");
    bar.className = "health-form-screen__bar";
    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "health-form-screen__back";
    backBtn.textContent = "Back";
    backBtn.addEventListener(
      "click",
      function () {
        this.closeForm();
      }.bind(this)
    );
    bar.append(backBtn);

    const form = document.createElement("form");
    form.className = "health-form-screen__form";
    form.noValidate = true;

    const heading = document.createElement("h2");
    heading.id = "health-form-title";
    heading.className = "health-form-screen__title";
    heading.textContent = editing ? "Edit health item" : "Add health item";

    const nameField = this.field(
      "name",
      "Name",
      editing ? editing.name : "",
      "text"
    );

    const dateField = this.field(
      "dateKey",
      "Date",
      editing ? editing.dateKey : window.JapaTime.getLocalDateKey(),
      "date"
    );

    const dayPreview = document.createElement("p");
    dayPreview.className = "health-day-preview";
    const dateInput = dateField.querySelector("input");

    function syncDay() {
      const key = String(dateInput.value || "").trim();
      dayPreview.textContent = key
        ? "Day: " + this.weekdayName(key)
        : "Day: —";
    }
    syncDay = syncDay.bind(this);
    dateInput.addEventListener("change", syncDay);
    dateInput.addEventListener("input", syncDay);
    syncDay();

    const typeField = document.createElement("label");
    typeField.className = "health-field";
    typeField.setAttribute("for", "health-field-type");
    const typeSpan = document.createElement("span");
    typeSpan.textContent = "Type";
    const typeSelect = document.createElement("select");
    typeSelect.id = "health-field-type";
    typeSelect.name = "type";
    typeSelect.className = "health-select";
    ["daily", "weekly"].forEach(function (value) {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = value === "daily" ? "Daily" : "Weekly";
      if ((editing ? editing.type : "daily") === value) {
        opt.selected = true;
      }
      typeSelect.append(opt);
    });
    typeField.append(typeSpan, typeSelect);

    const notesField = this.field(
      "notes",
      "Notes (optional)",
      editing ? editing.notes : "",
      "text"
    );

    const statusNote = document.createElement("p");
    statusNote.className = "health-form-hint";
    statusNote.textContent =
      "Status starts as In-Progress. Use Mark Completed on the card to finish and remove it.";

    const saveBtn = document.createElement("button");
    saveBtn.type = "submit";
    saveBtn.className = "btn btn--save-day";
    saveBtn.textContent = editing ? "Update" : "Add Item";

    form.append(
      heading,
      nameField,
      dateField,
      dayPreview,
      typeField,
      notesField,
      statusNote,
      saveBtn
    );

    form.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();
        const data = new FormData(form);
        const name = String(data.get("name") || "").trim();
        const dateKey = String(data.get("dateKey") || "").trim();
        const type = data.get("type") === "weekly" ? "weekly" : "daily";
        const notes = String(data.get("notes") || "").trim();

        if (!name) {
          window.alert("Please enter a Name.");
          return;
        }
        if (!dateKey) {
          window.alert("Please choose a Date.");
          return;
        }

        if (editing) {
          this.items = this.items.map(function (item) {
            if (item.id !== editing.id) {
              return item;
            }
            return {
              id: item.id,
              name: name,
              dateKey: dateKey,
              type: type,
              notes: notes,
              createdAt: item.createdAt,
            };
          });
        } else {
          this.items.push({
            id: window.JapaHealthStore.createId(),
            name: name,
            dateKey: dateKey,
            type: type,
            notes: notes,
            createdAt: Date.now(),
          });
        }

        this.persist();
        this.closeForm();
        this.drawList();
      }.bind(this)
    );

    screen.append(bar, form);
  },
};
