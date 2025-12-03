import { Fund, HistoricalDataPoint } from '../types';

export const FUNDS: Fund[] = [
  {
    id: '1',
    name: 'Global Tech Innovators ETF',
    code: 'TECH-001',
    currentNAV: 142.50,
    dayChangePercent: 1.25,
    marketCap: 4500,
    currency: 'USD',
    sector: 'Technology',
    riskLevel: 'High',
    description: 'Focuses on large-cap technology companies with a high growth potential in AI and cloud computing.'
  },
  {
    id: '2',
    name: 'Sustainable Green Energy Fund',
    code: 'GREEN-055',
    currentNAV: 88.20,
    dayChangePercent: -0.45,
    marketCap: 1200,
    currency: 'USD',
    sector: 'Energy',
    riskLevel: 'Medium',
    description: 'Invests in renewable energy infrastructure, electric vehicles, and battery technology.'
  },
  {
    id: '3',
    name: 'Blue Chip Dividend Plus',
    code: 'DIV-100',
    currentNAV: 54.10,
    dayChangePercent: 0.15,
    marketCap: 8900,
    currency: 'USD',
    sector: 'General',
    riskLevel: 'Low',
    description: 'A defensive portfolio focusing on established companies with a history of stable dividend payouts.'
  },
  {
    id: '4',
    name: 'Asian Emerging Markets Opps',
    code: 'ASIA-202',
    currentNAV: 32.80,
    dayChangePercent: 2.10,
    marketCap: 2100,
    currency: 'USD',
    sector: 'Emerging Markets',
    riskLevel: 'High',
    description: 'Targets high-growth potential companies in developing Asian economies.'
  },
];

export const generateHistory = (baseNAV: number, days: number = 30): HistoricalDataPoint[] => {
  const data: HistoricalDataPoint[] = [];
  let current = baseNAV * 0.9; // Start slightly lower to show trend
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Random walk
    const change = (Math.random() - 0.45) * (baseNAV * 0.05); 
    current += change;

    data.push({
      date: date.toISOString().split('T')[0],
      nav: parseFloat(current.toFixed(2))
    });
  }
  return data;
};