/**
 * Prayer section — add, search by name, list in boxes, open full prayer text.
 */
window.JapaPrayerPanel = {
  render(rootElement) {
    this.root = rootElement;
    this.items = window.JapaPrayerStore.load();
    this.searchQuery = this.searchQuery || "";
    this.editingId = null;
    this.ensureFormScreen();
    this.ensureViewScreen();
    this.drawList();
  },

  ensureFormScreen() {
    if (document.getElementById("prayer-form-screen")) {
      this.formScreen = document.getElementById("prayer-form-screen");
      return;
    }
    const screen = document.createElement("div");
    screen.id = "prayer-form-screen";
    screen.className = "prayer-form-screen";
    screen.hidden = true;
    screen.setAttribute("role", "dialog");
    screen.setAttribute("aria-modal", "true");
    screen.setAttribute("aria-labelledby", "prayer-form-title");
    document.body.append(screen);
    this.formScreen = screen;
  },

  ensureViewScreen() {
    if (document.getElementById("prayer-view-screen")) {
      this.viewScreen = document.getElementById("prayer-view-screen");
      return;
    }
    const screen = document.createElement("div");
    screen.id = "prayer-view-screen";
    screen.className = "prayer-view-screen";
    screen.hidden = true;
    screen.setAttribute("role", "dialog");
    screen.setAttribute("aria-modal", "true");
    screen.setAttribute("aria-labelledby", "prayer-view-title");
    document.body.append(screen);
    this.viewScreen = screen;
  },

  persist() {
    this.items = window.JapaPrayerStore.save(this.items);
  },

  filteredItems() {
    const query = String(this.searchQuery || "")
      .trim()
      .toLowerCase();
    if (!query) {
      return this.items.slice();
    }
    return this.items.filter(function (item) {
      return String(item.name || "")
        .toLowerCase()
        .indexOf(query) !== -1;
    });
  },

  drawList() {
    const root = this.root;
    root.replaceChildren();

    const help = document.createElement("p");
    help.className = "prayer-help";
    help.textContent =
      "Save prayers. Search by name, then tap a box to read the full prayer.";
    root.append(help);

    const searchWrap = document.createElement("label");
    searchWrap.className = "prayer-search";
    searchWrap.setAttribute("for", "prayer-search-input");

    const searchLabel = document.createElement("span");
    searchLabel.className = "prayer-search__label";
    searchLabel.textContent = "Search Prayer Name";

    const searchInput = document.createElement("input");
    searchInput.id = "prayer-search-input";
    searchInput.type = "search";
    searchInput.className = "prayer-search__input";
    searchInput.placeholder = "Type prayer name…";
    searchInput.value = this.searchQuery || "";
    searchInput.autocomplete = "off";
    searchInput.addEventListener(
      "input",
      function () {
        this.searchQuery = String(searchInput.value || "");
        this.drawResults();
      }.bind(this)
    );

    searchWrap.append(searchLabel, searchInput);
    root.append(searchWrap);

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn btn--save-day prayer-add-btn";
    addBtn.textContent = "Add Prayer";
    addBtn.addEventListener(
      "click",
      function () {
        this.openForm(null);
      }.bind(this)
    );
    root.append(addBtn);

    const list = document.createElement("div");
    list.id = "prayer-list";
    list.className = "prayer-list";
    root.append(list);
    this.listEl = list;
    this.drawResults();
  },

  drawResults() {
    const list = this.listEl || document.getElementById("prayer-list");
    if (!list) {
      return;
    }
    list.replaceChildren();
    const items = this.filteredItems();

    if (this.items.length === 0) {
      const empty = document.createElement("p");
      empty.className = "prayer-empty box";
      empty.textContent = "No prayers yet. Tap Add Prayer to start.";
      list.append(empty);
      return;
    }

    if (items.length === 0) {
      const empty = document.createElement("p");
      empty.className = "prayer-empty box";
      empty.textContent = "No prayer name matches your search.";
      list.append(empty);
      return;
    }

    items.forEach(
      function (item) {
        list.append(this.buildCard(item));
      }.bind(this)
    );
  },

  buildCard(item) {
    const card = document.createElement("article");
    card.className = "prayer-card box";

    const openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.className = "prayer-card__open";
    openBtn.setAttribute("aria-label", "Open prayer: " + item.name);

    const name = document.createElement("h3");
    name.className = "prayer-card__title";
    name.textContent = item.name;

    const preview = document.createElement("p");
    preview.className = "prayer-card__preview";
    preview.textContent = item.prayer;

    openBtn.append(name, preview);
    openBtn.addEventListener(
      "click",
      function () {
        this.openView(item.id);
      }.bind(this)
    );

    const footer = document.createElement("div");
    footer.className = "prayer-card__footer";

    if (item.link) {
      const link = document.createElement("a");
      link.className = "prayer-link";
      link.href = item.link;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Link";
      link.title = item.link;
      footer.append(link);
    } else {
      const noLink = document.createElement("span");
      noLink.className = "prayer-card__no-link";
      noLink.textContent = "No link";
      footer.append(noLink);
    }

    const actions = document.createElement("div");
    actions.className = "prayer-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "prayer-action-btn";
    editBtn.textContent = "Edit";
    editBtn.addEventListener(
      "click",
      function () {
        this.openForm(item.id);
      }.bind(this)
    );

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "prayer-action-btn prayer-action-btn--danger";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener(
      "click",
      function () {
        if (!window.confirm("Remove this prayer?")) {
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
    footer.append(actions);

    card.append(openBtn, footer);
    return card;
  },

  openForm(entryId) {
    this.editingId = entryId;
    this.drawFormScreen();
    this.formScreen.hidden = false;
    document.body.classList.add("is-prayer-form-open");
    const first = this.formScreen.querySelector("input, textarea");
    if (first) {
      first.focus();
    }
  },

  closeForm() {
    this.editingId = null;
    this.formScreen.hidden = true;
    this.formScreen.replaceChildren();
    document.body.classList.remove("is-prayer-form-open");
  },

  openView(entryId) {
    const item = this.items.find(function (entry) {
      return entry.id === entryId;
    });
    if (!item) {
      return;
    }
    this.drawViewScreen(item);
    this.viewScreen.hidden = false;
    document.body.classList.add("is-prayer-view-open");
  },

  closeView() {
    this.viewScreen.hidden = true;
    this.viewScreen.replaceChildren();
    document.body.classList.remove("is-prayer-view-open");
  },

  field(name, labelText, value, type) {
    const label = document.createElement("label");
    label.className = "prayer-field";
    label.setAttribute("for", "prayer-field-" + name);

    const span = document.createElement("span");
    span.textContent = labelText;

    const input = document.createElement("input");
    input.id = "prayer-field-" + name;
    input.name = name;
    input.type = type || "text";
    input.value = value == null ? "" : String(value);
    input.autocomplete = "off";

    label.append(span, input);
    return label;
  },

  textAreaField(name, labelText, value, rows) {
    const label = document.createElement("label");
    label.className = "prayer-field";
    label.setAttribute("for", "prayer-field-" + name);

    const span = document.createElement("span");
    span.textContent = labelText;

    const area = document.createElement("textarea");
    area.id = "prayer-field-" + name;
    area.name = name;
    area.rows = rows || 6;
    area.value = value == null ? "" : String(value);
    area.autocomplete = "off";

    label.append(span, area);
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
    bar.className = "prayer-form-screen__bar";
    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "prayer-form-screen__back";
    backBtn.textContent = "Back";
    backBtn.addEventListener(
      "click",
      function () {
        this.closeForm();
      }.bind(this)
    );
    bar.append(backBtn);

    const form = document.createElement("form");
    form.className = "prayer-form-screen__form";
    form.noValidate = true;

    const heading = document.createElement("h2");
    heading.id = "prayer-form-title";
    heading.className = "prayer-form-screen__title";
    heading.textContent = editing ? "Edit prayer" : "Add prayer";

    form.append(
      heading,
      this.field("name", "Prayer Name", editing ? editing.name : "", "text"),
      this.textAreaField(
        "prayer",
        "Prayer",
        editing ? editing.prayer : "",
        8
      ),
      this.field("link", "Link", editing ? editing.link : "", "url")
    );

    const saveBtn = document.createElement("button");
    saveBtn.type = "submit";
    saveBtn.className = "btn btn--save-day";
    saveBtn.textContent = editing ? "Update" : "Add Prayer";
    form.append(saveBtn);

    form.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();
        const data = new FormData(form);
        const name = String(data.get("name") || "").trim();
        const prayer = String(data.get("prayer") || "").trim();
        const link = String(data.get("link") || "").trim();

        if (!name || !prayer) {
          window.alert("Please fill Prayer Name and Prayer.");
          return;
        }

        if (link && !/^https?:\/\//i.test(link)) {
          window.alert("Link should start with http:// or https://");
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
              prayer: prayer,
              link: link,
              createdAt: item.createdAt,
            };
          });
        } else {
          this.items.push({
            id: window.JapaPrayerStore.createId(),
            name: name,
            prayer: prayer,
            link: link,
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

  drawViewScreen(item) {
    const screen = this.viewScreen;
    screen.replaceChildren();

    const bar = document.createElement("div");
    bar.className = "prayer-form-screen__bar";
    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "prayer-form-screen__back";
    backBtn.textContent = "Back";
    backBtn.addEventListener(
      "click",
      function () {
        this.closeView();
      }.bind(this)
    );
    bar.append(backBtn);

    const body = document.createElement("article");
    body.className = "prayer-view";

    const title = document.createElement("h2");
    title.id = "prayer-view-title";
    title.className = "prayer-view__title";
    title.textContent = item.name;

    const prayerText = document.createElement("p");
    prayerText.className = "prayer-view__body";
    prayerText.textContent = item.prayer;

    body.append(title, prayerText);

    if (item.link) {
      const link = document.createElement("a");
      link.className = "prayer-link";
      link.href = item.link;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Open Link";
      body.append(link);
    }

    screen.append(bar, body);
  },
};
