(function registerPlanningTopics() {
  "use strict";
  const register = window.JapaFinancialEducation.register;

  register({
    id: "budgeting", icon: "📒", title: "Budgeting & Monthly Expenses", description: "Give income, expenses and savings a simple plan.",
    introduction: "A budget is a practical plan for income, essential costs, flexible spending, savings and less-frequent expenses.",
    remember: ["Know your monthly income.", "Track essential and discretionary expenses separately.", "Include irregular annual expenses.", "Save before spending when practical.", "Review the budget regularly.", "Avoid making the budget unrealistically restrictive.", "Leave room for unexpected expenses."],
    why: "A realistic budget shows what is affordable and turns financial priorities into regular actions.",
    mistakes: ["Leaving out annual or irregular bills.", "Making limits too strict to follow.", "Counting credit as income.", "Never comparing the plan with actual spending."],
    checklist: ["I recorded monthly income.", "I separated essential and discretionary costs.", "I included irregular and unexpected expenses.", "I review planned versus actual amounts."],
    extraTitle: "Basic Formula",
    extra: ["Savings = Income - Expenses", "Savings Rate = Savings ÷ Income × 100"],
  });

  register({
    id: "financial-goals", icon: "🎯", title: "Financial Goals", description: "Turn future plans into amounts, dates and actions.",
    introduction: "Financial goals connect money with a purpose and can be grouped as short-term, medium-term or long-term.",
    remember: ["Give every major goal a target amount.", "Give every goal a target date.", "Record current savings for the goal.", "Estimate the required periodic saving or investment.", "Choose an appropriate risk level for the time available.", "Prioritize goals when available money cannot fund all of them at once."],
    why: "Clear targets make progress measurable and help avoid using one goal's money for another expense.",
    mistakes: ["Using vague goals without amounts or dates.", "Ignoring current savings.", "Taking too much risk for a near-term goal.", "Trying to fund every goal equally."],
    checklist: ["My goal has an amount and date.", "I know what is already saved.", "I calculated a periodic contribution.", "The risk level fits the remaining time."],
    extraTitle: "Goal Examples",
    extra: ["Short-term: emergency fund, travel, festival expenses.", "Medium-term: car, higher education, marriage.", "Long-term: home, retirement, children's education."],
  });

  register({
    id: "documents-nominee", icon: "🗂️", title: "Nominee & Important Documents", description: "Organize records without storing secret credentials.",
    introduction: "Organized records can help you and trusted family members identify financial accounts, responsibilities and valid nominee information when needed.",
    remember: ["Organize bank account information where applicable.", "Organize insurance policies and investment account information.", "Keep loan and property documents identifiable.", "Keep nominee details and important identity documents current.", "Retain applicable tax records.", "Review nominee information after major life events.", "Do not store passwords or highly sensitive credentials in the application."],
    why: "Clear records can reduce missed obligations and help authorized people find the correct institutions and documents during an emergency.",
    mistakes: ["Leaving nominee details outdated.", "Keeping no inventory of accounts and policies.", "Storing passwords, OTPs or PINs in ordinary notes.", "Failing to tell a trusted person where documents are held."],
    checklist: ["My account, policy, loan and property inventory is current.", "My nominee details reflect major life changes.", "A trusted person knows where authorized records are kept.", "I did not store passwords, PINs, OTPs or authentication codes here."],
    note: "Keep sensitive originals and credentials only through secure, appropriate methods. This application does not request or store passwords, PINs, OTPs, bank credentials or authentication secrets.",
  });

  register({
    id: "children-education", icon: "🎓", title: "Children's Education Planning", description: "Estimate future education costs and save early.",
    introduction: "Education planning starts with a target date and an estimated future cost rather than today's price alone.",
    remember: ["Start early because education costs can increase over time.", "Estimate the future cost rather than today's cost.", "Consider inflation.", "Define the target date.", "Match investment risk with the time remaining.", "Review the plan periodically."],
    why: "A longer preparation period can reduce the required periodic contribution and provide time to adjust when assumptions change.",
    mistakes: ["Using today's cost as the final target.", "Starting without a target year.", "Taking unsuitable risk near the payment date.", "Ignoring other education-related costs."],
    checklist: ["I estimated today's complete education cost.", "I chose a target year and inflation assumption.", "My saving approach fits the time remaining.", "I review costs and progress periodically."],
    extraTitle: "Formula",
    extra: ["Future Cost = Current Cost × (1 + Inflation Rate)^Years"],
  });

  register({
    id: "major-life-event", icon: "💍", title: "Marriage / Major Life Event Planning", description: "Prepare for large events without weakening essentials.",
    introduction: "A major life event can involve both a one-time cost and lasting changes to responsibilities, insurance and shared goals.",
    remember: ["Estimate the expected cost.", "Separate essential expenses from optional expenses.", "Set a target date.", "Avoid high-cost debt for discretionary expenses where possible.", "Keep an emergency fund separate from the event fund.", "Reassess insurance and financial responsibilities after marriage or other major family changes."],
    why: "A defined event fund supports informed choices while protecting emergency savings and future household needs.",
    mistakes: ["Planning from social expectations instead of affordability.", "Mixing event and emergency money.", "Ignoring costs after the event.", "Using high-cost debt without a repayment plan."],
    checklist: ["I set an affordable target and date.", "I separated essential and optional costs.", "The event fund is separate from emergencies.", "I planned a review of new responsibilities afterward."],
  });
})();
