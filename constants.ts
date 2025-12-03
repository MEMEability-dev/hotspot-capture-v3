
import { HotspotEvent, HotspotStatus, MarketIndex, NewsItem, CompetitorData, ChartPoint, PanoramaData, InfoItem, CopyItem } from './types';
import { REAL_DATA_DB, FundRealData } from './services/realData';

// --- HELPERS FOR REAL DATA ---

// Helper to determine status based on change %
const getStatusFromChange = (change: number): HotspotStatus => {
  if (Math.abs(change) > 2) return HotspotStatus.PENDING; // High volatility
  if (Math.abs(change) > 1) return HotspotStatus.PROCESSING; 
  return HotspotStatus.COMPLETED;
};

// Helper to generate a reason
const getReasonFromChange = (change: number): string => {
  if (change > 3) return '大幅拉升';
  if (change > 1) return '逆势上涨';
  if (change > 0) return '温和上涨';
  if (change > -1) return '小幅震荡';
  if (change > -3) return '回调压力';
  return '大幅下跌';
};

// --- MOCK INDICES (Keep somewhat static as no data provided for main indices) ---
export const MOCK_INDICES: MarketIndex[] = [
  { 
    name: '上证指数', 
    value: 3058.23, 
    change: 12.45, 
    changePercent: 0.41,
    data: Array.from({ length: 20 }, (_, i) => ({ time: `${9 + Math.floor(i/2)}:${i%2===0?'00':'30'}`, value: 3040 + Math.random() * 30 }))
  },
  { 
    name: '沪深300', 
    value: 3567.89, 
    change: -5.20, 
    changePercent: -0.15,
    data: Array.from({ length: 20 }, (_, i) => ({ time: `${9 + Math.floor(i/2)}:${i%2===0?'00':'30'}`, value: 3560 + Math.random() * 20 }))
  },
  { 
    name: '科创50', 
    value: 890.12, 
    change: 15.67, 
    changePercent: 1.79,
    data: Array.from({ length: 20 }, (_, i) => ({ time: `${9 + Math.floor(i/2)}:${i%2===0?'00':'30'}`, value: 880 + Math.random() * 25 }))
  },
  { 
    name: '中证红利', 
    value: 5200.45, 
    change: 32.10, 
    changePercent: 0.62,
    data: Array.from({ length: 20 }, (_, i) => ({ time: `${9 + Math.floor(i/2)}:${i%2===0?'00':'30'}`, value: 5180 + Math.random() * 40 }))
  },
];

// --- GENERATE HOTSPOTS FROM REAL DATA ---
export const MOCK_HOTSPOTS: HotspotEvent[] = Object.values(REAL_DATA_DB).map((fund, index) => {
  const isPositive = fund.latest.changePercent >= 0;
  return {
    id: fund.code,
    time: '14:55', // Mocking a late afternoon time for the "Daily" close data
    code: fund.code,
    name: fund.name,
    triggerReason: getReasonFromChange(fund.latest.changePercent),
    triggerType: isPositive ? 'PRICE' : 'INFLOW', // Simple logic mapping
    metricValue: `${isPositive ? '+' : ''}${fund.latest.changePercent.toFixed(2)}%`,
    status: getStatusFromChange(fund.latest.changePercent),
    isSelfSelect: true, // All user provided funds are treated as self-select
    description: `最新日期 ${fund.latest.date}, 收盘价 ${fund.latest.price.toFixed(4)}, 当日涨跌幅 ${fund.latest.changePercent}%。`
  };
});


// --- NEWS (Keep Generic) ---
export const MOCK_NEWS: NewsItem[] = [
  {
    id: 'n1',
    time: '10:40',
    title: '市场震荡加剧，红利策略配置价值凸显',
    source: '财联社',
    summary: '近期市场波动较大，高股息资产成为资金避风港，红利ETF持续获净申购。',
    views: 12503
  },
  {
    id: 'n2',
    time: '10:35',
    title: '医药板块估值处于历史低位，创新药迎布局良机',
    source: '证券时报',
    summary: '随着集采政策边际缓和，创新药出海逻辑强化，板块反弹动力积蓄。',
    views: 8900
  },
  {
    id: 'n3',
    time: '10:15',
    title: '机器人产业利好频出，人形机器人量产在即',
    source: 'Wind资讯',
    summary: '特斯拉Optimus进展超预期，国内产业链相关公司有望受益。',
    views: 10200
  }
];

// --- PRODUCT HELPERS ---

export const getProductNameByCode = (code: string) => {
   const real = REAL_DATA_DB[code];
   return real ? real.name : '未知产品';
}

