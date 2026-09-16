(function registerLoanCalculators() {
  const F = window.JapaFinanceCalculators;
  const rateOptions = { min: 0, minExclusive: null };
  const loanCaution =
    "Loan results are approximate. Lender schedules, fees, rounding, payment dates, and rate changes can alter actual amounts.";

  function standardLoanFields() {
    return [
      F.amountField("principal", "Loan Amount"),
      F.percentField("rate", "Annual Interest Rate (%)", rateOptions),
      F.yearsField("years", "Loan Tenure (Years)", { integer: true }),
    ];
  }

  function standardLoanResult(values) {
    const months = values.years * 12;
    const emi = F.emi(values.principal, values.rate, months);
    const total = emi * months;
    return { months: months, emi: emi, total: total, interest: total - values.principal };
  }

  F.registerCategory({
    id: "loans",
    title: "Loans",
    calculators: [
      {
        id: "emi",
        title: "EMI Calculator",
        description: "Estimate monthly EMI and total loan cost.",
        fields: standardLoanFields(),
        calculate(values) {
          const result = standardLoanResult(values);
          return {
            raw: [result.emi, result.total, result.interest],
            headline: "Estimated EMI: " + F.money(result.emi) + " per month",
            formula: "EMI = P × r × (1+r)^n / ((1+r)^n − 1)",
            breakdown: [
              { label: "Monthly EMI", value: F.money(result.emi) },
              { label: "Total Payment", value: F.money(result.total) },
              { label: "Total Interest", value: F.money(result.interest) },
            ],
            caution: loanCaution,
          };
        },
      },
      {
        id: "loan-interest",
        title: "Loan Interest Calculator",
        description: "Estimate total interest and total repayment.",
        fields: standardLoanFields(),
        calculate(values) {
          const result = standardLoanResult(values);
          return {
            raw: [result.emi, result.total, result.interest],
            headline: "Estimated total interest: " + F.money(result.interest),
            formula: "Total Interest = Total Payments − Principal",
            breakdown: [
              { label: "Principal", value: F.money(values.principal) },
              { label: "Monthly EMI", value: F.money(result.emi) },
              { label: "Total Interest", value: F.money(result.interest) },
              { label: "Total Payment", value: F.money(result.total) },
            ],
            caution: loanCaution,
          };
        },
      },
      {
        id: "loan-tenure",
        title: "Loan Tenure Calculator",
        description: "Estimate payoff time from a fixed monthly EMI.",
        fields: [
          F.amountField("principal", "Loan Amount"),
          F.percentField("rate", "Annual Interest Rate (%)", rateOptions),
          F.amountField("emi", "Monthly EMI"),
        ],
        validate(values) {
          const monthlyInterest = values.principal * F.monthlyRate(values.rate);
          if (values.emi <= monthlyInterest) {
            return {
              emi: "EMI must be greater than the monthly interest to repay the loan.",
            };
          }
          return {};
        },
        calculate(values) {
          const months = F.loanMonths(
            values.principal,
            values.rate,
            values.emi
          );
          const total = values.emi * Math.ceil(months);
          return {
            raw: [months, total],
            headline: "Estimated loan tenure: " + F.months(months),
            formula: "n = ln(EMI / (EMI − P×r)) / ln(1+r)",
            breakdown: [
              { label: "Estimated Months", value: F.decimal(Math.ceil(months), 0) },
              { label: "Estimated Total Payment", value: F.money(total) },
              {
                label: "Estimated Total Interest",
                value: F.money(total - values.principal),
              },
            ],
            caution: loanCaution,
          };
        },
      },
      {
        id: "loan-prepayment",
        title: "Loan Prepayment Calculator",
        description:
          "Compare reduced-tenure and reduced-EMI options after prepayment.",
        fields: [
          F.amountField("principal", "Outstanding Loan"),
          F.percentField("rate", "Annual Interest Rate (%)", rateOptions),
          F.amountField("emi", "Current EMI"),
          F.yearsField("years", "Remaining Tenure (Years)", { integer: true }),
          F.amountField("prepayment", "Prepayment Amount"),
        ],
        validate(values) {
          if (values.prepayment >= values.principal) {
            return {
              prepayment: "Prepayment must be less than the outstanding loan.",
            };
          }
          const requiredEmi = F.emi(
            values.principal,
            values.rate,
            values.years * 12
          );
          if (values.emi < requiredEmi) {
            return {
              emi:
                "Current EMI must be at least " +
                F.money(requiredEmi) +
                " for this remaining tenure.",
            };
          }
          return {};
        },
        calculate(values) {
          const oldMonths = values.years * 12;
          const newPrincipal = values.principal - values.prepayment;
          const beforeInterest = values.emi * oldMonths - values.principal;

          const reducedMonths = F.loanMonths(
            newPrincipal,
            values.rate,
            values.emi
          );
          const tenureInterest =
            values.emi * Math.ceil(reducedMonths) - newPrincipal;
          const reducedEmi = F.emi(newPrincipal, values.rate, oldMonths);
          const emiInterest = reducedEmi * oldMonths - newPrincipal;

          return {
            raw: [
              newPrincipal,
              beforeInterest,
              reducedMonths,
              tenureInterest,
              reducedEmi,
              emiInterest,
            ],
            headline:
              "Estimated interest saved: up to " +
              F.money(beforeInterest - tenureInterest),
            formula:
              "New Principal = Outstanding Loan − Prepayment; then recalculate EMI and tenure.",
            breakdown: [
              { label: "Before: Remaining Principal", value: F.money(values.principal) },
              { label: "Before: EMI", value: F.money(values.emi) },
              { label: "Before: Remaining Interest", value: F.money(beforeInterest) },
              { label: "Before: Remaining Tenure", value: F.months(oldMonths) },
              { label: "After: New Principal", value: F.money(newPrincipal) },
              { label: "Keep EMI: New Tenure", value: F.months(reducedMonths) },
              { label: "Keep EMI: New Interest", value: F.money(tenureInterest) },
              { label: "Keep Tenure: New EMI", value: F.money(reducedEmi) },
              { label: "Keep Tenure: New Interest", value: F.money(emiInterest) },
              {
                label: "Keep Tenure: Interest Saved",
                value: F.money(beforeInterest - emiInterest),
              },
            ],
            caution: loanCaution,
          };
        },
      },
    ],
  });
})();
