import React, { useState, useMemo } from 'react';
import { FUNDS, generateHistory } from './services/mockData';
import { Fund } from './types';
import FundList from './components/FundList';
import FundChart from './components/FundChart';
import AIAnalyst from './components/AIAnalyst';
import { LayoutDashboard, PieChart, Info, Bell, Search, Menu } from 'lucide-react';

const App: React.FC = () => {
  const [selectedFund, setSelectedFund] = useState<Fund>(FUNDS[0]);
  
  // Memoize history generation so it doesn't change on every render unless selectedFund changes
  const fundHistory = useMemo(() => {
    return generateHistory(selectedFund.currentNAV);
  }, [selectedFund.id, selectedFund.currentNAV]);

  const isPositiveTrend = selectedFund.dayChangePercent >= 0;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F3F4F6]">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
            F
          </div>
          <span className="font-bold text-xl text-gray-800 tracking-tight">FundFlow</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg bg-blue-50 text-blue-700">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <PieChart className="w-5 h-5" />
            Portfolio
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <Info className="w-5 h-5" />
            News
          </a>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="bg-indigo-900 rounded-xl p-4 text-white text-center">
            <p className="text-xs text-indigo-200 mb-2">Upgrade to Pro</p>
            <button className="w-full bg-white/10 hover:bg-white/20 transition-colors py-2 rounded-lg text-xs font-semibold">
              Get Advanced Insights
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4 md:hidden">
            <Menu className="w-6 h-6 text-gray-600" />
            <span className="font-bold text-lg text-gray-800">FundFlow</span>
          </div>
          
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-gray-800">Market Overview</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search funds..." 
                className="pl-9 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all w-64 outline-none"
              />
            </div>
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-md border-2 border-white"></div>
          </div>
        </header>

        {/* Scrollable Dashboard Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            
            {/* Left Column: Fund Selection */}
            <div className="lg:col-span-4 xl:col-span-3 h-[500px] lg:h-auto">
              <FundList 
                funds={FUNDS} 
                selectedId={selectedFund.id} 
                onSelect={setSelectedFund} 
              />
            </div>

            {/* Right Column: Detailed View */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-6">
              
              {/* Header Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedFund.name}</h2>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-md uppercase tracking-wide">
                      {selectedFund.code}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span>{selectedFund.sector}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>Risk: <span className={`${selectedFund.riskLevel === 'High' ? 'text-orange-500' : 'text-green-600'} font-medium`}>{selectedFund.riskLevel}</span></span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">${selectedFund.currentNAV.toFixed(2)}</div>
                  <div className={`text-sm font-semibold flex items-center justify-end ${isPositiveTrend ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositiveTrend ? '+' : ''}{selectedFund.dayChangePercent}% Today
                  </div>
                </div>
              </div>

              {/* Chart Section */}
              <FundChart 
                data={fundHistory} 
                color={isPositiveTrend ? '#16a34a' : '#dc2626'} 
              />

              {/* Info & AI Section */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Stats Grid */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Fund Statistics</h3>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Market Cap</p>
                      <p className="font-semibold text-gray-900">${selectedFund.marketCap}M</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Currency</p>
                      <p className="font-semibold text-gray-900">{selectedFund.currency}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">52W High</p>
                      <p className="font-semibold text-gray-900">${(selectedFund.currentNAV * 1.12).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">52W Low</p>
                      <p className="font-semibold text-gray-900">${(selectedFund.currentNAV * 0.85).toFixed(2)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 mb-1">About</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{selectedFund.description}</p>
                    </div>
                  </div>
                </div>

                {/* AI Analyst */}
                <AIAnalyst fund={selectedFund} history={fundHistory} />
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;