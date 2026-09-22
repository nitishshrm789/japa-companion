/**
 * Slokas section — add, list in boxes, open full text, and open Vedabase link.
 */
window.JapaSlokaPanel = {
  render(rootElement) {
    this.root = rootElement;
    this.items = window.JapaSlokaStore.load();
    this.editingId = null;
    this.ensureFormScreen();
    this.ensureViewScreen();
    this.drawList();
  },

  ensureFormScreen() {
    if (document.getElementById("sloka-form-screen")) {
      this.formScreen = document.getElementById("sloka-form-screen");
      return;
    }
    const screen = document.createElement("div");
    screen.id = "sloka-form-screen";
    screen.className = "sloka-form-screen";
    screen.hidden = true;
    screen.setAttribute("role", "dialog");
    screen.setAttribute("aria-modal", "true");
    screen.setAttribute("aria-labelledby", "sloka-form-title");
    document.body.append(screen);
    this.formScreen = screen;
  },

  ensureViewScreen() {
    if (document.getElementById("sloka-view-screen")) {
      this.viewScreen = document.getElementById("sloka-view-screen");
      return;
    }
    const screen = document.createElement("div");
    screen.id = "sloka-view-screen";
    screen.className = "sloka-view-screen";
    screen.hidden = true;
    screen.setAttribute("role", "dialog");
    screen.setAttribute("aria-modal", "true");
    screen.setAttribute("aria-labelledby", "sloka-view-title");
    document.body.append(screen);
    this.viewScreen = screen;
  },

  persist() {
    this.items = window.JapaSlokaStore.save(this.items);
  },

  drawList() {
    const root = this.root;
    root.replaceChildren();

    const help = document.createElement("p");
    help.className = "sloka-help";
    help.textContent =
      "Save favorite slokas. Tap a box to read the verse and purport.";
    root.append(help);

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn btn--save-day sloka-add-btn";
    addBtn.textContent = "Add Slokas";
    addBtn.addEventListener(
      "click",
      function () {
        this.openForm(null);
      }.bind(this)
    );
    root.append(addBtn);

    const list = document.createElement("div");
    list.className = "sloka-list";

    if (this.items.length === 0) {
      const empty = document.createElement("p");
      empty.className = "sloka-empty box";
      empty.textContent = "No slokas yet. Tap Add Slokas to start.";
      list.append(empty);
    } else {
      this.items.forEach(
        function (item) {
          list.append(this.buildCard(item));
        }.bind(this)
      );
    }

    root.append(list);
  },

  buildCard(item) {
    const card = document.createElement("article");
    card.className = "sloka-card box";

    const openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.className = "sloka-card__open";
    openBtn.setAttribute("aria-label", "Open sloka: " + item.name);

    const name = document.createElement("h3");
    name.className = "sloka-card__title";
    name.textContent = item.name;

    const preview = document.createElement("p");
    preview.className = "sloka-card__preview";
    preview.textContent = item.sloka;

    openBtn.append(name, preview);
    openBtn.addEventListener(
      "click",
      function () {
        this.openView(item.id);
      }.bind(this)
    );

    const footer = document.createElement("div");
    footer.className = "sloka-card__footer";

    if (item.link) {
      const link = document.createElement("a");
      link.className = "sloka-link";
      link.href = item.link;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Link";
      link.title = item.link;
      footer.append(link);
    } else {
      const noLink = document.createElement("span");
      noLink.className = "sloka-card__no-link";
      noLink.textContent = "No link";
      footer.append(noLink);
    }

    const actions = document.createElement("div");
    actions.className = "sloka-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "sloka-action-btn";
    editBtn.textContent = "Edit";
    editBtn.addEventListener(
      "click",
      function () {
        this.openForm(item.id);
      }.bind(this)
    );

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "sloka-action-btn sloka-action-btn--danger";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener(
      "click",
      function () {
        if (!window.confirm("Remove this sloka?")) {
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
    document.body.classList.add("is-sloka-form-open");
    const first = this.formScreen.querySelector("input, textarea");
    if (first) {
      first.focus();
    }
  },

  closeForm() {
    this.editingId = null;
    this.formScreen.hidden = true;
    this.formScreen.replaceChildren();
    document.body.classList.remove("is-sloka-form-open");
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
    document.body.classList.add("is-sloka-view-open");
  },

  closeView() {
    this.viewScreen.hidden = true;
    this.viewScreen.replaceChildren();
    document.body.classList.remove("is-sloka-view-open");
  },

  field(name, labelText, value, type) {
    const label = document.createElement("label");
    label.className = "sloka-field";
    label.setAttribute("for", "sloka-field-" + name);

    const span = document.createElement("span");
    span.textContent = labelText;

    const input = document.createElement("input");
    input.id = "sloka-field-" + name;
    input.name = name;
    input.type = type || "text";
    input.value = value == null ? "" : String(value);
    input.autocomplete = "off";

    label.append(span, input);
    return label;
  },

  textAreaField(name, labelText, value, rows) {
    const label = document.createElement("label");
    label.className = "sloka-field";
    label.setAttribute("for", "sloka-field-" + name);

    const span = document.createElement("span");
    span.textContent = labelText;

    const area = document.createElement("textarea");
    area.id = "sloka-field-" + name;
    area.name = name;
    area.rows = rows || 5;
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
    bar.className = "sloka-form-screen__bar";
    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "sloka-form-screen__back";
    backBtn.textContent = "Back";
    backBtn.addEventListener(
      "click",
      function () {
        this.closeForm();
      }.bind(this)
    );
    bar.append(backBtn);

    const form = document.createElement("form");
    form.className = "sloka-form-screen__form";
    form.noValidate = true;

    const heading = document.createElement("h2");
    heading.id = "sloka-form-title";
    heading.className = "sloka-form-screen__title";
    heading.textContent = editing ? "Edit sloka" : "Add sloka";

    form.append(
      heading,
      this.field("name", "Sloka Name", editing ? editing.name : "", "text"),
      this.textAreaField("sloka", "Sloka", editing ? editing.sloka : "", 6),
      this.textAreaField(
        "purport",
        "Sloka Purport",
        editing ? editing.purport : "",
        6
      ),
      this.field(
        "link",
        "Sloka Link (URL)",
        editing ? editing.link : "",
        "url"
      )
    );

    const saveBtn = document.createElement("button");
    saveBtn.type = "submit";
    saveBtn.className = "btn btn--save-day";
    saveBtn.textContent = editing ? "Update" : "Add Slokas";
    form.append(saveBtn);

    form.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();
        const data = new FormData(form);
        const name = String(data.get("name") || "").trim();
        const sloka = String(data.get("sloka") || "").trim();
        const purport = String(data.get("purport") || "").trim();
        const link = String(data.get("link") || "").trim();

        if (!name || !sloka) {
          window.alert("Please fill Sloka Name and Sloka.");
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
              sloka: sloka,
              purport: purport,
              link: link,
              createdAt: item.createdAt,
            };
          });
        } else {
          this.items.push({
            id: window.JapaSlokaStore.createId(),
            name: name,
            sloka: sloka,
            purport: purport,
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
    bar.className = "sloka-form-screen__bar";
    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "sloka-form-screen__back";
    backBtn.textContent = "Back";
    backBtn.addEventListener(
      "click",
      function () {
        this.closeView();
      }.bind(this)
    );
    bar.append(backBtn);

    const body = document.createElement("article");
    body.className = "sloka-view";

    const title = document.createElement("h2");
    title.id = "sloka-view-title";
    title.className = "sloka-view__title";
    title.textContent = item.name;

    const slokaLabel = document.createElement("h3");
    slokaLabel.className = "sloka-view__label";
    slokaLabel.textContent = "Sloka";

    const slokaText = document.createElement("p");
    slokaText.className = "sloka-view__sloka";
    slokaText.textContent = item.sloka;

    body.append(title, slokaLabel, slokaText);

    if (item.purport) {
      const purportLabel = document.createElement("h3");
      purportLabel.className = "sloka-view__label";
      purportLabel.textContent = "Sloka Purport";

      const purportText = document.createElement("p");
      purportText.className = "sloka-view__purport";
      purportText.textContent = item.purport;

      body.append(purportLabel, purportText);
    }

    screen.append(bar, body);
  },
};
