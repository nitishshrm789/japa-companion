/**
 * My Progress — track goals with days left, pace, and progress check.
 */
window.JapaProgressPanel = {
  render(rootElement) {
    this.root = rootElement;
    this.items = window.JapaProgressStore.load();
    this.editingId = null;
    this.ensureFormScreen();
    this.ensureReportScreen();
    this.drawList();
  },

  ensureFormScreen() {
    if (document.getElementById("progress-form-screen")) {
      this.formScreen = document.getElementById("progress-form-screen");
      return;
    }
    const screen = document.createElement("div");
    screen.id = "progress-form-screen";
    screen.className = "progress-form-screen";
    screen.hidden = true;
    screen.setAttribute("role", "dialog");
    screen.setAttribute("aria-modal", "true");
    screen.setAttribute("aria-labelledby", "progress-form-title");
    document.body.append(screen);
    this.formScreen = screen;
  },

  ensureReportScreen() {
    if (document.getElementById("progress-report-screen")) {
      this.reportScreen = document.getElementById("progress-report-screen");
      return;
    }
    const screen = document.createElement("div");
    screen.id = "progress-report-screen";
    screen.className = "progress-report-screen";
    screen.hidden = true;
    screen.setAttribute("role", "dialog");
    screen.setAttribute("aria-modal", "true");
    screen.setAttribute("aria-labelledby", "progress-report-title");
    document.body.append(screen);
    this.reportScreen = screen;
  },

  persist() {
    this.items = window.JapaProgressStore.save(this.items);
  },

  calc(item) {
    const daysRemaining = window.JapaTime.daysUntil(item.completeDateKey);
    const partsLeft = Math.max(0, item.totalParts - item.partsRead);
    const percent = Math.min(
      100,
      Math.round((item.partsRead / item.totalParts) * 1000) / 10
    );

    // Daily Targeted = (Total − Read) / Days Remaining
    let dailyTargeted = 0;
    if (daysRemaining > 0) {
      dailyTargeted = partsLeft / daysRemaining;
    } else if (partsLeft > 0) {
      dailyTargeted = partsLeft;
    }

    const paceNeeded = dailyTargeted;

    const plannedSpan = window.JapaTime.daysUntil(
      item.completeDateKey,
      new Date(item.createdAt)
    );
    const originalDaily =
      plannedSpan > 0 ? item.totalParts / plannedSpan : item.totalParts;

    let status = "on-track";
    let statusLabel = "On track";
    if (partsLeft <= 0) {
      status = "done";
      statusLabel = "Completed";
    } else if (daysRemaining < 0) {
      status = "overdue";
      statusLabel = "Past due";
    } else if (daysRemaining === 0 && partsLeft > 0) {
      status = "due-today";
      statusLabel = "Due today";
    } else if (dailyTargeted > originalDaily * 1.15) {
      status = "behind";
      statusLabel = "Needs focus";
    }

    return {
      daysRemaining: daysRemaining,
      partsLeft: partsLeft,
      percent: percent,
      dailyTargeted: dailyTargeted,
      paceNeeded: paceNeeded,
      status: status,
      statusLabel: statusLabel,
    };
  },

  formatFloat(value) {
    if (!isFinite(value)) {
      return "0";
    }
    const rounded = Math.round(value * 100) / 100;
    return String(rounded);
  },

  drawList() {
    const root = this.root;
    root.replaceChildren();

    const help = document.createElement("p");
    help.className = "progress-help";
    help.textContent =
      "Track reading or study goals. Days left and daily target update automatically.";
    root.append(help);

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn btn--save-day progress-add-btn";
    addBtn.textContent = "Add Goal";
    addBtn.addEventListener(
      "click",
      function () {
        this.openForm(null);
      }.bind(this)
    );
    root.append(addBtn);

    const list = document.createElement("div");
    list.className = "progress-list";

    if (this.items.length === 0) {
      const empty = document.createElement("p");
      empty.className = "progress-empty box";
      empty.textContent = "No goals yet. Tap Add Goal to start tracking.";
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
      const checkBtn = document.createElement("button");
      checkBtn.type = "button";
      checkBtn.className = "btn btn--reset progress-check-btn";
      checkBtn.textContent = "Check Your Progress";
      checkBtn.addEventListener(
        "click",
        function () {
          this.openReport();
        }.bind(this)
      );
      root.append(checkBtn);
    }
  },

  buildCard(item) {
    const stats = this.calc(item);
    const card = document.createElement("article");
    card.className = "progress-card box is-" + stats.status;

    const top = document.createElement("div");
    top.className = "progress-card__top";

    const title = document.createElement("h3");
    title.className = "progress-card__title";
    title.textContent = item.name;

    const actions = document.createElement("div");
    actions.className = "progress-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "progress-action-btn";
    editBtn.textContent = "Edit";
    editBtn.addEventListener(
      "click",
      function () {
        this.openForm(item.id);
      }.bind(this)
    );

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "progress-action-btn progress-action-btn--danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener(
      "click",
      function () {
        if (!window.confirm("Delete this progress goal?")) {
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

    const badge = document.createElement("p");
    badge.className = "progress-card__badge";
    badge.textContent = stats.statusLabel + " · " + stats.percent + "% done";

    const bar = document.createElement("div");
    bar.className = "progress-bar";
    const fill = document.createElement("div");
    fill.className = "progress-bar__fill";
    fill.style.width = Math.min(100, stats.percent) + "%";
    bar.append(fill);

    const meta = document.createElement("dl");
    meta.className = "progress-meta";

    const rows = [
      ["Total chapter/part", String(item.totalParts)],
      [
        "Date to complete",
        window.JapaTime.formatDateLabel(item.completeDateKey),
      ],
      [
        "Days Remaining",
        stats.daysRemaining < 0
          ? String(stats.daysRemaining) + " (overdue)"
          : String(stats.daysRemaining),
      ],
      ["Chapter Read", String(item.partsRead)],
      [
        "Daily Targeted",
        this.formatFloat(stats.dailyTargeted) + " per Day",
      ],
      ["Still to do", String(stats.partsLeft) + " left"],
    ];

    rows.forEach(function (pair) {
      const dt = document.createElement("dt");
      dt.textContent = pair[0];
      const dd = document.createElement("dd");
      dd.textContent = pair[1];
      meta.append(dt, dd);
    });

    card.append(top, badge, bar, meta);
    return card;
  },

  openForm(entryId) {
    this.editingId = entryId;
    this.drawFormScreen();
    this.formScreen.hidden = false;
    document.body.classList.add("is-progress-form-open");
    const first = this.formScreen.querySelector("input");
    if (first) {
      first.focus();
    }
  },

  closeForm() {
    this.editingId = null;
    this.formScreen.hidden = true;
    this.formScreen.replaceChildren();
    document.body.classList.remove("is-progress-form-open");
  },

  field(name, labelText, value, type, attrs) {
    const label = document.createElement("label");
    label.className = "progress-field";
    label.setAttribute("for", "progress-field-" + name);

    const span = document.createElement("span");
    span.textContent = labelText;

    const input = document.createElement("input");
    input.id = "progress-field-" + name;
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
    bar.className = "progress-form-screen__bar";
    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "progress-form-screen__back";
    backBtn.textContent = "Back";
    backBtn.addEventListener(
      "click",
      function () {
        this.closeForm();
      }.bind(this)
    );
    bar.append(backBtn);

    const form = document.createElement("form");
    form.className = "progress-form-screen__form";
    form.noValidate = true;

    const heading = document.createElement("h2");
    heading.id = "progress-form-title";
    heading.className = "progress-form-screen__title";
    heading.textContent = editing ? "Edit goal" : "Add goal";

    const today = window.JapaTime.getLocalDateKey();

    form.append(
      heading,
      this.field("name", "Name", editing ? editing.name : "", "text"),
      this.field(
        "totalParts",
        "Total chapter/part",
        editing ? editing.totalParts : "",
        "number",
        { min: "1", step: "1" }
      ),
      this.field(
        "completeDateKey",
        "Date to complete",
        editing ? editing.completeDateKey : "",
        "date",
        { min: today }
      ),
      this.field(
        "partsRead",
        "Chapter Read (till today)",
        editing ? editing.partsRead : "0",
        "number",
        { min: "0", step: "1" }
      )
    );

    const hint = document.createElement("p");
    hint.className = "progress-form-hint";
    hint.textContent =
      "Days Remaining and Daily Targeted are calculated automatically after you save.";
    form.append(hint);

    const saveBtn = document.createElement("button");
    saveBtn.type = "submit";
    saveBtn.className = "btn btn--save-day";
    saveBtn.textContent = editing ? "Update" : "Add Goal";
    form.append(saveBtn);

    form.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();
        const data = new FormData(form);
        const name = String(data.get("name") || "").trim();
        const totalParts = Math.floor(Number(data.get("totalParts")));
        const completeDateKey = String(data.get("completeDateKey") || "").trim();
        let partsRead = Math.floor(Number(data.get("partsRead")));
        const todayKey = window.JapaTime.getLocalDateKey();

        if (!name) {
          window.alert("Please enter a Name.");
          return;
        }
        if (!isFinite(totalParts) || totalParts < 1) {
          window.alert("Please enter Total chapter/part (1 or more).");
          return;
        }
        if (!completeDateKey) {
          window.alert("Please choose Date to complete.");
          return;
        }
        if (completeDateKey < todayKey) {
          window.alert("Please choose the correct Date");
          return;
        }
        if (!isFinite(partsRead) || partsRead < 0) {
          window.alert("Chapter Read must be 0 or more.");
          return;
        }
        if (partsRead > totalParts) {
          window.alert("Chapter Read cannot be more than Total chapter/part.");
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
              totalParts: totalParts,
              completeDateKey: completeDateKey,
              partsRead: partsRead,
              createdAt: item.createdAt,
            };
          });
        } else {
          this.items.push({
            id: window.JapaProgressStore.createId(),
            name: name,
            totalParts: totalParts,
            completeDateKey: completeDateKey,
            partsRead: partsRead,
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

  openReport() {
    this.drawReportScreen();
    this.reportScreen.hidden = false;
    document.body.classList.add("is-progress-report-open");
  },

  closeReport() {
    this.reportScreen.hidden = true;
    this.reportScreen.replaceChildren();
    document.body.classList.remove("is-progress-report-open");
  },

  drawReportScreen() {
    const screen = this.reportScreen;
    screen.replaceChildren();

    const bar = document.createElement("div");
    bar.className = "progress-form-screen__bar";
    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "progress-form-screen__back";
    backBtn.textContent = "Back";
    backBtn.addEventListener(
      "click",
      function () {
        this.closeReport();
      }.bind(this)
    );
    bar.append(backBtn);

    const body = document.createElement("div");
    body.className = "progress-report";

    const title = document.createElement("h2");
    title.id = "progress-report-title";
    title.className = "progress-report__title";
    title.textContent = "Check Your Progress";

    const todayLabel = document.createElement("p");
    todayLabel.className = "progress-report__today";
    todayLabel.textContent =
      "Today: " + window.JapaTime.formatDateLabel(window.JapaTime.getLocalDateKey());

    let done = 0;
    let behind = 0;
    let onTrack = 0;
    let overdue = 0;

    const rows = this.items.map(
      function (item) {
        const stats = this.calc(item);
        if (stats.status === "done") {
          done += 1;
        } else if (stats.status === "overdue" || stats.status === "due-today") {
          overdue += 1;
        } else if (stats.status === "behind") {
          behind += 1;
        } else {
          onTrack += 1;
        }
        return { item: item, stats: stats };
      }.bind(this)
    );

    const summary = document.createElement("div");
    summary.className = "progress-report__summary box";
    summary.innerHTML =
      "<p><strong>" +
      this.items.length +
      "</strong> goals</p>" +
      "<p>Completed: <strong>" +
      done +
      "</strong></p>" +
      "<p>On track: <strong>" +
      onTrack +
      "</strong></p>" +
      "<p>Needs focus: <strong>" +
      behind +
      "</strong></p>" +
      "<p>Due / overdue: <strong>" +
      overdue +
      "</strong></p>";

    const focus = document.createElement("div");
    focus.className = "progress-report__focus box";
    const focusTitle = document.createElement("h3");
    focusTitle.textContent = "What to focus on";
    focus.append(focusTitle);

    const priority = rows
      .filter(function (row) {
        return row.stats.partsLeft > 0;
      })
      .sort(function (a, b) {
        if (a.stats.daysRemaining !== b.stats.daysRemaining) {
          return a.stats.daysRemaining - b.stats.daysRemaining;
        }
        return b.stats.paceNeeded - a.stats.paceNeeded;
      });

    if (priority.length === 0) {
      const allDone = document.createElement("p");
      allDone.textContent = "All goals are complete. Hari Bol!";
      focus.append(allDone);
    } else {
      const top = priority[0];
      const tip = document.createElement("p");
      tip.textContent =
        "Priority: “" +
        top.item.name +
        "” — " +
        top.stats.partsLeft +
        " left in " +
        top.stats.daysRemaining +
        " day(s). Aim about " +
        this.formatFloat(top.stats.paceNeeded) +
        " per day.";
      focus.append(tip);
    }

    const detail = document.createElement("div");
    detail.className = "progress-report__list";

    rows.forEach(
      function (row) {
        const card = document.createElement("article");
        card.className = "progress-report-card box is-" + row.stats.status;

        const h = document.createElement("h3");
        h.textContent = row.item.name;

        const p = document.createElement("p");
        p.textContent =
          row.stats.percent +
          "% done (" +
          row.item.partsRead +
          "/" +
          row.item.totalParts +
          "). " +
          row.stats.statusLabel +
          ". " +
          (row.stats.partsLeft <= 0
            ? "Finished."
            : row.stats.daysRemaining < 0
              ? "Past due — finish remaining " +
                row.stats.partsLeft +
                " as soon as possible."
              : "Need about " +
                this.formatFloat(row.stats.paceNeeded) +
                " per day to finish on time.");

        card.append(h, p);
        detail.append(card);
      }.bind(this)
    );

    body.append(title, todayLabel, summary, focus, detail);
    screen.append(bar, body);
  },
};
