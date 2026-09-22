/**
 * Gift section — plan gifts, edit/remove, and view date-sorted summary list.
 */
window.JapaGiftPanel = {
  render(rootElement) {
    this.root = rootElement;
    this.items = window.JapaGiftStore.load();
    this.editingId = null;
    this.ensureFormScreen();
    this.ensureListScreen();
    this.drawList();
  },

  ensureFormScreen() {
    if (document.getElementById("gift-form-screen")) {
      this.formScreen = document.getElementById("gift-form-screen");
      return;
    }
    const screen = document.createElement("div");
    screen.id = "gift-form-screen";
    screen.className = "gift-form-screen";
    screen.hidden = true;
    screen.setAttribute("role", "dialog");
    screen.setAttribute("aria-modal", "true");
    screen.setAttribute("aria-labelledby", "gift-form-title");
    document.body.append(screen);
    this.formScreen = screen;
  },

  ensureListScreen() {
    if (document.getElementById("gift-list-screen")) {
      this.listScreen = document.getElementById("gift-list-screen");
      return;
    }
    const screen = document.createElement("div");
    screen.id = "gift-list-screen";
    screen.className = "gift-list-screen";
    screen.hidden = true;
    screen.setAttribute("role", "dialog");
    screen.setAttribute("aria-modal", "true");
    screen.setAttribute("aria-labelledby", "gift-list-title");
    document.body.append(screen);
    this.listScreen = screen;
  },

  persist() {
    this.items = window.JapaGiftStore.save(this.items);
  },

  sortedByGiftDate() {
    return this.items.slice().sort(function (a, b) {
      if (a.giftDate === b.giftDate) {
        return a.createdAt - b.createdAt;
      }
      return a.giftDate < b.giftDate ? -1 : 1;
    });
  },

  drawList() {
    const root = this.root;
    root.replaceChildren();

    const help = document.createElement("p");
    help.className = "gift-help";
    help.textContent =
      "Plan gifts for someone. Add details, track status, and review by gift date.";
    root.append(help);

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn btn--save-day gift-add-btn";
    addBtn.textContent = "Add Gift";
    addBtn.addEventListener(
      "click",
      function () {
        this.openForm(null);
      }.bind(this)
    );
    root.append(addBtn);

    const list = document.createElement("div");
    list.className = "gift-list";

    if (this.items.length === 0) {
      const empty = document.createElement("p");
      empty.className = "gift-empty box";
      empty.textContent = "No gifts yet. Tap Add Gift to start.";
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
      seeBtn.className = "btn btn--reset gift-see-btn";
      seeBtn.textContent = "See Your Gift List";
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
    card.className = "gift-card box";

    const top = document.createElement("div");
    top.className = "gift-card__top";

    const title = document.createElement("h3");
    title.className = "gift-card__title";
    title.textContent = item.giftName || "—";

    const actions = document.createElement("div");
    actions.className = "gift-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "gift-action-btn";
    editBtn.textContent = "Edit";
    editBtn.addEventListener(
      "click",
      function () {
        this.openForm(item.id);
      }.bind(this)
    );

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "gift-action-btn gift-action-btn--danger";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener(
      "click",
      function () {
        if (!window.confirm("Remove this gift?")) {
          return;
        }
        this.items = this.items.filter(function (entry) {
          return entry.id !== item.id;
        });
        this.persist();
        this.drawList();
      }.bind(this)
    );

    actions.append(editBtn, removeBtn);
    top.append(title, actions);

    const meta = document.createElement("dl");
    meta.className = "gift-meta";

    function addRow(label, value) {
      const dt = document.createElement("dt");
      dt.textContent = label;
      const dd = document.createElement("dd");
      dd.textContent = value || "—";
      meta.append(dt, dd);
    }

    addRow("For Whom", item.forWhom);
    addRow("Occasion", item.occasion);
    addRow("Budget", item.budget);
    addRow(
      "Gift Date",
      item.giftDate ? window.JapaTime.formatDateLabel(item.giftDate) : "—"
    );
    addRow("Status", window.JapaGiftStore.statusLabel(item.status));

    card.append(top, meta);
    return card;
  },

  openForm(entryId) {
    this.editingId = entryId;
    this.drawFormScreen();
    this.formScreen.hidden = false;
    document.body.classList.add("is-gift-form-open");
    const first = this.formScreen.querySelector("input, select");
    if (first) {
      first.focus();
    }
  },

  closeForm() {
    this.editingId = null;
    this.formScreen.hidden = true;
    this.formScreen.replaceChildren();
    document.body.classList.remove("is-gift-form-open");
  },

  openListScreen() {
    this.drawListScreen();
    this.listScreen.hidden = false;
    document.body.classList.add("is-gift-list-open");
  },

  closeListScreen() {
    this.listScreen.hidden = true;
    this.listScreen.replaceChildren();
    document.body.classList.remove("is-gift-list-open");
  },

  field(name, labelText, value, type) {
    const label = document.createElement("label");
    label.className = "gift-field";
    label.setAttribute("for", "gift-field-" + name);

    const span = document.createElement("span");
    span.textContent = labelText;

    const input = document.createElement("input");
    input.id = "gift-field-" + name;
    input.name = name;
    input.type = type || "text";
    input.value = value == null ? "" : String(value);
    input.autocomplete = "off";

    label.append(span, input);
    return label;
  },

  selectField(name, labelText, value, options) {
    const label = document.createElement("label");
    label.className = "gift-field";
    label.setAttribute("for", "gift-field-" + name);

    const span = document.createElement("span");
    span.textContent = labelText;

    const select = document.createElement("select");
    select.id = "gift-field-" + name;
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
    bar.className = "gift-form-screen__bar";
    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "gift-form-screen__back";
    backBtn.textContent = "Back";
    backBtn.addEventListener(
      "click",
      function () {
        this.closeForm();
      }.bind(this)
    );
    bar.append(backBtn);

    const form = document.createElement("form");
    form.className = "gift-form-screen__form";
    form.noValidate = true;

    const heading = document.createElement("h2");
    heading.id = "gift-form-title";
    heading.className = "gift-form-screen__title";
    heading.textContent = editing ? "Edit gift" : "Add gift";

    form.append(
      heading,
      this.field(
        "giftName",
        "Gift Name",
        editing ? editing.giftName : "",
        "text"
      ),
      this.field(
        "forWhom",
        "For Whom?",
        editing ? editing.forWhom : "",
        "text"
      ),
      this.field(
        "occasion",
        "Occasion",
        editing ? editing.occasion : "",
        "text"
      ),
      this.field("budget", "Budget", editing ? editing.budget : "", "text"),
      this.field(
        "giftDate",
        "Gift Date",
        editing ? editing.giftDate : "",
        "date"
      ),
      this.selectField(
        "status",
        "Status",
        editing ? editing.status : "planned",
        window.JapaGiftStore.STATUSES
      )
    );

    const saveBtn = document.createElement("button");
    saveBtn.type = "submit";
    saveBtn.className = "btn btn--save-day";
    saveBtn.textContent = editing ? "Update" : "Add Gift";
    form.append(saveBtn);

    form.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();
        const data = new FormData(form);
        const giftName = String(data.get("giftName") || "").trim();
        const forWhom = String(data.get("forWhom") || "").trim();
        const occasion = String(data.get("occasion") || "").trim();
        const budget = String(data.get("budget") || "").trim();
        const giftDate = String(data.get("giftDate") || "").trim();
        const status = window.JapaGiftStore.normalizeStatus(
          String(data.get("status") || "").trim()
        );

        if (!giftName || !forWhom || !occasion || !giftDate) {
          window.alert(
            "Please fill Gift Name, For Whom?, Occasion, and Gift Date."
          );
          return;
        }

        if (editing) {
          this.items = this.items.map(function (item) {
            if (item.id !== editing.id) {
              return item;
            }
            return {
              id: item.id,
              giftName: giftName,
              forWhom: forWhom,
              occasion: occasion,
              budget: budget,
              giftDate: giftDate,
              status: status,
              createdAt: item.createdAt,
            };
          });
        } else {
          this.items.push({
            id: window.JapaGiftStore.createId(),
            giftName: giftName,
            forWhom: forWhom,
            occasion: occasion,
            budget: budget,
            giftDate: giftDate,
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
    bar.className = "gift-form-screen__bar";
    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "gift-form-screen__back";
    backBtn.textContent = "Back";
    backBtn.addEventListener(
      "click",
      function () {
        this.closeListScreen();
      }.bind(this)
    );
    bar.append(backBtn);

    const body = document.createElement("div");
    body.className = "gift-summary";

    const title = document.createElement("h2");
    title.id = "gift-list-title";
    title.className = "gift-summary__title";
    title.textContent = "Your Gift List";

    const hint = document.createElement("p");
    hint.className = "gift-summary__hint";
    hint.textContent = "Sorted by Gift Date (earliest first).";

    const ol = document.createElement("ol");
    ol.className = "gift-summary__list";

    const sorted = this.sortedByGiftDate();
    if (sorted.length === 0) {
      const empty = document.createElement("p");
      empty.className = "gift-empty box";
      empty.textContent = "No gifts to show.";
      body.append(title, hint, empty);
    } else {
      sorted.forEach(function (item) {
        const li = document.createElement("li");
        li.className = "gift-summary__item";
        li.textContent =
          (item.giftName || "—") +
          " - " +
          (item.occasion || "—") +
          " - " +
          (item.giftDate
            ? window.JapaTime.formatDateLabel(item.giftDate)
            : "—") +
          " - " +
          window.JapaGiftStore.statusLabel(item.status);
        ol.append(li);
      });
      body.append(title, hint, ol);
    }

    screen.append(bar, body);
  },
};
