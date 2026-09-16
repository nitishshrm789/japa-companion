(function registerInvestmentCalculators() {
  const F = window.JapaFinanceCalculators;
  const marketCaution =
    "These estimates assume a constant return. Actual returns, fees, taxes, and market conditions can change the outcome.";

  F.registerCategory({
    id: "investment-growth",
    title: "Investment & Growth",
    calculators: [
      {
        id: "money-doubling",
        title: "Money Doubling Time",
        description:
          "Estimate doubling time with the Rule of 72. Enter 8 for 8%, not 0.08.",
        fields: [
          F.amountField("investment", "Investment Amount", { integer: true }),
          F.percentField("returnRate", "Annual Return (%)"),
        ],
        calculate(values) {
          const years = 72 / values.returnRate;
          const doubled = values.investment * 2;
          return {
            raw: [years, doubled],
            headline:
              "Investment Amount: " +
              F.moneyWestern(values.investment) +
              " will become approximately " +
              F.moneyWestern(doubled) +
              " in " +
              F.years(years) +
              ".",
            formula:
              "72 ÷ " +
              F.decimal(values.returnRate, 2) +
              " = " +
              F.years(years),
            breakdown: [
              { label: "Doubled Amount", value: F.moneyWestern(doubled) },
              { label: "Estimated Time", value: F.years(years) },
            ],
            caution:
              "The doubling period shown is an estimate based on the Rule of 72. Actual results may vary depending on the investment's return, compounding frequency, fees, taxes, and market conditions. The calculation assumes a constant annual rate of return and does not guarantee that the money will double.",
          };
        },
      },
      {
        id: "compound-interest",
        title: "Compound Interest Calculator",
        description: "Estimate growth when interest is compounded periodically.",
        fields: [
          F.amountField("principal", "Principal / Investment Amount"),
          F.percentField("rate", "Annual Interest Rate (%)", {
            min: 0,
            minExclusive: null,
          }),
          F.yearsField("years", "Time (Years)"),
          F.selectField("frequency", "Compounding Frequency", [
            { value: 1, label: "Annually" },
            { value: 2, label: "Half-yearly" },
            { value: 4, label: "Quarterly" },
            { value: 12, label: "Monthly" },
            { value: 365, label: "Daily" },
          ]),
        ],
        calculate(values) {
          const n = Number(values.frequency);
          const amount =
            values.principal *
            Math.pow(1 + values.rate / 100 / n, n * values.years);
          const interest = amount - values.principal;
          return {
            raw: [amount, interest],
            headline: "Estimated final amount: " + F.money(amount),
            formula: "A = P × (1 + r/n)^(n×t)",
            breakdown: [
              { label: "Principal", value: F.money(values.principal) },
              { label: "Final Amount", value: F.money(amount) },
              { label: "Interest Earned", value: F.money(interest) },
            ],
            caution: marketCaution,
          };
        },
      },
      {
        id: "simple-interest",
        title: "Simple Interest Calculator",
        description: "Calculate interest that does not compound.",
        fields: [
          F.amountField("principal", "Principal"),
          F.percentField("rate", "Annual Interest Rate (%)", {
            min: 0,
            minExclusive: null,
          }),
          F.yearsField("years", "Time (Years)"),
        ],
        calculate(values) {
          const interest =
            (values.principal * values.rate * values.years) / 100;
          const total = values.principal + interest;
          return {
            raw: [interest, total],
            headline: "Estimated total amount: " + F.money(total),
            formula: "SI = P × R × T / 100; Total Amount = P + SI",
            breakdown: [
              { label: "Simple Interest", value: F.money(interest) },
              { label: "Total Amount", value: F.money(total) },
            ],
            assumptions: ["The interest rate remains unchanged."],
          };
        },
      },
      {
        id: "cagr",
        title: "CAGR Calculator",
        description: "Find the annualized growth rate between two values.",
        fields: [
          F.amountField("initial", "Initial Investment"),
          F.amountField("final", "Final Value"),
          F.yearsField("years", "Investment Period (Years)"),
        ],
        calculate(values) {
          const cagr =
            (Math.pow(values.final / values.initial, 1 / values.years) - 1) *
            100;
          return {
            raw: [cagr],
            headline: "Approximate CAGR: " + F.percentage(cagr),
            formula:
              "CAGR = ((Final Value / Initial Value)^(1 / Years) - 1) × 100",
            breakdown: [
              { label: "Initial Value", value: F.money(values.initial) },
              { label: "Final Value", value: F.money(values.final) },
              { label: "CAGR", value: F.percentage(cagr) },
            ],
            caution: marketCaution,
          };
        },
      },
      {
        id: "lumpsum",
        title: "Lumpsum Investment Calculator",
        description: "Estimate the future value of a one-time investment.",
        fields: [
          F.amountField("principal", "Investment Amount"),
          F.percentField("rate", "Expected Annual Return (%)", {
            min: 0,
            minExclusive: null,
          }),
          F.yearsField("years", "Investment Period (Years)"),
        ],
        calculate(values) {
          const future = F.futureValue(
            values.principal,
            values.rate,
            values.years
          );
          return {
            raw: [future],
            headline: "Estimated future value: " + F.money(future),
            formula: "FV = P × (1 + r)^t",
            breakdown: [
              { label: "Investment", value: F.money(values.principal) },
              { label: "Estimated Growth", value: F.money(future - values.principal) },
              { label: "Future Value", value: F.money(future) },
            ],
            caution: marketCaution,
          };
        },
      },
    ],
  });
})();