const NEWS_DATABASE: Record<string, { news: InfoItem[], announcements: InfoItem[] }> = {
  'BROAD': {
    news: [
      { id: 's1', date: '12-03', tag: '资讯', title: 'A股三大指数集体收跌，成交额萎缩' },
      { id: 's2', date: '12-02', tag: '资讯', title: '北向资金今日净流出，大消费板块承压' },
    ],
    announcements: [
      { id: 'sa1', date: '11-30', tag: '公告', title: '关于旗下基金调整估值方法的公告' },
      { id: 'sa2', date: '11-28', tag: '公告', title: '基金暂停大额申购公告' },
    ]
  }
};

export const getNewsForProduct = (code: string) => {
   // Simple fallback
   return NEWS_DATABASE['BROAD'];
};

// --- COMPETITORS (Generating from the 6 real funds) ---
// We treat the other 5 funds as "Competitors" to the current one for demo purposes
export const getCompetitorsForProduct = (code: string): CompetitorData[] => {
    const target = REAL_DATA_DB[code];
    if (!target) return [];

    const all = Object.values(REAL_DATA_DB);
    // Use the target plus 2-3 others
    const others = all.filter(f => f.code !== code).slice(0, 3);
    
    const list = [target, ...others];

    return list.map(f => ({
        name: f.name,
        code: f.code,
        currentPrice: f.latest.price,
        volume: f.latest.volume ? (f.latest.volume / 1000000).toFixed(2) + '万' : '--',
        premiumRate: (Math.random() * 0.2 - 0.1).toFixed(2) + '%', // Mock
        netInflow: (Math.random() * 1 - 0.5).toFixed(2) + '亿', // Mock
        scale: (10 + Math.random() * 50).toFixed(2) + '亿', // Mock
        marketShare: (5 + Math.random() * 20).toFixed(1) + '%', // Mock
        change1M: (Math.random() * 10 - 5).toFixed(2) + '%', // Mock
        inflow1M: (Math.random() * 5 - 2).toFixed(2) + '亿', // Mock
        isLeader: f.code === code
    }));
};

// --- CHART DATA GENERATORS ---

export const generateChartData = (competitors: CompetitorData[] = [], triggerTime: string = '10:42'): ChartPoint[] => {
  const points: ChartPoint[] = [];
  
  // Find self
  const selfProduct = competitors.find(c => c.isLeader);
  // Default base price to 1.0 if not found
  const basePrice = selfProduct ? selfProduct.currentPrice : 1.0; 
  
  // Simulate intraday volatility based on the Real Close Price
  // We start at Open (simulated as Close / (1+change%)) and end at Close
  // This ensures the "Real-time" chart matches the "Real Data" numbers in the header
  
  // Find the real change percent for this product
  const realInfo = selfProduct ? REAL_DATA_DB[selfProduct.code] : null;
  const changePct = realInfo ? realInfo.latest.changePercent / 100 : 0;
  
  // Calculate implied Open
  const startPrice = basePrice / (1 + changePct);
  
  let currentValue = startPrice;
  const step = (basePrice - startPrice) / 240; // Simple linear trend + noise

  // Initialize mock values for competitors
  const compValues: Record<string, number> = {};
  competitors.forEach(c => {
    if (!c.isLeader) {
       compValues[c.code] = c.currentPrice || 1.0;
    }
  });

  // Morning 09:30 - 11:30 (120 mins)
  for (let i = 0; i <= 120; i++) {
    const d = new Date();
    d.setHours(9, 30 + i, 0, 0);
    const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    
    // Trend towards close + Noise
    currentValue = currentValue + step + (Math.random() - 0.5) * (basePrice * 0.002);
    
    // IOPV
    const iopv = currentValue * (1 + (Math.random() - 0.5) * 0.0005);
    
    // Competitors
    const currentCompValues: Record<string, number> = {};
    Object.keys(compValues).forEach(code => {
      // Just random walk around their close price
      currentCompValues[code] = compValues[code] * (1 + (Math.random() - 0.5) * 0.001);
    });

    points.push({
      time: timeStr,
      value: Number(currentValue.toFixed(4)),
      iopv: Number(iopv.toFixed(4)),
      competitors: currentCompValues,
      isTrigger: false,
      volume: Math.floor(Math.random() * 1000)
    });
  }

  // Afternoon 13:00 - 15:00 (120 mins)
  for (let i = 0; i <= 120; i++) {
    const d = new Date();
    d.setHours(13, i, 0, 0);
    const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    
    currentValue = currentValue + step + (Math.random() - 0.5) * (basePrice * 0.002);
    const iopv = currentValue * (1 + (Math.random() - 0.5) * 0.0005);

    const currentCompValues: Record<string, number> = {};
    Object.keys(compValues).forEach(code => {
       currentCompValues[code] = compValues[code] * (1 + (Math.random() - 0.5) * 0.001);
    });

    points.push({
      time: timeStr,
      value: Number(currentValue.toFixed(4)),
      iopv: Number(iopv.toFixed(4)),
      competitors: currentCompValues,
      isTrigger: false,
      volume: Math.floor(Math.random() * 1000)
    });
  }
  
  // Force the last point to be exactly the real close price
  if (points.length > 0) {
      points[points.length - 1].value = basePrice;
  }

  return points;
};

