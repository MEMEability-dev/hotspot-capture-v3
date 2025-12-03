import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Plus, Trash2, Edit } from 'lucide-react';

const ConfigCenter: React.FC = () => {
  const navigate = useNavigate();

  const configs = [
    { code: '512480', name: '半导体ETF', active: true },
    { code: '159915', name: '创业板ETF', active: true },
    { code: '510300', name: '300ETF', active: true },
    { code: '588000', name: '科创50ETF', active: false },
    { code: '515030', name: '新能源车ETF', active: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">监控策略配置</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors">
          <Plus className="w-4 h-4" />
          新增监控产品
        </button>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {configs.map((item) => (
          <div key={item.code} className="break-inside-avoid bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{item.name}</h3>
                <div className="text-sm text-slate-500 font-mono">{item.code}</div>
              </div>
              <span className={`px-2 py-0.5 text-xs rounded-full ${item.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {item.active ? '运行中' : '已暂停'}
              </span>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">成交额阈值</span>
                <span className="font-mono font-medium">10亿</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">涨幅触发</span>
                <span className="font-mono font-medium">&gt;3.5%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">关联竞品</span>
                <span className="font-mono font-medium">3个</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-100">
               <button 
                 onClick={() => navigate('/config-detail')}
                 className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-brand bg-brand-light/30 hover:bg-brand-light rounded-lg transition-colors"
               >
                 <Edit className="w-4 h-4" /> 编辑
               </button>
               <button className="px-3 py-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors">
                 <Trash2 className="w-4 h-4" />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConfigCenter;