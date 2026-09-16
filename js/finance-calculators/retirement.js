(function registerRetirementCalculators() {
  const F = window.JapaFinanceCalculators;
  const nonNegativePercent = { min: 0, minExclusive: null };
  const retirementCaution =
    "Retirement results are estimates based on the assumptions provided. Returns, inflation, expenses, taxes, and withdrawal needs can differ.";

  function ageFields() {
    return [
      F.numberField("currentAge", "Current Age", {
        minExclusive: 0,
        max: 120,
        integer: true,
      }),
      F.numberField("retirementAge", "Retirement Age", {
        minExclusive: 0,
        max: 120,
        integer: true,
      }),
    ];
  }

  function validateAges(values) {
    if (values.retirementAge <= values.currentAge) {
      return { retirementAge: "Retirement Age must be above Current Age." };
    }
    return {};
  }

  F.registerCategory({
    id: "retirement",
    title: "Retirement",
    calculators: [
      {
        id: "retirement-corpus",
        title: "Retirement Corpus Calculator",
        description:
          "Estimate retirement expenses and corpus using a withdrawal-rate assumption.",
        fields: ageFields().concat([
          F.amountField("expenses", "Current Monthly Expenses"),
          F.percentField("inflation", "Expected Inflation (%)", nonNegativePercent),
          F.percentField("returnRate", "Expected Return (%)", nonNegativePercent),
          F.percentField("withdrawalRate", "Withdrawal Rate (%)", {
            defaultValue: 4,
          }),
        ]),
        validate: validateAges,
        calculate(values) {
          const years = values.retirementAge - values.currentAge;
          const futureExpense =
            values.expenses *
            Math.pow(1 + values.inflation / 100, years);
          const annualExpense = futureExpense * 12;
          const corpus = annualExpense / (values.withdrawalRate / 100);
          return {
            raw: [years, futureExpense, corpus],
            headline: "Estimated retirement corpus: " + F.money(corpus),
            formula:
              "Future Monthly Expense = Current Expense × (1 + Inflation)^Years; Corpus = Annual Expense / Withdrawal Rate",
            breakdown: [
              { label: "Years Until Retirement", value: F.years(years) },
              { label: "Future Monthly Expense", value: F.money(futureExpense) },
              { label: "Future Annual Expense", value: F.money(annualExpense) },
              { label: "Required Corpus", value: F.money(corpus) },
            ],
            assumptions: [
              "Withdrawal rate is an assumption, not a guaranteed sustainable rate.",
              "Expected return of " +
                F.percentage(values.returnRate) +
                " is shown as a planning assumption and is not guaranteed.",
            ],
            caution: retirementCaution,
          };
        },
      },
      {
        id: "retirement-sip",
        title: "Retirement SIP Calculator",
        description:
          "Project current corpus and monthly investments until retirement.",
        fields: ageFields().concat([
          F.amountField("currentCorpus", "Current Corpus", {
            min: 0,
            minExclusive: null,
          }),
          F.amountField("monthly", "Monthly Investment", {
            min: 0,
            minExclusive: null,
          }),
          F.percentField("returnRate", "Expected Return (%)", nonNegativePercent),
        ]),
        validate(values) {
          const errors = validateAges(values);
          if (values.currentCorpus === 0 && values.monthly === 0) {
            errors.monthly =
              "Current Corpus or Monthly Investment must be greater than 0.";
          }
          return errors;
        },
        calculate(values) {
          const years = values.retirementAge - values.currentAge;
          const months = years * 12;
          const monthlyRate = F.monthlyRate(values.returnRate);
          const grownCorpus =
            values.currentCorpus * Math.pow(1 + monthlyRate, months);
          const sipValue = F.monthlyContributionFutureValue(
            values.monthly,
            values.returnRate,
            months
          );
          const contributions = values.monthly * months;
          const total = grownCorpus + sipValue;
          return {
            raw: [grownCorpus, sipValue, total],
            headline: "Estimated retirement corpus: " + F.money(total),
            formula:
              "Current corpus and monthly contributions grow at the assumed monthly compound return.",
            breakdown: [
              { label: "Current Corpus", value: F.money(values.currentCorpus) },
              { label: "Total Contributions", value: F.money(contributions) },
              {
                label: "Estimated Growth",
                value: F.money(total - values.currentCorpus - contributions),
              },
              { label: "Retirement Corpus", value: F.money(total) },
            ],
            caution: retirementCaution,
          };
        },
      },
      {
        id: "financial-independence",
        title: "Financial Independence Calculator",
        description:
          "Estimate required corpus and time to reach it as expenses inflate.",
        fields: [
          F.amountField("expenses", "Monthly Expenses"),
          F.amountField("currentInvestments", "Current Investments", {
            min: 0,
            minExclusive: null,
          }),
          F.amountField("monthlyInvestment", "Monthly Investment", {
            min: 0,
            minExclusive: null,
          }),
          F.percentField("returnRate", "Expected Return (%)", nonNegativePercent),
          F.percentField("inflation", "Inflation (%)", nonNegativePercent),
          F.percentField("withdrawalRate", "Withdrawal Rate (%)", {
            defaultValue: 4,
          }),
        ],
        validate(values) {
          if (
            values.currentInvestments === 0 &&
            values.monthlyInvestment === 0
          ) {
            return {
              monthlyInvestment:
                "Current Investments or Monthly Investment must be above 0.",
            };
          }
          return {};
        },
        calculate(values) {
          const monthlyReturn = F.monthlyRate(values.returnRate);
          const monthlyInflation = F.monthlyRate(values.inflation);
          let investments = values.currentInvestments;
          let expenses = values.expenses;
          let target = (expenses * 12) / (values.withdrawalRate / 100);
          let reachedMonth = null;

          for (let month = 0; month <= 1200; month += 1) {
            target = (expenses * 12) / (values.withdrawalRate / 100);
            if (investments >= target) {
              reachedMonth = month;
              break;
            }
            investments =
              investments * (1 + monthlyReturn) + values.monthlyInvestment;
            expenses *= 1 + monthlyInflation;
          }

          const reached = reachedMonth != null;
          return {
            raw: [investments, target],
            headline: reached
              ? "Estimated time to financial independence: " +
                F.months(reachedMonth)
              : "The target was not reached within 100 years under these assumptions.",
            formula:
              "Required Corpus = Inflation-adjusted Annual Expenses / Withdrawal Rate; investments are projected monthly.",
            breakdown: [
              { label: "Current Required Corpus", value: F.money((values.expenses * 12) / (values.withdrawalRate / 100)) },
              { label: "Projected Target Corpus", value: F.money(target) },
              { label: "Projected Investments", value: F.money(investments) },
              {
                label: "Estimated Time",
                value: reached ? F.months(reachedMonth) : "Over 100 years",
              },
            ],
            assumptions: [
              "The withdrawal rate is an assumption and is not guaranteed to remain sustainable.",
            ],
            caution: retirementCaution,
          };
        },
      },
    ],
  });
})();
