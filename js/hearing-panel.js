/**
 * Hearing tab — lecture cards + full-screen add/edit form.
 */
window.JapaHearingPanel = {
  render(rootElement) {
    this.root = rootElement;
    this.entries = window.JapaHearingStore.load();
    this.editingId = null;
    this.ensureFormScreen();
    this.drawList();
  },

  ensureFormScreen() {
    if (document.getElementById("hearing-form-screen")) {
      this.formScreen = document.getElementById("hearing-form-screen");
      return;
    }

    const screen = document.createElement("div");
    screen.id = "hearing-form-screen";
    screen.className = "hearing-form-screen";
    screen.hidden = true;
    screen.setAttribute("role", "dialog");
    screen.setAttribute("aria-modal", "true");
    screen.setAttribute("aria-labelledby", "hearing-form-screen-title");
    document.body.append(screen);
    this.formScreen = screen;
  },

  persist() {
    this.entries = window.JapaHearingStore.save(this.entries);
  },

  drawList() {
    const root = this.root;
    root.replaceChildren();

    const help = document.createElement("p");
    help.className = "hearing-help";
    help.textContent =
      "Track lectures and classes you are hearing. Tap Link to open; note the time-stamp where you paused.";
    root.append(help);

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn btn--save-day hearing-add-btn";
    addBtn.textContent = "Add Class";
    addBtn.addEventListener(
      "click",
      function () {
        this.openForm(null);
      }.bind(this)
    );
    root.append(addBtn);

    const list = document.createElement("div");
    list.className = "hearing-list";

    if (this.entries.length === 0) {
      const empty = document.createElement("p");
      empty.className = "hearing-empty box";
      empty.textContent = "No classes yet. Tap Add Class to start.";
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
    card.className = "hearing-card box";

    const top = document.createElement("div");
    top.className = "hearing-card__top";

    const indexEl = document.createElement("span");
    indexEl.className = "hearing-card__index";
    indexEl.textContent = "#" + index;

    const actions = document.createElement("div");
    actions.className = "hearing-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "hearing-action-btn";
    editBtn.textContent = "Edit";
    editBtn.addEventListener(
      "click",
      function () {
        this.openForm(entry.id);
      }.bind(this)
    );

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "hearing-action-btn hearing-action-btn--danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener(
      "click",
      function () {
        if (!window.confirm("Delete this class entry?")) {
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
    title.className = "hearing-card__title";
    title.textContent = entry.lectureName || "—";

    const stamp = document.createElement("p");
    stamp.className = "hearing-card__stamp";
    stamp.textContent = "Time-stamp: " + (entry.timeStamp || "—");

    const footer = document.createElement("div");
    footer.className = "hearing-card__footer";

    if (entry.link) {
      const anchor = document.createElement("a");
      anchor.className = "hearing-link";
      anchor.href = entry.link;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.textContent = "Link";
      anchor.title = entry.link;
      footer.append(anchor);
    } else {
      const noLink = document.createElement("span");
      noLink.className = "hearing-card__no-link";
      noLink.textContent = "No link";
      footer.append(noLink);
    }

    card.append(top, title, stamp, footer);
    return card;
  },

  openForm(entryId) {
    this.editingId = entryId;
    this.drawFormScreen();
    this.formScreen.hidden = false;
    document.body.classList.add("is-hearing-form-open");
    const firstInput = this.formScreen.querySelector("input");
    if (firstInput) {
      firstInput.focus();
    }
  },

  closeForm() {
    this.editingId = null;
    this.formScreen.hidden = true;
    this.formScreen.replaceChildren();
    document.body.classList.remove("is-hearing-form-open");
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
    bar.className = "hearing-form-screen__bar";

    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "hearing-form-screen__back";
    backBtn.textContent = "Back";
    backBtn.addEventListener(
      "click",
      function () {
        this.closeForm();
      }.bind(this)
    );
    bar.append(backBtn);

    const form = document.createElement("form");
    form.className = "hearing-form-screen__form";
    form.noValidate = true;

    const heading = document.createElement("h2");
    heading.id = "hearing-form-screen-title";
    heading.className = "hearing-form-screen__title";
    heading.textContent = editing ? "Edit class" : "Add class";

    form.append(
      heading,
      this.field(
        "lectureName",
        "Lecture Name",
        editing ? editing.lectureName : "",
        "text"
      ),
      this.field("link", "Full Link (URL)", editing ? editing.link : "", "url"),
      this.field(
        "timeStamp",
        "Time-Stamp (e.g. 12:45)",
        editing ? editing.timeStamp : "",
        "text"
      )
    );

    const saveBtn = document.createElement("button");
    saveBtn.type = "submit";
    saveBtn.className = "btn btn--save-day";
    saveBtn.textContent = editing ? "Update" : "Add Class";
    form.append(saveBtn);

    form.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();
        const data = new FormData(form);
        const lectureName = String(data.get("lectureName") || "").trim();
        const link = String(data.get("link") || "").trim();
        const timeStamp = String(data.get("timeStamp") || "").trim();

        if (!lectureName) {
          window.alert("Please fill Lecture Name.");
          return;
        }

        if (link && !/^https?:\/\//i.test(link)) {
          window.alert("Link should start with http:// or https://");
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
              lectureName: lectureName,
              link: link,
              timeStamp: timeStamp,
            };
          });
        } else {
          this.entries.push({
            id: window.JapaHearingStore.createId(),
            order: this.entries.length + 1,
            lectureName: lectureName,
            link: link,
            timeStamp: timeStamp,
          });
        }

        this.persist();
        this.closeForm();
        this.drawList();
      }.bind(this)
    );

    screen.append(bar, form);
  },

  field(name, labelText, value, type) {
    const label = document.createElement("label");
    label.className = "hearing-field";
    label.setAttribute("for", "hearing-field-" + name);

    const span = document.createElement("span");
    span.textContent = labelText;

    const input = document.createElement("input");
    input.id = "hearing-field-" + name;
    input.name = name;
    input.type = type || "text";
    input.value = value || "";
    input.autocomplete = "off";

    label.append(span, input);
    return label;
  },
};
