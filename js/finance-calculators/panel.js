/**
 * Shared catalogue, form, validation, result, and navigation UI.
 */
window.JapaFinanceCalculatorPanel = {
  renderCatalog(container) {
    const registry = window.JapaFinanceCalculators;
    const grid = document.createElement("div");
    grid.className = "finance-category-grid";

    registry.categories.forEach(
      function (category) {
        const section = document.createElement("section");
        section.className = "finance-category box";

        const heading = document.createElement("h3");
        heading.className = "finance-category__title";
        heading.textContent = category.title;

        const buttons = document.createElement("div");
        buttons.className = "finance-category__buttons";

        category.calculators.forEach(
          function (calculator) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "finance-category__button";
            button.textContent = calculator.title;
            button.addEventListener(
              "click",
              function () {
                this.open(calculator.id, button);
              }.bind(this)
            );
            buttons.append(button);
          }.bind(this)
        );

        section.append(heading, buttons);
        grid.append(section);
      }.bind(this)
    );

    container.append(grid);
  },

  ensureScreen() {
    const existing = document.getElementById("finance-calculator-screen");
    if (existing) {
      this.screen = existing;
      return;
    }

    const screen = document.createElement("div");
    screen.id = "finance-calculator-screen";
    screen.className = "financial-screen finance-calculator-screen";
    screen.hidden = true;
    screen.setAttribute("role", "dialog");
    screen.setAttribute("aria-modal", "true");
    screen.setAttribute("aria-labelledby", "finance-calculator-title");

    const bar = document.createElement("div");
    bar.className = "financial-screen__bar";

    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "financial-screen__back";
    backButton.textContent = "Back";
    backButton.addEventListener(
      "click",
      function () {
        this.close();
      }.bind(this)
    );
    bar.append(backButton);

    const content = document.createElement("div");
    content.className = "finance-calculator-content";
    screen.append(bar, content);
    document.body.append(screen);

    document.addEventListener(
      "keydown",
      function (event) {
        if (event.key === "Escape" && !screen.hidden) {
          this.close();
        }
      }.bind(this)
    );

    this.screen = screen;
    this.content = content;
  },

  open(calculatorId, trigger) {
    this.ensureScreen();
    this.calculator =
      window.JapaFinanceCalculators.getCalculator(calculatorId);
    if (!this.calculator) {
      return;
    }
    this.returnFocus = trigger || null;
    this.hasResult = false;
    this.drawCalculator();
    this.screen.hidden = false;
    document.body.classList.add("is-financial-form-open");
    const firstInput = this.form.querySelector("input, select");
    if (firstInput) {
      firstInput.focus();
    }
  },

  close() {
    this.screen.hidden = true;
    this.content.replaceChildren();
    this.calculator = null;
    this.hasResult = false;
    if (this.returnFocus) {
      this.returnFocus.focus();
    }
  },

  drawCalculator() {
    const calculator = this.calculator;
    this.content.replaceChildren();
    this.fieldControls = {};
    this.fieldErrors = {};

    const heading = document.createElement("h2");
    heading.id = "finance-calculator-title";
    heading.className = "financial-screen__title";
    heading.textContent = calculator.title;

    const description = document.createElement("p");
    description.className = "finance-calculator-description";
    description.textContent = calculator.description;

    const form = document.createElement("form");
    form.className = "finance-calculator-form";
    form.noValidate = true;
    form.append(heading, description);

    calculator.fields.forEach(
      function (field) {
        form.append(this.createField(field, calculator.id));
      }.bind(this)
    );

    const calculateButton = document.createElement("button");
    calculateButton.type = "submit";
    calculateButton.className =
      "btn btn--save-day finance-calculator-submit";
    calculateButton.textContent = "Calculate";
    calculateButton.hidden = true;

    const result = document.createElement("div");
    result.className = "finance-result";
    result.setAttribute("aria-live", "polite");
    result.hidden = true;

    form.append(calculateButton, result);
    form.addEventListener("submit", this.handleSubmit.bind(this));
    this.content.append(form);

    this.form = form;
    this.calculateButton = calculateButton;
    this.result = result;
    this.updateValidation(false);
  },

  createField(field, calculatorId) {
    const wrapper = document.createElement("label");
    wrapper.className = "finance-field";
    const inputId = "finance-" + calculatorId + "-" + field.name;
    wrapper.setAttribute("for", inputId);

    const label = document.createElement("span");
    label.className = "finance-field__label";
    label.textContent = field.label;

    let control;
    if (field.type === "select") {
      control = document.createElement("select");
      field.options.forEach(function (option) {
        const element = document.createElement("option");
        element.value = String(option.value);
        element.textContent = option.label;
        control.append(element);
      });
    } else {
      control = document.createElement("input");
      control.type = "number";
      control.inputMode = field.integer ? "numeric" : "decimal";
      control.step = field.integer ? "1" : "any";
      if (field.placeholder) {
        control.placeholder = field.placeholder;
      }
    }

    control.id = inputId;
    control.name = field.name;
    if (field.defaultValue != null) {
      control.value = String(field.defaultValue);
      control.defaultValue = String(field.defaultValue);
    }

    const error = document.createElement("span");
    error.className = "finance-field__error";
    error.id = inputId + "-error";
    error.hidden = true;
    control.setAttribute("aria-describedby", error.id);
    control.addEventListener(
      "input",
      function () {
        this.updateValidation(false);
      }.bind(this)
    );
    control.addEventListener(
      "change",
      function () {
        this.updateValidation(false);
      }.bind(this)
    );

    this.fieldControls[field.name] = control;
    this.fieldErrors[field.name] = error;
    wrapper.append(label, control, error);
    return wrapper;
  },

  readValues() {
    const values = {};
    this.calculator.fields.forEach(
      function (field) {
        const raw = this.fieldControls[field.name].value.trim();
        values[field.name] = field.type === "select" ? raw : Number(raw);
      }.bind(this)
    );
    return values;
  },

  validate(showEmptyErrors) {
    const values = this.readValues();
    const errors = {};

    this.calculator.fields.forEach(
      function (field) {
        const control = this.fieldControls[field.name];
        const raw = control.value.trim();
        if (!raw) {
          if (showEmptyErrors) {
            errors[field.name] = "This field is required.";
          }
          return;
        }
        if (field.type === "select") {
          return;
        }

        const value = values[field.name];
        if (!Number.isFinite(value)) {
          errors[field.name] = "Enter a valid number.";
        } else if (field.minExclusive != null && value <= field.minExclusive) {
          errors[field.name] =
            "Enter a value greater than " + field.minExclusive + ".";
        } else if (field.min != null && value < field.min) {
          errors[field.name] =
            "Enter a value of at least " + field.min + ".";
        } else if (field.max != null && value > field.max) {
          errors[field.name] =
            "Enter a value no greater than " + field.max + ".";
        } else if (field.integer && !Number.isInteger(value)) {
          errors[field.name] = "Enter a whole number.";
        }
      }.bind(this)
    );

    if (
      Object.keys(errors).length === 0 &&
      typeof this.calculator.validate === "function"
    ) {
      const crossErrors = this.calculator.validate(values) || {};
      Object.keys(crossErrors).forEach(function (name) {
        errors[name] = crossErrors[name];
      });
    }

    return { values: values, errors: errors };
  },

  updateValidation(showEmptyErrors) {
    if (this.hasResult) {
      this.calculateButton.hidden = false;
      return true;
    }

    const validation = this.validate(showEmptyErrors);
    const allFilled = this.calculator.fields.every(
      function (field) {
        return this.fieldControls[field.name].value.trim() !== "";
      }.bind(this)
    );

    Object.keys(this.fieldErrors).forEach(
      function (name) {
        const message = validation.errors[name] || "";
        const control = this.fieldControls[name];
        const error = this.fieldErrors[name];
        error.textContent = message;
        error.hidden = !message;
        control.setAttribute("aria-invalid", message ? "true" : "false");
      }.bind(this)
    );

    const valid = allFilled && Object.keys(validation.errors).length === 0;
    this.calculateButton.hidden = !valid;
    return valid;
  },

  handleSubmit(event) {
    event.preventDefault();
    if (this.hasResult) {
      this.reset();
      return;
    }
    if (!this.updateValidation(true)) {
      return;
    }

    const values = this.readValues();
    const result = this.calculator.calculate(values);
    if (!window.JapaFinanceCalculators.allFinite(result.raw || [])) {
      this.showGeneralError(
        "The calculation could not produce a finite result. Check the inputs."
      );
      return;
    }
    this.renderResult(values, result);
  },

  renderResult(values, result) {
    this.result.replaceChildren();

    const headline = document.createElement("strong");
    headline.className = "finance-result__headline";
    headline.textContent = result.headline;
    this.result.append(headline);

    this.result.append(
      this.createResultSection(
        "Input Summary",
        this.calculator.fields.map(
          function (field) {
            return {
              label: field.label,
              value: this.formatInput(field, values[field.name]),
            };
          }.bind(this)
        )
      )
    );

    if (result.formula) {
      const formula = document.createElement("section");
      formula.className = "finance-result__section";
      const title = document.createElement("h3");
      title.textContent = "Calculation / Formula";
      const text = document.createElement("p");
      text.className = "finance-result__formula";
      text.textContent = result.formula;
      formula.append(title, text);
      this.result.append(formula);
    }

    if (result.breakdown && result.breakdown.length) {
      this.result.append(
        this.createResultSection("Breakdown", result.breakdown)
      );
    }

    const notes = (result.assumptions || []).slice();
    if (result.caution) {
      notes.push(result.caution);
    }
    if (notes.length) {
      const caution = document.createElement("section");
      caution.className = "finance-result__caution";
      const title = document.createElement("h3");
      title.textContent = "Important Assumptions";
      const list = document.createElement("ul");
      notes.forEach(function (note) {
        const item = document.createElement("li");
        item.textContent = note;
        list.append(item);
      });
      caution.append(title, list);
      this.result.append(caution);
    }

    this.result.hidden = false;
    this.hasResult = true;
    this.calculateButton.textContent = "Re-Calculate";
    this.calculateButton.hidden = false;
  },

  createResultSection(titleText, rows) {
    const section = document.createElement("section");
    section.className = "finance-result__section";
    const title = document.createElement("h3");
    title.textContent = titleText;
    const list = document.createElement("dl");
    list.className = "finance-result__list";
    rows.forEach(function (row) {
      const term = document.createElement("dt");
      term.textContent = row.label;
      const value = document.createElement("dd");
      value.textContent = row.value;
      list.append(term, value);
    });
    section.append(title, list);
    return section;
  },

  formatInput(field, value) {
    if (field.type === "select") {
      const selected = field.options.find(function (option) {
        return String(option.value) === String(value);
      });
      return selected ? selected.label : String(value);
    }
    if (field.kind === "amount") {
      return window.JapaFinanceCalculators.money(value, 2);
    }
    if (field.kind === "percent") {
      return window.JapaFinanceCalculators.percentage(value);
    }
    if (field.kind === "years") {
      return window.JapaFinanceCalculators.years(value);
    }
    return window.JapaFinanceCalculators.decimal(value, 2);
  },

  showGeneralError(message) {
    this.result.replaceChildren();
    const error = document.createElement("p");
    error.className = "finance-result__error";
    error.textContent = message;
    this.result.append(error);
    this.result.hidden = false;
  },

  reset() {
    this.hasResult = false;
    this.form.reset();
    this.result.replaceChildren();
    this.result.hidden = true;
    this.calculateButton.textContent = "Calculate";
    this.updateValidation(false);
    const firstInput = this.form.querySelector("input, select");
    if (firstInput) {
      firstInput.focus();
    }
  },
};
