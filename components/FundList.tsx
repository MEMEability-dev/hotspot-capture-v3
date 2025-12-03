import React from 'react';
import { Fund } from '../types';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface FundListProps {
  funds: Fund[];
  selectedId: string;
  onSelect: (fund: Fund) => void;
}

const FundList: React.FC<FundListProps> = ({ funds, selectedId, onSelect }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
      <div className="p-5 border-b border-gray-100 bg-gray-50">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Market Funds
        </h2>
        <p className="text-xs text-gray-500 mt-1">Select a fund to view details</p>
      </div>
      <div className="overflow-y-auto flex-1 p-2 space-y-2">
        {funds.map((fund) => {
          const isPositive = fund.dayChangePercent >= 0;
          const isSelected = fund.id === selectedId;

          return (
            <button
              key={fund.id}
              onClick={() => onSelect(fund)}
              className={`w-full text-left p-4 rounded-xl transition-all duration-200 border ${
                isSelected
                  ? 'bg-blue-50 border-blue-200 shadow-sm'
                  : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`font-bold text-sm ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>
                  {fund.code}
                </span>
                <span className={`flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                  isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {fund.dayChangePercent > 0 ? '+' : ''}{fund.dayChangePercent}%
                </span>
              </div>
              <div className="text-sm font-medium text-gray-700 truncate mb-1">{fund.name}</div>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>NAV: ${fund.currentNAV.toFixed(2)}</span>
                <span>Cap: ${fund.marketCap}M</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FundList;