export type Category = 'quick-win' | 'strategic-bet' | 'consider' | 'reconsider';

export interface Scores {
  strategicAlignment: number;   // 1–5
  deliveryComplexity: number;   // 1–5  (higher = harder)
  dataAvailability: number;     // 1–5
  riskCompliance: number;       // 1–5  (higher = riskier)
  stakeholderSupport: number;   // 1–5
}

export interface UseCase {
  id: string;
  name: string;
  description: string;
  businessUnit: string;
  scores: Scores;
  compositeScore: number;
  category: Category;
  createdAt: string;
}
