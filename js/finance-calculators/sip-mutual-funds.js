(function registerSipCalculators() {
  const F = window.JapaFinanceCalculators;
  const caution =
    "Mutual fund and market returns are not guaranteed. Actual returns can differ because of market movement, fees, taxes, and timing.";

  F.registerCategory({
    id: "sip-mutual-funds",
    title: "SIP & Mutual Funds",
    calculators: [
      {
        id: "sip",
        title: "SIP Calculator",
        description: "Estimate future value from fixed monthly investments.",
        fields: [
          F.amountField("monthly", "Monthly Investment"),
          F.percentField("rate", "Expected Annual Return (%)", {
            min: 0,
            minExclusive: null,
          }),
          F.yearsField("years", "Investment Period (Years)", {
            integer: true,
          }),
        ],
        calculate(values) {
          const months = values.years * 12;
          const future = F.monthlyContributionFutureValue(
            values.monthly,
            values.rate,
            months
          );
          const invested = values.monthly * months;
          return {
            raw: [future, invested],
            headline: "Estimated SIP value: " + F.money(future),
            formula:
              "FV = P × [((1+r)^n - 1) / r] × (1+r), where r is the monthly return.",
            breakdown: [
              { label: "Total Invested", value: F.money(invested) },
              { label: "Estimated Profit", value: F.money(future - invested) },
              { label: "Estimated Value", value: F.money(future) },
            ],
            assumptions: ["Contributions are invested at the start of each month."],
            caution: caution,
          };
        },
      },
      {
        id: "step-up-sip",
        title: "Step-Up SIP Calculator",
        description:
          "Increase the monthly SIP annually and estimate growth month by month.",
        fields: [
          F.amountField("monthly", "Initial Monthly SIP"),
          F.percentField("rate", "Annual Return (%)", {
            min: 0,
            minExclusive: null,
          }),
          F.yearsField("years", "Investment Period (Years)", {
            integer: true,
          }),
          F.percentField("increase", "Annual SIP Increase (%)", {
            min: 0,
            minExclusive: null,
          }),
        ],
        calculate(values) {
          const monthlyRate = F.monthlyRate(values.rate);
          const months = values.years * 12;
          let monthlySip = values.monthly;
          let invested = 0;
          let balance = 0;

          for (let month = 0; month < months; month += 1) {
            if (month > 0 && month % 12 === 0) {
              monthlySip *= 1 + values.increase / 100;
            }
            invested += monthlySip;
            balance = (balance + monthlySip) * (1 + monthlyRate);
          }

          return {
            raw: [balance, invested],
            headline: "Estimated Step-Up SIP value: " + F.money(balance),
            formula:
              "Each month: balance = (balance + SIP) × (1 + monthly return); SIP increases annually.",
            breakdown: [
              { label: "Total Invested", value: F.money(invested) },
              { label: "Estimated Growth", value: F.money(balance - invested) },
              { label: "Estimated Value", value: F.money(balance) },
            ],
            assumptions: ["The SIP increases after every 12 contributions."],
            caution: caution,
          };
        },
      },
      {
        id: "swp",
        title: "SWP Calculator",
        description:
          "Estimate withdrawals and the remaining investment balance.",
        fields: [
          F.amountField("initial", "Initial Investment"),
          F.percentField("rate", "Annual Return (%)", { min: 0 }),
          F.amountField("withdrawal", "Monthly Withdrawal"),
          F.yearsField("years", "Period (Years)", { integer: true }),
        ],
        calculate(values) {
          const monthlyRate = F.monthlyRate(values.rate);
          const months = values.years * 12;
          let balance = values.initial;
          let withdrawals = 0;
          let depletedAt = null;

          for (let month = 1; month <= months; month += 1) {
            balance *= 1 + monthlyRate;
            const withdrawn = Math.min(values.withdrawal, balance);
            withdrawals += withdrawn;
            balance -= withdrawn;
            if (balance <= 0) {
              balance = 0;
              depletedAt = month;
              break;
            }
          }

          const growth = balance + withdrawals - values.initial;
          const breakdown = [
            { label: "Initial Investment", value: F.money(values.initial) },
            { label: "Total Withdrawals", value: F.money(withdrawals) },
            { label: "Remaining Balance", value: F.money(balance) },
            { label: "Estimated Growth", value: F.money(growth) },
          ];
          if (depletedAt) {
            breakdown.push({
              label: "Funds Depleted After",
              value: F.months(depletedAt),
            });
          }
          return {
            raw: [balance, withdrawals, growth],
            headline: "Estimated remaining balance: " + F.money(balance),
            formula:
              "Monthly ending balance = beginning balance × (1+r) − withdrawal",
            breakdown: breakdown,
            assumptions: ["Returns and withdrawals occur monthly."],
            caution: caution,
          };
        },
      },
    ],
  });
})();
