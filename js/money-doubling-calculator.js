/**
 * Rule of 72 calculator for estimating how long an investment may take to double.
 */
window.JapaMoneyDoublingCalculator = {
  ensureScreen() {
    const existingScreen = document.getElementById(
      "money-doubling-calculator-screen"
    );
    if (existingScreen) {
      this.screen = existingScreen;
      return;
    }

    const screen = document.createElement("div");
    screen.id = "money-doubling-calculator-screen";
    screen.className = "financial-screen money-doubling-screen";
    screen.hidden = true;
    screen.setAttribute("role", "dialog");
    screen.setAttribute("aria-modal", "true");
    screen.setAttribute("aria-labelledby", "money-doubling-title");

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

    const form = document.createElement("form");
    form.className = "money-doubling-form";
    form.noValidate = true;

    const heading = document.createElement("h2");
    heading.id = "money-doubling-title";
    heading.className = "financial-screen__title";
    heading.textContent = "Money Doubling Time";

    const description = document.createElement("p");
    description.className = "money-doubling-description";
    description.textContent =
      "Estimate how many years an investment may take to double using the Rule of 72.";

    const investmentField = this.createNumberField({
      id: "money-doubling-investment",
      name: "investmentAmount",
      label: "Investment Amount",
      min: "1",
      step: "1",
      inputMode: "numeric",
      placeholder: "Example: 1000000",
    });

    const returnField = this.createNumberField({
      id: "money-doubling-return",
      name: "annualReturn",
      label: "Annual Return (%)",
      min: "0.01",
      step: "any",
      inputMode: "decimal",
      placeholder: "Example: 8 or 8.5",
    });

    const calculateButton = document.createElement("button");
    calculateButton.type = "submit";
    calculateButton.className = "btn btn--save-day money-doubling-calculate";
    calculateButton.textContent = "Calculate";
    calculateButton.hidden = true;

    const result = document.createElement("div");
    result.className = "money-doubling-result";
    result.setAttribute("aria-live", "polite");
    result.hidden = true;

    form.append(
      heading,
      description,
      investmentField.field,
      returnField.field,
      calculateButton,
      result
    );
    screen.append(bar, form);
    document.body.append(screen);

    this.screen = screen;
    this.form = form;
    this.investmentInput = investmentField.input;
    this.annualReturnInput = returnField.input;
    this.calculateButton = calculateButton;
    this.result = result;
    this.hasResult = false;

    const updateButton = this.updateButtonVisibility.bind(this);
    this.investmentInput.addEventListener("input", updateButton);
    this.annualReturnInput.addEventListener("input", updateButton);
    form.addEventListener("submit", this.handleSubmit.bind(this));
  },

  createNumberField(options) {
    const field = document.createElement("label");
    field.className = "financial-field";
    field.setAttribute("for", options.id);

    const label = document.createElement("span");
    label.textContent = options.label;

    const input = document.createElement("input");
    input.id = options.id;
    input.name = options.name;
    input.type = "number";
    input.min = options.min;
    input.step = options.step;
    input.inputMode = options.inputMode;
    input.placeholder = options.placeholder;

    field.append(label, input);
    return { field: field, input: input };
  },

  open() {
    this.ensureScreen();
    this.reset();
    this.screen.hidden = false;
    document.body.classList.add("is-financial-form-open");
    this.investmentInput.focus();
  },

  close() {
    this.reset();
    this.screen.hidden = true;
  },

  updateButtonVisibility() {
    if (this.hasResult) {
      this.calculateButton.hidden = false;
      return;
    }

    const hasInvestment = this.investmentInput.value.trim() !== "";
    const hasAnnualReturn = this.annualReturnInput.value.trim() !== "";
    this.calculateButton.hidden = !(hasInvestment && hasAnnualReturn);
  },

  handleSubmit(event) {
    event.preventDefault();

    if (this.hasResult) {
      this.reset();
      this.investmentInput.focus();
      return;
    }

    const investmentAmount = Number(this.investmentInput.value);
    const annualReturn = Number(this.annualReturnInput.value);

    if (
      !Number.isFinite(investmentAmount) ||
      investmentAmount <= 0 ||
      !Number.isInteger(investmentAmount)
    ) {
      window.alert("Please enter a positive whole-number Investment Amount.");
      this.investmentInput.focus();
      return;
    }

    if (!Number.isFinite(annualReturn) || annualReturn <= 0) {
      window.alert("Please enter an Annual Return greater than 0.");
      this.annualReturnInput.focus();
      return;
    }

    this.showResult(investmentAmount, annualReturn);
  },

  showResult(investmentAmount, annualReturn) {
    const doublingYears = 72 / annualReturn;
    const doubledAmount = investmentAmount * 2;

    const resultLine = document.createElement("strong");
    resultLine.className = "money-doubling-result__line";
    resultLine.textContent =
      "Invested Amount: " +
      this.formatAmount(investmentAmount) +
      " will become " +
      this.formatAmount(doubledAmount) +
      " in " +
      this.formatYears(doublingYears) +
      ".";

    const caution = document.createElement("p");
    caution.className = "money-doubling-result__caution";
    caution.textContent =
      "⚠️ Important: The doubling period shown is an estimate based on the Rule of 72. Actual results may vary depending on the investment's return, compounding frequency, fees, taxes, and market conditions. The calculation assumes a constant annual rate of return and does not guarantee that your money will double.";

    this.result.replaceChildren(resultLine, caution);
    this.result.hidden = false;
    this.hasResult = true;
    this.calculateButton.textContent = "Re-Calculate";
    this.updateButtonVisibility();
  },

  reset() {
    this.hasResult = false;
    this.form.reset();
    this.result.replaceChildren();
    this.result.hidden = true;
    this.calculateButton.textContent = "Calculate";
    this.updateButtonVisibility();
  },

  formatAmount(amount) {
    return String(Math.round(amount));
  },

  formatYears(years) {
    const roundedYears = Math.round(years * 100) / 100;
    return (
      roundedYears.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      }) + (roundedYears === 1 ? " year" : " years")
    );
  },
};
