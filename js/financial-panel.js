/**
 * Financial — plan life goals (Home, Car, etc.) with links and investment details.
 */
window.JapaFinancialPanel = {
  render(rootElement) {
    this.root = rootElement;
    this.items = window.JapaFinancialStore.load();
    this.activeType = this.activeType || "all";
    this.editingId = null;
    this.detailsItemId = null;
    this.ensureItemForm();
    this.ensureDetailsForm();
    this.ensureCalculatorScreen();
    this.drawList();
  },

  ensureItemForm() {
    if (document.getElementById("financial-item-screen")) {
      this.itemScreen = document.getElementById("financial-item-screen");
      return;
    }
    const screen = document.createElement("div");
    screen.id = "financial-item-screen";
    screen.className = "financial-screen";
    screen.hidden = true;
    screen.setAttribute("role", "dialog");
    screen.setAttribute("aria-modal", "true");
    screen.setAttribute("aria-labelledby", "financial-item-title");
    document.body.append(screen);
    this.itemScreen = screen;
  },

  ensureDetailsForm() {
    if (document.getElementById("financial-details-screen")) {
      this.detailsScreen = document.getElementById("financial-details-screen");
      return;
    }
    const screen = document.createElement("div");
    screen.id = "financial-details-screen";
    screen.className = "financial-screen";
    screen.hidden = true;
    screen.setAttribute("role", "dialog");
    screen.setAttribute("aria-modal", "true");
    screen.setAttribute("aria-labelledby", "financial-details-title");
    document.body.append(screen);
    this.detailsScreen = screen;
  },

  ensureCalculatorScreen() {
    const existingScreen = document.getElementById(
      "financial-calculator-screen"
    );
    if (existingScreen) {
      this.calculatorScreen = existingScreen;
      return;
    }

    const screen = document.createElement("div");
    screen.id = "financial-calculator-screen";
    screen.className = "financial-screen";
    screen.hidden = true;
    screen.setAttribute("role", "dialog");
    screen.setAttribute("aria-modal", "true");
    screen.setAttribute("aria-labelledby", "financial-calculator-title");

    const bar = document.createElement("div");
    bar.className = "financial-screen__bar";

    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "financial-screen__back";
    backBtn.textContent = "Back";
    backBtn.addEventListener(
      "click",
      function () {
        this.closeCalculatorScreen();
      }.bind(this)
    );
    bar.append(backBtn);

    const content = document.createElement("div");
    content.className = "financial-calculator-hub";

    const heading = document.createElement("h2");
    heading.id = "financial-calculator-title";
    heading.className = "financial-screen__title";
    heading.textContent = "Calculate Different Finance";

    const message = document.createElement("p");
    message.textContent = "Choose a financial calculation.";

    content.append(heading, message);
    window.JapaFinanceCalculatorPanel.renderCatalog(content);
    screen.append(bar, content);
    document.body.append(screen);
    this.calculatorScreen = screen;
  },

  persist() {
    this.items = window.JapaFinancialStore.save(this.items);
  },

  uniqueTypes() {
    const seen = {};
    const types = [];
    this.items.forEach(function (item) {
      if (!seen[item.financeType]) {
        seen[item.financeType] = true;
        types.push(item.financeType);
      }
    });
    return types.sort(function (a, b) {
      return a < b ? -1 : 1;
    });
  },

  filteredItems() {
    if (this.activeType === "all") {
      return this.items.slice();
    }
    const type = this.activeType;
    return this.items.filter(function (item) {
      return item.financeType === type;
    });
  },

  formatMoney(amount) {
    const value = Math.round((Number(amount) || 0) * 100) / 100;
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  },

  /** Accepts www.site.com or site.com and stores a clickable https URL. */
  normalizeLink(raw) {
    const value = String(raw || "").trim();
    if (!value) {
      return "";
    }
    if (/^https?:\/\//i.test(value)) {
      return value;
    }
    if (/^\/\//.test(value)) {
      return "https:" + value;
    }
    return "https://" + value;
  },

  calcPlan(details) {
    if (!details) {
      return null;
    }
    const days = window.JapaTime.daysUntil(
      details.endDateKey,
      window.JapaTime.parseDateKey(details.startDateKey)
    );
    const totalDays = Math.max(0, days);
    const totalInvest = details.dailyAmount * totalDays;
    const remainingDays = window.JapaTime.daysUntil(details.endDateKey);
    return {
      totalDays: totalDays,
      remainingDays: remainingDays,
      totalInvest: totalInvest,
    };
  },

  drawList() {
    const root = this.root;
    root.replaceChildren();

    const help = document.createElement("p");
    help.className = "financial-help";
    help.textContent =
      "Plan purchases and investments. Add links and optional saving details for each goal.";
    root.append(help);

    const types = this.uniqueTypes();
    if (types.length > 0) {
      const chips = document.createElement("div");
      chips.className = "financial-chips";
      chips.setAttribute("aria-label", "Finance types");

      const allChip = document.createElement("button");
      allChip.type = "button";
      allChip.className =
        "financial-chip" + (this.activeType === "all" ? " is-active" : "");
      allChip.textContent = "All";
      allChip.addEventListener(
        "click",
        function () {
          this.activeType = "all";
          this.drawList();
        }.bind(this)
      );
      chips.append(allChip);

      types.forEach(
        function (type) {
          const chip = document.createElement("button");
          chip.type = "button";
          chip.className =
            "financial-chip" + (this.activeType === type ? " is-active" : "");
          chip.textContent = type;
          chip.addEventListener(
            "click",
            function () {
              this.activeType = type;
              this.drawList();
            }.bind(this)
          );
          chips.append(chip);
        }.bind(this)
      );

      root.append(chips);
    }

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn btn--save-day financial-add-btn";
    addBtn.textContent = "Add Finance Item";
    addBtn.addEventListener(
      "click",
      function () {
        this.openItemForm(null);
      }.bind(this)
    );
    root.append(addBtn);

    const readBtn = document.createElement("button");
    readBtn.type = "button";
    readBtn.className = "btn btn--reset financial-read-btn";
    readBtn.textContent = "Read This";
    readBtn.addEventListener("click", function () {
      window.JapaFinancialEducationPanel.open(readBtn);
    });
    root.append(readBtn);

    const calculatorBtn = document.createElement("button");
    calculatorBtn.type = "button";
    calculatorBtn.className = "btn btn--reset financial-calculator-btn";
    calculatorBtn.textContent = "Calculate Different Finance";
    calculatorBtn.addEventListener(
      "click",
      function () {
        this.openCalculatorScreen();
      }.bind(this)
    );
    root.append(calculatorBtn);

    const list = document.createElement("div");
    list.className = "financial-list";
    const items = this.filteredItems();

    if (items.length === 0) {
      const empty = document.createElement("p");
      empty.className = "financial-empty box";
      empty.textContent =
        this.items.length === 0
          ? "No finance items yet. Tap Add Finance Item to start planning."
          : "No items in this type.";
      list.append(empty);
    } else {
      items.forEach(
        function (item) {
          list.append(this.buildCard(item));
        }.bind(this)
      );
    }
    root.append(list);
  },

  buildCard(item) {
    const card = document.createElement("article");
    card.className = "financial-card box";

    const top = document.createElement("div");
    top.className = "financial-card__top";

    const titleWrap = document.createElement("div");
    const type = document.createElement("p");
    type.className = "financial-card__type";
    type.textContent = item.financeType;
    const title = document.createElement("h3");
    title.className = "financial-card__title";
    title.textContent = item.name;
    titleWrap.append(type, title);

    const actions = document.createElement("div");
    actions.className = "financial-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "financial-action-btn";
    editBtn.textContent = "Edit";
    editBtn.addEventListener(
      "click",
      function () {
        this.openItemForm(item.id);
      }.bind(this)
    );

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "financial-action-btn financial-action-btn--danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener(
      "click",
      function () {
        if (!window.confirm("Delete this finance item?")) {
          return;
        }
        this.items = this.items.filter(function (entry) {
          return entry.id !== item.id;
        });
        if (
          this.activeType !== "all" &&
          this.uniqueTypes().indexOf(this.activeType) === -1
        ) {
          this.activeType = "all";
        }
        this.persist();
        this.drawList();
      }.bind(this)
    );

    actions.append(editBtn, deleteBtn);
    top.append(titleWrap, actions);
    card.append(top);

    if (item.notes) {
      const notes = document.createElement("p");
      notes.className = "financial-card__notes";
      notes.textContent = item.notes;
      card.append(notes);
    }

    if (item.links.length > 0) {
      const links = document.createElement("div");
      links.className = "financial-links";
      item.links.forEach(function (url, index) {
        const a = document.createElement("a");
        a.className = "financial-link";
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = "Link " + (index + 1);
        a.title = url;
        links.append(a);
      });
      card.append(links);
    }

    if (item.details) {
      const plan = this.calcPlan(item.details);
      const detailsBox = document.createElement("div");
      detailsBox.className = "financial-details box";

      const dl = document.createElement("dl");
      dl.className = "financial-meta";
      const rows = [
        [
          "Start Date",
          window.JapaTime.formatDayMonthYear(item.details.startDateKey),
        ],
        [
          "End Date",
          window.JapaTime.formatDayMonthYear(item.details.endDateKey),
        ],
        [
          "Daily amount to be Invested",
          this.formatMoney(item.details.dailyAmount),
        ],
      ];
      if (plan) {
        rows.push(
          ["Plan days", String(plan.totalDays)],
          ["Days remaining", String(plan.remainingDays)],
          ["Estimated total", this.formatMoney(plan.totalInvest)]
        );
      }
      rows.forEach(function (pair) {
        const dt = document.createElement("dt");
        dt.textContent = pair[0];
        const dd = document.createElement("dd");
        dd.textContent = pair[1];
        dl.append(dt, dd);
      });
      detailsBox.append(dl);

      if (item.details.moreDetails) {
        const more = document.createElement("p");
        more.className = "financial-more";
        more.textContent = item.details.moreDetails;
        detailsBox.append(more);
      }
      card.append(detailsBox);
    }

    const detailsBtn = document.createElement("button");
    detailsBtn.type = "button";
    detailsBtn.className = "btn btn--reset financial-details-btn";
    detailsBtn.textContent = item.details
      ? "Edit More Details"
      : "Add More Details";
    detailsBtn.addEventListener(
      "click",
      function () {
        this.openDetailsForm(item.id);
      }.bind(this)
    );
    card.append(detailsBtn);

    return card;
  },

  openItemForm(entryId) {
    this.editingId = entryId;
    this.drawItemForm();
    this.itemScreen.hidden = false;
    document.body.classList.add("is-financial-form-open");
  },

  closeItemForm() {
    this.editingId = null;
    this.itemScreen.hidden = true;
    this.itemScreen.replaceChildren();
    document.body.classList.remove("is-financial-form-open");
  },

  openDetailsForm(itemId) {
    this.detailsItemId = itemId;
    this.drawDetailsForm();
    this.detailsScreen.hidden = false;
    document.body.classList.add("is-financial-form-open");
  },

  closeDetailsForm() {
    this.detailsItemId = null;
    this.detailsScreen.hidden = true;
    this.detailsScreen.replaceChildren();
    document.body.classList.remove("is-financial-form-open");
  },

  openCalculatorScreen() {
    this.calculatorScreen.hidden = false;
    document.body.classList.add("is-financial-form-open");
  },

  closeCalculatorScreen() {
    this.calculatorScreen.hidden = true;
    document.body.classList.remove("is-financial-form-open");
  },

  field(name, labelText, value, type, attrs) {
    const label = document.createElement("label");
    label.className = "financial-field";
    label.setAttribute("for", "financial-field-" + name);

    const span = document.createElement("span");
    span.textContent = labelText;

    const input = document.createElement("input");
    input.id = "financial-field-" + name;
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

  drawItemForm() {
    const editing = this.items.find(
      function (item) {
        return item.id === this.editingId;
      }.bind(this)
    );

    const screen = this.itemScreen;
    screen.replaceChildren();

    const bar = document.createElement("div");
    bar.className = "financial-screen__bar";
    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "financial-screen__back";
    backBtn.textContent = "Back";
    backBtn.addEventListener(
      "click",
      function () {
        this.closeItemForm();
      }.bind(this)
    );
    bar.append(backBtn);

    const form = document.createElement("form");
    form.className = "financial-screen__form";
    form.noValidate = true;

    const heading = document.createElement("h2");
    heading.id = "financial-item-title";
    heading.className = "financial-screen__title";
    heading.textContent = editing ? "Edit finance item" : "Add finance item";

    form.append(
      heading,
      this.field(
        "financeType",
        "Type of Finance (e.g. Home, Car, Bike)",
        editing ? editing.financeType : "",
        "text"
      ),
      this.field("name", "Name", editing ? editing.name : "", "text")
    );

    const linksWrap = document.createElement("div");
    linksWrap.className = "financial-links-editor";
    const linksLabel = document.createElement("p");
    linksLabel.className = "financial-links-editor__label";
    linksLabel.textContent = "Link(s)";
    linksWrap.append(linksLabel);

    const linksList = document.createElement("div");
    linksList.className = "financial-links-editor__list";

    const initialLinks =
      editing && editing.links.length > 0 ? editing.links.slice() : [""];

    function addLinkRow(value) {
      const row = document.createElement("div");
      row.className = "financial-link-row";
      const input = document.createElement("input");
      input.type = "text";
      input.className = "financial-link-input";
      input.placeholder = "www.example.com or https://...";
      input.value = value || "";
      input.autocomplete = "off";
      input.inputMode = "url";
      row.append(input);
      linksList.append(row);
    }

    initialLinks.forEach(addLinkRow);

    const addLinkBtn = document.createElement("button");
    addLinkBtn.type = "button";
    addLinkBtn.className = "financial-add-link";
    addLinkBtn.setAttribute("aria-label", "Add another link");
    addLinkBtn.textContent = "+";
    addLinkBtn.addEventListener("click", function () {
      addLinkRow("");
      const inputs = linksList.querySelectorAll("input");
      inputs[inputs.length - 1].focus();
    });

    linksWrap.append(linksList, addLinkBtn);
    form.append(linksWrap);

    form.append(
      this.field("notes", "Notes", editing ? editing.notes : "", "text")
    );

    const saveBtn = document.createElement("button");
    saveBtn.type = "submit";
    saveBtn.className = "btn btn--save-day";
    saveBtn.textContent = editing ? "Update" : "Save Item";
    form.append(saveBtn);

    form.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();
        const data = new FormData(form);
        const financeType = String(data.get("financeType") || "").trim();
        const name = String(data.get("name") || "").trim();
        const notes = String(data.get("notes") || "").trim();
        const links = Array.prototype.slice
          .call(linksList.querySelectorAll("input"))
          .map(
            function (input) {
              return this.normalizeLink(input.value);
            }.bind(this)
          )
          .filter(Boolean);

        if (!financeType) {
          window.alert("Please enter Type of Finance.");
          return;
        }
        if (!name) {
          window.alert("Please enter a Name.");
          return;
        }

        if (editing) {
          this.items = this.items.map(function (item) {
            if (item.id !== editing.id) {
              return item;
            }
            return {
              id: item.id,
              financeType: financeType,
              name: name,
              links: links,
              notes: notes,
              details: item.details,
              createdAt: item.createdAt,
            };
          });
        } else {
          this.items.push({
            id: window.JapaFinancialStore.createId(),
            financeType: financeType,
            name: name,
            links: links,
            notes: notes,
            details: null,
            createdAt: Date.now(),
          });
          this.activeType = financeType;
        }

        this.persist();
        this.closeItemForm();
        this.drawList();
      }.bind(this)
    );

    screen.append(bar, form);
    const first = form.querySelector("input");
    if (first) {
      first.focus();
    }
  },

  drawDetailsForm() {
    const item = this.items.find(
      function (entry) {
        return entry.id === this.detailsItemId;
      }.bind(this)
    );
    if (!item) {
      this.closeDetailsForm();
      return;
    }

    const details = item.details || {
      startDateKey: "",
      endDateKey: "",
      dailyAmount: "",
      moreDetails: "",
    };

    const screen = this.detailsScreen;
    screen.replaceChildren();

    const bar = document.createElement("div");
    bar.className = "financial-screen__bar";
    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "financial-screen__back";
    backBtn.textContent = "Back";
    backBtn.addEventListener(
      "click",
      function () {
        this.closeDetailsForm();
      }.bind(this)
    );
    bar.append(backBtn);

    const form = document.createElement("form");
    form.className = "financial-screen__form";
    form.noValidate = true;

    const heading = document.createElement("h2");
    heading.id = "financial-details-title";
    heading.className = "financial-screen__title";
    heading.textContent = "More details — " + item.name;

    const hint = document.createElement("p");
    hint.className = "financial-form-hint";
    hint.textContent =
      "Fill Start Date, End Date, and Daily amount. Extra notes are optional.";

    form.append(
      heading,
      hint,
      this.field(
        "startDateKey",
        "Start Date",
        details.startDateKey,
        "date"
      ),
      this.field("endDateKey", "End Date", details.endDateKey, "date"),
      this.field(
        "dailyAmount",
        "Daily amount to be Invested",
        details.dailyAmount || "",
        "number",
        { min: "0", step: "0.01" }
      ),
      this.field(
        "moreDetails",
        "Some more details (optional)",
        details.moreDetails || "",
        "text"
      )
    );

    const saveBtn = document.createElement("button");
    saveBtn.type = "submit";
    saveBtn.className = "btn btn--save-day";
    saveBtn.textContent = "Save Details";
    form.append(saveBtn);

    if (item.details) {
      const clearBtn = document.createElement("button");
      clearBtn.type = "button";
      clearBtn.className = "btn btn--stop";
      clearBtn.textContent = "Clear Details";
      clearBtn.addEventListener(
        "click",
        function () {
          if (!window.confirm("Clear more details for this item?")) {
            return;
          }
          this.items = this.items.map(function (entry) {
            if (entry.id !== item.id) {
              return entry;
            }
            return {
              id: entry.id,
              financeType: entry.financeType,
              name: entry.name,
              links: entry.links,
              notes: entry.notes,
              details: null,
              createdAt: entry.createdAt,
            };
          });
          this.persist();
          this.closeDetailsForm();
          this.drawList();
        }.bind(this)
      );
      form.append(clearBtn);
    }

    form.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();
        const data = new FormData(form);
        const startDateKey = String(data.get("startDateKey") || "").trim();
        const endDateKey = String(data.get("endDateKey") || "").trim();
        const dailyAmount = Number(data.get("dailyAmount"));
        const moreDetails = String(data.get("moreDetails") || "").trim();

        if (!startDateKey || !endDateKey) {
          window.alert("Please choose Start Date and End Date.");
          return;
        }
        if (endDateKey < startDateKey) {
          window.alert("End Date should be on or after Start Date.");
          return;
        }
        if (!isFinite(dailyAmount) || dailyAmount <= 0) {
          window.alert("Please enter a Daily amount greater than 0.");
          return;
        }

        this.items = this.items.map(function (entry) {
          if (entry.id !== item.id) {
            return entry;
          }
          return {
            id: entry.id,
            financeType: entry.financeType,
            name: entry.name,
            links: entry.links,
            notes: entry.notes,
            details: {
              startDateKey: startDateKey,
              endDateKey: endDateKey,
              dailyAmount: dailyAmount,
              moreDetails: moreDetails,
            },
            createdAt: entry.createdAt,
          };
        });

        this.persist();
        this.closeDetailsForm();
        this.drawList();
      }.bind(this)
    );

    screen.append(bar, form);
  },
};