// Generate Historical Data from REAL CSV Data
export const generateHistoricalData = (range: string, competitors: CompetitorData[] = []): { date: string; value: number; competitors: Record<string, number> }[] => {
  const points: { date: string; value: number; competitors: Record<string, number> }[] = [];
  
  // Identify the main product
  const selfProduct = competitors.find(c => c.isLeader);
  if (!selfProduct) return [];
  
  const realSelf = REAL_DATA_DB[selfProduct.code];
  if (!realSelf) return [];

  // Filter history based on range
  // Simple logic: return all history available in realData (approx 3 months)
  // In a real app, filtering by date would happen here
  
  // We need to normalize data.
  // The charts usually show % change relative to start of period.
  
  const startPriceSelf = realSelf.history[0].value;

  realSelf.history.forEach((day, index) => {
      // Calculate % change from start of this period
      const pctChangeSelf = ((day.value - startPriceSelf) / startPriceSelf) * 100;

      const compVals: Record<string, number> = {};
      
      competitors.forEach(c => {
          if (!c.isLeader) {
              const realComp = REAL_DATA_DB[c.code];
              if (realComp && realComp.history[index]) {
                  const startPriceComp = realComp.history[0].value;
                  const currentPriceComp = realComp.history[index].value;
                  compVals[c.code] = Number((((currentPriceComp - startPriceComp) / startPriceComp) * 100).toFixed(2));
              } else {
                  compVals[c.code] = 0;
              }
          }
      });

      points.push({
          date: day.date,
          value: Number(pctChangeSelf.toFixed(2)),
          competitors: compVals
      });
  });

  return points;
};

// Generator for Panorama Data (Using Real Data)
export const getMockPanoramaData = (): PanoramaData[] => {
  return Object.values(REAL_DATA_DB).map(fund => ({
    id: fund.code,
    code: fund.code,
    name: fund.name,
    trackingIndex: fund.name.replace('ETF', '指数'),
    price: fund.latest.price,
    changePercent: fund.latest.changePercent,
    premiumRate: Number((Math.random() * 0.4 - 0.2).toFixed(2)),
    scale: Number((10 + Math.random() * 100).toFixed(2)),
    volume: fund.latest.volume ? fund.latest.volume / 100000000 : 0, // Convert to 亿
    turnoverRate: Number((Math.random() * 5).toFixed(2)),
    triggerStatus: Math.abs(fund.latest.changePercent) > 1 ? (fund.latest.changePercent > 0 ? '大幅上涨' : '大幅下跌') : null,
    isSelfSelect: true,
    
    changePrevDay: Number((Math.random() * 2 - 1).toFixed(2)),
    change1W: Number((Math.random() * 5 - 2.5).toFixed(2)),
    change1M: Number((Math.random() * 10 - 5).toFixed(2)),
    change3M: Number((Math.random() * 15 - 7.5).toFixed(2)),
    changeYTD: Number((Math.random() * 20 - 10).toFixed(2)),
    change1Y: Number((Math.random() * 25 - 12.5).toFixed(2)),

    avgVol1W: Number((Math.random() * 5).toFixed(2)),
    avgVol1M: Number((Math.random() * 5).toFixed(2)),
    avgVol3M: Number((Math.random() * 5).toFixed(2)),
    avgVolYTD: Number((Math.random() * 5).toFixed(2)),
    avgVol1Y: Number((Math.random() * 5).toFixed(2)),

    inflowPrevDay: Number((Math.random() * 1 - 0.5).toFixed(2)),
    inflow1W: Number((Math.random() * 2 - 1).toFixed(2)),
    inflow1M: Number((Math.random() * 5 - 2.5).toFixed(2)),
    inflow3M: Number((Math.random() * 10 - 5).toFixed(2)),
    inflowYTD: Number((Math.random() * 20 - 10).toFixed(2)),
    inflow1Y: Number((Math.random() * 30 - 15).toFixed(2)),
  }));
};

export const MOCK_COPIES: CopyItem[] = [
  {
    id: 1,
    title: '半导体行情速递',
    product: '创新药ETF易方达 (516080)',
    status: 'DRAFT',
    updatedAt: '2025-12-03 14:00',
    preview: '创新药板块今日回调，但资金持续关注...',
    content: '...'
  },
  {
    id: 2,
    title: '红利策略分析',
    product: '红利ETF易方达 (515180)',
    status: 'PUBLISHED',
    updatedAt: '2025-12-02 16:30',
    preview: '红利资产具有较高防御属性...',
    content: '...'
  }
];

export const getCopyById = (id: number | string): CopyItem | undefined => {
  return MOCK_COPIES.find(c => c.id.toString() === id.toString());
};
