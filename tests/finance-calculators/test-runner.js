window.FinanceTestRunner = {
  results: [],

  test(name, callback) {
    try {
      callback();
      this.results.push({ name: name, passed: true });
    } catch (error) {
      this.results.push({
        name: name,
        passed: false,
        message: error.message,
      });
    }
  },

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || "Assertion failed");
    }
  },

  equal(actual, expected, message) {
    this.assert(
      actual === expected,
      (message || "Values differ") +
        ": expected " +
        expected +
        ", received " +
        actual
    );
  },

  near(actual, expected, tolerance, message) {
    this.assert(
      Math.abs(actual - expected) <= tolerance,
      (message || "Values are outside tolerance") +
        ": expected " +
        expected +
        ", received " +
        actual
    );
  },

  finish() {
    const failed = this.results.filter(function (result) {
      return !result.passed;
    });
    const output = document.getElementById("test-output");
    output.textContent = JSON.stringify(
      {
        passed: this.results.length - failed.length,
        failed: failed.length,
        total: this.results.length,
        failures: failed,
      },
      null,
      2
    );
    document.title = failed.length === 0 ? "PASS" : "FAIL";
  },
};
