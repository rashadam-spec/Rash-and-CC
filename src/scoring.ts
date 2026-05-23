import type { Scores, Category, UseCase } from './types';

export const DIMENSIONS: {
  key: keyof Scores;
  label: string;
  description: string;
  lowAnchor: string;
  highAnchor: string;
  weight: number;
  inverted: boolean;
}[] = [
  {
    key: 'strategicAlignment',
    label: 'Strategic Alignment',
    description: "How strongly does this align with the agency's AI strategy and APS priorities?",
    lowAnchor: 'No alignment',
    highAnchor: 'Top priority',
    weight: 0.30,
    inverted: false,
  },
  {
    key: 'deliveryComplexity',
    label: 'Delivery Complexity',
    description: 'How complex is this to implement? Consider technical risk, integration, and change management.',
    lowAnchor: 'Minimal effort',
    highAnchor: 'Major program',
    weight: 0.20,
    inverted: true,
  },
  {
    key: 'dataAvailability',
    label: 'Data Availability',
    description: 'Is the required data accessible, fit-for-purpose, and of sufficient quality?',
    lowAnchor: 'No suitable data',
    highAnchor: 'Ready & governed',
    weight: 0.20,
    inverted: false,
  },
  {
    key: 'riskCompliance',
    label: 'Risk & Compliance',
    description: 'What is the level of regulatory, ethical, or reputational risk?',
    lowAnchor: 'Negligible risk',
    highAnchor: 'High risk',
    weight: 0.15,
    inverted: true,
  },
  {
    key: 'stakeholderSupport',
    label: 'Stakeholder Support',
    description: 'How strong is executive sponsorship and operational buy-in?',
    lowAnchor: 'Active resistance',
    highAnchor: 'Strong champion',
    weight: 0.15,
    inverted: false,
  },
];

// Returns 0–100. Raw range is 1.0 (all worst) to 5.0 (all best).
export function computeScore(scores: Scores): number {
  const raw = DIMENSIONS.reduce((acc, dim) => {
    const val = dim.inverted ? 6 - scores[dim.key] : scores[dim.key];
    return acc + val * dim.weight;
  }, 0);
  return Math.round(((raw - 1) / 4) * 100);
}

export function getCategory(scores: Scores): Category {
  const highValue = scores.strategicAlignment >= 3;
  const lowEffort = scores.deliveryComplexity <= 3;
  if (highValue && lowEffort) return 'quick-win';
  if (highValue && !lowEffort) return 'strategic-bet';
  if (!highValue && lowEffort) return 'consider';
  return 'reconsider';
}

export function applyScoring(uc: Omit<UseCase, 'compositeScore' | 'category'>): UseCase {
  return {
    ...uc,
    compositeScore: computeScore(uc.scores),
    category: getCategory(uc.scores),
  };
}

export const CATEGORY_META: Record<Category, { label: string; color: string; bg: string }> = {
  'quick-win':     { label: 'Quick Win',     color: '#15803d', bg: '#dcfce7' },
  'strategic-bet': { label: 'Strategic Bet', color: '#1d4ed8', bg: '#dbeafe' },
  'consider':      { label: 'Consider',      color: '#b45309', bg: '#fef3c7' },
  'reconsider':    { label: 'Reconsider',    color: '#b91c1c', bg: '#fee2e2' },
};
