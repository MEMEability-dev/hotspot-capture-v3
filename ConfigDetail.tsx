import React from 'react';
import { ArrowLeft, Save, HelpCircle, Activity, BarChart3, TrendingUp, Wallet, PieChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ConfigDetail: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">策略配置详情 - 半导体ETF (512480)</h1>
      </div>

      {/* 1. Tracking Index Triggers */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
           <h3 className="font-bold text-slate-700 flex items-center gap-2">
             <Activity className="w-4 h-4 text-brand" />
             跟踪指数维度
           </h3>
           <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
           {/* Super-period Rise */}
           <div className="space-y-3 p-4 bg-slate-50/50 rounded-lg border border-slate-100">
              <label className="text-sm font-bold text-slate-700 block">超期涨幅</label>
              <div className="text-xs text-slate-500 mb-2">当日涨幅超过近10日平均波动幅度的 N 倍</div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">倍数阈值 &gt;</span>
                <input type="number" step="0.1" defaultValue={1.5} className="w-24 px-3 py-1.5 border border-slate-300 rounded focus:border-brand outline-none text-sm" />
                <span className="text-sm text-slate-400">倍</span>
              </div>
           </div>

           {/* Consecutive Rise/Fall */}
           <div className="space-y-3 p-4 bg-slate-50/50 rounded-lg border border-slate-100">
              <label className="text-sm font-bold text-slate-700 block">连涨/连跌</label>
              <div className="flex items-center justify-between gap-4">
                 <div className="flex-1">
                   <span className="text-xs text-slate-500 block mb-1">宽基连续天数</span>
                   <input type="number" defaultValue={3} className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-brand outline-none text-sm" />
                 </div>
                 <div className="flex-1">
                   <span className="text-xs text-slate-500 block mb-1">行业连续天数</span>
                   <input type="number" defaultValue={4} className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-brand outline-none text-sm" />
                 </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" defaultChecked className="text-brand focus:ring-brand rounded" />
                <span className="text-xs text-slate-500">过滤微涨噪音 (&lt;0.1%)</span>
              </div>
           </div>

           {/* Oversold Rebound */}
           <div className="space-y-3 p-4 bg-slate-50/50 rounded-lg border border-slate-100">
              <label className="text-sm font-bold text-slate-700 block">超跌反弹</label>
              <div className="text-xs text-slate-500 mb-2">连跌5日后，首次出现涨幅超过 N%</div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">反弹阈值 &gt;</span>
                <input type="number" step="0.1" defaultValue={1.0} className="w-24 px-3 py-1.5 border border-slate-300 rounded focus:border-brand outline-none text-sm" />
                <span className="text-sm text-slate-400">%</span>
              </div>
           </div>

           {/* Key Points */}
           <div className="space-y-3 p-4 bg-slate-50/50 rounded-lg border border-slate-100">
              <label className="text-sm font-bold text-slate-700 block">关键点位/历史新高</label>
              <div className="flex flex-col gap-2">
                 <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" defaultChecked className="rounded text-brand" />
                    突破并站稳整数关口
                 </label>
                 <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" defaultChecked className="rounded text-brand" />
                    突破上市以来最高纪录
                 </label>
              </div>
           </div>
        </div>
      </div>

      {/* 2. Volume Triggers */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
           <h3 className="font-bold text-slate-700 flex items-center gap-2">
             <BarChart3 className="w-4 h-4 text-brand" />
             成交额维度
           </h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
           {/* Volume Surge */}
           <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 block">成交放量</label>
              <div className="text-xs text-slate-500 mb-2">今日成交额达到过去10天同一时段平均水平的 N 倍</div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">放量倍数 &gt;</span>
                <input type="number" step="0.1" defaultValue={2.0} className="w-24 px-3 py-1.5 border border-slate-300 rounded focus:border-brand outline-none text-sm" />
                <span className="text-sm text-slate-400">倍</span>
              </div>
           </div>

           {/* Market Share */}
           <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 block">市占率吸纳</label>
              <div className="flex gap-4">
                 <div className="flex-1">
                   <span className="text-xs text-slate-500 block mb-1">相对份额涨幅 &gt;</span>
                   <div className="relative">
                     <input type="number" defaultValue={10} className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-brand outline-none text-sm" />
                     <span className="absolute right-3 top-1.5 text-xs text-slate-400">%</span>
                   </div>
                 </div>
                 <div className="flex-1">
                   <span className="text-xs text-slate-500 block mb-1">成交占比提升 &gt;</span>
                   <div className="relative">
                     <input type="number" defaultValue={5} className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-brand outline-none text-sm" />
                     <span className="absolute right-3 top-1.5 text-xs text-slate-400">%</span>
                   </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* 3. Net Inflow Triggers */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
           <h3 className="font-bold text-slate-700 flex items-center gap-2">
             <TrendingUp className="w-4 h-4 text-brand" />
             净流入维度
           </h3>
        </div>
        <div className="p-6 space-y-6">
           {/* Huge Inflow */}
           <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 block">巨额流入 (单日净流入额超过特定值)</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="p-3 bg-slate-50 rounded border border-slate-100">
                    <span className="text-xs font-bold text-slate-600 block mb-2">巨型宽基 (&gt;100亿)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">流入强度&gt;</span>
                      <input type="number" step="0.1" defaultValue={0.5} className="w-16 px-2 py-1 border border-slate-300 rounded text-sm" />
                      <span className="text-xs text-slate-500">%</span>
                    </div>
                 </div>
                 <div className="p-3 bg-slate-50 rounded border border-slate-100">
                    <span className="text-xs font-bold text-slate-600 block mb-2">中型行业 (10-100亿)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">流入强度&gt;</span>
                      <input type="number" step="0.1" defaultValue={2.0} className="w-16 px-2 py-1 border border-slate-300 rounded text-sm" />
                      <span className="text-xs text-slate-500">%</span>
                    </div>
                 </div>
                 <div className="p-3 bg-slate-50 rounded border border-slate-100">
                    <span className="text-xs font-bold text-slate-600 block mb-2">微型/新发 (&lt;10亿)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">流入强度&gt;</span>
                      <input type="number" step="0.1" defaultValue={5.0} className="w-16 px-2 py-1 border border-slate-300 rounded text-sm" />
                      <span className="text-xs text-slate-500">%</span>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block">连续吸金</label>
                <div className="flex items-center gap-2">
                   <span className="text-sm text-slate-600">连续</span>
                   <input type="number" defaultValue={5} className="w-16 px-2 py-1.5 border border-slate-300 rounded text-sm" />
                   <span className="text-sm text-slate-600">日净流入大于0</span>
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block">逆势流入</label>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                   <span>价格跌幅 &lt; -1% 且 流入强度 &gt;</span>
                   <input type="number" defaultValue={1} className="w-16 px-2 py-1.5 border border-slate-300 rounded text-sm" />
                   <span>%</span>
                </div>
             </div>
           </div>
        </div>
      </div>

      {/* 4. Scale & Subscription Triggers */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
           <h3 className="font-bold text-slate-700 flex items-center gap-2">
             <PieChart className="w-4 h-4 text-brand" />
             规模/申赎维度
           </h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
           <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 block">里程碑突破</label>
              <div className="flex flex-wrap gap-2">
                 {[5, 10, 20, 50, 100, 200, 500].map(val => (
                   <span key={val} className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600 border border-slate-200">{val}亿</span>
                 ))}
                 <button className="px-3 py-1 border border-dashed border-slate-300 rounded-full text-xs text-brand hover:bg-brand-light">+ 自定义</button>
              </div>
           </div>

           <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 block">显著申购 (机构购买)</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">单日份额增长率 &gt;</span>
                <input type="number" step="0.1" defaultValue={3.0} className="w-20 px-3 py-1.5 border border-slate-300 rounded focus:border-brand outline-none text-sm" />
                <span className="text-sm text-slate-400">%</span>
              </div>
           </div>

           <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 block">溢价抢购</label>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                 <span>溢价率 &gt;</span>
                 <input type="number" defaultValue={0.2} className="w-16 px-2 py-1 border border-slate-300 rounded text-sm" />
                 <span>% 且 存在大量申购</span>
              </div>
           </div>

           <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 block">折价赎回</label>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                 <span>折价率 &lt; -</span>
                 <input type="number" defaultValue={0.2} className="w-16 px-2 py-1 border border-slate-300 rounded text-sm" />
                 <span>% 且 份额大幅减少</span>
              </div>
           </div>
        </div>
      </div>

      {/* Competitor Config (Existing) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
           <h3 className="font-bold text-slate-700">竞品追踪</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
             {['159995 - 芯片ETF', '512660 - 半导体龙头', '159813 - 半导体50'].map((comp, idx) => (
               <div key={idx} className="flex items-center gap-4">
                 <input type="text" value={comp} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded text-slate-600" readOnly />
                 <button className="text-sm text-red-500 hover:text-red-700">删除</button>
               </div>
             ))}
             <button className="w-full py-2 border border-dashed border-slate-300 rounded text-slate-500 hover:border-brand hover:text-brand transition-colors text-sm">
               + 添加竞品关联
             </button>
          </div>
        </div>
      </div>

      {/* Keywords (Existing) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
           <h3 className="font-bold text-slate-700">资讯关键词标签</h3>
        </div>
        <div className="p-6">
          <textarea 
            className="w-full h-32 px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand focus:border-brand outline-none resize-none"
            defaultValue="半导体, 芯片, 集成电路, 存储, 大基金, 韦尔股份, 中芯国际, 北方华创, 科技股, 晶圆"
          ></textarea>
        </div>
      </div>

      <div className="flex justify-end pt-4 pb-12">
        <button className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors font-bold shadow-lg shadow-brand/20">
          <Save className="w-4 h-4" />
          保存所有配置
        </button>
      </div>
    </div>
  );
};

export default ConfigDetail;