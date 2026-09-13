/**
 * Expense Manager — cash in/out tracker with period filters.
 */
window.JapaExpensePanel = {
  MODES: ["all", "daily", "weekly", "monthly", "yearly"],

  render(rootElement) {
    this.root = rootElement;
    this.entries = window.JapaExpenseStore.load();
    this.mode = this.mode || "all";
    this.anchorDate = this.anchorDate || new Date();
    this.anchorDate.setHours(0, 0, 0, 0);
    this.formType = "in";
    this.ensureFormScreen();
    this.drawMain();
  },

  ensureFormScreen() {
    if (document.getElementById("expense-form-screen")) {
      this.formScreen = document.getElementById("expense-form-screen");
      return;
    }
    const screen = document.createElement("div");
    screen.id = "expense-form-screen";
    screen.className = "expense-form-screen";
    screen.hidden = true;
    screen.setAttribute("role", "dialog");
    screen.setAttribute("aria-modal", "true");
    screen.setAttribute("aria-labelledby", "expense-form-title");
    document.body.append(screen);
    this.formScreen = screen;
  },

  persist() {
    this.entries = window.JapaExpenseStore.save(this.entries);
  },

  formatMoney(amount) {
    const value = Math.round((Number(amount) || 0) * 100) / 100;
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  },

  shiftDate(date, days) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    next.setHours(0, 0, 0, 0);
    return next;
  },

  startOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Monday start
    return this.shiftDate(d, diff);
  },

  endOfWeek(date) {
    return this.shiftDate(this.startOfWeek(date), 6);
  },

  startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  },

  endOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  },

  startOfYear(date) {
    return new Date(date.getFullYear(), 0, 1);
  },

  endOfYear(date) {
    return new Date(date.getFullYear(), 11, 31);
  },

  getPeriod() {
    const anchor = new Date(this.anchorDate);
    anchor.setHours(0, 0, 0, 0);

    if (this.mode === "all") {
      return {
        label: "All",
        startKey: null,
        endKey: null,
        canNavigate: false,
      };
    }

    if (this.mode === "daily") {
      const key = window.JapaTime.getLocalDateKey(anchor);
      const today = window.JapaTime.getLocalDateKey();
      return {
        label: key === today ? "Today" : window.JapaTime.formatDayMonthYear(key),
        startKey: key,
        endKey: key,
        canNavigate: true,
      };
    }

    if (this.mode === "weekly") {
      const start = this.startOfWeek(anchor);
      const end = this.endOfWeek(anchor);
      const startKey = window.JapaTime.getLocalDateKey(start);
      const endKey = window.JapaTime.getLocalDateKey(end);
      return {
        label:
          window.JapaTime.formatDayMonthYear(startKey) +
          " to " +
          window.JapaTime.formatDayMonthYear(endKey),
        startKey: startKey,
        endKey: endKey,
        canNavigate: true,
      };
    }

    if (this.mode === "monthly") {
      const start = this.startOfMonth(anchor);
      const end = this.endOfMonth(anchor);
      const startKey = window.JapaTime.getLocalDateKey(start);
      const endKey = window.JapaTime.getLocalDateKey(end);
      return {
        label:
          window.JapaTime.formatDayMonthYear(startKey) +
          " to " +
          window.JapaTime.formatDayMonthYear(endKey),
        startKey: startKey,
        endKey: endKey,
        canNavigate: true,
      };
    }

    const start = this.startOfYear(anchor);
    const end = this.endOfYear(anchor);
    const startKey = window.JapaTime.getLocalDateKey(start);
    const endKey = window.JapaTime.getLocalDateKey(end);
    return {
      label:
        window.JapaTime.formatDayMonthYear(startKey) +
        " to " +
        window.JapaTime.formatDayMonthYear(endKey),
      startKey: startKey,
      endKey: endKey,
      canNavigate: true,
    };
  },

  navigate(direction) {
    if (this.mode === "all") {
      return;
    }
    const step = direction < 0 ? -1 : 1;
    if (this.mode === "daily") {
      this.anchorDate = this.shiftDate(this.anchorDate, step);
    } else if (this.mode === "weekly") {
      this.anchorDate = this.shiftDate(this.anchorDate, step * 7);
    } else if (this.mode === "monthly") {
      this.anchorDate = new Date(
        this.anchorDate.getFullYear(),
        this.anchorDate.getMonth() + step,
        1
      );
    } else if (this.mode === "yearly") {
      this.anchorDate = new Date(this.anchorDate.getFullYear() + step, 0, 1);
    }
    this.drawMain();
  },

  inPeriod(dateKey, period) {
    if (!period.startKey || !period.endKey) {
      return true;
    }
    return dateKey >= period.startKey && dateKey <= period.endKey;
  },

  signedAmount(entry) {
    return entry.type === "out" ? -entry.amount : entry.amount;
  },

  sumBefore(dateKey) {
    return this.entries.reduce(
      function (total, entry) {
        if (entry.dateKey < dateKey) {
          return total + this.signedAmount(entry);
        }
        return total;
      }.bind(this),
      0
    );
  },

  getPeriodEntries(period) {
    return this.entries.filter(
      function (entry) {
        return this.inPeriod(entry.dateKey, period);
      }.bind(this)
    );
  },

  groupByDate(entries) {
    const groups = {};
    entries.forEach(function (entry) {
      if (!groups[entry.dateKey]) {
        groups[entry.dateKey] = [];
      }
      groups[entry.dateKey].push(entry);
    });
    return Object.keys(groups)
      .sort(function (a, b) {
        return a < b ? 1 : -1;
      })
      .map(function (dateKey) {
        return { dateKey: dateKey, entries: groups[dateKey] };
      });
  },

  drawMain() {
    const root = this.root;
    root.replaceChildren();
    const period = this.getPeriod();
    const periodEntries = this.getPeriodEntries(period);

    let previousBalance = 0;
    if (period.startKey) {
      previousBalance = this.sumBefore(period.startKey);
    }

    let cashIn = 0;
    let cashOut = 0;
    periodEntries.forEach(function (entry) {
      if (entry.type === "in") {
        cashIn += entry.amount;
      } else {
        cashOut += entry.amount;
      }
    });
    const balance = previousBalance + cashIn - cashOut;

    const filters = document.createElement("div");
    filters.className = "expense-filters";
    const labels = {
      all: "All",
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      yearly: "Yearly",
    };
    this.MODES.forEach(
      function (mode) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className =
          "expense-filter-btn" + (this.mode === mode ? " is-active" : "");
        btn.textContent = labels[mode];
        btn.addEventListener(
          "click",
          function () {
            this.mode = mode;
            this.anchorDate = new Date();
            this.anchorDate.setHours(0, 0, 0, 0);
            this.drawMain();
          }.bind(this)
        );
        filters.append(btn);
      }.bind(this)
    );
    root.append(filters);

    const range = document.createElement("div");
    range.className = "expense-range";

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "expense-range__nav";
    prevBtn.textContent = "<";
    prevBtn.disabled = !period.canNavigate;
    prevBtn.setAttribute("aria-label", "Previous period");
    prevBtn.addEventListener(
      "click",
      function () {
        this.navigate(-1);
      }.bind(this)
    );

    const label = document.createElement("p");
    label.className = "expense-range__label";
    label.textContent = period.label;

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "expense-range__nav";
    nextBtn.textContent = ">";
    nextBtn.disabled = !period.canNavigate;
    nextBtn.setAttribute("aria-label", "Next period");
    nextBtn.addEventListener(
      "click",
      function () {
        this.navigate(1);
      }.bind(this)
    );

    range.append(prevBtn, label, nextBtn);
    root.append(range);

    const columns = document.createElement("div");
    columns.className = "expense-columns";
    columns.innerHTML =
      "<span>Date</span><span>Cash In</span><span>Cash Out</span>";
    root.append(columns);

    if (period.startKey) {
      const prevBox = document.createElement("div");
      prevBox.className = "expense-prev-inline box";
      prevBox.textContent =
        "Previous Balance: " + this.formatMoney(previousBalance);
      root.append(prevBox);
    }

    const list = document.createElement("div");
    list.className = "expense-list";

    const groups = this.groupByDate(periodEntries);
    if (groups.length === 0) {
      const empty = document.createElement("p");
      empty.className = "expense-empty box";
      empty.textContent = "No entries in this period. Tap Cash In or Cash Out.";
      list.append(empty);
    } else {
      groups.forEach(
        function (group) {
          list.append(this.buildDayCard(group));
        }.bind(this)
      );
    }
    root.append(list);

    const actions = document.createElement("div");
    actions.className = "expense-actions";

    const cashInBtn = document.createElement("button");
    cashInBtn.type = "button";
    cashInBtn.className = "btn btn--start expense-action-btn";
    cashInBtn.textContent = "Cash In";
    cashInBtn.addEventListener(
      "click",
      function () {
        this.openForm("in");
      }.bind(this)
    );

    const cashOutBtn = document.createElement("button");
    cashOutBtn.type = "button";
    cashOutBtn.className = "btn btn--stop expense-action-btn";
    cashOutBtn.textContent = "Cash Out";
    cashOutBtn.addEventListener(
      "click",
      function () {
        this.openForm("out");
      }.bind(this)
    );

    actions.append(cashInBtn, cashOutBtn);
    root.append(actions);

    const totals = document.createElement("div");
    totals.className = "expense-totals";
    totals.append(
      this.totalBox("Total Cash In", this.formatMoney(cashIn)),
      this.totalBox("Total Cash Out", this.formatMoney(cashOut)),
      this.totalBox("Balance", this.formatMoney(balance))
    );
    root.append(totals);

    const footers = document.createElement("div");
    footers.className = "expense-footers";
    footers.append(
      this.footerRow("Previous Balance", this.formatMoney(previousBalance)),
      this.footerRow("Balance", this.formatMoney(balance))
    );
    root.append(footers);
  },

  totalBox(label, value) {
    const box = document.createElement("div");
    box.className = "expense-total-box box";
    const l = document.createElement("span");
    l.textContent = label;
    const v = document.createElement("strong");
    v.textContent = value;
    box.append(l, v);
    return box;
  },

  footerRow(label, value) {
    const row = document.createElement("div");
    row.className = "expense-footer-row box";
    const l = document.createElement("span");
    l.textContent = label;
    const v = document.createElement("strong");
    v.textContent = value;
    row.append(l, v);
    return row;
  },

  buildDayCard(group) {
    const card = document.createElement("article");
    card.className = "expense-day box";

    const heading = document.createElement("h3");
    heading.className = "expense-day__title";
    heading.textContent =
      "Date: " + window.JapaTime.formatExpenseDateHeading(group.dateKey);
    card.append(heading);

    group.entries.forEach(
      function (entry) {
        card.append(this.buildEntryRow(entry));
      }.bind(this)
    );

    return card;
  },

  buildEntryRow(entry) {
    const row = document.createElement("div");
    row.className = "expense-entry";

    const notes = document.createElement("p");
    notes.className = "expense-entry__notes";
    notes.textContent = entry.notes || "(No notes)";

    const meta = document.createElement("p");
    meta.className = "expense-entry__meta";
    meta.textContent = (entry.time || "--:--") + " · " + (entry.type === "in" ? "Cash In" : "Cash Out");

    const amounts = document.createElement("div");
    amounts.className = "expense-entry__amounts";

    const inAmt = document.createElement("span");
    inAmt.className = "is-in";
    inAmt.textContent =
      entry.type === "in" ? this.formatMoney(entry.amount) : "—";

    const outAmt = document.createElement("span");
    outAmt.className = "is-out";
    outAmt.textContent =
      entry.type === "out" ? this.formatMoney(entry.amount) : "—";

    amounts.append(inAmt, outAmt);

    const del = document.createElement("button");
    del.type = "button";
    del.className = "expense-entry__delete";
    del.textContent = "X";
    del.setAttribute("aria-label", "Delete entry");
    del.addEventListener(
      "click",
      function () {
        if (!window.confirm("Delete this entry?")) {
          return;
        }
        this.entries = this.entries.filter(function (item) {
          return item.id !== entry.id;
        });
        this.persist();
        this.drawMain();
      }.bind(this)
    );

    const left = document.createElement("div");
    left.className = "expense-entry__left";
    left.append(notes, meta);

    row.append(left, amounts, del);
    return row;
  },

  openForm(type) {
    this.formType = type === "out" ? "out" : "in";
    this.drawForm();
    this.formScreen.hidden = false;
    document.body.classList.add("is-expense-form-open");
  },

  closeForm() {
    this.formScreen.hidden = true;
    this.formScreen.replaceChildren();
    document.body.classList.remove("is-expense-form-open");
  },

  nowTimeValue() {
    const now = new Date();
    return (
      String(now.getHours()).padStart(2, "0") +
      ":" +
      String(now.getMinutes()).padStart(2, "0")
    );
  },

  drawForm() {
    const screen = this.formScreen;
    screen.replaceChildren();

    const bar = document.createElement("div");
    bar.className = "expense-form-screen__bar";
    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "expense-form-screen__back";
    backBtn.textContent = "Back";
    backBtn.addEventListener(
      "click",
      function () {
        this.closeForm();
      }.bind(this)
    );
    bar.append(backBtn);

    const form = document.createElement("form");
    form.className = "expense-form-screen__form";
    form.noValidate = true;

    const title = document.createElement("h2");
    title.id = "expense-form-title";
    title.className = "expense-form-screen__title";
    title.textContent = "Add entry";

    const typeRow = document.createElement("div");
    typeRow.className = "expense-type-row";

    const inBtn = document.createElement("button");
    inBtn.type = "button";
    inBtn.className =
      "expense-type-btn" + (this.formType === "in" ? " is-active" : "");
    inBtn.textContent = "Cash In";

    const outBtn = document.createElement("button");
    outBtn.type = "button";
    outBtn.className =
      "expense-type-btn" + (this.formType === "out" ? " is-active" : "");
    outBtn.textContent = "Cash Out";

    const amountInput = document.createElement("input");
    amountInput.className = "expense-input";
    amountInput.type = "number";
    amountInput.min = "0";
    amountInput.step = "0.01";
    amountInput.inputMode = "decimal";
    amountInput.placeholder =
      this.formType === "in" ? "Cash In amount" : "Cash Out amount";
    amountInput.required = true;

    function syncTypeUi() {
      inBtn.classList.toggle("is-active", this.formType === "in");
      outBtn.classList.toggle("is-active", this.formType === "out");
      amountInput.placeholder =
        this.formType === "in" ? "Cash In amount" : "Cash Out amount";
    }

    inBtn.addEventListener(
      "click",
      function () {
        this.formType = "in";
        syncTypeUi.call(this);
      }.bind(this)
    );
    outBtn.addEventListener(
      "click",
      function () {
        this.formType = "out";
        syncTypeUi.call(this);
      }.bind(this)
    );

    typeRow.append(inBtn, outBtn);

    const whenRow = document.createElement("div");
    whenRow.className = "expense-when-row";

    const dateInput = document.createElement("input");
    dateInput.className = "expense-input";
    dateInput.type = "date";
    dateInput.value = window.JapaTime.getLocalDateKey();
    dateInput.required = true;

    const timeInput = document.createElement("input");
    timeInput.className = "expense-input";
    timeInput.type = "time";
    timeInput.value = this.nowTimeValue();
    timeInput.required = true;

    whenRow.append(dateInput, timeInput);

    const notesInput = document.createElement("input");
    notesInput.className = "expense-input";
    notesInput.type = "text";
    notesInput.placeholder = "Notes";
    notesInput.autocomplete = "off";

    const actions = document.createElement("div");
    actions.className = "expense-form-actions";

    const saveExit = document.createElement("button");
    saveExit.type = "submit";
    saveExit.name = "mode";
    saveExit.value = "exit";
    saveExit.className = "btn btn--reset";
    saveExit.textContent = "Save & Exit";

    const saveContinue = document.createElement("button");
    saveContinue.type = "submit";
    saveContinue.name = "mode";
    saveContinue.value = "continue";
    saveContinue.className = "btn btn--start";
    saveContinue.textContent = "Save & Continue";

    actions.append(saveExit, saveContinue);

    let submitMode = "exit";
    saveExit.addEventListener("click", function () {
      submitMode = "exit";
    });
    saveContinue.addEventListener("click", function () {
      submitMode = "continue";
    });

    form.append(
      title,
      typeRow,
      whenRow,
      amountInput,
      notesInput,
      actions
    );

    form.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();
        const amount = Number(amountInput.value);
        const dateKey = String(dateInput.value || "").trim();
        const time = String(timeInput.value || "").trim();
        const notes = String(notesInput.value || "").trim();

        if (!dateKey) {
          window.alert("Please choose a Date.");
          return;
        }
        if (!time) {
          window.alert("Please choose a Time.");
          return;
        }
        if (!isFinite(amount) || amount <= 0) {
          window.alert("Please enter a valid amount greater than 0.");
          return;
        }

        this.entries.unshift({
          id: window.JapaExpenseStore.createId(),
          type: this.formType,
          dateKey: dateKey,
          time: time,
          amount: amount,
          notes: notes,
          createdAt: Date.now(),
        });
        this.persist();

        if (submitMode === "continue") {
          amountInput.value = "";
          notesInput.value = "";
          amountInput.focus();
          return;
        }

        this.closeForm();
        this.drawMain();
      }.bind(this)
    );

    screen.append(bar, form);
    amountInput.focus();
  },
};
