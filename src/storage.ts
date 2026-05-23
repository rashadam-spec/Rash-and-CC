import type { UseCase } from './types';
import { applyScoring } from './scoring';

const STORAGE_KEY = 'aps-ai-usecases';

const SAMPLE_CASES: Omit<UseCase, 'compositeScore' | 'category'>[] = [
  {
    id: 'sample-1',
    name: 'Automated FOI Request Triage',
    description: 'Use NLP to classify and route incoming FOI requests to the appropriate team, reducing manual review time.',
    businessUnit: 'Legal & Governance',
    scores: { strategicAlignment: 4, deliveryComplexity: 3, dataAvailability: 4, riskCompliance: 3, stakeholderSupport: 4 },
    createdAt: new Date('2025-03-01').toISOString(),
  },
  {
    id: 'sample-2',
    name: 'AI-Assisted Policy Drafting',
    description: 'LLM-powered tool to assist policy officers in drafting briefs and regulatory documents with precedent suggestions.',
    businessUnit: 'Policy',
    scores: { strategicAlignment: 5, deliveryComplexity: 4, dataAvailability: 3, riskCompliance: 4, stakeholderSupport: 3 },
    createdAt: new Date('2025-03-02').toISOString(),
  },
  {
    id: 'sample-3',
    name: 'Internal HR Self-Service Chatbot',
    description: 'Conversational AI for staff to self-serve common HR queries covering leave, entitlements, and APS policies.',
    businessUnit: 'People & Culture',
    scores: { strategicAlignment: 3, deliveryComplexity: 2, dataAvailability: 5, riskCompliance: 2, stakeholderSupport: 5 },
    createdAt: new Date('2025-03-03').toISOString(),
  },
  {
    id: 'sample-4',
    name: 'Predictive Procurement Analytics',
    description: 'ML models to forecast procurement spend, identify patterns, and surface cost-saving opportunities across the agency.',
    businessUnit: 'Finance',
    scores: { strategicAlignment: 4, deliveryComplexity: 5, dataAvailability: 3, riskCompliance: 2, stakeholderSupport: 3 },
    createdAt: new Date('2025-03-04').toISOString(),
  },
  {
    id: 'sample-5',
    name: 'Automated Meeting Summarisation',
    description: 'AI transcription and summarisation of internal meetings to reduce admin burden and improve record-keeping.',
    businessUnit: 'Corporate Services',
    scores: { strategicAlignment: 2, deliveryComplexity: 2, dataAvailability: 4, riskCompliance: 3, stakeholderSupport: 3 },
    createdAt: new Date('2025-03-05').toISOString(),
  },
];

export function loadUseCases(): UseCase[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as UseCase[];
  } catch {
    // corrupt data — fall through to seed
  }
  const seeded = SAMPLE_CASES.map(applyScoring);
  saveUseCases(seeded);
  return seeded;
}

export function saveUseCases(cases: UseCase[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
}
