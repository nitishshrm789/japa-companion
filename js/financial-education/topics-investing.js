(function registerInvestingTopics() {
  "use strict";
  const register = window.JapaFinancialEducation.register;

  register({
    id: "sip-investment", icon: "📈", title: "SIP Investment", description: "Invest periodically while understanding the underlying risk.",
    introduction: "A SIP is a method of investing a fixed amount periodically; it does not itself guarantee a particular return.",
    remember: ["SIP is a method of investing, not a guaranteed-return product.", "Understand what asset or fund the SIP invests in.", "Investment horizon should match the goal.", "Higher potential returns generally come with higher risk.", "Review the investment periodically.", "Understand fees and expenses.", "Do not select an investment solely because of past performance.", "Avoid stopping a long-term investment solely because of short-term market movements without considering the original goal and risk level."],
    why: "Regular investing can support disciplined saving, but the outcome still depends on market performance, costs, time and the chosen investment.",
    mistakes: ["Assuming SIP guarantees returns.", "Investing without understanding risk.", "Choosing a fund only because it recently performed well.", "Investing money needed for short-term expenses into volatile investments."],
    checklist: ["I understand the asset, risk and fees.", "The time horizon matches my goal.", "I can continue without using emergency money.", "I review the goal and investment periodically."],
  });

  register({
    id: "retirement-planning", icon: "🌅", title: "Retirement Planning", description: "Prepare for future living and healthcare expenses.",
    introduction: "Retirement planning estimates future needs and builds resources over time for a period when employment income may reduce or stop.",
    remember: ["Start planning early.", "Consider inflation.", "Estimate future expenses rather than using only today's expenses.", "Consider healthcare and other later-life expenses.", "Diversify investments appropriately for your risk tolerance and time horizon.", "Review the plan periodically.", "Increase savings as income increases."],
    why: "Starting earlier generally provides more time to save, adjust assumptions and respond to changes in expenses or income.",
    mistakes: ["Ignoring inflation.", "Using an unrealistically high return assumption.", "Forgetting healthcare and longevity.", "Never reviewing contributions or progress."],
    checklist: ["I estimated future essential and healthcare costs.", "My assumptions are written and reasonable.", "My savings match my time horizon and risk capacity.", "I review progress and increase savings when practical."],
    note: "Retirement calculations are based on assumptions about inflation, returns, lifespan and spending. Actual results can differ significantly.",
  });

  register({
    id: "inflation", icon: "🎈", title: "Inflation", description: "Understand how rising prices change future costs.",
    introduction: "Inflation is an increase in general price levels over time, which means the same amount of money may buy less in the future.",
    remember: ["Money generally loses purchasing power when prices rise.", "Long-term financial planning should consider inflation.", "A return that looks positive may not fully preserve purchasing power after inflation.", "Do not use today's expenses directly for a retirement goal many years in the future.", "Use more than one assumption when the future rate is uncertain."],
    why: "Ignoring inflation can leave long-term goals underfunded even when today's target appears affordable.",
    mistakes: ["Planning with today's cost only.", "Treating a nominal return as purchasing-power growth.", "Assuming one inflation rate is certain.", "Ignoring that different expenses may rise at different rates."],
    checklist: ["I estimated the years until the expense.", "I used an explicit inflation assumption.", "I tested a higher-cost scenario.", "I review the estimate as prices change."],
    extraTitle: "Formula",
    extra: ["Future Cost = Current Cost × (1 + Inflation Rate)^Years", "The result is an estimate based on the inflation assumption, not a guaranteed future price."],
  });

  register({
    id: "diversification", icon: "🧺", title: "Investment Diversification", description: "Spread concentration while keeping goals in focus.",
    introduction: "Diversification means spreading investments across more than one holding, asset type or source of risk.",
    remember: ["Avoid putting all investments into a single asset or investment.", "Understand the risk of each asset class.", "Diversification does not eliminate risk.", "Match investments with financial goals and time horizon.", "Review concentration periodically."],
    why: "A diversified plan may reduce the damage from one holding performing poorly, although the overall value can still fall.",
    mistakes: ["Owning many investments that all carry the same risk.", "Diversifying without understanding fees.", "Using volatile assets for near-term goals.", "Assuming diversification prevents losses."],
    checklist: ["I know where my largest concentrations are.", "Each investment has a goal and time horizon.", "I understand major risks and costs.", "I review and rebalance thoughtfully when needed."],
  });

  register({
    id: "net-worth", icon: "⚖️", title: "Net Worth", description: "Track what you own compared with what you owe.",
    introduction: "Net worth is a simple snapshot of assets minus liabilities. It complements income and spending information.",
    remember: ["Review net worth periodically.", "Include both assets and liabilities.", "Do not focus only on income.", "Track whether assets are growing relative to liabilities.", "Use consistent values and categories when comparing periods."],
    why: "Tracking net worth can reveal whether debt is falling and resources for future goals are growing over time.",
    mistakes: ["Leaving out loans or card balances.", "Using unrealistic asset values.", "Confusing high income with high net worth.", "Reacting to one short-term change without context."],
    checklist: ["I listed all material assets.", "I listed all material liabilities.", "I used realistic current estimates.", "I compare changes at a consistent interval."],
    extraTitle: "Formula",
    extra: ["Net Worth = Total Assets - Total Liabilities"],
  });
})();
