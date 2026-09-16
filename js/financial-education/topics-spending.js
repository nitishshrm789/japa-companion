(function registerSpendingTopics() {
  "use strict";
  const register = window.JapaFinancialEducation.register;

  register({
    id: "festival-savings", icon: "🎉", title: "Festival / Family Savings", description: "Save monthly for predictable annual celebrations.",
    introduction: "Festival, gift and family-event spending often repeats each year, so it can be planned before it becomes urgent.",
    remember: ["Plan recurring family and festival expenses in advance.", "Create a separate savings goal.", "Estimate annual expenses and divide them by the number of saving months.", "Avoid using credit unnecessarily for predictable expenses.", "Start saving before the expense becomes urgent.", "Include birthdays, festivals, gifts, family functions and other recurring expenses in the annual budget."],
    why: "Small regular savings can make planned occasions easier to afford without taking from emergency money or adding expensive debt.",
    mistakes: ["Starting only when the event is close.", "Forgetting gifts and related travel.", "Using credit for a predictable cost.", "Setting a target without tracking progress."],
    checklist: ["I estimated the year's family and festival costs.", "I chose the number of saving months.", "I keep this money separate from emergencies.", "I track contributions and adjust the estimate."],
    extraTitle: "Example",
    extra: ["If expected annual festival/family expenses are ₹60,000:", "₹60,000 ÷ 12 = ₹5,000/month", "Saving ₹5,000 per month would create approximately ₹60,000 over 12 months, assuming no withdrawals and ignoring interest."],
  });

  register({
    id: "eating-out", icon: "🍽️", title: "Eating Out", description: "Enjoy meals out within a clear spending limit.",
    introduction: "Restaurant and delivery spending can be enjoyable, but small frequent purchases can become a large monthly total.",
    remember: ["Include eating-out expenses in the monthly budget.", "Set a reasonable spending limit.", "Track small recurring expenses.", "Do not use credit simply because the expense feels small.", "Distinguish between planned social spending and impulse spending."],
    why: "A visible limit supports enjoyable spending while protecting essential expenses and savings goals.",
    mistakes: ["Ignoring small frequent expenses.", "Not including food delivery in the budget.", "Using credit for routine discretionary spending.", "Setting no monthly total."],
    checklist: ["I chose a monthly eating-out limit.", "I include delivery, tips and fees.", "I track each purchase.", "I pause when the limit is reached."],
  });

  register({
    id: "shopping", icon: "🛍️", title: "Shopping", description: "Separate needs from wants before purchasing.",
    introduction: "Planned shopping begins with affordability and purpose, not a discount label or a convenient payment plan.",
    remember: ["Separate needs from wants.", "Set a monthly discretionary spending limit.", "Avoid impulse purchases.", "Compare prices before major purchases.", "Consider the total cost, not only discounts.", "Avoid taking unnecessary debt for non-essential purchases.", "Use a cooling-off period for expensive purchases."],
    why: "A pause before buying can protect important goals and reduce regret, clutter and avoidable debt.",
    mistakes: ["Buying because an item is discounted.", "Ignoring delivery, maintenance or subscription costs.", "Using buy-now-pay-later without checking the budget.", "Making expensive purchases without comparison."],
    checklist: ["I identified whether this is a need or want.", "The complete cost fits my spending limit.", "I compared alternatives.", "I used a cooling-off period for a major purchase."],
    extraTitle: "Quick Rule",
    extra: ["Before a major discretionary purchase, ask: “Do I need this, can I afford this, and does it fit my financial goals?”"],
  });

  register({
    id: "travelling", icon: "✈️", title: "Travelling", description: "Build a complete trip budget before departure.",
    introduction: "A travel plan should include the full trip cost and a separate contingency rather than relying on debt or emergency savings.",
    remember: ["Create a separate travel fund.", "Estimate the complete trip cost.", "Include transportation, accommodation, food, activities, insurance and emergency expenses.", "Save before the trip rather than relying on debt.", "Keep an additional contingency amount.", "Avoid using emergency savings for discretionary travel.", "Plan for currency conversion costs when travelling internationally."],
    why: "Saving in advance makes the trip cost visible and protects regular bills and emergency reserves.",
    mistakes: ["Budgeting only flights and hotels.", "Relying on a credit limit.", "Using the emergency fund for discretionary travel.", "Forgetting exchange, insurance or local transport costs."],
    checklist: ["I listed every major trip category.", "I included a contingency amount.", "My monthly target fits my budget.", "I am not using emergency money or costly debt."],
    extraTitle: "Example",
    extra: ["If a trip is expected to cost ₹60,000 and is 6 months away:", "₹60,000 ÷ 6 = ₹10,000/month", "Saving ₹10,000 per month would provide ₹60,000 over six months, assuming no withdrawals."],
  });

  register({
    id: "lifestyle-inflation", icon: "📶", title: "Lifestyle Inflation", description: "Keep some income growth for future priorities.",
    introduction: "Lifestyle inflation happens when spending rises as income rises, leaving little improvement in saving or financial resilience.",
    remember: ["As income increases, avoid automatically increasing every category of spending.", "Consider directing part of an income increase to emergency savings.", "Consider directing part to investments and long-term goals.", "Consider using part for debt repayment.", "Review insurance when income and responsibilities change.", "Enjoyable spending can increase without consuming all income growth."],
    why: "Keeping part of each increase can strengthen savings and reduce debt while still allowing intentional lifestyle improvements.",
    mistakes: ["Committing the full raise to recurring costs.", "Upgrading spending before the higher income is stable.", "Ignoring debt and underfunded goals.", "Comparing lifestyle choices with others."],
    checklist: ["I decided how to divide my income increase.", "I increased at least one savings or debt payment.", "New recurring costs remain affordable.", "My lifestyle changes do not consume all income growth."],
  });
})();
