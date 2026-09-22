/**
 * Skills section — track learning goals, edit/delete, and view date-sorted list.
 */
window.JapaSkillPanel = {
  render(rootElement) {
    this.root = rootElement;
    this.items = window.JapaSkillStore.load();
    this.editingId = null;
    this.ensureFormScreen();
    this.ensureListScreen();
    this.drawList();
  },

  ensureFormScreen() {
    if (document.getElementById("skill-form-screen")) {
      this.formScreen = document.getElementById("skill-form-screen");
      return;
    }
    const screen = document.createElement("div");
    screen.id = "skill-form-screen";
    screen.className = "skill-form-screen";
    screen.hidden = true;
    screen.setAttribute("role", "dialog");
    screen.setAttribute("aria-modal", "true");
    screen.setAttribute("aria-labelledby", "skill-form-title");
    document.body.append(screen);
    this.formScreen = screen;
  },

  ensureListScreen() {
    if (document.getElementById("skill-list-screen")) {
      this.listScreen = document.getElementById("skill-list-screen");
      return;
    }
    const screen = document.createElement("div");
    screen.id = "skill-list-screen";
    screen.className = "skill-list-screen";
    screen.hidden = true;
    screen.setAttribute("role", "dialog");
    screen.setAttribute("aria-modal", "true");
    screen.setAttribute("aria-labelledby", "skill-list-title");
    document.body.append(screen);
    this.listScreen = screen;
  },

  persist() {
    this.items = window.JapaSkillStore.save(this.items);
  },

  formatTargetDate(dateKey) {
    const parts = String(dateKey || "").split("-");
    if (parts.length !== 3) {
      return dateKey || "—";
    }
    const date = new Date(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2])
    );
    if (isNaN(date.getTime())) {
      return dateKey;
    }
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  },

  sortedByTargetDate() {
    return this.items.slice().sort(function (a, b) {
      if (a.targetDate === b.targetDate) {
        return a.createdAt - b.createdAt;
      }
      return a.targetDate < b.targetDate ? -1 : 1;
    });
  },

  drawList() {
    const root = this.root;
    root.replaceChildren();

    const help = document.createElement("p");
    help.className = "skill-help";
    help.textContent =
      "Track skills you want to learn. Set a target date, status, and learning link.";
    root.append(help);

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn btn--save-day skill-add-btn";
    addBtn.textContent = "Add Skills";
    addBtn.addEventListener(
      "click",
      function () {
        this.openForm(null);
      }.bind(this)
    );
    root.append(addBtn);

    const list = document.createElement("div");
    list.className = "skill-list";

    if (this.items.length === 0) {
      const empty = document.createElement("p");
      empty.className = "skill-empty box";
      empty.textContent = "No skills yet. Tap Add Skills to start.";
      list.append(empty);
    } else {
      this.items.forEach(
        function (item) {
          list.append(this.buildCard(item));
        }.bind(this)
      );
    }
    root.append(list);

    if (this.items.length > 0) {
      const seeBtn = document.createElement("button");
      seeBtn.type = "button";
      seeBtn.className = "btn btn--reset skill-see-btn";
      seeBtn.textContent = "See Your All Skills";
      seeBtn.addEventListener(
        "click",
        function () {
          this.openListScreen();
        }.bind(this)
      );
      root.append(seeBtn);
    }
  },

  buildCard(item) {
    const card = document.createElement("article");
    card.className = "skill-card box is-" + item.status;

    const top = document.createElement("div");
    top.className = "skill-card__top";

    const title = document.createElement("h3");
    title.className = "skill-card__title";
    title.textContent = item.skillName || "—";

    const actions = document.createElement("div");
    actions.className = "skill-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "skill-action-btn";
    editBtn.textContent = "Edit";
    editBtn.addEventListener(
      "click",
      function () {
        this.openForm(item.id);
      }.bind(this)
    );

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "skill-action-btn skill-action-btn--danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener(
      "click",
      function () {
        if (!window.confirm("Delete this skill?")) {
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
    meta.className = "skill-meta";

    function addRow(label, value) {
      const dt = document.createElement("dt");
      dt.textContent = label;
      const dd = document.createElement("dd");
      dd.textContent = value || "—";
      meta.append(dt, dd);
    }

    addRow("Target Date", this.formatTargetDate(item.targetDate));
    addRow("Status", window.JapaSkillStore.statusLabel(item.status));

    const footer = document.createElement("div");
    footer.className = "skill-card__footer";

    if (item.learningLink) {
      const link = document.createElement("a");
      link.className = "skill-link";
      link.href = item.learningLink;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Learning Link";
      link.title = item.learningLink;
      footer.append(link);
    } else {
      const noLink = document.createElement("span");
      noLink.className = "skill-card__no-link";
      noLink.textContent = "No learning link";
      footer.append(noLink);
    }

    card.append(top, meta, footer);
    return card;
  },

  openForm(entryId) {
    this.editingId = entryId;
    this.drawFormScreen();
    this.formScreen.hidden = false;
    document.body.classList.add("is-skill-form-open");
    const first = this.formScreen.querySelector("input, select");
    if (first) {
      first.focus();
    }
  },

  closeForm() {
    this.editingId = null;
    this.formScreen.hidden = true;
    this.formScreen.replaceChildren();
    document.body.classList.remove("is-skill-form-open");
  },

  openListScreen() {
    this.drawListScreen();
    this.listScreen.hidden = false;
    document.body.classList.add("is-skill-list-open");
  },

  closeListScreen() {
    this.listScreen.hidden = true;
    this.listScreen.replaceChildren();
    document.body.classList.remove("is-skill-list-open");
  },

  field(name, labelText, value, type) {
    const label = document.createElement("label");
    label.className = "skill-field";
    label.setAttribute("for", "skill-field-" + name);

    const span = document.createElement("span");
    span.textContent = labelText;

    const input = document.createElement("input");
    input.id = "skill-field-" + name;
    input.name = name;
    input.type = type || "text";
    input.value = value == null ? "" : String(value);
    input.autocomplete = "off";

    label.append(span, input);
    return label;
  },

  selectField(name, labelText, value, options) {
    const label = document.createElement("label");
    label.className = "skill-field";
    label.setAttribute("for", "skill-field-" + name);

    const span = document.createElement("span");
    span.textContent = labelText;

    const select = document.createElement("select");
    select.id = "skill-field-" + name;
    select.name = name;

    options.forEach(function (option) {
      const opt = document.createElement("option");
      opt.value = option.value;
      opt.textContent = option.label;
      if (option.value === value) {
        opt.selected = true;
      }
      select.append(opt);
    });

    label.append(span, select);
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
    bar.className = "skill-form-screen__bar";
    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "skill-form-screen__back";
    backBtn.textContent = "Back";
    backBtn.addEventListener(
      "click",
      function () {
        this.closeForm();
      }.bind(this)
    );
    bar.append(backBtn);

    const form = document.createElement("form");
    form.className = "skill-form-screen__form";
    form.noValidate = true;

    const heading = document.createElement("h2");
    heading.id = "skill-form-title";
    heading.className = "skill-form-screen__title";
    heading.textContent = editing ? "Edit skill" : "Add skill";

    form.append(
      heading,
      this.field(
        "skillName",
        "Skill Name",
        editing ? editing.skillName : "",
        "text"
      ),
      this.field(
        "targetDate",
        "Target Date",
        editing ? editing.targetDate : "",
        "date"
      ),
      this.field(
        "learningLink",
        "Learning Link",
        editing ? editing.learningLink : "",
        "url"
      ),
      this.selectField(
        "status",
        "Status",
        editing ? editing.status : "not-started",
        window.JapaSkillStore.STATUSES
      )
    );

    const saveBtn = document.createElement("button");
    saveBtn.type = "submit";
    saveBtn.className = "btn btn--save-day";
    saveBtn.textContent = editing ? "Update" : "Add Skills";
    form.append(saveBtn);

    form.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();
        const data = new FormData(form);
        const skillName = String(data.get("skillName") || "").trim();
        const targetDate = String(data.get("targetDate") || "").trim();
        const learningLink = String(data.get("learningLink") || "").trim();
        const status = window.JapaSkillStore.normalizeStatus(
          String(data.get("status") || "").trim()
        );

        if (!skillName || !targetDate) {
          window.alert("Please fill Skill Name and Target Date.");
          return;
        }

        if (learningLink && !/^https?:\/\//i.test(learningLink)) {
          window.alert("Learning Link should start with http:// or https://");
          return;
        }

        if (editing) {
          this.items = this.items.map(function (item) {
            if (item.id !== editing.id) {
              return item;
            }
            return {
              id: item.id,
              skillName: skillName,
              targetDate: targetDate,
              learningLink: learningLink,
              status: status,
              createdAt: item.createdAt,
            };
          });
        } else {
          this.items.push({
            id: window.JapaSkillStore.createId(),
            skillName: skillName,
            targetDate: targetDate,
            learningLink: learningLink,
            status: status,
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

  drawListScreen() {
    const screen = this.listScreen;
    screen.replaceChildren();

    const bar = document.createElement("div");
    bar.className = "skill-form-screen__bar";
    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "skill-form-screen__back";
    backBtn.textContent = "Back";
    backBtn.addEventListener(
      "click",
      function () {
        this.closeListScreen();
      }.bind(this)
    );
    bar.append(backBtn);

    const body = document.createElement("div");
    body.className = "skill-summary";

    const title = document.createElement("h2");
    title.id = "skill-list-title";
    title.className = "skill-summary__title";
    title.textContent = "Your All Skills";

    const hint = document.createElement("p");
    hint.className = "skill-summary__hint";
    hint.textContent = "Sorted by Target Date (nearest first).";

    const ol = document.createElement("ol");
    ol.className = "skill-summary__list";

    const sorted = this.sortedByTargetDate();
    if (sorted.length === 0) {
      const empty = document.createElement("p");
      empty.className = "skill-empty box";
      empty.textContent = "No skills to show.";
      body.append(title, hint, empty);
    } else {
      sorted.forEach(
        function (item) {
          const li = document.createElement("li");
          li.className = "skill-summary__item";
          li.textContent =
            (item.skillName || "—") +
            " - " +
            this.formatTargetDate(item.targetDate) +
            " - " +
            window.JapaSkillStore.statusLabel(item.status);
          ol.append(li);
        }.bind(this)
      );
      body.append(title, hint, ol);
    }

    screen.append(bar, body);
  },
};
