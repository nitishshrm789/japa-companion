/**
 * Book Reading tab — card list (no horizontal scroll) + full-screen add/edit form.
 */
window.JapaBookPanel = {
  render(rootElement) {
    this.root = rootElement;
    this.entries = window.JapaBookStore.load();
    this.editingId = null;
    this.formOpen = false;
    this.ensureFormScreen();
    this.drawList();
  },

  ensureFormScreen() {
    if (document.getElementById("book-form-screen")) {
      this.formScreen = document.getElementById("book-form-screen");
      return;
    }

    const screen = document.createElement("div");
    screen.id = "book-form-screen";
    screen.className = "book-form-screen";
    screen.hidden = true;
    screen.setAttribute("role", "dialog");
    screen.setAttribute("aria-modal", "true");
    screen.setAttribute("aria-labelledby", "book-form-screen-title");
    document.body.append(screen);
    this.formScreen = screen;
  },

  persist() {
    this.entries = window.JapaBookStore.save(this.entries);
  },

  drawList() {
    const root = this.root;
    root.replaceChildren();

    const help = document.createElement("p");
    help.className = "book-help";
    help.textContent =
      "Track where you stopped in Srila Prabhupada's books. Tap Link to open Vedabase.";
    root.append(help);

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn btn--save-day book-add-btn";
    addBtn.textContent = "Add Book";
    addBtn.addEventListener(
      "click",
      function () {
        this.openForm(null);
      }.bind(this)
    );
    root.append(addBtn);

    const list = document.createElement("div");
    list.className = "book-list";

    if (this.entries.length === 0) {
      const empty = document.createElement("p");
      empty.className = "book-empty box";
      empty.textContent = "No books yet. Tap Add Book to start.";
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
    card.className = "book-card box";

    const top = document.createElement("div");
    top.className = "book-card__top";

    const indexEl = document.createElement("span");
    indexEl.className = "book-card__index";
    indexEl.textContent = "#" + index;

    const actions = document.createElement("div");
    actions.className = "book-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "book-action-btn";
    editBtn.textContent = "Edit";
    editBtn.addEventListener(
      "click",
      function () {
        this.openForm(entry.id);
      }.bind(this)
    );

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "book-action-btn book-action-btn--danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener(
      "click",
      function () {
        if (!window.confirm("Delete this book entry?")) {
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

    const bookName = document.createElement("h3");
    bookName.className = "book-card__title";
    bookName.textContent = entry.bookName || "—";

    const chapter = document.createElement("p");
    chapter.className = "book-card__chapter";
    chapter.textContent = entry.chapter || "—";

    const para = document.createElement("p");
    para.className = "book-card__para";
    para.textContent = entry.para || "—";

    const footer = document.createElement("div");
    footer.className = "book-card__footer";

    if (entry.link) {
      const anchor = document.createElement("a");
      anchor.className = "book-link";
      anchor.href = entry.link;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.textContent = "Link";
      anchor.title = entry.link;
      footer.append(anchor);
    } else {
      const noLink = document.createElement("span");
      noLink.className = "book-card__no-link";
      noLink.textContent = "No link";
      footer.append(noLink);
    }

    card.append(top, bookName, chapter, para, footer);
    return card;
  },

  openForm(entryId) {
    this.editingId = entryId;
    this.formOpen = true;
    this.drawFormScreen();
    this.formScreen.hidden = false;
    document.body.classList.add("is-book-form-open");
    const firstInput = this.formScreen.querySelector("input");
    if (firstInput) {
      firstInput.focus();
    }
  },

  closeForm() {
    this.editingId = null;
    this.formOpen = false;
    this.formScreen.hidden = true;
    this.formScreen.replaceChildren();
    document.body.classList.remove("is-book-form-open");
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
    bar.className = "book-form-screen__bar";

    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "book-form-screen__back";
    backBtn.textContent = "Back";
    backBtn.addEventListener(
      "click",
      function () {
        this.closeForm();
      }.bind(this)
    );
    bar.append(backBtn);

    const form = document.createElement("form");
    form.className = "book-form-screen__form";
    form.noValidate = true;

    const heading = document.createElement("h2");
    heading.id = "book-form-screen-title";
    heading.className = "book-form-screen__title";
    heading.textContent = editing ? "Edit book entry" : "Add book entry";

    form.append(
      heading,
      this.field("bookName", "Book Name", editing ? editing.bookName : "", "text"),
      this.field("chapter", "Chapter", editing ? editing.chapter : "", "text"),
      this.field(
        "link",
        "Full Link (URL)",
        editing ? editing.link : "",
        "url"
      ),
      this.field(
        "para",
        "Para (5–6 words to continue from)",
        editing ? editing.para : "",
        "text"
      )
    );

    const saveBtn = document.createElement("button");
    saveBtn.type = "submit";
    saveBtn.className = "btn btn--save-day";
    saveBtn.textContent = editing ? "Update" : "Add Book";
    form.append(saveBtn);

    form.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();
        const data = new FormData(form);
        const bookName = String(data.get("bookName") || "").trim();
        const chapter = String(data.get("chapter") || "").trim();
        const link = String(data.get("link") || "").trim();
        const para = String(data.get("para") || "").trim();

        if (!bookName || !chapter) {
          window.alert("Please fill Book Name and Chapter.");
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
              bookName: bookName,
              chapter: chapter,
              link: link,
              para: para,
            };
          });
        } else {
          this.entries.push({
            id: window.JapaBookStore.createId(),
            order: this.entries.length + 1,
            bookName: bookName,
            chapter: chapter,
            link: link,
            para: para,
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
    label.className = "book-field";
    label.setAttribute("for", "book-field-" + name);

    const span = document.createElement("span");
    span.textContent = labelText;

    const input = document.createElement("input");
    input.id = "book-field-" + name;
    input.name = name;
    input.type = type || "text";
    input.value = value || "";
    input.autocomplete = "off";

    label.append(span, input);
    return label;
  },
};
