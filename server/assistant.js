import { summarizeEmissions } from './calculations.js';

const actionLibrary = {
  transport: [
    {
      title: 'Replace two car commutes with bus or train',
      impactKgPerYear: 420,
      effort: 'medium',
      rationale: 'Transport is your largest category, so recurring commute changes compound quickly.'
    },
    {
      title: 'Batch errands into one weekly route',
      impactKgPerYear: 160,
      effort: 'easy',
      rationale: 'The same tasks produce less carbon when short trips are grouped.'
    }
  ],
  home: [
    {
      title: 'Shift heavy appliance use outside peak hours',
      impactKgPerYear: 120,
      effort: 'easy',
      rationale: 'Lower demand periods often rely on cleaner grid supply and reduce waste.'
    },
    {
      title: 'Audit cooling, lighting, and standby power',
      impactKgPerYear: 300,
      effort: 'medium',
      rationale: 'Home energy is high enough that small efficiency wins are visible in monthly logs.'
    }
  ],
  food: [
    {
      title: 'Plan three plant-forward days each week',
      impactKgPerYear: 450,
      effort: 'medium',
      rationale: 'Diet changes are repeatable and do not require new equipment.'
    },
    {
      title: 'Use a weekly leftovers-first meal slot',
      impactKgPerYear: 140,
      effort: 'easy',
      rationale: 'Cutting waste reduces both production emissions and landfill methane.'
    }
  ],
  shopping: [
    {
      title: 'Set a 48-hour pause for non-essential purchases',
      impactKgPerYear: 180,
      effort: 'easy',
      rationale: 'Reducing unnecessary purchases avoids manufacturing and delivery emissions.'
    },
    {
      title: 'Prefer repair, rental, or second-hand for one purchase a month',
      impactKgPerYear: 240,
      effort: 'medium',
      rationale: 'Reuse lowers the footprint of goods without removing convenience.'
    }
  ]
};

export function createAssistantPlan({ profile, emissions, goal = 'reduce monthly footprint' }) {
  const summary = summarizeEmissions(emissions);
  const priority = summary.biggestCategory;
  const secondary = Object.entries(summary.categoryTotals)
    .filter(([key]) => key !== priority)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'home';

  const annualTotal = summary.annualTotal;
  const score =
    annualTotal <= 2 ? 'excellent' :
    annualTotal <= 4.7 ? 'on-track' :
    annualTotal <= 8 ? 'needs-attention' :
    'high-impact';

  return {
    persona: profile?.persona || 'personal carbon coach',
    goal,
    score,
    summary,
    message: `Focus first on ${priority}. Based on ${summary.monthsLogged} logged months, that is the clearest path to lower emissions for ${profile?.name || 'this user'}.`,
    nextActions: [
      ...actionLibrary[priority].slice(0, 2),
      actionLibrary[secondary][0]
    ],
    guardrails: [
      'Prioritize actions that are affordable and repeatable.',
      'Avoid recommendations that require sensitive personal data.',
      'Recalculate after each monthly log so advice adapts to the user context.'
    ]
  };
}
