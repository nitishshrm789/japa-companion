(function registerInflationCalculators() {
  const F = window.JapaFinanceCalculators;
  const caution =
    "Inflation can change over time. These results are estimates based on a constant inflation rate.";

  F.registerCategory({
    id: "inflation",
    title: "Inflation",
    calculators: [
      {
        id: "inflation-cost",
        title: "Inflation Calculator",
        description: "Estimate the future cost of a current amount.",
        fields: [
          F.amountField("amount", "Current Amount"),
          F.percentField("rate", "Inflation Rate (%)", {
            min: 0,
            minExclusive: null,
          }),
          F.yearsField("years", "Number of Years"),
        ],
        calculate(values) {
          const future = F.futureValue(values.amount, values.rate, values.years);
          return {
            raw: [future],
            headline: "Estimated future cost: " + F.money(future),
            formula: "Future Cost = Current Amount × (1 + Inflation Rate)^Years",
            breakdown: [
              { label: "Current Cost", value: F.money(values.amount) },
              { label: "Increase", value: F.money(future - values.amount) },
              { label: "Future Cost", value: F.money(future) },
            ],
            caution: caution,
          };
        },
      },
      {
        id: "purchasing-power",
        title: "Purchasing Power Calculator",
        description:
          "Estimate how inflation may reduce an amount's purchasing power.",
        fields: [
          F.amountField("amount", "Current Amount"),
          F.percentField("rate", "Inflation Rate (%)", {
            min: 0,
            minExclusive: null,
          }),
          F.yearsField("years", "Number of Years"),
        ],
        calculate(values) {
          const purchasingPower =
            values.amount / Math.pow(1 + values.rate / 100, values.years);
          return {
            raw: [purchasingPower],
            headline:
              "Estimated future purchasing power: " + F.money(purchasingPower),
            formula:
              "Future Purchasing Power = Current Amount / (1 + Inflation Rate)^Years",
            breakdown: [
              { label: "Current Amount", value: F.money(values.amount) },
              {
                label: "Purchasing Power Lost",
                value: F.money(values.amount - purchasingPower),
              },
              {
                label: "Future Purchasing Power",
                value: F.money(purchasingPower),
              },
            ],
            caution: caution,
          };
        },
      },
    ],
  });
})();
