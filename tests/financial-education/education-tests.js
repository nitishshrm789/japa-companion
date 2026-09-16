(function runFinancialEducationTests() {
  "use strict";

  const T = window.FinanceTestRunner;
  const Education = window.JapaFinancialEducation;
  const Panel = window.JapaFinancialEducationPanel;
  const Store = window.JapaFinancialEducationStore;
  const trigger = document.getElementById("open-trigger");

  localStorage.removeItem(Store.STORAGE_KEY);

  T.test("registers 25 unique complete topics", function () {
    const topics = Education.getTopics();
    T.equal(topics.length, 25);
    T.equal(new Set(topics.map(function (topic) { return topic.id; })).size, 25);
    topics.forEach(function (topic) {
      T.assert(topic.introduction, topic.id + " introduction");
      T.assert(topic.remember.length >= 5 && topic.remember.length <= 10, topic.id + " remember count");
      T.assert(topic.why, topic.id + " why");
      T.assert(topic.mistakes.length >= 3 && topic.mistakes.length <= 5, topic.id + " mistakes count");
      T.assert(topic.checklist.length > 0, topic.id + " checklist");
      T.assert(topic.note, topic.id + " note");
    });
  });

  T.test("opens a catalogue with every topic card", function () {
    Panel.open(trigger);
    T.equal(Panel.screen.hidden, false);
    T.equal(Panel.screen.querySelectorAll("[data-topic-id]").length, 25);
    T.assert(document.body.classList.contains("is-financial-form-open"));
  });

  T.test("Financial Read This button opens the education catalogue", function () {
    Panel.close();
    const root = document.createElement("div");
    window.JapaFinancialPanel.render(root);
    const readButton = Array.prototype.find.call(root.querySelectorAll("button"), function (button) {
      return button.textContent === "Read This";
    });
    T.assert(readButton, "Read This button");
    readButton.click();
    T.equal(Panel.screen.hidden, false);
    T.equal(Panel.screen.querySelectorAll("[data-topic-id]").length, 25);
  });

  T.test("every card opens its matching complete article", function () {
    Education.getTopics().forEach(function (topic) {
      Panel.showCatalog();
      const card = Panel.screen.querySelector('[data-topic-id="' + topic.id + '"]');
      card.click();
      T.equal(Panel.activeTopicId, topic.id);
      T.equal(Panel.screen.querySelector(".financial-education-article__title").textContent, topic.title);
      const articleText = Panel.screen.querySelector(".financial-education-article").textContent;
      ["Must Remember", "Why It Matters", "Common Mistakes", "Quick Checklist", "Important Note"].forEach(function (heading) {
        T.assert(articleText.indexOf(heading) !== -1, topic.id + " missing " + heading);
      });
      T.equal(Panel.screen.querySelectorAll("[data-checklist-index]").length, topic.checklist.length);
    });
  });

  T.test("back returns to catalogue and Escape follows screen levels", function () {
    Panel.showTopic("emergency-fund");
    Panel.screen.querySelector(".financial-screen__back").click();
    T.equal(Panel.activeTopicId, null);
    Panel.showTopic("home-loan");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    T.equal(Panel.activeTopicId, null);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    T.equal(Panel.screen.hidden, true);
  });

  T.test("checklist state persists and can be removed", function () {
    Panel.open(trigger);
    Panel.showTopic("budgeting");
    let checkbox = Panel.screen.querySelector("[data-checklist-index='0']");
    checkbox.click();
    T.equal(Store.load("budgeting")[0], "0");
    Panel.showCatalog();
    Panel.showTopic("budgeting");
    checkbox = Panel.screen.querySelector("[data-checklist-index='0']");
    T.equal(checkbox.checked, true);
    checkbox.click();
    T.equal(Store.load("budgeting").length, 0);
  });

  T.test("supplied formulas and examples render correctly", function () {
    const expected = {
      budgeting: "Savings Rate = Savings ÷ Income × 100",
      inflation: "Future Cost = Current Cost × (1 + Inflation Rate)^Years",
      "children-education": "Future Cost = Current Cost × (1 + Inflation Rate)^Years",
      "net-worth": "Net Worth = Total Assets - Total Liabilities",
      travelling: "₹60,000 ÷ 6 = ₹10,000/month",
      "festival-savings": "₹60,000 ÷ 12 = ₹5,000/month",
    };
    Object.keys(expected).forEach(function (id) {
      Panel.showTopic(id);
      T.assert(Panel.screen.textContent.indexOf(expected[id]) !== -1, id + " formula/example");
    });
  });

  T.test("does not request sensitive credentials", function () {
    Panel.showCatalog();
    T.equal(Panel.screen.querySelectorAll("input[type='password'], input[type='text'], input[type='number']").length, 0);
    const prohibitedLabels = ["Enter OTP", "Enter PIN", "Bank password", "Authentication code"];
    const allText = Education.getTopics().map(function (topic) {
      return JSON.stringify(topic);
    }).join(" ");
    prohibitedLabels.forEach(function (label) {
      T.assert(allText.indexOf(label) === -1, "Sensitive request found: " + label);
    });
  });

  T.test("responsive grid rules are loaded", function () {
    const rules = Array.prototype.map.call(document.styleSheets, function (sheet) {
      try {
        return Array.prototype.map.call(sheet.cssRules || [], function (rule) {
          return rule.cssText;
        }).join(" ");
      } catch (error) {
        return "";
      }
    }).join(" ");
    T.assert(rules.indexOf("min-width: 42rem") !== -1, "tablet rule");
    T.assert(rules.indexOf("min-width: 64rem") !== -1, "desktop rule");
  });

  T.test("has no uncaught script errors", function () {
    T.equal(window.__educationTestErrors.length, 0);
  });

  Panel.close();
  localStorage.removeItem(Store.STORAGE_KEY);
  T.finish();
})();
