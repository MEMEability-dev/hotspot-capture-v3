export interface Fund {
  id: string;
  name: string;
  code: string;
  currentNAV: number; // Net Asset Value
  dayChangePercent: number;
  marketCap: number; // In millions
  currency: string;
  sector: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  description: string;
}

export interface HistoricalDataPoint {
  date: string;
  nav: number;
}

export interface AIAnalysisState {
  isLoading: boolean;
  content: string | null;
  error: string | null;
}
