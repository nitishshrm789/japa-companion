(function registerStockCalculators() {
  const F = window.JapaFinanceCalculators;
  const caution =
    "Stock prices, dividends, taxes, fees, and market returns can change. Results are estimates, not guaranteed outcomes.";

  F.registerCategory({
    id: "stocks",
    title: "Stocks",
    calculators: [
      {
        id: "stock-profit-loss",
        title: "Stock Profit/Loss Calculator",
        description: "Estimate profit or loss before fees and taxes.",
        fields: [
          F.amountField("buyingPrice", "Buying Price per Share"),
          F.amountField("sellingPrice", "Selling Price per Share"),
          F.numberField("quantity", "Quantity", {
            minExclusive: 0,
            integer: true,
          }),
        ],
        calculate(values) {
          const profit =
            (values.sellingPrice - values.buyingPrice) * values.quantity;
          return {
            raw: [profit],
            headline:
              (profit >= 0 ? "Estimated profit: " : "Estimated loss: ") +
              F.money(Math.abs(profit)),
            formula:
              "Profit/Loss = (Selling Price − Buying Price) × Quantity",
            breakdown: [
              {
                label: "Purchase Value",
                value: F.money(values.buyingPrice * values.quantity),
              },
              {
                label: "Sale Value",
                value: F.money(values.sellingPrice * values.quantity),
              },
              { label: "Profit / Loss", value: F.money(profit) },
            ],
            caution: caution,
          };
        },
      },
      {
        id: "average-stock-price",
        title: "Average Stock Price Calculator",
        description: "Find the weighted average price across two purchases.",
        fields: [
          F.numberField("quantity1", "First Purchase Quantity", {
            minExclusive: 0,
            integer: true,
          }),
          F.amountField("price1", "First Purchase Price"),
          F.numberField("quantity2", "Second Purchase Quantity", {
            minExclusive: 0,
            integer: true,
          }),
          F.amountField("price2", "Second Purchase Price"),
        ],
        calculate(values) {
          const totalQuantity = values.quantity1 + values.quantity2;
          const totalInvestment =
            values.quantity1 * values.price1 +
            values.quantity2 * values.price2;
          const average = totalInvestment / totalQuantity;
          return {
            raw: [totalQuantity, totalInvestment, average],
            headline: "Average stock price: " + F.money(average, 2),
            formula: "Average Price = Total Investment / Total Quantity",
            breakdown: [
              { label: "Total Investment", value: F.money(totalInvestment) },
              {
                label: "Total Quantity",
                value: F.decimal(totalQuantity, 0),
              },
              { label: "Average Price", value: F.money(average, 2) },
            ],
            caution: caution,
          };
        },
      },
      {
        id: "dividend-yield",
        title: "Dividend Yield Calculator",
        description: "Estimate annual dividend income relative to share price.",
        fields: [
          F.amountField("dividend", "Annual Dividend per Share"),
          F.amountField("sharePrice", "Share Price"),
        ],
        calculate(values) {
          const yieldPercent = (values.dividend / values.sharePrice) * 100;
          return {
            raw: [yieldPercent],
            headline: "Estimated dividend yield: " + F.percentage(yieldPercent),
            formula:
              "Dividend Yield = Annual Dividend per Share / Share Price × 100",
            breakdown: [
              {
                label: "Annual Dividend per Share",
                value: F.money(values.dividend, 2),
              },
              { label: "Share Price", value: F.money(values.sharePrice, 2) },
              {
                label: "Dividend Yield",
                value: F.percentage(yieldPercent),
              },
            ],
            caution: caution,
          };
        },
      },
    ],
  });
})();
