
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, List, TrendingUp, TrendingDown, ArrowRight, Eye, Filter, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { MOCK_HOTSPOTS, getMockPanoramaData } from '../constants';
import { HotspotEvent, PanoramaData } from '../types';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import Skeleton from '../components/Skeleton';
import Toast from '../components/Toast';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'HOTSPOT' | 'PANORAMA'>('HOTSPOT');
  const [toast, setToast] = useState<string | null>(null);
  const [panoramaData, setPanoramaData] = useState<PanoramaData[]>([]);
  
  // Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterCode, setFilterCode] = useState('');
  const [filterSelfSelect, setFilterSelfSelect] = useState<'ALL' | 'YES'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING'>('PENDING');

  // Ref for scroll target
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate loading data
    setPanoramaData(getMockPanoramaData());
    setTimeout(() => setLoading(false), 1200);
  }, []);

  const handleCardClick = (id: string) => {
    navigate(`/analysis/${id}`);
  };

  const handleIgnore = (e: React.MouseEvent) => {
    e.stopPropagation();
    setToast("已忽略该热点");
  };

  const handleCreate = (e: React.MouseEvent, hotspot: HotspotEvent) => {
    e.stopPropagation();
    navigate('/workbench', { state: { product: hotspot } });
  };

  const scrollToToolbar = () => {
    // Use a small timeout to ensure state updates trigger render first if needed
    setTimeout(() => {
      toolbarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleViewSwitch = (mode: 'HOTSPOT' | 'PANORAMA') => {
    setViewMode(mode);
    if (mode === 'PANORAMA') {
      // Panorama Mode Default: Lock to Self Select = YES, Status = ALL
      setFilterSelfSelect('YES');
      setFilterStatus('ALL'); 
    } else {
      // Hotspot Mode Default: Usually Pending
      setFilterStatus('PENDING');
      setFilterSelfSelect('ALL');
    }
  };

  const handleSelfSelectClick = () => {
    if (filterSelfSelect === 'YES') {
      setFilterSelfSelect('ALL');
    } else {
      setFilterSelfSelect('YES');
      setFilterStatus('ALL'); // Mutually exclusive: Reset Status
      scrollToToolbar();
    }
  };

  const handlePendingClick = () => {
    if (viewMode === 'PANORAMA') return; // Not supported in Panorama

    if (filterStatus === 'PENDING') {
      setFilterStatus('ALL');
    } else {
      setFilterStatus('PENDING');
      setFilterSelfSelect('ALL'); // Mutually exclusive: Reset Self Select to show ALL (both watched and non-watched)
      scrollToToolbar();
    }
  };

  const pendingCount = MOCK_HOTSPOTS.filter(h => h.status === 'PENDING').length;
  const selfSelectCount = MOCK_HOTSPOTS.filter(h => h.isSelfSelect).length;

  // Filter Logic for Hotspot Mode
  const filteredHotspots = MOCK_HOTSPOTS.filter(h => {
    if (filterCode && !h.code.includes(filterCode) && !h.name.includes(filterCode)) return false;
    if (filterSelfSelect === 'YES' && !h.isSelfSelect) return false;
    if (filterStatus === 'PENDING' && h.status !== 'PENDING') return false;
    return true;
  }).sort((a, b) => b.time.localeCompare(a.time));

  // Filter Logic for Panorama Mode (Simple search for now)
  const filteredPanorama = panoramaData.filter(p => {
    if (filterCode && !p.code.includes(filterCode) && !p.name.includes(filterCode)) return false;
    if (filterSelfSelect === 'YES' && !p.isSelfSelect) return false;
    return true;
  });

  // Generate Self-Selected Trend Data (Top 4 unique products)
  const selfSelectedTrends = MOCK_HOTSPOTS
    .filter(h => h.isSelfSelect)
    .reduce((acc, current) => {
      if (!acc.find(item => item.code === current.code)) {
        acc.push(current);
      }
      return acc;
    }, [] as HotspotEvent[])
    .slice(0, 4)
    .map((h, index) => {
       // Mock price data generation
       const isPositive = index % 3 !== 2;
       const changePercent = isPositive ? +(Math.random() * 2 + 0.1).toFixed(2) : -(Math.random() * 2 + 0.1).toFixed(2);
       const price = 0.8 + Math.random() * 0.5;
       const change = price * changePercent / 100;
       
       const points = [];
       let v = price * (1 - changePercent/100);
       for(let i=0; i<20; i++) {
          v = v * (1 + (Math.random() - 0.45) * 0.04);
          points.push({ value: v });
       }
       points.push({ value: price });

       return {
         id: h.id,
         name: h.name,
         code: h.code,
         value: price,
         change: change,
         changePercent: changePercent,
         data: points
       };
    });

  // Helper for rendering percentage cells
  const PctCell = ({ value }: { value: number }) => (
    <span className={`font-medium ${value > 0 ? 'text-red-500' : value < 0 ? 'text-green-500' : 'text-slate-500'}`}>
      {value > 0 ? '+' : ''}{value.toFixed(2)}%
    </span>
  );

  // Helper for rendering number cells
  const NumCell = ({ value, suffix = '', colorize = false }: { value: number, suffix?: string, colorize?: boolean }) => (
    <span className={`font-mono ${colorize ? (value > 0 ? 'text-red-500' : value < 0 ? 'text-green-500' : 'text-slate-500') : 'text-slate-700'}`}>
      {colorize && value > 0 ? '+' : ''}{value.toFixed(2)}{suffix}
    </span>
  );

  return (
    <div className="space-y-6 relative">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* 1. Self-Selected Product Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {selfSelectedTrends.map((product) => (
          <div 
            key={product.code} 
            onClick={() => handleCardClick(product.id)}
            className="bg-white p-4 rounded-md shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-sm text-slate-500 font-medium flex items-center gap-2 group-hover:text-brand">
                  {product.name}
                  <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-400 font-mono">{product.code}</span>
                </h3>
                <div className={`text-xl font-bold mt-1 ${product.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {product.value.toFixed(3)}
                </div>
                <div className={`text-xs flex items-center gap-1 ${product.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {product.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {product.change > 0 ? '+' : ''}{product.change.toFixed(3)} ({product.change > 0 ? '+' : ''}{product.changePercent}%)
                </div>
              </div>
              <div className="h-12 w-20">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={product.data}>
                    <defs>
                      <linearGradient id={`grad${product.code}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={product.change >= 0 ? "#ef4444" : "#22c55e"} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={product.change >= 0 ? "#ef4444" : "#22c55e"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={product.change >= 0 ? "#ef4444" : "#22c55e"} 
                      fill={`url(#grad${product.code})`} 
                      strokeWidth={1.5}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ))}
        {selfSelectedTrends.length === 0 && (
           <div className="col-span-full p-4 bg-white rounded-md border border-slate-100 text-center text-slate-400 text-sm">
             暂无自选关注产品
           </div>
        )}
      </div>

      {/* 2. Task Counters */}
      <div className="grid grid-cols-3 gap-6 bg-white px-6 py-4 rounded-md border border-slate-100 select-none">
        
        {/* Total */}
        <div 
          onClick={() => {
            setFilterSelfSelect('ALL');
            setFilterStatus('ALL');
          }}
          className="flex items-center justify-center gap-4 cursor-pointer group"
        >
          <span className="text-4xl font-bold font-mono text-slate-900 tabular-nums">{MOCK_HOTSPOTS.length}</span>
          <span className="text-sm font-bold text-slate-500 group-hover:text-slate-700">热点总数</span>
        </div>

        {/* Self Select */}
        <div 
          onClick={handleSelfSelectClick}
          className="flex items-center justify-center gap-4 cursor-pointer group"
        >
          <span className={`text-4xl font-bold font-mono tabular-nums transition-colors ${
            filterSelfSelect === 'YES' ? 'text-orange-500' : 'text-orange-500'
          }`}>
            {selfSelectCount}
          </span>
          <span className={`text-sm font-bold px-3 py-1 rounded transition-colors ${
            filterSelfSelect === 'YES' ? 'bg-orange-50 text-orange-600' : 'text-orange-500 group-hover:bg-orange-50/50'
          }`}>
            自选关注
          </span>
        </div>

        {/* Pending */}
        <div 
          onClick={handlePendingClick}
          className={`flex items-center justify-center gap-4 group ${
            viewMode === 'PANORAMA' ? 'opacity-40 cursor-not-allowed grayscale' : 'cursor-pointer'
          }`}
          title={viewMode === 'PANORAMA' ? "全景监控模式下不支持按状态筛选" : ""}
        >
          <span className={`text-4xl font-bold font-mono tabular-nums transition-colors ${
            filterStatus === 'PENDING' ? 'text-red-500' : 'text-red-500'
          }`}>
            {pendingCount}
          </span>
          <span className={`text-sm font-bold px-3 py-1 rounded transition-colors ${
            filterStatus === 'PENDING' ? 'bg-red-50 text-red-600' : 'text-red-500 group-hover:bg-red-50/50'
          }`}>
            待处理
          </span>
        </div>
      </div>

      {/* 3. Controls & Sticky Toolbar */}
      <div 
        ref={toolbarRef}
        className="sticky top-0 z-40 bg-[#f8fbff] py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300"
      >
        <div className="bg-slate-100 p-1 rounded flex items-center">
          <button 
            onClick={() => handleViewSwitch('HOTSPOT')}
            className={`px-4 py-2 rounded text-sm font-medium transition-all flex items-center gap-2 ${
              viewMode === 'HOTSPOT' ? 'bg-white text-brand shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Grid className="w-4 h-4" />
            热点聚焦
          </button>
          <button 
            onClick={() => handleViewSwitch('PANORAMA')}
            className={`px-4 py-2 rounded text-sm font-medium transition-all flex items-center gap-2 ${
              viewMode === 'PANORAMA' ? 'bg-white text-brand shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <List className="w-4 h-4" />
            全景监控
          </button>
        </div>

        <div className="relative">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded text-sm font-medium transition-colors border ${
              isFilterOpen 
                ? 'bg-brand text-white border-brand' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-brand hover:text-brand'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>高级筛选</span>
            {isFilterOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Advanced Filter Panel */}
          {isFilterOpen && (
            <div className="absolute right-0 top-12 w-[800px] max-w-[90vw] bg-white rounded-md shadow-xl border border-slate-200 p-6 z-50 animate-in slide-in-from-top-2 fade-in">
              <div className="grid grid-cols-2 gap-x-12 gap-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                
                {/* 1. Basic Search */}
                <div className="col-span-2 space-y-4 pb-4 border-b border-slate-100">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700">代码查找</label>
                       <div className="relative">
                         <input 
                           type="text" 
                           placeholder="输入代码或名称" 
                           value={filterCode}
                           onChange={(e) => setFilterCode(e.target.value)}
                           className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-brand"
                         />
                         <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700">是否自选</label>
                       <div className="flex bg-slate-100 p-1 rounded">
                          <button 
                            onClick={() => setFilterSelfSelect('ALL')}
                            className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${filterSelfSelect === 'ALL' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                          >全部</button>
                          <button 
                             onClick={() => setFilterSelfSelect('YES')}
                             className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${filterSelfSelect === 'YES' ? 'bg-white shadow text-brand' : 'text-slate-500 hover:text-brand'}`}
                          >是</button>
                       </div>
                    </div>
                    {/* Status Filter: Hidden in Panorama Mode */}
                    {viewMode === 'HOTSPOT' && (
                      <div className="space-y-2">
                         <label className="text-sm font-bold text-slate-700">状态</label>
                         <div className="flex bg-slate-100 p-1 rounded">
                            <button 
                               onClick={() => setFilterStatus('ALL')}
                               className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${filterStatus === 'ALL' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                            >全部</button>
                            <button 
                               onClick={() => setFilterStatus('PENDING')}
                               className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${filterStatus === 'PENDING' ? 'bg-white shadow text-red-500' : 'text-slate-500 hover:text-red-500'}`}
                            >待处理</button>
                         </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Product Type */}
                <div className="col-span-2 space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm">产品类型</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2 mt-1">
                        <input type="checkbox" id="stock" className="w-4 h-4 rounded border-slate-300 text-brand focus:ring-brand" defaultChecked />
                        <label htmlFor="stock" className="text-xs font-medium text-slate-700">股票</label>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['规模指数(宽基)', '风格因子', '行业', '主题', '指数增强'].map(t => (
                          <button key={t} className="px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded text-xs text-slate-600 transition-colors">
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-6">
                      {['债券', '商品', '货币'].map(t => (
                        <div key={t} className="flex items-center gap-2">
                          <input type="checkbox" id={t} className="w-4 h-4 rounded border-slate-300 text-brand focus:ring-brand" />
                          <label htmlFor={t} className="text-xs text-slate-600">{t}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Tracking Index */}
                <div className="space-y-3">
                   <h4 className="font-bold text-slate-800 text-sm">跟踪指数</h4>
                   <div className="relative">
                     <input type="text" placeholder="请输入指数名称/代码" className="w-full pl-3 pr-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:border-brand" />
                   </div>
                </div>

                {/* 4. Scale */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-800 text-sm">产品规模</h4>
                    <div className="flex items-center gap-2">
                      <input type="number" placeholder="0" className="w-20 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs" />
                      <span className="text-slate-400 text-xs">亿元</span>
                      <span className="text-slate-400">-</span>
                      <input type="number" placeholder="Max" className="w-20 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs" />
                      <span className="text-slate-400 text-xs">亿元</span>
                    </div>
                  </div>
                </div>

                {/* 5. Change & Volume */}
                <div className="space-y-3">
                   <h4 className="font-bold text-slate-800 text-sm">涨跌幅</h4>
                   <div className="grid grid-cols-2 gap-2">
                      {['上一交易日', '近1周', '近1月', '近3月'].map(t => (
                        <button key={t} className="px-2 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded text-xs text-slate-600 transition-colors text-center">
                          {t}
                        </button>
                      ))}
                   </div>
                   <h4 className="font-bold text-slate-800 pt-2 text-sm">日均成交额</h4>
                   <div className="grid grid-cols-2 gap-2">
                      {['近1周', '近1月'].map(t => (
                        <button key={t} className="px-2 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded text-xs text-slate-600 transition-colors text-center">
                          {t}
                        </button>
                      ))}
                   </div>
                </div>

                {/* 6. Constituents */}
                <div className="space-y-4">
                   <div className="space-y-2">
                     <h4 className="font-bold text-slate-800 text-sm">成分股</h4>
                     <input type="text" placeholder="请输入股票名称/代码" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:border-brand" />
                   </div>
                </div>

              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => {
                    setFilterCode('');
                    setFilterSelfSelect('ALL');
                    if (viewMode === 'HOTSPOT') setFilterStatus('ALL');
                  }}
                  className="px-6 py-2 text-slate-500 hover:text-slate-700 font-medium text-xs"
                >
                  重置
                </button>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="px-6 py-2 bg-brand hover:bg-brand-dark text-white rounded font-medium text-xs transition-colors shadow-lg shadow-brand/20"
                >
                  确认筛选
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Content Area */}
      {viewMode === 'HOTSPOT' ? (
        loading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-24 w-full rounded-md" />
            <Skeleton className="h-24 w-full rounded-md" />
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredHotspots.map((hotspot) => (
              <HotspotCard 
                key={hotspot.id} 
                data={hotspot} 
                onClick={() => handleCardClick(hotspot.id)}
                onIgnore={handleIgnore}
                onCreate={(e) => handleCreate(e, hotspot)}
              />
            ))}
            {filteredHotspots.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                  <Filter className="w-8 h-8 text-slate-300" />
                </div>
                <p>暂无符合筛选条件的热点</p>
                <button 
                  onClick={() => {
                    setFilterCode('');
                    setFilterSelfSelect('ALL');
                    setFilterStatus('ALL');
                  }}
                  className="mt-4 text-brand text-sm hover:underline"
                >
                  重置筛选条件
                </button>
              </div>
            )}
          </div>
        )
      ) : (
        /* PANORAMA MODE: Comprehensive Data Table */
        <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-4 py-3 sticky left-0 z-20 bg-slate-50 border-r border-slate-200 shadow-sm min-w-[160px]">代码/名称</th>
                  <th className="px-4 py-3 min-w-[120px]">跟踪指数</th>
                  <th className="px-4 py-3 min-w-[160px]">触发状态</th>
                  <th className="px-4 py-3 text-right">最新价</th>
                  <th className="px-4 py-3 text-right">涨跌幅</th>
                  <th className="px-4 py-3 text-right">溢价率</th>
                  <th className="px-4 py-3 text-right">规模(亿)</th>
                  <th className="px-4 py-3 text-right">成交额(亿)</th>
                  <th className="px-4 py-3 text-right">换手率</th>
                  
                  {/* Performance */}
                  <th className="px-4 py-3 text-right border-l border-slate-100">昨日涨跌</th>
                  <th className="px-4 py-3 text-right">近1周</th>
                  <th className="px-4 py-3 text-right">近1月</th>
                  <th className="px-4 py-3 text-right">近3月</th>
                  <th className="px-4 py-3 text-right">年初至今</th>
                  <th className="px-4 py-3 text-right">近1年</th>
                  
                  {/* Avg Vol */}
                  <th className="px-4 py-3 text-right border-l border-slate-100">日均额(1周)</th>
                  <th className="px-4 py-3 text-right">1月</th>
                  <th className="px-4 py-3 text-right">3月</th>
                  <th className="px-4 py-3 text-right">年初至今</th>
                  <th className="px-4 py-3 text-right">1年</th>
                  
                  {/* Inflow */}
                  <th className="px-4 py-3 text-right border-l border-slate-100">净流入(昨)</th>
                  <th className="px-4 py-3 text-right">近1周</th>
                  <th className="px-4 py-3 text-right">近1月</th>
                  <th className="px-4 py-3 text-right">近3月</th>
                  <th className="px-4 py-3 text-right">年初至今</th>
                  <th className="px-4 py-3 text-right">近1年</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPanorama.map((row) => (
                  <tr key={row.id} className="hover:bg-brand-light/30 transition-colors cursor-pointer group" onClick={() => handleCardClick(row.id)}>
                    <td className="px-4 py-2 sticky left-0 z-10 bg-white border-r border-slate-200 group-hover:bg-[#eef8ff] transition-colors">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-bold text-slate-800">{row.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{row.code}</div>
                        </div>
                        {row.isSelfSelect && <Eye className="w-3 h-3 text-orange-400 ml-1" />}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-slate-600 truncate max-w-[150px]" title={row.trackingIndex}>{row.trackingIndex}</td>
                    <td className="px-4 py-2">
                      {row.triggerStatus ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-600 border border-red-100 truncate max-w-[140px]" title={row.triggerStatus}>
                          {row.triggerStatus}
                        </span>
                      ) : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-slate-700">{row.price.toFixed(3)}</td>
                    <td className="px-4 py-2 text-right"><PctCell value={row.changePercent} /></td>
                    <td className="px-4 py-2 text-right"><PctCell value={row.premiumRate} /></td>
                    <td className="px-4 py-2 text-right font-mono text-slate-700">{row.scale.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right font-mono text-slate-700">{row.volume.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right font-mono text-slate-700">{row.turnoverRate.toFixed(2)}%</td>
                    
                    {/* Performance */}
                    <td className="px-4 py-2 text-right border-l border-slate-100"><PctCell value={row.changePrevDay} /></td>
                    <td className="px-4 py-2 text-right"><PctCell value={row.change1W} /></td>
                    <td className="px-4 py-2 text-right"><PctCell value={row.change1M} /></td>
                    <td className="px-4 py-2 text-right"><PctCell value={row.change3M} /></td>
                    <td className="px-4 py-2 text-right"><PctCell value={row.changeYTD} /></td>
                    <td className="px-4 py-2 text-right"><PctCell value={row.change1Y} /></td>
                    
                    {/* Avg Vol */}
                    <td className="px-4 py-2 text-right border-l border-slate-100 font-mono text-slate-600">{row.avgVol1W.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right font-mono text-slate-600">{row.avgVol1M.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right font-mono text-slate-600">{row.avgVol3M.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right font-mono text-slate-600">{row.avgVolYTD.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right font-mono text-slate-600">{row.avgVol1Y.toFixed(2)}</td>
                    
                    {/* Inflow */}
                    <td className="px-4 py-2 text-right border-l border-slate-100"><NumCell value={row.inflowPrevDay} colorize /></td>
                    <td className="px-4 py-2 text-right"><NumCell value={row.inflow1W} colorize /></td>
                    <td className="px-4 py-2 text-right"><NumCell value={row.inflow1M} colorize /></td>
                    <td className="px-4 py-2 text-right"><NumCell value={row.inflow3M} colorize /></td>
                    <td className="px-4 py-2 text-right"><NumCell value={row.inflowYTD} colorize /></td>
                    <td className="px-4 py-2 text-right"><NumCell value={row.inflow1Y} colorize /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPanorama.length === 0 && (
              <div className="p-12 text-center text-slate-400">
                暂无符合筛选条件的产品
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for Hotspot Card
const HotspotCard: React.FC<{ 
  data: HotspotEvent; 
  onClick: () => void;
  onIgnore: (e: React.MouseEvent) => void;
  onCreate: (e: React.MouseEvent) => void;
}> = ({ data, onClick, onIgnore, onCreate }) => {
  return (
    <div 
      onClick={onClick}
      className="w-full bg-white rounded-md border border-slate-200 shadow-sm p-4 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md group relative"
    >
      {/* Header: One Line */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
           <span className="bg-[#eef6ff] text-brand-dark text-xs px-2 py-0.5 rounded font-mono font-bold">{data.time}</span>
           <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1 group-hover:text-brand transition-colors">
              {data.name} 
              <span className="text-xs font-normal text-slate-400">({data.code})</span>
              {/* Notification Dot next to name/code */}
              {data.status === 'PENDING' && (
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full ml-1 animate-pulse"></span>
              )}
           </h3>
           {data.status === 'PROCESSING' && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded">已处理</span>}
        </div>
        {data.isSelfSelect && <Eye className="w-4 h-4 text-orange-400" />}
      </div>

      {/* Main Trigger Info: Compact */}
      <div className="bg-brand-light/50 rounded px-3 py-2 mb-2 flex justify-between items-center">
        <span className="text-xs text-brand-dark font-medium">{data.triggerReason}</span>
        <span className="text-xs font-bold text-brand tabular-nums">{data.metricValue}</span>
      </div>

      {/* Attribution / Description - Truncated to one line */}
      <p className="text-xs text-slate-600 leading-relaxed truncate">
        {data.description}
      </p>

      {/* Actions: Collapsible (Slide Down on Hover) */}
      <div className="max-h-0 overflow-hidden group-hover:max-h-20 transition-[max-height] duration-300 ease-in-out">
        <div className="flex gap-2 pt-3 mt-2 border-t border-slate-100">
          <button 
            onClick={onCreate}
            className="flex-1 bg-brand hover:bg-brand-dark text-white text-xs py-2 rounded font-medium transition-colors"
          >
            去编辑
          </button>
          <button 
            onClick={onIgnore}
            className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded text-xs font-medium transition-colors"
          >
            忽略此条消息
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
