(function registerPersonalFinanceCalculators() {
  const F = window.JapaFinanceCalculators;
  const optionalAmount = { min: 0, minExclusive: null };

  F.registerCategory({
    id: "personal-finance",
    title: "Personal Finance",
    calculators: [
      {
        id: "savings-rate",
        title: "Savings Rate Calculator",
        description: "Measure how much of your income remains after expenses.",
        fields: [
          F.amountField("income", "Monthly Income"),
          F.amountField("expenses", "Monthly Expenses", optionalAmount),
        ],
        calculate(values) {
          const savings = values.income - values.expenses;
          const rate = (savings / values.income) * 100;
          return {
            raw: [savings, rate],
            headline: "Savings rate: " + F.percentage(rate),
            formula:
              "Savings = Income − Expenses; Savings Rate = (Savings / Income) × 100",
            breakdown: [
              { label: "Savings", value: F.money(savings) },
              { label: "Savings Rate", value: F.percentage(rate) },
            ],
            assumptions: ["Income and expenses represent the same time period."],
          };
        },
      },
      {
        id: "emergency-fund",
        title: "Emergency Fund Calculator",
        description: "Estimate a reserve for essential monthly expenses.",
        fields: [
          F.amountField("expenses", "Monthly Essential Expenses"),
          F.numberField("months", "Months of Coverage", {
            minExclusive: 0,
            integer: true,
          }),
        ],
        calculate(values) {
          const fund = values.expenses * values.months;
          return {
            raw: [fund],
            headline: "Estimated emergency fund: " + F.money(fund),
            formula: "Emergency Fund = Monthly Essential Expenses × Months",
            breakdown: [
              { label: "Monthly Essentials", value: F.money(values.expenses) },
              { label: "Coverage", value: F.months(values.months) },
              { label: "Emergency Fund", value: F.money(fund) },
            ],
            assumptions: ["This estimate excludes non-essential spending."],
          };
        },
      },
      {
        id: "net-worth",
        title: "Net Worth Calculator",
        description: "Compare total assets with total liabilities.",
        fields: [
          F.amountField("cash", "Cash", optionalAmount),
          F.amountField("investments", "Investments", optionalAmount),
          F.amountField("property", "Property", optionalAmount),
          F.amountField("vehicles", "Vehicles", optionalAmount),
          F.amountField("otherAssets", "Other Assets", optionalAmount),
          F.amountField("homeLoan", "Home Loan", optionalAmount),
          F.amountField("carLoan", "Car Loan", optionalAmount),
          F.amountField("personalLoan", "Personal Loan", optionalAmount),
          F.amountField("creditCard", "Credit Card Debt", optionalAmount),
          F.amountField("otherLiabilities", "Other Liabilities", optionalAmount),
        ],
        calculate(values) {
          const assets =
            values.cash +
            values.investments +
            values.property +
            values.vehicles +
            values.otherAssets;
          const liabilities =
            values.homeLoan +
            values.carLoan +
            values.personalLoan +
            values.creditCard +
            values.otherLiabilities;
          const netWorth = assets - liabilities;
          return {
            raw: [assets, liabilities, netWorth],
            headline: "Estimated net worth: " + F.money(netWorth),
            formula: "Net Worth = Total Assets − Total Liabilities",
            breakdown: [
              { label: "Total Assets", value: F.money(assets) },
              { label: "Total Liabilities", value: F.money(liabilities) },
              { label: "Net Worth", value: F.money(netWorth) },
            ],
            assumptions: ["Asset values should be current reasonable estimates."],
          };
        },
      },
    ],
  });
})();
