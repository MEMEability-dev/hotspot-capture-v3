
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Share2, MoreHorizontal, ChevronDown, 
  TrendingUp, TrendingDown, Lightbulb
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Line, ReferenceDot, CartesianGrid
} from 'recharts';
import { 
  getCompetitorsForProduct, 
  generateChartData, 
  generateHistoricalData, 
  getProductNameByCode,
  getNewsForProduct,
  MOCK_HOTSPOTS 
} from '../constants';
import { CompetitorData } from '../types';

// Metrics definition for transposed table
const METRICS = [
  { label: '成交额', key: 'volume' },
  { label: '最新价', key: 'currentPrice', format: (v: any) => `¥${Number(v).toFixed(3)}` },
  { label: '溢价率', key: 'premiumRate' },
  { label: '净流入额', key: 'netInflow' },
  { label: '产品规模', key: 'scale' },
  { label: '市场份额占比', key: 'marketShare' },
  { label: '近1月收益率', key: 'change1M' },
  { label: '近1月净流入', key: 'inflow1M' },
];

const Analysis: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const hotspot = MOCK_HOTSPOTS.find(h => h.id === id);
  const productCode = hotspot?.code || '512480'; 
  const productName = hotspot?.name || getProductNameByCode(productCode);

  const [timeRange, setTimeRange] = useState<string>('实时');
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const comps = getCompetitorsForProduct(productCode);
    setCompetitors(comps);
    // Default to NO competitors selected
    setSelectedCompetitors([]);
  }, [productCode]);

  useEffect(() => {
    if (timeRange === '实时') {
      const data = generateChartData(competitors, hotspot?.time || '10:42');
      setChartData(data);
    } else {
      const data = generateHistoricalData(timeRange, competitors);
      setChartData(data);
    }
  }, [timeRange, competitors, hotspot]);

  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].value : 0;
  // Use first data point as approximate pre-close for visualization calculation
  const preClose = chartData.length > 0 ? chartData[0].value : 1.0;
  const priceChange = currentPrice - preClose;
  const priceChangePct = (priceChange / preClose) * 100;

  // Get current IOPV (mock logic: last point iopv or price * small offset)
  const currentIOPV = chartData.length > 0 && chartData[chartData.length - 1].iopv 
    ? chartData[chartData.length - 1].iopv 
    : currentPrice;

  const showCompetitor = selectedCompetitors.length > 0;
  
  // Find trigger point for visualization
  const triggerPoint = useMemo(() => {
    if (timeRange !== '实时') return null;
    return chartData.find(d => d.isTrigger);
  }, [chartData, timeRange]);

  // Calculate Historical Metrics (Interval Return)
  const histMetrics = useMemo(() => {
    if (chartData.length === 0 || timeRange === '实时') return null;
    const start = chartData[0];
    const end = chartData[chartData.length - 1];
    return {
      start: start.date,
      end: end.date,
      change: end.value // Since generateHistoricalData starts at 0, the end value is the cumulative change
    };
  }, [chartData, timeRange]);

  const handleCompetitorToggle = (code: string) => {
    if (selectedCompetitors.includes(code)) {
      setSelectedCompetitors(selectedCompetitors.filter(c => c !== code));
    } else {
      if (selectedCompetitors.length < 2) {
         setSelectedCompetitors([...selectedCompetitors, code]);
      }
    }
  };

  const handleCreateCopy = () => {
    navigate('/workbench', { state: { product: hotspot || { name: productName, code: productCode, triggerReason: '手动分析' } } });
  };

  const newsData = getNewsForProduct(productCode);
  const selfProduct = competitors.find(c => c.isLeader);

  // Custom Tick Formatter for X Axis
  const formatXAxis = (tickItem: string) => {
    if (tickItem === '11:30') return '11:30/13:00';
    return tickItem;
  };

  // Y Axis Domain
  const yDomain = useMemo(() => {
    if (!chartData.length) return ['auto', 'auto'];
    const values = chartData.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1;
    return [min - padding, max + padding];
  }, [chartData]);

  // Tooltips
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded text-xs z-50">
          <p className="font-bold text-slate-700 mb-2">{label}</p>
          {payload.map((p: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-4 mb-1">
              <span style={{ color: p.color }}>{p.name}:</span>
              <span className="font-mono font-medium">
                {typeof p.value === 'number' ? p.value.toFixed(3) : p.value}
                {timeRange !== '实时' && '%'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Render function for the Trigger Bubble using pure SVG
  const renderTriggerLabel = (props: any) => {
    const { x, y } = props;
    if (!x || !y) return null;

    const reason = hotspot?.triggerReason || '异动触发';
    const time = hotspot?.time || '';
    
    // Bubble dimensions
    const bubbleWidth = 96;
    const bubbleHeight = 36;
    const arrowSize = 6;
    const verticalOffset = 8; // Distance from dot center to arrow tip

    // Calculate top-left of the bubble rect
    const rectY = y - verticalOffset - arrowSize - bubbleHeight;
    const rectX = x - bubbleWidth / 2;

    return (
      <g style={{ pointerEvents: 'none' }}>
        <g filter="url(#bubble-shadow)">
            <path 
              d={`
                M ${rectX + 4},${rectY} 
                H ${rectX + bubbleWidth - 4} 
                Q ${rectX + bubbleWidth},${rectY} ${rectX + bubbleWidth},${rectY + 4} 
                V ${rectY + bubbleHeight - 4} 
                Q ${rectX + bubbleWidth},${rectY + bubbleHeight} ${rectX + bubbleWidth - 4},${rectY + bubbleHeight} 
                H ${x + arrowSize} 
                L ${x},${rectY + bubbleHeight + arrowSize} 
                L ${x - arrowSize},${rectY + bubbleHeight} 
                H ${rectX + 4} 
                Q ${rectX},${rectY + bubbleHeight} ${rectX},${rectY + bubbleHeight - 4} 
                V ${rectY + 4} 
                Q ${rectX},${rectY} ${rectX + 4},${rectY} 
                Z
              `} 
              fill="#ef4444" 
            />
        </g>
        
        {/* Text Content */}
        <text 
          x={x} 
          y={rectY + 14} 
          textAnchor="middle" 
          fill="#fff" 
          fontSize="11" 
          fontWeight="bold" 
          dominantBaseline="central"
        >
          {reason}
        </text>
        <text 
          x={x} 
          y={rectY + 26} 
          textAnchor="middle" 
          fill="rgba(255,255,255,0.9)" 
          fontSize="10" 
          fontFamily="monospace"
          dominantBaseline="central"
        >
          {time}
        </text>
      </g>
    );
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-md border border-slate-200 shadow-sm sticky top-0 z-30">
         <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                {productName} 
                <span className="text-sm font-normal text-slate-500 font-mono bg-slate-100 px-1.5 rounded">{productCode}</span>
              </h1>
              {hotspot && (
                <div className="flex items-center gap-2 mt-1">
                  <TrendingUp className="w-3 h-3 text-red-500" />
                  <span className="text-xs text-red-500 font-medium">
                    触发热点: {hotspot.triggerReason} {hotspot.metricValue} ({hotspot.time})
                  </span>
                </div>
              )}
            </div>
         </div>
         <div className="flex gap-3">
             <button className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 text-sm hover:bg-slate-50 flex items-center gap-2">
               <Share2 className="w-4 h-4" /> 分享
             </button>
             <button 
              onClick={handleCreateCopy}
              className="px-4 py-1.5 bg-brand text-white rounded text-sm font-bold shadow-md shadow-brand/20 hover:bg-brand-dark transition-colors"
             >
               去制作文案
             </button>
         </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column: Chart (Larger) */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          <div className="bg-white rounded-md border border-slate-200 shadow-sm p-5 h-[500px] flex flex-col">
            <h2 className="text-sm font-bold text-slate-800 mb-4">业绩走势</h2>
            
            {/* Chart Header Logic: Real-time vs Historical */}
            {timeRange === '实时' ? (
              // === REAL-TIME HEADER ===
              <div className="flex items-center gap-8 mb-4 h-8">
                 {/* Price Block */}
                 <div className="flex items-center gap-2">
                   <span className="w-3 h-1 bg-[#0e57b4] rounded-full"></span>
                   <span className="text-sm font-bold text-slate-600">价格:</span>
                   <span className="text-lg font-bold font-mono text-slate-800 tracking-tight">
                      {currentPrice.toFixed(3)}
                   </span>
                   <span className={`text-sm font-bold ml-1 ${priceChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {priceChange > 0 ? '+' : ''}{priceChangePct.toFixed(2)}%
                   </span>
                 </div>

                 {/* IOPV Block (Only when no competitor) */}
                 {!showCompetitor && (
                   <div className="flex items-center gap-2">
                       <span className="w-3 h-1 bg-[#fbbf24] rounded-full"></span>
                       <span className="text-sm font-bold text-slate-500">IOPV:</span>
                       <span className="text-lg font-normal font-mono text-slate-500 tracking-tight">
                          {currentIOPV.toFixed(3)}
                       </span>
                       <span className="text-xs text-slate-400 cursor-help" title="实时估值参考">ⓘ</span>
                   </div>
                 )}

                 {/* Competitor Legend (Only when competitor selected) */}
                 {showCompetitor && (
                   <div className="flex items-center gap-2 opacity-60">
                       <span className="w-3 h-1 bg-slate-400 rounded-full"></span>
                       <span className="text-sm font-bold text-slate-500">竞品:</span>
                       <span className="text-lg font-bold font-mono text-slate-300 tracking-widest">
                          ...
                       </span>
                   </div>
                 )}
              </div>
            ) : (
              // === HISTORICAL HEADER ===
              <div className="flex items-center gap-6 mb-4 h-8">
                 <div className="flex items-center gap-2">
                    <span className="w-3 h-1 bg-[#0e57b4] rounded-full"></span>
                    <span className="text-sm font-bold text-slate-600">区间收益率:</span>
                    <span className={`text-lg font-bold font-mono tracking-tight ${histMetrics?.change && histMetrics.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                       {histMetrics?.change && histMetrics.change > 0 ? '+' : ''}{histMetrics?.change?.toFixed(2)}%
                    </span>
                 </div>
                 <div className="text-xs text-slate-400 font-mono self-center mt-1">
                    {histMetrics?.start} ~ {histMetrics?.end}
                 </div>
              </div>
            )}

            {/* Chart Area */}
            <div className="flex-1 w-full min-h-0 relative">
               <ResponsiveContainer width="100%" height="100%">
                  {timeRange === '实时' ? (
                    <AreaChart data={chartData} margin={{ top: 80, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          <stop offset="100%" stopColor="#ffffff" stopOpacity={0.05}/>
                        </linearGradient>
                        <filter id="bubble-shadow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2"/>
                        </filter>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                      
                      {/* X Axis */}
                      <XAxis 
                        dataKey="time" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 11, fill: '#94a3b8'}} 
                        ticks={['09:30', '11:30', '15:00']}
                        tickFormatter={formatXAxis}
                      />
                      
                      {/* Left Y Axis: Price */}
                      <YAxis 
                        yAxisId="left"
                        domain={yDomain} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 11, fill: '#94a3b8'}} 
                        tickFormatter={(val) => val.toFixed(3)}
                        width={50}
                      />
                      
                      {/* Right Y Axis: Percentage */}
                      {!showCompetitor && (
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          domain={[
                             (dataMin: number) => (dataMin - preClose) / preClose,
                             (dataMax: number) => (dataMax - preClose) / preClose
                          ]}
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fontSize: 11, fill: '#94a3b8'}} 
                          tickFormatter={(val) => `${(val * 100).toFixed(2)}%`}
                          width={45}
                        />
                      )}

                      <Tooltip content={<CustomTooltip />} />
                      
                      {/* Main Price Area/Line */}
                      {!showCompetitor ? (
                        <Area 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="value" 
                          stroke="#0e57b4" 
                          fill="url(#colorPrice)" 
                          strokeWidth={2} 
                          name="价格" 
                        />
                      ) : (
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="value" 
                          stroke="#0e57b4" 
                          strokeWidth={2} 
                          dot={false}
                          name="价格" 
                        />
                      )}

                      {/* IOPV Line (Solid Yellow) - Only when no competitor */}
                      {!showCompetitor && (
                         <Line 
                           yAxisId="left"
                           type="monotone" 
                           dataKey="iopv" 
                           stroke="#fbbf24" 
                           strokeWidth={1.5} 
                           dot={false} 
                           name="IOPV" 
                         />
                      )}
                      
                      {/* Competitor Lines */}
                      {selectedCompetitors.map((code, idx) => (
                         <Line 
                           yAxisId="left"
                           key={code} 
                           type="monotone" 
                           dataKey={`competitors.${code}`} 
                           stroke={idx === 0 ? "#94a3b8" : "#cbd5e1"} 
                           strokeWidth={1} 
                           dot={false} 
                           name={competitors.find(c => c.code === code)?.name} 
                         />
                      ))}

                      {/* Trigger Dot with Bubble (Only when no competitor and trigger exists) */}
                      {!showCompetitor && triggerPoint && (
                        <ReferenceDot 
                          yAxisId="left" 
                          x={triggerPoint.time} 
                          y={triggerPoint.value} 
                          r={4} 
                          fill="#ef4444" 
                          stroke="none"
                          label={renderTriggerLabel}
                        />
                      )}

                    </AreaChart>
                  ) : (
                    // Historical Chart (No IOPV)
                    <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                       <defs>
                        <linearGradient id="colorHist" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          <stop offset="100%" stopColor="#ffffff" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                       <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                       <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} minTickGap={30} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} tickFormatter={(v) => `${v.toFixed(0)}%`} width={50} />
                       <Tooltip content={<CustomTooltip />} />
                       
                       {!showCompetitor ? (
                         <Area 
                           type="monotone" 
                           dataKey="value" 
                           stroke="#0e57b4" 
                           fill="url(#colorHist)" 
                           strokeWidth={2} 
                           name="本产品" 
                         />
                       ) : (
                         <Line 
                           type="monotone" 
                           dataKey="value" 
                           stroke="#0e57b4" 
                           strokeWidth={2} 
                           dot={false} 
                           name="本产品" 
                         />
                       )}
                       
                       {selectedCompetitors.map((code, idx) => (
                         <Line 
                           key={code} 
                           type="monotone" 
                           dataKey={`competitors.${code}`} 
                           stroke={idx === 0 ? "#94a3b8" : "#cbd5e1"} 
                           strokeWidth={1} 
                           dot={false} 
                           name={competitors.find(c => c.code === code)?.name} 
                         />
                      ))}
                    </AreaChart>
                  )}
               </ResponsiveContainer>
            </div>
            
            {/* Tabs */}
            <div className="flex justify-between items-center mt-4 border-t border-slate-100 pt-4">
              <div className="flex gap-1">
                 {['实时', '近1月', '近3月', '近6月'].map(t => (
                   <button 
                     key={t}
                     onClick={() => setTimeRange(t)}
                     className={`px-4 py-1.5 text-xs font-medium rounded transition-colors ${
                       timeRange === t 
                         ? 'text-[#0e57b4] font-bold border-b-2 border-[#0e57b4]' 
                         : 'text-slate-500 hover:text-slate-700'
                     }`}
                   >
                     {t}
                   </button>
                 ))}
                 <button className="px-4 py-1.5 text-xs text-slate-500 flex items-center gap-1">
                   更多 <ChevronDown className="w-3 h-3" />
                 </button>
              </div>
            </div>
          </div>

          {/* Add Comparison Bar */}
          <div className="flex items-center gap-3">
             <span className="text-sm font-bold text-slate-700">添加对比:</span>
             {competitors.filter(c => !c.isLeader).slice(0, 3).map(comp => (
               <button
                 key={comp.code}
                 onClick={() => handleCompetitorToggle(comp.code)}
                 className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    selectedCompetitors.includes(comp.code)
                      ? 'bg-slate-800 text-white shadow-md'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-800 hover:text-slate-800'
                 }`}
               >
                 VS {comp.name}
               </button>
             ))}
          </div>
        </div>

        {/* Right Column: Table & Analysis (Smaller) */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
           {/* Comparison Table */}
           <div className="bg-white rounded-md border border-slate-200 shadow-sm p-5">
              <h2 className="text-sm font-bold text-slate-800 mb-4">横向对比</h2>
              <div className="overflow-x-auto">
                 <table className="w-full text-xs">
                    <thead>
                       <tr>
                         <th className="text-left py-2 px-2 text-slate-400 font-medium w-20">指标</th>
                         {/* Columns: Self + Selected Competitors (Max 2) */}
                         <th className="text-right py-2 px-2 text-[#0e57b4] font-bold">
                           {selfProduct?.name.replace('ETF', '')} <span className="bg-[#eef6ff] text-[10px] px-1 rounded ml-1">我司</span>
                         </th>
                         {selectedCompetitors.slice(0, 2).map(code => {
                           const c = competitors.find(cmp => cmp.code === code);
                           return (
                             <th key={code} className="text-right py-2 px-2 text-slate-600 font-medium">
                               {c?.name.replace('ETF', '')}
                             </th>
                           );
                         })}
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {METRICS.map(metric => (
                         <tr key={metric.key} className="hover:bg-slate-50">
                            <td className="py-3 px-2 text-slate-500">{metric.label}</td>
                            
                            {/* Self Value */}
                            <td className="py-3 px-2 text-right font-mono font-bold text-slate-700">
                               {metric.format 
                                 ? metric.format((selfProduct as any)?.[metric.key]) 
                                 : (selfProduct as any)?.[metric.key] || '-'}
                            </td>

                            {/* Competitor Values */}
                            {selectedCompetitors.slice(0, 2).map(code => {
                               const c = competitors.find(cmp => cmp.code === code);
                               return (
                                 <td key={code} className="py-3 px-2 text-right font-mono text-slate-500">
                                   {c && (metric.format 
                                     ? metric.format((c as any)[metric.key]) 
                                     : (c as any)[metric.key])}
                                 </td>
                               );
                            })}
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* AI Analysis Box */}
           <div className="bg-[#eef6ff] rounded-md border border-[#dbeafe] p-4">
              <div className="flex items-center gap-2 mb-2 text-[#0e57b4]">
                 <Lightbulb className="w-4 h-4" />
                 <h3 className="text-sm font-bold">竞争优势分析</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed text-justify">
                当前我司产品成交额显著领先市场竞品，流动性优势明显；且在溢价率上保持合理区间，资金承接力度强。建议在营销文案中重点强调“流动性”与“资金认可度”。
              </p>
           </div>
        </div>
      </div>

      {/* Bottom Section: News & Announcements Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
         {/* News */}
         <div className="bg-white rounded-md border border-slate-200 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-sm font-bold text-slate-800">资讯、提醒</h3>
               <MoreHorizontal className="w-4 h-4 text-slate-400 cursor-pointer" />
            </div>
            <ul className="space-y-4">
               {newsData.news.slice(0, 6).map(item => (
                 <li key={item.id} className="group flex gap-3 items-start cursor-pointer">
                    <span className="text-[10px] text-slate-400 font-mono mt-1 w-8 shrink-0">{item.date}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded h-fit shrink-0 mt-0.5">{item.tag}</span>
                    <p className="text-xs text-slate-700 leading-relaxed group-hover:text-[#0e57b4] transition-colors">
                      {item.title}
                    </p>
                 </li>
               ))}
            </ul>
         </div>

         {/* Announcements */}
         <div className="bg-white rounded-md border border-slate-200 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-sm font-bold text-slate-800">公告、研报</h3>
               <MoreHorizontal className="w-4 h-4 text-slate-400 cursor-pointer" />
            </div>
            <ul className="space-y-4">
               {newsData.announcements.slice(0, 6).map(item => (
                 <li key={item.id} className="group flex gap-3 items-start cursor-pointer">
                    <span className="text-[10px] text-slate-400 font-mono mt-1 w-8 shrink-0">{item.date}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded h-fit shrink-0 mt-0.5">{item.tag}</span>
                    <p className="text-xs text-slate-700 leading-relaxed group-hover:text-[#0e57b4] transition-colors">
                      {item.title}
                    </p>
                 </li>
               ))}
            </ul>
         </div>
      </div>
    </div>
  );
};

export default Analysis;
