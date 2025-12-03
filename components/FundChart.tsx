import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';
import { HistoricalDataPoint } from '../types';

interface FundChartProps {
  data: HistoricalDataPoint[];
  color: string;
}

const FundChart: React.FC<FundChartProps> = ({ data, color }) => {
  return (
    <div className="h-64 w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">30-Day Performance</h3>
        <span className="text-xs text-gray-400">NAV History</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10, fill: '#94a3b8' }} 
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => value.slice(5)} // Show MM-DD
            interval={6}
          />
          <YAxis 
            domain={['auto', 'auto']} 
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => `$${val}`}
            width={40}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            labelStyle={{ color: '#64748b', fontSize: '12px' }}
            itemStyle={{ color: color, fontWeight: 600 }}
          />
          <Line 
            type="monotone" 
            dataKey="nav" 
            stroke={color} 
            strokeWidth={3} 
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FundChart;