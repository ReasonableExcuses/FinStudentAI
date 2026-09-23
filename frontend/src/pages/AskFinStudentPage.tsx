import React, { useState } from 'react';
import { Send, Sparkles, HelpCircle, ShieldAlert, Bot, User, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { qaApi } from '../services/api';

const SAMPLE_QUESTIONS = [
  'Where did most of my money go this month?',
  'How much did I spend on Food?',
  'What subscriptions do I have?',
  'Why did I spend more this month?',
  'What is my predicted spending next month?',
  'Which transactions were unusual?',
  'Am I within budget this month?',
];

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  intent?: string;
  chartType?: string;
  chartData?: any;
}

export const AskFinStudentPage: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello Alex! I am **FinStudent AI**. Ask me anything about your expenses, subscriptions, budgets, or next month's forecast. Every answer is derived from your real transaction data.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await qaApi.ask(q);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.data.answer,
        intent: res.data.intent,
        chartType: res.data.supporting_chart_type,
        chartData: res.data.supporting_chart_data,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Sorry, I encountered an issue analyzing your financial records. Please try again.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSupportingChart = (chartType?: string, chartData?: any) => {
    if (!chartType || !chartData) return null;

    if (chartType === 'category_donut' && Array.isArray(chartData)) {
      const COLORS = ['#10b981', '#ec4899', '#38bdf8', '#8b5cf6', '#f59e0b'];
      return (
        <div className="mt-3 p-3 bg-[#0c0e12] rounded-xl border border-white/[0.08]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category Distribution</p>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={4}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Spent']}
                  contentStyle={{ backgroundColor: '#161a24', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '0.5rem', fontSize: '11px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    if (chartType === 'category_bar' && Array.isArray(chartData)) {
      return (
        <div className="mt-3 p-3 bg-[#0c0e12] rounded-xl border border-white/[0.08]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category Variance</p>
          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="category" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Amount']}
                  contentStyle={{ backgroundColor: '#161a24', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '0.5rem', fontSize: '11px', color: '#fff' }}
                />
                <Bar dataKey="difference" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-12 max-w-4xl mx-auto flex flex-col h-[calc(100vh-9rem)]">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">Ask FinStudent AI</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Ask questions in natural language. Answers are computed from database transactions.
        </p>
      </div>

      {/* Suggested Query Chips (Scrollable on mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none shrink-0">
        {SAMPLE_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-[#10b981]/50 hover:bg-[#10b981]/10 text-xs text-slate-300 hover:text-white transition whitespace-nowrap"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 fin-card p-4 sm:p-5 border border-white/[0.08] overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start space-x-2.5 sm:space-x-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981] flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-xl p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-[#10b981] text-[#042f1a] font-semibold rounded-tr-none'
                  : 'bg-white/[0.03] text-slate-200 border border-white/[0.07] rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>
              {renderSupportingChart(m.chartType, m.chartData)}
            </div>

            {m.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-white/[0.08] border border-white/[0.1] text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981] flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs text-[#10b981] flex items-center space-x-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Analyzing financial records & computing answers...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="fin-card p-1.5 sm:p-2 border border-white/[0.08] flex items-center space-x-2 shrink-0"
      >
        <input
          type="text"
          placeholder="Ask a question (e.g., 'How much did I spend on food?')..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-3 sm:px-4 py-2 bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2 sm:p-2.5 bg-[#10b981] hover:bg-[#34d399] text-[#042f1a] rounded-xl font-bold transition active:scale-95 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
