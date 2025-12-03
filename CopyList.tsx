
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Calendar, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import Toast from '../components/Toast';
import { MOCK_COPIES } from '../constants';

const CopyList: React.FC = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'DRAFT' | 'PUBLISHED'>('ALL');

  const filteredCopies = MOCK_COPIES.filter(c => {
    if (activeTab === 'ALL') return true;
    return c.status === activeTab;
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setToast('文案已删除');
  };

  const handleEdit = (id: number) => {
    navigate('/workbench', { state: { copyId: id } });
  };

  const handleCreateNew = () => {
    navigate('/workbench', { state: { mode: 'create' } });
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800">智能文案中心</h1>
          <p className="text-xs text-slate-500 mt-1">管理您的所有营销文案，支持一键生成与多渠道分发</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded hover:bg-brand-dark transition-colors font-medium shadow-lg shadow-brand/20 text-sm"
        >
          <Plus className="w-4 h-4" />
          新建文案
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex justify-between items-center bg-white p-2 rounded-md border border-slate-200">
        <div className="flex gap-1">
          {['ALL', 'DRAFT', 'PUBLISHED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded text-xs font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-brand-light text-brand'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab === 'ALL' ? '全部文案' : tab === 'DRAFT' ? '草稿箱' : '已发布'}
            </button>
          ))}
        </div>
        <div className="relative mr-2">
           <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
           <input 
             type="text" 
             placeholder="搜索标题或产品..." 
             className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:border-brand w-64"
           />
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCopies.map((item) => (
          <div 
            key={item.id} 
            onClick={() => handleEdit(item.id)}
            className="group bg-white rounded-md border border-slate-200 p-5 cursor-pointer hover:shadow-md hover:border-brand/50 transition-all flex flex-col h-[220px] relative"
          >
            <div className="flex justify-between items-start mb-3">
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                item.status === 'PUBLISHED' 
                  ? 'bg-green-50 text-green-600 border-green-100' 
                  : 'bg-yellow-50 text-yellow-600 border-yellow-100'
              }`}>
                {item.status === 'PUBLISHED' ? '已发布' : '草稿'}
              </span>
              <button className="text-slate-300 hover:text-slate-600" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-sm font-bold text-slate-800 mb-2 line-clamp-1 group-hover:text-brand transition-colors">
              {item.title}
            </h3>
            
            <div className="text-[10px] text-brand font-medium bg-brand-light/20 px-2 py-1 rounded w-fit mb-3">
              {item.product}
            </div>

            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-auto">
              {item.preview}
            </p>

            <div className="pt-4 mt-2 border-t border-slate-50 flex justify-between items-center text-[10px] text-slate-400 font-mono">
               <div className="flex items-center gap-1">
                 <Calendar className="w-3 h-3" />
                 {item.updatedAt}
               </div>
               
               <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEdit(item.id); }}
                    className="p-1.5 hover:bg-brand-light text-slate-400 hover:text-brand rounded" 
                    title="编辑"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded" 
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
               </div>
            </div>
          </div>
        ))}
        
        {/* Create New Card (Empty State-ish) */}
        <div 
          onClick={handleCreateNew}
          className="border-2 border-dashed border-slate-200 rounded-md flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-brand hover:text-brand hover:bg-brand-light/5 transition-all h-[220px]"
        >
           <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-brand-light/20">
             <Plus className="w-6 h-6" />
           </div>
           <span className="font-medium text-sm">新建空白文案</span>
        </div>
      </div>
    </div>
  );
};

export default CopyList;