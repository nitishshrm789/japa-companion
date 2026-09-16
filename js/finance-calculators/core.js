/**
 * Registry and shared numeric helpers for dependency-free finance calculators.
 */
window.JapaFinanceCalculators = {
  categories: [],

  registerCategory(category) {
    this.categories.push(category);
  },

  getCalculator(calculatorId) {
    for (let i = 0; i < this.categories.length; i += 1) {
      const calculator = this.categories[i].calculators.find(function (entry) {
        return entry.id === calculatorId;
      });
      if (calculator) {
        return calculator;
      }
    }
    return null;
  },

  numberField(name, label, options) {
    const settings = options || {};
    return {
      name: name,
      label: label,
      type: "number",
      min: settings.min,
      minExclusive: settings.minExclusive,
      max: settings.max,
      integer: Boolean(settings.integer),
      defaultValue: settings.defaultValue,
      placeholder: settings.placeholder || "",
      suffix: settings.suffix || "",
    };
  },

  amountField(name, label, options) {
    const settings = Object.assign({ minExclusive: 0 }, options || {});
    const field = this.numberField(name, label, settings);
    field.kind = "amount";
    return field;
  },

  percentField(name, label, options) {
    const settings = Object.assign(
      { minExclusive: 0, suffix: "%" },
      options || {}
    );
    const field = this.numberField(name, label, settings);
    field.kind = "percent";
    return field;
  },

  yearsField(name, label, options) {
    const settings = Object.assign(
      { minExclusive: 0, suffix: "years" },
      options || {}
    );
    const field = this.numberField(name, label, settings);
    field.kind = "years";
    return field;
  },

  selectField(name, label, options) {
    return {
      name: name,
      label: label,
      type: "select",
      options: options,
      defaultValue: String(options[0].value),
    };
  },

  money(value, maximumFractionDigits) {
    return (
      "₹" +
      Number(value).toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits:
          maximumFractionDigits == null ? 0 : maximumFractionDigits,
      })
    );
  },

  moneyWestern(value) {
    return (
      "₹" +
      Number(value).toLocaleString("en-US", {
        maximumFractionDigits: 0,
      })
    );
  },

  decimal(value, maximumFractionDigits) {
    const digits = maximumFractionDigits == null ? 2 : maximumFractionDigits;
    return Number(value).toLocaleString("en-US", {
      maximumFractionDigits: digits,
    });
  },

  percentage(value) {
    return this.decimal(value, 2) + "%";
  },

  years(value) {
    const rounded = Math.round(Number(value) * 100) / 100;
    return this.decimal(rounded, 2) + (rounded === 1 ? " year" : " years");
  },

  months(value) {
    const rounded = Math.ceil(Number(value));
    const years = Math.floor(rounded / 12);
    const months = rounded % 12;
    const parts = [];
    if (years) {
      parts.push(years + (years === 1 ? " year" : " years"));
    }
    if (months || parts.length === 0) {
      parts.push(months + (months === 1 ? " month" : " months"));
    }
    return parts.join(" ");
  },

  monthlyRate(annualRate) {
    return Number(annualRate) / 12 / 100;
  },

  futureValue(principal, annualRate, years) {
    return Number(principal) * Math.pow(1 + Number(annualRate) / 100, years);
  },

  monthlyContributionFutureValue(payment, annualRate, months) {
    const monthlyRate = this.monthlyRate(annualRate);
    if (monthlyRate === 0) {
      return Number(payment) * months;
    }
    return (
      Number(payment) *
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
      (1 + monthlyRate)
    );
  },

  emi(principal, annualRate, months) {
    const monthlyRate = this.monthlyRate(annualRate);
    if (monthlyRate === 0) {
      return Number(principal) / months;
    }
    const growth = Math.pow(1 + monthlyRate, months);
    return (Number(principal) * monthlyRate * growth) / (growth - 1);
  },

  loanMonths(principal, annualRate, emi) {
    const monthlyRate = this.monthlyRate(annualRate);
    if (monthlyRate === 0) {
      return Number(principal) / Number(emi);
    }
    const denominator = Number(emi) - Number(principal) * monthlyRate;
    if (denominator <= 0) {
      return Infinity;
    }
    return (
      Math.log(Number(emi) / denominator) / Math.log(1 + monthlyRate)
    );
  },

  allFinite(result) {
    if (typeof result === "number") {
      return Number.isFinite(result);
    }
    if (Array.isArray(result)) {
      return result.every(this.allFinite.bind(this));
    }
    if (result && typeof result === "object") {
      return Object.keys(result).every(
        function (key) {
          return this.allFinite(result[key]);
        }.bind(this)
      );
    }
    return true;
  },
};
