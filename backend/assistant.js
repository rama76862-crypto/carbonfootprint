import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { roundTonnes, summarizeEmissions } from './calculations.js';

const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

function normalizeProviderError(error) {
  const message = String(error?.message || error || '').trim();
  const lower = message.toLowerCase();

  if (!message) return 'Gemini request failed.';
  if (lower.includes('quota') || lower.includes('rate') || lower.includes('429')) {
    return 'Gemini quota exceeded or disabled for this key/project.';
  }
  if (lower.includes('permission') || lower.includes('unauthorized') || lower.includes('403')) {
    return 'Gemini API key unauthorized or Gemini API not enabled.';
  }
  if (lower.includes('not found') || lower.includes('404')) {
    return `Gemini model not available for this API key/project (${modelName}).`;
  }

  return message.length > 200 ? `${message.slice(0, 200)}…` : message;
}

function extractJsonObject(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = (fenced?.[1] || text).trim();
  const start = candidate.indexOf('{');
  if (start < 0) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < candidate.length; i += 1) {
    const ch = candidate[i];
    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (ch === '"') inString = false;
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === '{') {
      depth += 1;
      continue;
    }
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) return candidate.slice(start, i + 1);
    }
  }

  return null;
}

export async function createAssistantPlan({ profile, emissions, goal = 'reduce monthly footprint' }) {
  const baseSummary = summarizeEmissions(emissions);
  const monthsLogged = Math.max(0, Number(baseSummary.monthsLogged) || 0);
  const annualTotal = Number(baseSummary.annualTotal) || 0;
  const monthlyAverageRaw = monthsLogged ? annualTotal / monthsLogged : 0;
  const annualTarget = Math.max(0, Number(profile?.annualTarget) || 0);
  const targetProgressRaw = annualTarget ? annualTotal / annualTarget : 0;
  const summary = {
    ...baseSummary,
    monthlyAverage: roundTonnes(monthlyAverageRaw),
    targetProgress: Number.isFinite(targetProgressRaw) ? targetProgressRaw : 0
  };

  if (!process.env.GEMINI_API_KEY) {
    return {
      ...fallbackCreateAssistantPlan({ profile, emissions, goal }),
      provider: 'fallback',
      providerError: 'GEMINI_API_KEY missing.'
    };
  }

  try {
    const prompt = `
You are a personal sustainability coach named EcoTrace. Your goal is to help the user reduce their carbon footprint.

User Profile:
- Name: ${profile?.name || 'User'}
- Location: ${profile?.location || 'Not specified'}
- Household Size: ${profile?.householdSize || 1}
- Annual Target: ${profile?.annualTarget || 2.0} tonnes CO₂e
- Persona: ${profile?.persona || 'personal carbon coach'}

Current Emissions Data:
- Months Logged: ${summary.monthsLogged}
- Annual Total: ${summary.annualTotal.toFixed(2)} tonnes CO₂e
- Category Totals (tonnes CO₂e):
  - Transport: ${summary.categoryTotals.transport.toFixed(2)}
  - Home: ${summary.categoryTotals.home.toFixed(2)}
  - Food: ${summary.categoryTotals.food.toFixed(2)}
  - Shopping: ${summary.categoryTotals.shopping.toFixed(2)}
- Biggest Category: ${summary.biggestCategory}
- Monthly Average: ${summary.monthlyAverage.toFixed(2)} tonnes CO₂e
- Target Progress: ${(summary.targetProgress * 100).toFixed(0)}%

User Goal: ${goal}

Please respond with a JSON object in the following format:
{
  "persona": "personal carbon coach",
  "goal": "${goal}",
  "score": "excellent|on-track|needs-attention|high-impact",
  "summary": {
    "annualTotal": number,
    "biggestCategory": "transport|home|food|shopping",
    "categoryTotals": {
      "transport": number,
      "home": number,
      "food": number,
      "shopping": number
    },
    "monthlyAverage": number,
    "monthsLogged": number,
    "targetProgress": number
  },
  "message": "A personalized, encouraging message to the user",
  "nextActions": [
    {
      "title": "Action title",
      "impactKgPerYear": number,
      "effort": "easy|medium|hard",
      "rationale": "Why this action helps"
    },
    {
      "title": "Action title",
      "impactKgPerYear": number,
      "effort": "easy|medium|hard",
      "rationale": "Why this action helps"
    },
    {
      "title": "Action title",
      "impactKgPerYear": number,
      "effort": "easy|medium|hard",
      "rationale": "Why this action helps"
    }
  ],
  "guardrails": [
    "Prioritize actions that are affordable and repeatable.",
    "Avoid recommendations that require sensitive personal data.",
    "Recalculate after each monthly log so advice adapts to the user context."
  ]
}

Important:
- Score should be: "excellent" (<=2 tonnes), "on-track" (<=4.7 tonnes), "needs-attention" (<=8 tonnes), "high-impact" (>8 tonnes)
- Only return valid JSON, no other text
- Make actions practical and specific
- impactKgPerYear should be reasonable estimates (between 50 and 500 kg per year)
`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const json = extractJsonObject(text);
    if (json) {
      const plan = JSON.parse(json);
      return { ...plan, summary, provider: 'gemini' };
    }

    throw new Error('Failed to parse Gemini response');
  } catch (error) {
    console.error('Gemini API error:', error?.message || error);
    return {
      ...fallbackCreateAssistantPlan({ profile, emissions, goal }),
      provider: 'fallback',
      providerError: normalizeProviderError(error)
    };
  }
}

function fallbackCreateAssistantPlan({ profile, emissions, goal = 'reduce monthly footprint' }) {
  const baseSummary = summarizeEmissions(emissions);
  const monthsLogged = Math.max(0, Number(baseSummary.monthsLogged) || 0);
  const annualTotal = Number(baseSummary.annualTotal) || 0;
  const monthlyAverageRaw = monthsLogged ? annualTotal / monthsLogged : 0;
  const annualTarget = Math.max(0, Number(profile?.annualTarget) || 0);
  const targetProgressRaw = annualTarget ? annualTotal / annualTarget : 0;
  const summary = {
    ...baseSummary,
    monthlyAverage: roundTonnes(monthlyAverageRaw),
    targetProgress: Number.isFinite(targetProgressRaw) ? targetProgressRaw : 0
  };

  const priority = summary.biggestCategory;
  const secondary = Object.entries(summary.categoryTotals)
    .filter(([key]) => key !== priority)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'home';

  const score =
    annualTotal <= 2 ? 'excellent' :
    annualTotal <= 4.7 ? 'on-track' :
    annualTotal <= 8 ? 'needs-attention' :
    'high-impact';

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
