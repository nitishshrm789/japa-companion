(function registerBorrowingTopics() {
  "use strict";
  const register = window.JapaFinancialEducation.register;

  register({
    id: "home-loan", icon: "🏠", title: "Home Loan", description: "Look beyond EMI to the full cost of home ownership.",
    introduction: "A home loan is a long-term commitment. Affordability includes the repayment, purchase costs, home running costs and enough room for other goals.",
    remember: ["Do not evaluate a home loan only by looking at the EMI.", "Consider the total amount payable over the entire loan.", "Compare interest rates and loan terms.", "Maintain an emergency fund even after taking the loan.", "Consider processing fees and other charges.", "Understand whether the interest rate is fixed, floating or otherwise structured.", "Avoid taking a loan amount that leaves too little monthly cash flow.", "Understand prepayment conditions before making additional payments."],
    why: "A manageable loan leaves room for essential expenses, repairs, savings and unexpected changes in income or interest costs.",
    mistakes: ["Choosing a property based only on maximum loan eligibility.", "Ignoring maintenance, property taxes and other ownership costs.", "Using all savings for the down payment.", "Ignoring the total interest payable."],
    checklist: ["I compared total repayment, rates, terms and fees.", "The payment leaves comfortable monthly cash flow.", "I retained emergency savings after the down payment.", "I budgeted for ownership and maintenance costs."],
  });

  register({
    id: "car-loan", icon: "🚗", title: "Car Loan", description: "Check the loan and every ongoing vehicle cost.",
    introduction: "A vehicle costs more than its purchase price. Loan interest and regular running costs should fit the same realistic budget.",
    remember: ["Consider the total cost of owning the car, not only EMI.", "Include fuel, insurance, maintenance, parking and taxes/fees where applicable.", "Make sure the EMI fits comfortably within your budget.", "Compare the total repayment amount.", "Avoid extending the loan tenure only to make the EMI look smaller without considering total interest.", "Maintain emergency savings separately."],
    why: "Understanding the complete cost reduces the chance that transport spending crowds out essentials, savings or debt payments.",
    mistakes: ["Buying based only on EMI.", "Ignoring running costs.", "Taking a loan for a vehicle that is too expensive for the budget.", "Using emergency savings for the down payment."],
    checklist: ["I calculated the total loan repayment.", "I included insurance, fuel, service and parking.", "The payment fits without using emergency money.", "I compared the vehicle cost with my other goals."],
  });

  register({
    id: "debt-management", icon: "📉", title: "Debt Management", description: "Know what you owe and reduce costly borrowing.",
    introduction: "Debt management means keeping a clear record of borrowing, paying on time and choosing a practical repayment order.",
    remember: ["Know every outstanding loan and its interest rate.", "Prioritize understanding high-cost debt.", "Pay obligations on time.", "Avoid taking new debt simply to fund unnecessary consumption.", "Maintain an emergency buffer.", "Understand the total repayment cost before borrowing."],
    why: "Interest and late charges can grow quickly. A clear plan protects cash flow and helps reduce financial stress.",
    mistakes: ["Tracking only the monthly payment and not the balance.", "Borrowing again without addressing the cause.", "Missing payments because due dates are unorganized.", "Using emergency savings for non-essential debt-funded purchases."],
    checklist: ["I listed every balance, rate, payment and due date.", "I understand which debt costs the most.", "My payments are scheduled on time.", "I avoid new non-essential borrowing."],
  });

  register({
    id: "credit-card", icon: "💳", title: "Credit Card Usage", description: "Use available credit without treating it as income.",
    introduction: "A credit card delays payment and can charge interest and fees. The credit limit is not a measure of what is affordable.",
    remember: ["A credit card is a payment/credit facility, not additional income.", "Pay bills on time.", "Understand interest charges and fees.", "Avoid carrying expensive revolving balances unnecessarily.", "Keep track of all card transactions.", "Understand rewards, annual fees and conditions."],
    why: "Paying late or revolving a balance can make ordinary purchases much more expensive and reduce future cash flow.",
    mistakes: ["Treating the available credit limit as money that can safely be spent.", "Paying only the minimum without checking interest.", "Chasing rewards through unnecessary purchases.", "Ignoring statements and recurring charges."],
    checklist: ["I spend only what my budget can repay.", "I review every statement transaction.", "I know the due date, fees and interest terms.", "I have a plan to pay the bill on time."],
  });

  register({
    id: "tax-planning", icon: "🧾", title: "Tax Planning", description: "Keep records and consider tax without chasing it blindly.",
    introduction: "Tax planning means understanding applicable rules, organizing evidence and considering tax consequences as one part of a financial decision.",
    remember: ["Understand the tax rules applicable to your jurisdiction.", "Keep records of income, investments and eligible deductions.", "Do not make an investment solely because of a potential tax benefit.", "Understand tax implications before selling investments.", "Keep supporting documents.", "Review tax rules when they change."],
    why: "Good records support accurate filings and help you compare an investment's overall cost, risk and suitability—not only its possible tax treatment.",
    mistakes: ["Using outdated tax information.", "Missing supporting documents.", "Buying unsuitable products only for a deduction.", "Assuming another person's tax treatment applies to you."],
    checklist: ["I checked current official rules for my jurisdiction.", "My income and supporting records are organized.", "I considered risk and costs beyond tax.", "I will seek qualified help when my situation is complex."],
    note: "This is general education, not jurisdiction-specific tax advice. Tax laws and individual treatment can change; use current official information or a qualified professional.",
  });
})();
