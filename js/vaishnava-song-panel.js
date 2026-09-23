/**
 * Vaishnava Songs — add, search by name, list in boxes, open full song text.
 */
window.JapaVaishnavaSongPanel = {
  render(rootElement) {
    this.root = rootElement;
    this.items = window.JapaVaishnavaSongStore.load();
    this.searchQuery = this.searchQuery || "";
    this.editingId = null;
    this.ensureFormScreen();
    this.ensureViewScreen();
    this.drawList();
  },

  ensureFormScreen() {
    if (document.getElementById("vaishnava-song-form-screen")) {
      this.formScreen = document.getElementById("vaishnava-song-form-screen");
      return;
    }
    const screen = document.createElement("div");
    screen.id = "vaishnava-song-form-screen";
    screen.className = "vaishnava-song-form-screen";
    screen.hidden = true;
    screen.setAttribute("role", "dialog");
    screen.setAttribute("aria-modal", "true");
    screen.setAttribute("aria-labelledby", "vaishnava-song-form-title");
    document.body.append(screen);
    this.formScreen = screen;
  },

  ensureViewScreen() {
    if (document.getElementById("vaishnava-song-view-screen")) {
      this.viewScreen = document.getElementById("vaishnava-song-view-screen");
      return;
    }
    const screen = document.createElement("div");
    screen.id = "vaishnava-song-view-screen";
    screen.className = "vaishnava-song-view-screen";
    screen.hidden = true;
    screen.setAttribute("role", "dialog");
    screen.setAttribute("aria-modal", "true");
    screen.setAttribute("aria-labelledby", "vaishnava-song-view-title");
    document.body.append(screen);
    this.viewScreen = screen;
  },

  persist() {
    this.items = window.JapaVaishnavaSongStore.save(this.items);
  },

  filteredItems() {
    const query = String(this.searchQuery || "")
      .trim()
      .toLowerCase();
    if (!query) {
      return this.items.slice();
    }
    return this.items.filter(function (item) {
      return (
        String(item.name || "")
          .toLowerCase()
          .indexOf(query) !== -1
      );
    });
  },

  drawList() {
    const root = this.root;
    root.replaceChildren();

    const help = document.createElement("p");
    help.className = "vaishnava-song-help";
    help.textContent =
      "Save Vaishnava songs. Search by name, then tap a box to read the full song.";
    root.append(help);

    const searchWrap = document.createElement("label");
    searchWrap.className = "vaishnava-song-search";
    searchWrap.setAttribute("for", "vaishnava-song-search-input");

    const searchLabel = document.createElement("span");
    searchLabel.className = "vaishnava-song-search__label";
    searchLabel.textContent = "Search Vaishnava Song Name";

    const searchInput = document.createElement("input");
    searchInput.id = "vaishnava-song-search-input";
    searchInput.type = "search";
    searchInput.className = "vaishnava-song-search__input";
    searchInput.placeholder = "Type song name…";
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
    addBtn.className = "btn btn--save-day vaishnava-song-add-btn";
    addBtn.textContent = "Add Vaishnava Song";
    addBtn.addEventListener(
      "click",
      function () {
        this.openForm(null);
      }.bind(this)
    );
    root.append(addBtn);

    const list = document.createElement("div");
    list.id = "vaishnava-song-list";
    list.className = "vaishnava-song-list";
    root.append(list);
    this.listEl = list;
    this.drawResults();
  },

  drawResults() {
    const list = this.listEl || document.getElementById("vaishnava-song-list");
    if (!list) {
      return;
    }
    list.replaceChildren();
    const items = this.filteredItems();

    if (this.items.length === 0) {
      const empty = document.createElement("p");
      empty.className = "vaishnava-song-empty box";
      empty.textContent = "No songs yet. Tap Add Vaishnava Song to start.";
      list.append(empty);
      return;
    }

    if (items.length === 0) {
      const empty = document.createElement("p");
      empty.className = "vaishnava-song-empty box";
      empty.textContent = "No song name matches your search.";
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
    card.className = "vaishnava-song-card box";

    const openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.className = "vaishnava-song-card__open";
    openBtn.setAttribute("aria-label", "Open song: " + item.name);

    const name = document.createElement("h3");
    name.className = "vaishnava-song-card__title";
    name.textContent = item.name;

    const preview = document.createElement("p");
    preview.className = "vaishnava-song-card__preview";
    preview.textContent = item.song;

    openBtn.append(name, preview);
    openBtn.addEventListener(
      "click",
      function () {
        this.openView(item.id);
      }.bind(this)
    );

    const footer = document.createElement("div");
    footer.className = "vaishnava-song-card__footer";

    if (item.link) {
      const link = document.createElement("a");
      link.className = "vaishnava-song-link";
      link.href = item.link;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Link";
      link.title = item.link;
      footer.append(link);
    } else {
      const noLink = document.createElement("span");
      noLink.className = "vaishnava-song-card__no-link";
      noLink.textContent = "No link";
      footer.append(noLink);
    }

    const actions = document.createElement("div");
    actions.className = "vaishnava-song-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "vaishnava-song-action-btn";
    editBtn.textContent = "Edit";
    editBtn.addEventListener(
      "click",
      function () {
        this.openForm(item.id);
      }.bind(this)
    );

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className =
      "vaishnava-song-action-btn vaishnava-song-action-btn--danger";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener(
      "click",
      function () {
        if (!window.confirm("Remove this Vaishnava song?")) {
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
    document.body.classList.add("is-vaishnava-song-form-open");
    const first = this.formScreen.querySelector("input, textarea");
    if (first) {
      first.focus();
    }
  },

  closeForm() {
    this.editingId = null;
    this.formScreen.hidden = true;
    this.formScreen.replaceChildren();
    document.body.classList.remove("is-vaishnava-song-form-open");
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
    document.body.classList.add("is-vaishnava-song-view-open");
  },

  closeView() {
    this.viewScreen.hidden = true;
    this.viewScreen.replaceChildren();
    document.body.classList.remove("is-vaishnava-song-view-open");
  },

  field(name, labelText, value, type) {
    const label = document.createElement("label");
    label.className = "vaishnava-song-field";
    label.setAttribute("for", "vaishnava-song-field-" + name);

    const span = document.createElement("span");
    span.textContent = labelText;

    const input = document.createElement("input");
    input.id = "vaishnava-song-field-" + name;
    input.name = name;
    input.type = type || "text";
    input.value = value == null ? "" : String(value);
    input.autocomplete = "off";

    label.append(span, input);
    return label;
  },

  textAreaField(name, labelText, value, rows) {
    const label = document.createElement("label");
    label.className = "vaishnava-song-field";
    label.setAttribute("for", "vaishnava-song-field-" + name);

    const span = document.createElement("span");
    span.textContent = labelText;

    const area = document.createElement("textarea");
    area.id = "vaishnava-song-field-" + name;
    area.name = name;
    area.rows = rows || 8;
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
    bar.className = "vaishnava-song-form-screen__bar";
    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "vaishnava-song-form-screen__back";
    backBtn.textContent = "Back";
    backBtn.addEventListener(
      "click",
      function () {
        this.closeForm();
      }.bind(this)
    );
    bar.append(backBtn);

    const form = document.createElement("form");
    form.className = "vaishnava-song-form-screen__form";
    form.noValidate = true;

    const heading = document.createElement("h2");
    heading.id = "vaishnava-song-form-title";
    heading.className = "vaishnava-song-form-screen__title";
    heading.textContent = editing ? "Edit Vaishnava song" : "Add Vaishnava song";

    form.append(
      heading,
      this.field(
        "name",
        "Vaishnava Song Name",
        editing ? editing.name : "",
        "text"
      ),
      this.textAreaField(
        "song",
        "Vaishnava Song",
        editing ? editing.song : "",
        10
      ),
      this.field("link", "Link", editing ? editing.link : "", "url")
    );

    const saveBtn = document.createElement("button");
    saveBtn.type = "submit";
    saveBtn.className = "btn btn--save-day";
    saveBtn.textContent = editing ? "Update" : "Add Vaishnava Song";
    form.append(saveBtn);

    form.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();
        const data = new FormData(form);
        const name = String(data.get("name") || "").trim();
        const song = String(data.get("song") || "").trim();
        const link = String(data.get("link") || "").trim();

        if (!name || !song) {
          window.alert("Please fill Vaishnava Song Name and Vaishnava Song.");
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
              song: song,
              link: link,
              createdAt: item.createdAt,
            };
          });
        } else {
          this.items.push({
            id: window.JapaVaishnavaSongStore.createId(),
            name: name,
            song: song,
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
    bar.className = "vaishnava-song-form-screen__bar";
    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "vaishnava-song-form-screen__back";
    backBtn.textContent = "Back";
    backBtn.addEventListener(
      "click",
      function () {
        this.closeView();
      }.bind(this)
    );
    bar.append(backBtn);

    const body = document.createElement("article");
    body.className = "vaishnava-song-view";

    const title = document.createElement("h2");
    title.id = "vaishnava-song-view-title";
    title.className = "vaishnava-song-view__title";
    title.textContent = item.name;

    const songText = document.createElement("p");
    songText.className = "vaishnava-song-view__body";
    songText.textContent = item.song;

    body.append(title, songText);

    if (item.link) {
      const link = document.createElement("a");
      link.className = "vaishnava-song-link";
      link.href = item.link;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Open Link";
      body.append(link);
    }

    screen.append(bar, body);
  },
};
