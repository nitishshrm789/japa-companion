(function runFinanceCalculatorTests() {
  const T = window.FinanceTestRunner;
  const F = window.JapaFinanceCalculators;

  function calculate(id, values) {
    const calculator = F.getCalculator(id);
    T.assert(calculator, "Calculator not registered: " + id);
    const validation =
      typeof calculator.validate === "function"
        ? calculator.validate(values)
        : {};
    T.equal(Object.keys(validation).length, 0, id + " example validation");
    return calculator.calculate(values);
  }

  T.test("registers eight categories and 25 calculators", function () {
    T.equal(F.categories.length, 8);
    const count = F.categories.reduce(function (total, category) {
      return total + category.calculators.length;
    }, 0);
    T.equal(count, 25);
  });

  T.test("Money Doubling example at 8 percent", function () {
    const result = calculate("money-doubling", {
      investment: 1000000,
      returnRate: 8,
    });
    T.near(result.raw[0], 9, 0.0001);
    T.equal(result.raw[1], 2000000);
  });

  T.test("Money Doubling example at 10 percent", function () {
    const result = calculate("money-doubling", {
      investment: 500000,
      returnRate: 10,
    });
    T.near(result.raw[0], 7.2, 0.0001);
    T.equal(result.raw[1], 1000000);
  });

  T.test("Compound Interest example", function () {
    const result = calculate("compound-interest", {
      principal: 100000,
      rate: 10,
      years: 5,
      frequency: "1",
    });
    T.near(result.raw[0], 161051, 1);
  });

  T.test("Simple Interest example", function () {
    const result = calculate("simple-interest", {
      principal: 100000,
      rate: 8,
      years: 5,
    });
    T.near(result.raw[0], 40000, 0.01);
    T.near(result.raw[1], 140000, 0.01);
  });

  T.test("CAGR example", function () {
    const result = calculate("cagr", {
      initial: 100000,
      final: 150000,
      years: 5,
    });
    T.near(result.raw[0], 8.45, 0.01);
  });

  T.test("Lumpsum example", function () {
    const result = calculate("lumpsum", {
      principal: 500000,
      rate: 10,
      years: 10,
    });
    T.near(result.raw[0], 1296871, 1);
  });

  T.test("SIP example", function () {
    const result = calculate("sip", {
      monthly: 10000,
      rate: 12,
      years: 10,
    });
    T.near(result.raw[0], 2323391, 2);
    T.equal(result.raw[1], 1200000);
  });

  T.test("Step-Up SIP example produces finite growth", function () {
    const result = calculate("step-up-sip", {
      monthly: 10000,
      increase: 10,
      rate: 12,
      years: 10,
    });
    T.assert(F.allFinite(result.raw));
    T.assert(result.raw[0] > result.raw[1], "Expected positive estimated growth");
  });

  T.test("SWP calculates withdrawals and balance", function () {
    const result = calculate("swp", {
      initial: 1000000,
      rate: 8,
      withdrawal: 10000,
      years: 5,
    });
    T.assert(F.allFinite(result.raw));
    T.assert(result.raw[1] > 0, "Expected withdrawals");
    T.assert(result.raw[0] >= 0, "Balance cannot be negative");
  });

  T.test("EMI example", function () {
    const result = calculate("emi", {
      principal: 1000000,
      rate: 10,
      years: 5,
    });
    T.near(result.raw[0], 21247, 1);
  });

  T.test("Loan Interest example", function () {
    const result = calculate("loan-interest", {
      principal: 1000000,
      rate: 10,
      years: 5,
    });
    T.assert(result.raw[2] > 0);
  });

  T.test("Loan Tenure calculates finite payoff", function () {
    const result = calculate("loan-tenure", {
      principal: 1000000,
      rate: 10,
      emi: 25000,
    });
    T.assert(result.raw[0] > 0 && Number.isFinite(result.raw[0]));
  });

  T.test("Loan Prepayment shows both scenarios", function () {
    const result = calculate("loan-prepayment", {
      principal: 1000000,
      rate: 10,
      emi: 25000,
      years: 5,
      prepayment: 200000,
    });
    T.assert(F.allFinite(result.raw));
    T.equal(result.breakdown.length, 10);
  });

  T.test("Inflation example", function () {
    const result = calculate("inflation-cost", {
      amount: 1000000,
      rate: 6,
      years: 10,
    });
    T.near(result.raw[0], 1790848, 1);
  });

  T.test("Purchasing Power example", function () {
    const result = calculate("purchasing-power", {
      amount: 1000000,
      rate: 6,
      years: 10,
    });
    T.near(result.raw[0], 558395, 1);
  });

  T.test("Retirement Corpus uses withdrawal assumption", function () {
    const result = calculate("retirement-corpus", {
      currentAge: 30,
      retirementAge: 60,
      expenses: 50000,
      inflation: 6,
      returnRate: 10,
      withdrawalRate: 4,
    });
    T.assert(F.allFinite(result.raw));
    T.assert(result.raw[2] > result.raw[1] * 12);
  });

  T.test("Retirement SIP projects corpus", function () {
    const result = calculate("retirement-sip", {
      currentAge: 30,
      retirementAge: 60,
      currentCorpus: 1000000,
      monthly: 20000,
      returnRate: 10,
    });
    T.assert(F.allFinite(result.raw));
    T.assert(result.raw[2] > 1000000);
  });

  T.test("Financial Independence estimates a target", function () {
    const result = calculate("financial-independence", {
      expenses: 50000,
      currentInvestments: 1000000,
      monthlyInvestment: 50000,
      returnRate: 12,
      inflation: 6,
      withdrawalRate: 4,
    });
    T.assert(F.allFinite(result.raw));
    T.assert(result.raw[1] > 0);
  });

  T.test("Savings Rate example", function () {
    const result = calculate("savings-rate", {
      income: 100000,
      expenses: 60000,
    });
    T.equal(result.raw[0], 40000);
    T.equal(result.raw[1], 40);
  });

  T.test("Emergency Fund example", function () {
    const result = calculate("emergency-fund", {
      expenses: 40000,
      months: 6,
    });
    T.equal(result.raw[0], 240000);
  });

  T.test("Net Worth example", function () {
    const result = calculate("net-worth", {
      cash: 1100000,
      investments: 0,
      property: 0,
      vehicles: 0,
      otherAssets: 0,
      homeLoan: 300000,
      carLoan: 0,
      personalLoan: 0,
      creditCard: 0,
      otherLiabilities: 0,
    });
    T.equal(result.raw[2], 800000);
  });

  T.test("Stock Profit example", function () {
    const result = calculate("stock-profit-loss", {
      buyingPrice: 100,
      sellingPrice: 125,
      quantity: 100,
    });
    T.equal(result.raw[0], 2500);
  });

  T.test("Average Stock Price example", function () {
    const result = calculate("average-stock-price", {
      quantity1: 100,
      price1: 100,
      quantity2: 100,
      price2: 120,
    });
    T.equal(result.raw[2], 110);
  });

  T.test("Dividend Yield example", function () {
    const result = calculate("dividend-yield", {
      dividend: 8,
      sharePrice: 200,
    });
    T.equal(result.raw[0], 4);
  });

  T.test("Rental Yield example", function () {
    const result = calculate("rental-yield", {
      propertyValue: 5000000,
      monthlyRent: 25000,
    });
    T.equal(result.raw[1], 6);
  });

  T.test("Property Appreciation example", function () {
    const result = calculate("property-appreciation", {
      propertyValue: 5000000,
      rate: 7,
      years: 10,
    });
    T.near(result.raw[0], 9835756, 2);
  });

  T.test("catalog navigation and Money Doubling UI behavior", function () {
    localStorage.removeItem(window.JapaFinancialStore.KEY);
    const root = document.getElementById("financial-root");
    window.JapaFinancialPanel.render(root);
    root.querySelector(".financial-calculator-btn").click();

    const categoryScreen = document.getElementById(
      "financial-calculator-screen"
    );
    T.assert(!categoryScreen.hidden, "Category screen should open");
    T.equal(
      categoryScreen.querySelectorAll(".finance-category").length,
      8
    );
    const calculatorButtons = Array.prototype.slice.call(
      categoryScreen.querySelectorAll(".finance-category__button")
    );
    T.equal(calculatorButtons.length, 25);

    const doublingButton = calculatorButtons.find(function (button) {
      return button.textContent === "Money Doubling Time";
    });
    doublingButton.click();

    const panel = window.JapaFinanceCalculatorPanel;
    T.equal(panel.calculator.id, "money-doubling");
    T.assert(panel.calculateButton.hidden, "Calculate starts hidden");

    panel.fieldControls.investment.value = "1000000";
    panel.fieldControls.investment.dispatchEvent(new Event("input"));
    T.assert(panel.calculateButton.hidden, "Annual Return is still empty");

    panel.fieldControls.returnRate.value = "0";
    panel.fieldControls.returnRate.dispatchEvent(new Event("input"));
    T.assert(panel.calculateButton.hidden, "Zero return must be invalid");
    T.assert(!panel.fieldErrors.returnRate.hidden, "Zero return error shown");

    panel.fieldControls.returnRate.value = "-5";
    panel.fieldControls.returnRate.dispatchEvent(new Event("input"));
    T.assert(panel.calculateButton.hidden, "Negative return must be invalid");

    panel.fieldControls.returnRate.value = "8";
    panel.fieldControls.returnRate.dispatchEvent(new Event("input"));
    T.assert(!panel.calculateButton.hidden, "Valid inputs show Calculate");
    panel.form.requestSubmit();
    T.assert(panel.result.textContent.includes("9 years"));
    T.assert(panel.result.textContent.includes("₹2,000,000"));
    T.equal(panel.calculateButton.textContent, "Re-Calculate");

    panel.form.requestSubmit();
    T.equal(panel.fieldControls.investment.value, "");
    T.equal(panel.fieldControls.returnRate.value, "");
    T.assert(panel.result.hidden);
    T.assert(panel.calculateButton.hidden);

    panel.fieldControls.investment.value = "500000";
    panel.fieldControls.returnRate.value = "10";
    panel.fieldControls.investment.dispatchEvent(new Event("input"));
    panel.fieldControls.returnRate.dispatchEvent(new Event("input"));
    panel.form.requestSubmit();
    T.assert(panel.result.textContent.includes("7.2 years"));
    T.assert(panel.result.textContent.includes("₹1,000,000"));

    panel.close();
    T.assert(panel.screen.hidden, "Back navigation closes calculator");

    calculatorButtons.forEach(function (button) {
      button.click();
      T.equal(
        panel.calculator.title,
        button.textContent,
        "Button should open matching calculator"
      );
      panel.close();
    });

    const gridColumns = getComputedStyle(
      categoryScreen.querySelector(".finance-category-grid")
    ).gridTemplateColumns;
    T.assert(gridColumns !== "none", "Responsive category grid is applied");
  });

  T.test("no uncaught browser errors", function () {
    T.equal(window.__financeTestErrors.length, 0);
  });

  T.finish();
})();
