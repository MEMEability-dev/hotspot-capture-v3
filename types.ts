
export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  data: { time: string; value: number }[];
}

export enum HotspotStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  IGNORED = 'IGNORED'
}

export interface HotspotEvent {
  id: string;
  time: string;
  code: string;
  name: string;
  triggerReason: string; // e.g., "盘中成交额突破5亿"
  triggerType: 'VOLUME' | 'INFLOW' | 'PRICE' | 'SCALE';
  metricValue: string;
  status: HotspotStatus;
  isSelfSelect: boolean;
  description: string;
}

export interface PanoramaData {
  id: string;
  code: string;
  name: string;
  trackingIndex: string;
  price: number;
  changePercent: number;
  premiumRate: number;
  scale: number; // 亿元
  volume: number; // 亿元
  turnoverRate: number; // %
  triggerStatus: string | null; // The reason from HotspotEvent if exists
  isSelfSelect: boolean; // Support self-select filtering
  
  // Historical Change %
  changePrevDay: number;
  change1W: number;
  change1M: number;
  change3M: number;
  changeYTD: number;
  change1Y: number;

  // Avg Volume (Daily Avg in 亿元)
  avgVol1W: number;
  avgVol1M: number;
  avgVol3M: number;
  avgVolYTD: number;
  avgVol1Y: number;

  // Net Inflow (亿元)
  inflowPrevDay: number;
  inflow1W: number;
  inflow1M: number;
  inflow3M: number;
  inflowYTD: number;
  inflow1Y: number;
}

export interface NewsItem {
  id: string;
  time: string;
  title: string;
  source: string;
  summary: string;
  views: number;
}

// New interface for compact list items
export interface InfoItem {
  id: string;
  date: string;
  tag: string;
  title: string;
}

export interface CompetitorData {
  name: string;
  code: string;
  currentPrice: number;
  volume: string;
  premiumRate: string;
  netInflow: string;
  scale: string;       // 产品规模 (New)
  marketShare: string; // 市场份额占比 (New)
  change1M: string;    // 近1月收益率 (New)
  inflow1M: string;    // 近1月净流入 (New)
  isLeader: boolean;   // Is our product leading?
}

export interface ChartPoint {
  time: string;
  value: number;
  iopv: number; // Reference Net Value
  competitors: Record<string, number>; // Map of competitor code to value
  isTrigger?: boolean;
  volume: number;
}

export interface CopyItem {
  id: number;
  title: string;
  product: string; // e.g. "半导体ETF (512480)"
  status: 'DRAFT' | 'PUBLISHED';
  updatedAt: string;
  preview: string;
  content: string; // Full content
}