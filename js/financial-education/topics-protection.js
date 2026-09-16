(function registerProtectionTopics() {
  "use strict";
  const register = window.JapaFinancialEducation.register;

  register({
    id: "emergency-fund",
    icon: "🛟",
    title: "Save Emergency Fund",
    description: "Build a financial buffer for unexpected expenses.",
    introduction: "An emergency fund is money kept aside for unexpected expenses such as job loss, medical emergencies, urgent travel, major repairs, or other unexpected situations.",
    remember: [
      "Keep emergency money separate from normal spending money.",
      "Calculate your emergency fund based on essential monthly expenses.",
      "A common planning range is around 3–6 months of essential expenses, although the appropriate amount depends on personal circumstances.",
      "People with unstable income may need a larger buffer.",
      "Keep the money easily accessible.",
      "Do not invest your emergency fund in highly volatile assets simply to seek higher returns.",
      "Replenish the fund after using it.",
      "Review the required amount when your income, expenses, or family responsibilities change.",
    ],
    why: "It can help you meet urgent essential costs without selling long-term investments or relying immediately on expensive debt.",
    mistakes: ["Having no emergency fund.", "Counting credit-card limits as an emergency fund.", "Investing all savings in volatile investments.", "Using emergency savings for shopping or vacations."],
    checklist: ["I know my essential monthly expenses.", "I have a separate emergency fund.", "My emergency fund is easily accessible.", "I review it when my circumstances change."],
  });

  register({
    id: "term-insurance",
    icon: "🛡️",
    title: "Purchase Term Insurance",
    description: "Understand income protection for people who depend on you.",
    introduction: "Term insurance is primarily designed to provide a death benefit to the nominee during the policy term if the insured person dies, subject to the policy terms and exclusions.",
    remember: [
      "Consider term insurance primarily for income protection and family financial security.",
      "Assess coverage based on income, liabilities, future responsibilities and existing assets.",
      "Consider the financial needs of dependents rather than choosing a policy only because of a low premium.",
      "Understand policy exclusions and conditions.",
      "Check the policy term carefully.",
      "Be completely honest when providing information in the application.",
      "Review coverage after major life events such as marriage, children, major loans or significant income changes.",
      "Understand who the nominee is and keep nominee information updated.",
    ],
    why: "Appropriate cover may help dependents manage living costs, liabilities and future responsibilities after the insured person's death.",
    mistakes: ["Buying only based on the cheapest premium.", "Providing incomplete or incorrect information.", "Ignoring policy terms and exclusions.", "Forgetting to update nominee information."],
    checklist: ["I estimated my dependents' financial needs.", "I read the policy term, conditions and exclusions.", "My application information is complete and accurate.", "My nominee details are current."],
    note: "Term insurance is different from health insurance and investment products. It generally provides life cover for a stated term; health insurance addresses eligible medical costs, while investments are intended to build value and involve their own risks.",
  });

  register({
    id: "health-insurance",
    icon: "🏥",
    title: "Health Insurance",
    description: "Review medical cover, limits and claim conditions.",
    introduction: "Health insurance may help pay eligible medical costs, but the protection depends on the policy's coverage, limits, waiting periods and exclusions.",
    remember: [
      "Understand what the policy actually covers.",
      "Check the sum insured.",
      "Check waiting periods.",
      "Check room-rent limits and sub-limits where applicable.",
      "Understand exclusions.",
      "Check the hospital network/cashless facilities offered by the insurer.",
      "Understand the claim process.",
      "Review coverage as family responsibilities change.",
      "Do not assume employer-provided health insurance is always sufficient.",
      "Keep policy documents accessible.",
    ],
    why: "Medical bills can disrupt savings and other goals. Knowing the policy before treatment can also reduce claim surprises.",
    mistakes: ["Choosing only based on premium.", "Not reading exclusions.", "Ignoring waiting periods.", "Assuming every hospital expense is automatically covered."],
    checklist: ["I know my sum insured and major limits.", "I checked waiting periods and exclusions.", "I know how cashless and reimbursement claims work.", "My family can access the policy documents."],
  });

  register({
    id: "emergency-medical-expenses",
    icon: "🚑",
    title: "Emergency Medical Expenses",
    description: "Prepare cash and documents for urgent healthcare costs.",
    introduction: "Medical emergencies may create immediate costs even when insurance exists, because some expenses may not be covered or may need to be paid before reimbursement.",
    remember: [
      "Health insurance can reduce financial exposure, but coverage depends on the policy.",
      "Maintain an emergency cash buffer.",
      "Understand deductibles, co-payments, waiting periods and exclusions where applicable.",
      "Keep policy and medical documents accessible.",
      "Review coverage after major family changes.",
    ],
    why: "Preparation can make urgent payments easier and prevent avoidable delays while a claim is being assessed.",
    mistakes: ["Assuming every cost is insured.", "Keeping no accessible medical buffer.", "Not knowing the claim contact or process.", "Letting policy or nominee details become outdated."],
    checklist: ["I have an accessible medical buffer.", "I know my policy limits and cost-sharing.", "My documents and claim contacts are easy to find.", "I review cover after family changes."],
  });

  register({
    id: "scam-prevention",
    icon: "🔒",
    title: "Avoiding Financial Scams",
    description: "Recognize pressure, fake promises and credential theft.",
    introduction: "Financial scams often use urgency, impersonation or promises of unusually high returns to make people act before verifying the facts.",
    remember: [
      "Do not share OTPs, PINs, passwords or authentication codes.",
      "Be suspicious of guaranteed high returns.",
      "Verify the identity of financial service providers.",
      "Do not transfer money because of pressure or urgency.",
      "Verify investment opportunities through official sources.",
      "Be cautious with unsolicited calls, messages and social-media investment offers.",
    ],
    why: "A short independent verification can prevent irreversible transfers, identity theft and loss of savings.",
    mistakes: ["Trusting caller ID or a profile name as proof.", "Clicking unknown payment or login links.", "Acting because an offer is described as urgent.", "Sharing authentication information with someone claiming to help."],
    checklist: ["I independently verified the provider and contact details.", "I rejected guarantees and pressure tactics.", "I used only an official website or app.", "I did not share any password, PIN, OTP or authentication code."],
    note: "This application never asks you to enter banking passwords, OTPs, PINs or other authentication credentials. Stop and contact the institution through an independently verified official channel if you suspect fraud.",
  });
})();
