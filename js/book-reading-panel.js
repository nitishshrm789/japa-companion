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

  calcProgress(entry) {
    const completed = Math.max(0, entry.chaptersCompleted || 0);
    const total = Math.max(0, entry.chaptersTotal || 0);

    if (total <= 0) {
      return {
        percent: 0,
        status: "unset",
        statusLabel: "Set chapter totals",
        hasTotal: false,
      };
    }

    const percent = Math.min(
      100,
      Math.round((completed / total) * 1000) / 10
    );
    const done = completed >= total;

    return {
      percent: percent,
      status: done ? "done" : "on-track",
      statusLabel: done ? "Completed" : "On track",
      hasTotal: true,
    };
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
    const stats = this.calcProgress(entry);
    const card = document.createElement("article");
    card.className = "book-card box is-" + stats.status;

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

    const badge = document.createElement("p");
    badge.className = "book-card__badge";
    if (stats.hasTotal) {
      badge.textContent = stats.statusLabel + " · " + stats.percent + "% done";
    } else {
      badge.textContent = stats.statusLabel;
    }

    const bar = document.createElement("div");
    bar.className = "book-progress-bar";
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
    bar.setAttribute("aria-valuenow", String(stats.percent));
    bar.setAttribute(
      "aria-label",
      stats.hasTotal
        ? stats.percent + "% of chapters complete"
        : "Chapter totals not set"
    );

    const fill = document.createElement("div");
    fill.className = "book-progress-bar__fill";
    fill.style.width = stats.percent + "%";
    bar.append(fill);

    const meta = document.createElement("p");
    meta.className = "book-card__meta";
    if (stats.hasTotal) {
      meta.textContent =
        (entry.chaptersCompleted || 0) +
        " / " +
        entry.chaptersTotal +
        " chapters";
    } else {
      meta.textContent = "Edit to add chapter totals";
    }

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

    card.append(top, bookName, chapter, para, badge, bar, meta, footer);
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
      ),
      this.field(
        "chaptersCompleted",
        "Total no of Chapter Completed",
        editing ? String(editing.chaptersCompleted || 0) : "",
        "number",
        { min: "0", step: "1", inputmode: "numeric" }
      ),
      this.field(
        "chaptersTotal",
        "Total no of Chapters in this Book",
        editing && editing.chaptersTotal
          ? String(editing.chaptersTotal)
          : "",
        "number",
        { min: "1", step: "1", inputmode: "numeric" }
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
        const completedRaw = String(data.get("chaptersCompleted") || "").trim();
        const totalRaw = String(data.get("chaptersTotal") || "").trim();

        if (!bookName || !chapter) {
          window.alert("Please fill Book Name and Chapter.");
          return;
        }

        if (!completedRaw || !totalRaw) {
          window.alert(
            "Please fill Total no of Chapter Completed and Total no of Chapters in this Book."
          );
          return;
        }

        if (!/^\d+$/.test(completedRaw) || !/^\d+$/.test(totalRaw)) {
          window.alert("Chapter counts must be whole numbers (integers).");
          return;
        }

        const chaptersCompleted = parseInt(completedRaw, 10);
        const chaptersTotal = parseInt(totalRaw, 10);

        if (chaptersTotal < 1) {
          window.alert("Total chapters in this book must be at least 1.");
          return;
        }

        if (chaptersCompleted > chaptersTotal) {
          window.alert(
            "Chapters completed cannot be more than total chapters in this book."
          );
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
              chaptersCompleted: chaptersCompleted,
              chaptersTotal: chaptersTotal,
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
            chaptersCompleted: chaptersCompleted,
            chaptersTotal: chaptersTotal,
          });
        }

        this.persist();
        this.closeForm();
        this.drawList();
      }.bind(this)
    );

    screen.append(bar, form);
  },

  field(name, labelText, value, type, options) {
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

    if (options) {
      if (options.min !== undefined) {
        input.min = options.min;
      }
      if (options.step !== undefined) {
        input.step = options.step;
      }
      if (options.inputmode) {
        input.setAttribute("inputmode", options.inputmode);
      }
    }

    label.append(span, input);
    return label;
  },
};
