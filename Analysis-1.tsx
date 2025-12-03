import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Share2, MoreHorizontal, ChevronDown, ExternalLink, 
  TrendingUp, TrendingDown, AlertCircle, FileText, Download 
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

const Analysis: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Identify product based on ID (Hotspot ID) -> Product Code
  // In a real app, we'd fetch details by ID. Here we map mock ID to code.
  const hotspot = MOCK_HOTSPOTS.find(h => h.id === id);
  const productCode = hotspot?.code || '512480'; // Default to Semi ETF
  const productName = hotspot?.name || getProductNameByCode(productCode);

  const [timeRange, setTimeRange] = useState<string>('实时');
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Load competitors
    const comps = getCompetitorsForProduct(productCode);
    setCompetitors(comps);
    setSelectedCompetitors([]); // Reset on load
  }, [productCode]);

  useEffect(() => {
    // Generate data based on range
    if (timeRange === '实时') {
      const data = generateChartData(competitors, hotspot?.time || '10:42');
      setChartData(data);
    } else {
      const data = generateHistoricalData(timeRange, competitors);
      setChartData(data);
    }
  }, [timeRange, competitors, hotspot]);

  // Derived Metrics
  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].value : 0;
  const preClose = chartData.length > 0 ? chartData[0].value * 0.995 : 0; // Mock pre-close
  const priceChange = currentPrice - preClose;
  const priceChangePct = (priceChange / preClose) * 100;
  const currentIOPV = chartData.length > 0 && 'iopv' in chartData[chartData.length - 1] 
    ? chartData[chartData.length - 1].iopv 
    : currentPrice * 1.0005;

  const showCompetitor = selectedCompetitors.length > 0;

  // Find trigger point for intraday
  const triggerPoint = timeRange === '实时' 
    ? chartData.find((p: any) => p.isTrigger) 
    : undefined;

  // Y-Axis Domain
  const yDomain = useMemo(() => {
    if (chartData.length === 0) return ['auto', 'auto'];
    const values = chartData.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1;
    return [min - padding, max + padding];
  }, [chartData]);

  // Historical Metrics
  const histMetrics = useMemo(() => {
    if (chartData.length === 0 || timeRange === '实时') return { latestDate: '', price: 0, start: '', end: '', change: 0 };
    const start = chartData[0];
    const end = chartData[chartData.length - 1];
    return {
      latestDate: end.date,
      price: end.value, // This is actually cumulative % in historical mock
      start: start.date,
      end: end.date,
      change: end.value - start.value // Simple diff for cum %
    };
  }, [chartData, timeRange]);

  const handleCompetitorToggle = (code: string) => {
    if (selectedCompetitors.includes(code)) {
      setSelectedCompetitors(selectedCompetitors.filter(c => c !== code));
    } else {
      setSelectedCompetitors([...selectedCompetitors, code]);
    }
  };

  const handleCreateCopy = () => {
    navigate('/workbench', { state: { product: hotspot || { name: productName, code: productCode, triggerReason: '手动分析' } } });
  };

  // Tooltips
  const IntradayTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded text-xs">
          <p className="font-bold text-slate-700 mb-2">{label}</p>
          {payload.map((p: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-4 mb-1">
              <span style={{ color: p.color }}>{p.name}:</span>
              <span className="font-mono font-medium">{Number(p.value).toFixed(3)}</span>
            </div>
          ))}
          {triggerPoint && label === triggerPoint.time && (
            <div className="mt-2 pt-2 border-t border-slate-100 text-red-500 font-bold">
               🔥 {hotspot?.triggerReason || '异动触发'}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const HistoricalTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded text-xs">
          <p className="font-bold text-slate-700 mb-2">{label}</p>
          {payload.map((p: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-4 mb-1">
              <span style={{ color: p.color }}>{p.name}:</span>
              <span className="font-mono font-medium">{Number(p.value).toFixed(2)}%</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const newsData = getNewsForProduct(productCode);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-md border border-slate-200 shadow-sm">
         <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                {productName} 
                <span className="text-sm font-normal text-slate-500 font-mono">({productCode})</span>
                {hotspot && (
                  <span className="bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded border border-red-100 font-medium">
                    {hotspot.triggerReason}
                  </span>
                )}
              </h1>
            </div>
         </div>
         <div className="flex gap-3">
            <button 
              onClick={handleCreateCopy}
              className="px-4 py-2 bg-brand text-white rounded text-sm font-bold shadow-md shadow-brand/20 hover:bg-brand-dark transition-colors flex items-center gap-2"
            >
               <FileText className="w-4 h-4" /> 生成营销文案
            </button>
            <button className="p-2 border border-slate-200 rounded text-slate-500 hover:text-brand hover:border-brand transition-colors">
               <Share2 className="w-4 h-4" />
            </button>
            <button className="p-2 border border-slate-200 rounded text-slate-500 hover:text-brand hover:border-brand transition-colors">
               <MoreHorizontal className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column: Chart (5/12) */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
            {/* Chart Header Metrics */}
            <div className="px-5 pt-5 pb-2">
               <div className="flex justify-between items-start mb-4">
                 <h2 className="text-sm font-bold text-slate-700">业绩走势</h2>
                 {timeRange === '实时' && (
                    <span className="text-xs text-slate-400 font-mono">Updating...</span>
                 )}
               </div>
               
               {timeRange === '实时' ? (
                 <div className="flex items-center gap-8">
                    <div>
                       <div className="text-2xl font-bold font-mono text-slate-800">
                         {currentPrice.toFixed(3)}
                       </div>
                       <div className={`text-xs font-medium flex items-center gap-1 mt-1 ${priceChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {priceChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {priceChange > 0 ? '+' : ''}{priceChange.toFixed(3)} ({priceChangePct.toFixed(2)}%)
                       </div>
                    </div>
                    <div>
                       <div className="text-2xl font-medium font-mono text-slate-500">
                         {!showCompetitor ? currentIOPV.toFixed(3) : '--'}
                       </div>
                       <div className="text-xs text-slate-400 mt-1">
                         {showCompetitor ? '竞品对比模式' : 'IOPV (估值)'}
                       </div>
                    </div>
                 </div>
               ) : (
                 <div className="flex justify-between items-end">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">区间收益率</div>
                      <div className={`text-2xl font-bold font-mono ${histMetrics.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                         {histMetrics.change > 0 ? '+' : ''}{histMetrics.change.toFixed(2)}%
                      </div>
                    </div>
                    <div className="text-right">
                       <div className="text-xs text-slate-500">{histMetrics.start} ~ {histMetrics.latestDate}</div>
                    </div>
                 </div>
               )}
            </div>

            {/* Chart */}
            <div className="h-[250px] w-full px-2 mt-2 relative">
               <ResponsiveContainer width="100%" height="100%">
                  {timeRange === '实时' ? (
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0e57b4" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#0e57b4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} interval={30} />
                      <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} width={35} />
                      <Tooltip content={<IntradayTooltip />} />
                      
                      {/* Main Line */}
                      {showCompetitor ? (
                        <Line type="monotone" dataKey="value" stroke="#0e57b4" strokeWidth={2} dot={false} name="本产品" />
                      ) : (
                        <Area type="monotone" dataKey="value" stroke="#0e57b4" fill="url(#colorPrice)" strokeWidth={2} name="价格" />
                      )}

                      {/* IOPV or Competitors */}
                      {!showCompetitor && (
                         <Line type="monotone" dataKey="iopv" stroke="#fbbf24" strokeWidth={1} dot={false} strokeDasharray="3 3" name="IOPV" />
                      )}
                      
                      {selectedCompetitors.map(code => (
                         <Line key={code} type="monotone" dataKey={`competitors.${code}`} stroke="#94a3b8" strokeWidth={2} dot={false} name={competitors.find(c => c.code === code)?.name} />
                      ))}

                      {/* Trigger Point */}
                      {!showCompetitor && triggerPoint && (
                        <ReferenceDot x={triggerPoint.time} y={triggerPoint.value} r={4} fill="#ef4444" stroke="white" strokeWidth={2} />
                      )}
                    </AreaChart>
                  ) : (
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                       <defs>
                        <linearGradient id="colorHist" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0e57b4" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#0e57b4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} minTickGap={30} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} tickFormatter={(v) => `${v.toFixed(0)}%`} width={35} />
                      <Tooltip content={<HistoricalTooltip />} />
                      
                      {showCompetitor ? (
                         <Line type="monotone" dataKey="value" stroke="#0e57b4" strokeWidth={2} dot={false} name="本产品" />
                      ) : (
                         <Area type="monotone" dataKey="value" stroke="#0e57b4" fill="url(#colorHist)" strokeWidth={2} name="累计收益" />
                      )}

                      {selectedCompetitors.map(code => (
                         <Line key={code} type="monotone" dataKey={`competitors.${code}`} stroke="#94a3b8" strokeWidth={2} dot={false} name={competitors.find(c => c.code === code)?.name} />
                      ))}
                    </AreaChart>
                  )}
               </ResponsiveContainer>
            </div>

            {/* Time Controls */}
            <div className="flex border-t border-slate-100">
               {['实时', '近1月', '近3月', '近6月', '更多'].map(t => (
                 <button 
                   key={t}
                   onClick={() => setTimeRange(t)}
                   className={`flex-1 py-3 text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                     timeRange === t 
                       ? 'text-brand bg-brand-light/10 border-b-2 border-brand' 
                       : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                   }`}
                 >
                   {t}
                   {t === '更多' && <ChevronDown className="w-3 h-3" />}
                 </button>
               ))}
            </div>
          </div>

          {/* Competitor Selector */}
          <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm">
             <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">添加对比竞品</h3>
             <div className="flex flex-wrap gap-2">
               {competitors.filter(c => !c.isLeader).map(comp => (
                 <button
                   key={comp.code}
                   onClick={() => handleCompetitorToggle(comp.code)}
                   className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                     selectedCompetitors.includes(comp.code)
                       ? 'bg-slate-800 text-white border-slate-800'
                       : 'bg-white text-slate-600 border-slate-200 hover:border-brand hover:text-brand'
                   }`}
                 >
                   <span>{comp.name}</span>
                 </button>
               ))}
             </div>
          </div>

        </div>

        {/* Right Column: Details & News (7/12) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
           
           {/* Fund Comparison Table */}
           <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="font-bold text-slate-700 text-sm">核心指标对比</h3>
                 <button className="text-brand text-xs hover:underline">导出数据</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-4 py-3">产品名称</th>
                      <th className="px-4 py-3 text-right">规模</th>
                      <th className="px-4 py-3 text-right">成交额</th>
                      <th className="px-4 py-3 text-right">溢价率</th>
                      <th className="px-4 py-3 text-right">近1月流入</th>
                      <th className="px-4 py-3 text-right">市占率</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {competitors.map((comp) => (
                      <tr key={comp.code} className={`hover:bg-slate-50 ${comp.isLeader ? 'bg-brand-light/5' : ''}`}>
                         <td className="px-4 py-3">
                           <div className="font-bold text-slate-700">{comp.name}</div>
                           <div className="text-[10px] text-slate-400 font-mono">{comp.code}</div>
                         </td>
                         <td className="px-4 py-3 text-right font-mono">{comp.scale}</td>
                         <td className="px-4 py-3 text-right font-mono text-slate-700">{comp.volume}</td>
                         <td className={`px-4 py-3 text-right font-mono ${parseFloat(comp.premiumRate) > 0 ? 'text-red-500' : 'text-green-500'}`}>{comp.premiumRate}</td>
                         <td className={`px-4 py-3 text-right font-mono ${comp.inflow1M.includes('+') ? 'text-red-500' : 'text-green-500'}`}>{comp.inflow1M}</td>
                         <td className="px-4 py-3 text-right font-mono">{comp.marketShare}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>

           {/* News & Announcements */}
           <div className="bg-white rounded-md border border-slate-200 shadow-sm flex-1">
              <div className="px-5 py-4 border-b border-slate-100">
                 <h3 className="font-bold text-slate-700 text-sm">舆情与公告</h3>
              </div>
              <div className="grid grid-cols-2 divide-x divide-slate-100">
                 {/* Left: Market News */}
                 <div className="p-4">
                    <h4 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                       相关资讯
                    </h4>
                    <ul className="space-y-3">
                       {newsData.news.slice(0, 5).map(item => (
                         <li key={item.id} className="group cursor-pointer">
                            <div className="flex justify-between items-start gap-2">
                               <p className="text-xs text-slate-700 group-hover:text-brand line-clamp-2 leading-relaxed">
                                 {item.title}
                               </p>
                               <span className="text-[10px] text-slate-400 whitespace-nowrap mt-0.5">{item.date}</span>
                            </div>
                            <div className="flex gap-2 mt-1">
                               <span className="text-[10px] text-slate-400 bg-slate-100 px-1 rounded">{item.tag}</span>
                            </div>
                         </li>
                       ))}
                    </ul>
                 </div>
                 
                 {/* Right: Announcements */}
                 <div className="p-4">
                    <h4 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                       重要公告
                    </h4>
                    <ul className="space-y-3">
                       {newsData.announcements.slice(0, 5).map(item => (
                         <li key={item.id} className="group cursor-pointer">
                            <div className="flex justify-between items-start gap-2">
                               <p className="text-xs text-slate-700 group-hover:text-brand line-clamp-2 leading-relaxed">
                                 {item.title}
                               </p>
                               <span className="text-[10px] text-slate-400 whitespace-nowrap mt-0.5">{item.date}</span>
                            </div>
                         </li>
                       ))}
                    </ul>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default Analysis;