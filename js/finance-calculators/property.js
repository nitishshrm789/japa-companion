(function registerPropertyCalculators() {
  const F = window.JapaFinanceCalculators;
  const caution =
    "Property values, rent, vacancy, maintenance, taxes, fees, and market conditions can change actual results.";

  F.registerCategory({
    id: "property",
    title: "Property",
    calculators: [
      {
        id: "rental-yield",
        title: "Rental Yield Calculator",
        description: "Estimate gross annual rental yield.",
        fields: [
          F.amountField("propertyValue", "Property Value"),
          F.amountField("monthlyRent", "Monthly Rent"),
        ],
        calculate(values) {
          const annualRent = values.monthlyRent * 12;
          const yieldPercent = (annualRent / values.propertyValue) * 100;
          return {
            raw: [annualRent, yieldPercent],
            headline: "Estimated gross rental yield: " + F.percentage(yieldPercent),
            formula: "Rental Yield = Annual Rent / Property Value × 100",
            breakdown: [
              { label: "Property Value", value: F.money(values.propertyValue) },
              { label: "Annual Rent", value: F.money(annualRent) },
              { label: "Rental Yield", value: F.percentage(yieldPercent) },
            ],
            assumptions: ["This is gross yield before property expenses."],
            caution: caution,
          };
        },
      },
      {
        id: "property-appreciation",
        title: "Property Appreciation Calculator",
        description: "Estimate a property's future value from appreciation.",
        fields: [
          F.amountField("propertyValue", "Current Property Value"),
          F.percentField("rate", "Appreciation Rate (%)", {
            min: 0,
            minExclusive: null,
          }),
          F.yearsField("years", "Period (Years)"),
        ],
        calculate(values) {
          const future = F.futureValue(
            values.propertyValue,
            values.rate,
            values.years
          );
          return {
            raw: [future],
            headline: "Estimated future property value: " + F.money(future),
            formula:
              "Future Property Value = Current Value × (1 + Appreciation Rate)^Years",
            breakdown: [
              { label: "Current Value", value: F.money(values.propertyValue) },
              {
                label: "Estimated Appreciation",
                value: F.money(future - values.propertyValue),
              },
              { label: "Future Value", value: F.money(future) },
            ],
            caution: caution,
          };
        },
      },
    ],
  });
})();
