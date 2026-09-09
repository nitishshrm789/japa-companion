/**
 * Personalities tab — name + numbered points, add/edit/delete.
 */
window.JapaPersonalitiesPanel = {
  render(rootElement) {
    this.root = rootElement;
    this.entries = window.JapaPersonalitiesStore.load();
    this.editingId = null;
    this.ensureFormScreen();
    this.drawList();
  },

  ensureFormScreen() {
    if (document.getElementById("personalities-form-screen")) {
      this.formScreen = document.getElementById("personalities-form-screen");
      return;
    }

    const screen = document.createElement("div");
    screen.id = "personalities-form-screen";
    screen.className = "personalities-form-screen";
    screen.hidden = true;
    screen.setAttribute("role", "dialog");
    screen.setAttribute("aria-modal", "true");
    screen.setAttribute("aria-labelledby", "personalities-form-screen-title");
    document.body.append(screen);
    this.formScreen = screen;
  },

  persist() {
    this.entries = window.JapaPersonalitiesStore.save(this.entries);
  },

  parsePoints(rawText) {
    return String(rawText || "")
      .split(/\r?\n/)
      .map(function (line) {
        return line.replace(/^\s*\d+[\.\)\-]\s*/, "").trim();
      })
      .filter(Boolean);
  },

  pointsToText(points) {
    if (!Array.isArray(points) || points.length === 0) {
      return "";
    }
    return points.join("\n");
  },

  drawList() {
    const root = this.root;
    root.replaceChildren();

    const help = document.createElement("p");
    help.className = "personalities-help";
    help.textContent =
      "Note personalities and what you feel about them — point by point. Saved on this device.";
    root.append(help);

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn btn--save-day personalities-add-btn";
    addBtn.textContent = "Add Personality";
    addBtn.addEventListener(
      "click",
      function () {
        this.openForm(null);
      }.bind(this)
    );
    root.append(addBtn);

    const list = document.createElement("div");
    list.className = "personalities-list";

    if (this.entries.length === 0) {
      const empty = document.createElement("p");
      empty.className = "personalities-empty box";
      empty.textContent = "No personalities yet. Tap Add Personality to start.";
      list.append(empty);
    } else {
      this.entries.forEach(
        function (entry, index) {
          list.append(this.buildCard(entry, index + 1));
        }.bind(this)
      );
    }

    root.append(list);
  },

  buildCard(entry, index) {
    const card = document.createElement("article");
    card.className = "personalities-card box";

    const top = document.createElement("div");
    top.className = "personalities-card__top";

    const indexEl = document.createElement("span");
    indexEl.className = "personalities-card__index";
    indexEl.textContent = "#" + index;

    const actions = document.createElement("div");
    actions.className = "personalities-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "personalities-action-btn";
    editBtn.textContent = "Edit";
    editBtn.addEventListener(
      "click",
      function () {
        this.openForm(entry.id);
      }.bind(this)
    );

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className =
      "personalities-action-btn personalities-action-btn--danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener(
      "click",
      function () {
        if (!window.confirm("Delete this personality entry?")) {
          return;
        }
        this.entries = this.entries.filter(function (item) {
          return item.id !== entry.id;
        });
        this.persist();
        this.closeForm();
        this.drawList();
      }.bind(this)
    );

    actions.append(editBtn, deleteBtn);
    top.append(indexEl, actions);

    const title = document.createElement("h3");
    title.className = "personalities-card__title";
    title.textContent = entry.name || "—";

    const pointsList = document.createElement("ol");
    pointsList.className = "personalities-card__points";

    if (!entry.points || entry.points.length === 0) {
      const none = document.createElement("p");
      none.className = "personalities-card__none";
      none.textContent = "No points yet.";
      card.append(top, title, none);
      return card;
    }

    entry.points.forEach(function (point) {
      const item = document.createElement("li");
      item.textContent = point;
      pointsList.append(item);
    });

    card.append(top, title, pointsList);
    return card;
  },

  openForm(entryId) {
    this.editingId = entryId;
    this.drawFormScreen();
    this.formScreen.hidden = false;
    document.body.classList.add("is-personalities-form-open");
    const firstInput = this.formScreen.querySelector("input");
    if (firstInput) {
      firstInput.focus();
    }
  },

  closeForm() {
    this.editingId = null;
    this.formScreen.hidden = true;
    this.formScreen.replaceChildren();
    document.body.classList.remove("is-personalities-form-open");
  },

  drawFormScreen() {
    const editing = this.entries.find(
      function (entry) {
        return entry.id === this.editingId;
      }.bind(this)
    );

    const screen = this.formScreen;
    screen.replaceChildren();

    const bar = document.createElement("div");
    bar.className = "personalities-form-screen__bar";

    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "personalities-form-screen__back";
    backBtn.textContent = "Back";
    backBtn.addEventListener(
      "click",
      function () {
        this.closeForm();
      }.bind(this)
    );
    bar.append(backBtn);

    const form = document.createElement("form");
    form.className = "personalities-form-screen__form";
    form.noValidate = true;

    const heading = document.createElement("h2");
    heading.id = "personalities-form-screen-title";
    heading.className = "personalities-form-screen__title";
    heading.textContent = editing ? "Edit personality" : "Add personality";

    const nameField = this.textField(
      "name",
      "Name",
      editing ? editing.name : ""
    );

    const pointsLabel = document.createElement("label");
    pointsLabel.className = "personalities-field";
    pointsLabel.setAttribute("for", "personalities-field-points");

    const pointsSpan = document.createElement("span");
    pointsSpan.textContent = "Points (one per line — shown as 1. 2. 3.)";

    const pointsArea = document.createElement("textarea");
    pointsArea.id = "personalities-field-points";
    pointsArea.name = "points";
    pointsArea.rows = 10;
    pointsArea.placeholder = "First thought\nSecond thought\nThird thought";
    pointsArea.value = editing ? this.pointsToText(editing.points) : "";

    pointsLabel.append(pointsSpan, pointsArea);

    const saveBtn = document.createElement("button");
    saveBtn.type = "submit";
    saveBtn.className = "btn btn--save-day";
    saveBtn.textContent = editing ? "Update" : "Add Personality";

    form.append(heading, nameField, pointsLabel, saveBtn);

    form.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();
        const data = new FormData(form);
        const name = String(data.get("name") || "").trim();
        const points = this.parsePoints(data.get("points"));

        if (!name) {
          window.alert("Please fill Name.");
          return;
        }

        if (points.length === 0) {
          window.alert("Please add at least one point (one per line).");
          return;
        }

        if (editing) {
          this.entries = this.entries.map(function (entry) {
            if (entry.id !== editing.id) {
              return entry;
            }
            return {
              id: entry.id,
              order: entry.order,
              name: name,
              points: points,
            };
          });
        } else {
          this.entries.push({
            id: window.JapaPersonalitiesStore.createId(),
            order: this.entries.length + 1,
            name: name,
            points: points,
          });
        }

        this.persist();
        this.closeForm();
        this.drawList();
      }.bind(this)
    );

    screen.append(bar, form);
  },

  textField(name, labelText, value) {
    const label = document.createElement("label");
    label.className = "personalities-field";
    label.setAttribute("for", "personalities-field-" + name);

    const span = document.createElement("span");
    span.textContent = labelText;

    const input = document.createElement("input");
    input.id = "personalities-field-" + name;
    input.name = name;
    input.type = "text";
    input.value = value || "";
    input.autocomplete = "off";

    label.append(span, input);
    return label;
  },
};
