import React, { useEffect, useState } from 'react';
import { Fund, HistoricalDataPoint } from '../types';
import { analyzeFund } from '../services/geminiService';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // Assuming we can parse simple markdown or just render text

interface AIAnalystProps {
  fund: Fund;
  history: HistoricalDataPoint[];
}

const AIAnalyst: React.FC<AIAnalystProps> = ({ fund, history }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalyzedId, setLastAnalyzedId] = useState<string | null>(null);

  // We intentionally don't auto-analyze on mount to save tokens/API calls, 
  // unless it's a new session, or we can make it manual. 
  // Let's make it manual primarily, but auto-clear on fund switch.
  
  useEffect(() => {
    if (fund.id !== lastAnalyzedId) {
      setAnalysis(null);
      setError(null);
      setLastAnalyzedId(fund.id);
    }
  }, [fund.id, lastAnalyzedId]);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeFund(fund, history);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Gemini AI Analyst</h3>
            <p className="text-xs text-indigo-200">Real-time market insights</p>
          </div>
        </div>
        
        {!analysis && !loading && (
          <button 
            onClick={handleAnalyze}
            className="bg-white text-indigo-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition-colors shadow-lg flex items-center gap-2"
          >
            Generate Insight
          </button>
        )}
        
        {analysis && !loading && (
          <button 
            onClick={handleAnalyze}
            className="text-indigo-200 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
            title="Refresh Analysis"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="relative z-10 min-h-[160px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full py-8 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="text-indigo-200 text-sm animate-pulse">Analyzing market data & trends...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-200 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-100">Analysis Failed</p>
              <p className="text-sm text-red-200/80 mt-1">{error}</p>
              <button onClick={handleAnalyze} className="text-xs underline mt-2 text-white">Try Again</button>
            </div>
          </div>
        ) : analysis ? (
          <div className="prose prose-invert prose-sm max-w-none text-indigo-50 leading-relaxed">
             {/* Simple renderer for markdown-like text since we don't have a full markdown lib installed in this context unless we implement one. 
                 We will just split by newline and render paragraphs for simplicity, or just preserve whitespace. */}
             <div className="whitespace-pre-line font-light text-sm">
                {analysis}
             </div>
          </div>
        ) : (
          <div className="text-center py-8 text-indigo-300 border-2 border-dashed border-indigo-700/50 rounded-xl bg-indigo-800/20">
            <p>Ready to analyze <strong>{fund.name}</strong>.</p>
            <p className="text-xs opacity-70 mt-1">Click the button above to generate a report.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalyst;